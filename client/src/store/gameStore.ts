import { create } from 'zustand';

export interface LevelProgress {
  levelId: number;
  stars: number; // 0-3, 0=未通关
  completedAt?: string;
}

export interface UserState {
  username: string | null;
  isLoggedIn: boolean;
}

export interface GameState {
  user: UserState;
  currentLevel: number; // 当前可挑战的关卡ID（1-10）
  progress: LevelProgress[];
  playerStationId: number; // 玩家小人当前所在站点ID（用于行走动画）
  lastCompletedLevel: number | null; // 刚刚通关的关卡（用于显示通知）

  // 用户操作
  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (username: string, password: string) => boolean;

  // 游戏进度
  completeLevel: (levelId: number, stars: number) => void;
  dismissCompletionNotice: () => void;
  resetProgress: () => void;
  setPlayerStation: (stationId: number) => void;
  getLevelStatus: (levelId: number) => 'locked' | 'available' | 'completed';
  getStars: (levelId: number) => number;
}

// 简单的内存"数据库"（后续可接后端）
const mockUsers: { username: string; password: string }[] = [];

// 读取玩家所在站点（无存档时按已完成进度推导）
function loadStation(username: string | null, progress: LevelProgress[]): number {
  if (!username) return 1
  const saved = localStorage.getItem(`station_${username}`)
  if (saved) {
    const n = Number(saved)
    if (Number.isFinite(n) && n >= 1) return n
  }
  const maxCompleted = progress.reduce((max, p) => (p.stars > 0 ? Math.max(max, p.levelId) : max), 0)
  return Math.max(1, maxCompleted)
}

// 由已完成进度推导当前可挑战关卡
function loadCurrentLevel(progress: LevelProgress[]): number {
  const maxCompleted = progress.reduce((max, p) => (p.stars > 0 ? Math.max(max, p.levelId) : max), 0)
  return Math.min(10, maxCompleted + 1)
}

// TODO: 上线时改回 isLoggedIn: false，恢复登录流程
let guestProgress: LevelProgress[] = []
try {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('progress_guest') : null
  guestProgress = raw ? JSON.parse(raw) : []
} catch {
  guestProgress = []
}

const useGameStore = create<GameState>((set, get) => ({
  user: { username: 'guest', isLoggedIn: true },
  currentLevel: loadCurrentLevel(guestProgress),
  progress: guestProgress,
  playerStationId: loadStation('guest', guestProgress),
  lastCompletedLevel: null,

  login: (username, password) => {
    const user = mockUsers.find((u) => u.username === username && u.password === password);
    if (user) {
      const saved = localStorage.getItem(`progress_${username}`);
      const progress = saved ? JSON.parse(saved) : [];
      set({ user: { username, isLoggedIn: true }, progress, playerStationId: loadStation(username, progress) });
      return true;
    }
    // 如果用户不存在，自动注册
    mockUsers.push({ username, password });
    localStorage.setItem(`progress_${username}`, '[]');
    set({ user: { username, isLoggedIn: true }, progress: [], playerStationId: 1 });
    return true;
  },

  logout: () => {
    set({ user: { username: null, isLoggedIn: false }, currentLevel: 1, progress: [], playerStationId: 1 });
  },

  register: (username, password) => {
    if (mockUsers.find((u) => u.username === username)) {
      return false;
    }
    mockUsers.push({ username, password });
    localStorage.setItem(`progress_${username}`, '[]');
    return true;
  },

  completeLevel: (levelId, stars) => {
    const { user, progress } = get();
    const existing = progress.find((p) => p.levelId === levelId);
    const newProgress = existing
      ? progress.map((p) =>
          p.levelId === levelId
            ? { ...p, stars: Math.max(p.stars, stars), completedAt: new Date().toISOString() }
            : p
        )
      : [...progress, { levelId, stars, completedAt: new Date().toISOString() }];

    const nextLevel = levelId < 10 ? levelId + 1 : 10;
    // playerStationId 保持原值，等待 GameMap 中行走动画完成后更新
    set({ progress: newProgress, currentLevel: nextLevel, lastCompletedLevel: levelId });

    if (user.username) {
      localStorage.setItem(`progress_${user.username}`, JSON.stringify(newProgress));
    }
  },

  dismissCompletionNotice: () => {
    set({ lastCompletedLevel: null });
  },

  setPlayerStation: (stationId) => {
    const { user } = get();
    set({ playerStationId: stationId });
    if (user.username) {
      localStorage.setItem(`station_${user.username}`, String(stationId));
    }
  },

  resetProgress: () => {
    const { user } = get();
    set({ currentLevel: 1, progress: [], playerStationId: 1 });
    if (user.username) {
      localStorage.setItem(`progress_${user.username}`, '[]');
      localStorage.removeItem(`station_${user.username}`);
    }
  },

  getLevelStatus: (levelId) => {
    const { currentLevel, progress } = get();
    const p = progress.find((pr) => pr.levelId === levelId);
    if (p && p.stars > 0) return 'completed';
    if (levelId <= currentLevel) return 'available';
    return 'locked';
  },

  getStars: (levelId) => {
    const { progress } = get();
    return progress.find((p) => p.levelId === levelId)?.stars ?? 0;
  },
}));

export default useGameStore;
