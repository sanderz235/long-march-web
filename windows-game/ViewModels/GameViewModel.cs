using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Threading;
using LongMarchWindows.Data;
using LongMarchWindows.Models;
using LongMarchWindows.Services;

namespace LongMarchWindows.ViewModels;

public class GameViewModel : INotifyPropertyChanged
{
    private readonly ProgressStore _store = new();
    private readonly DispatcherTimer _timer = new() { Interval = TimeSpan.FromMilliseconds(16) };

    private readonly HashSet<int> _completed = new();

    private float _playerX;
    private float _playerY;
    private int _playerStationId;
    private int _walkedUpTo;
    private bool _isWalking;
    private int? _selectedLevelId;
    private string _lockedTitle = string.Empty;
    private string _lockedDesc = string.Empty;

    // 行走动画中间状态
    private List<LevelInfo> _path = new();
    private int _segIndex;
    private LevelInfo _from = null!;
    private LevelInfo _to = null!;
    private DateTime _segStart;
    private DateTime _walkStart;
    private double _segDurMs;
    private int _targetId;
    private float _walkPhase;

    public GameViewModel()
    {
        var data = _store.Load();
        foreach (var id in data.CompletedLevels.Where(id => id is >= 1 and <= 10))
            _completed.Add(id);

        _playerStationId = Math.Clamp(data.PlayerStationId, 1, 10);
        _walkedUpTo = _playerStationId;

        var start = Levels.First(l => l.Id == _playerStationId);
        _playerX = start.X;
        _playerY = start.Y - PlayerYOffset;

        _timer.Tick += OnTimerTick;
    }

    public const float PlayerYOffset = 25f;

    public IReadOnlyList<LevelInfo> Levels => GameData.Levels;

    public event PropertyChangedEventHandler? PropertyChanged;

    public float PlayerX
    {
        get => _playerX;
        private set => SetField(ref _playerX, value);
    }

    public float PlayerY
    {
        get => _playerY;
        private set => SetField(ref _playerY, value);
    }

    public bool IsWalking
    {
        get => _isWalking;
        private set => SetField(ref _isWalking, value);
    }

    public int WalkedUpTo
    {
        get => _walkedUpTo;
        private set => SetField(ref _walkedUpTo, value);
    }

    public float WalkPhase
    {
        get => _walkPhase;
        private set => SetField(ref _walkPhase, value);
    }

    public int? SelectedLevelId
    {
        get => _selectedLevelId;
        private set => SetField(ref _selectedLevelId, value);
    }

    public string LockedTitle
    {
        get => _lockedTitle;
        private set => SetField(ref _lockedTitle, value);
    }

    public string LockedDesc
    {
        get => _lockedDesc;
        private set => SetField(ref _lockedDesc, value);
    }

    public Visibility LockedOverlayVisibility =>
        string.IsNullOrEmpty(_lockedTitle) ? Visibility.Collapsed : Visibility.Visible;

    public int CurrentLevel => Math.Min(10, (_completed.Count == 0 ? 0 : _completed.Max()) + 1);

    public string ProgressText =>
        $"当前进度：第 {CurrentLevel} / {Levels.Count} 关  |  点击关卡节点继续征程";

    public LevelStatus GetStatus(int id)
    {
        if (_completed.Contains(id)) return LevelStatus.Completed;
        if (id <= CurrentLevel) return LevelStatus.Available;
        return LevelStatus.Locked;
    }

    public int GetStars(int id) => _completed.Contains(id) ? 3 : 0;

    public void ClickStation(int id)
    {
        SelectedLevelId = id;
        var level = Levels.First(l => l.Id == id);

        if (GetStatus(id) == LevelStatus.Locked)
        {
            LockedTitle = level.MapLabel;
            LockedDesc = level.ShortDesc;
            RaiseLockedOverlayChanged();
            return;
        }

        DismissLockedInfo();
        StartWalk(id);
    }

    public void DismissLockedInfo()
    {
        if (string.IsNullOrEmpty(_lockedTitle)) return;
        LockedTitle = string.Empty;
        LockedDesc = string.Empty;
        RaiseLockedOverlayChanged();
    }

    public void Reset()
    {
        if (_isWalking)
        {
            _timer.Stop();
            _isWalking = false;
        }

        _completed.Clear();
        _playerStationId = 1;
        _walkedUpTo = 1;
        SelectedLevelId = null;
        WalkPhase = 0;
        DismissLockedInfo();

        var start = Levels.First(l => l.Id == 1);
        PlayerX = start.X;
        PlayerY = start.Y - PlayerYOffset;

        OnPropertyChanged(nameof(CurrentLevel));
        OnPropertyChanged(nameof(ProgressText));
        OnPropertyChanged(nameof(WalkedUpTo));
        Save();
    }

    private void RaiseLockedOverlayChanged()
    {
        OnPropertyChanged(nameof(LockedTitle));
        OnPropertyChanged(nameof(LockedDesc));
        OnPropertyChanged(nameof(LockedOverlayVisibility));
    }

    private void StartWalk(int targetId)
    {
        if (_isWalking) return;

        _path = BuildPath(_playerStationId, targetId);
        _targetId = targetId;

        if (_path.Count < 2)
        {
            CompleteArrival(targetId);
            return;
        }

        _segIndex = 0;
        _walkStart = DateTime.Now;
        IsWalking = true;
        BeginSegment();
    }

    private List<LevelInfo> BuildPath(int fromId, int toId)
    {
        int start = Math.Min(fromId, toId);
        int end = Math.Max(fromId, toId);

        var list = new List<LevelInfo>();
        for (int i = start; i <= end; i++)
            list.Add(Levels.First(l => l.Id == i));

        if (toId < fromId) list.Reverse();
        return list;
    }

    private void BeginSegment()
    {
        _from = _path[_segIndex];
        _to = _path[_segIndex + 1];

        float dx = _to.X - _from.X;
        float dy = (_to.Y - PlayerYOffset) - (_from.Y - PlayerYOffset);
        float dist = MathF.Sqrt(dx * dx + dy * dy);
        _segDurMs = Math.Max(dist / 80f, 0.3f) * 1000;
        _segStart = DateTime.Now;
        _timer.Start();
    }

    private void OnTimerTick(object? sender, EventArgs e)
    {
        WalkPhase = (float)(((DateTime.Now - _walkStart).TotalMilliseconds % 400) / 400.0);

        double elapsed = (DateTime.Now - _segStart).TotalMilliseconds;
        double raw = Math.Min(elapsed / _segDurMs, 1.0);
        double t = raw < 0.5 ? 2 * raw * raw : -1 + (4 - 2 * raw) * raw;

        float fromX = _from.X;
        float fromY = _from.Y - PlayerYOffset;
        float toX = _to.X;
        float toY = _to.Y - PlayerYOffset;

        PlayerX = fromX + (toX - fromX) * (float)t;
        PlayerY = fromY + (toY - fromY) * (float)t;

        if (raw < 1.0) return;

        _segIndex++;
        WalkedUpTo = _to.Id;

        if (_segIndex >= _path.Count - 1)
        {
            _timer.Stop();
            IsWalking = false;
            CompleteArrival(_targetId);
        }
        else
        {
            BeginSegment();
        }
    }

    private void CompleteArrival(int id)
    {
        var level = Levels.First(l => l.Id == id);
        PlayerX = level.X;
        PlayerY = level.Y - PlayerYOffset;
        _playerStationId = id;
        WalkedUpTo = id;
        WalkPhase = 0;

        bool unlockedNew = false;
        if (!_completed.Contains(id))
        {
            _completed.Add(id);
            unlockedNew = true;
        }

        if (unlockedNew)
        {
            OnPropertyChanged(nameof(CurrentLevel));
            OnPropertyChanged(nameof(ProgressText));
        }

        Save();
    }

    private void Save()
    {
        _store.Save(new ProgressStore.ProgressData(_completed.OrderBy(x => x).ToList(), _playerStationId));
    }

    private void SetField<T>(ref T field, T value, [CallerMemberName] string? name = null)
    {
        if (EqualityComparer<T>.Default.Equals(field, value)) return;
        field = value;
        OnPropertyChanged(name);
    }

    private void OnPropertyChanged([CallerMemberName] string? name = null)
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
