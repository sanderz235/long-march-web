export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number; // 0-based
}

export interface LevelData {
  id: number;
  mapLabel: string;       // 地图上显示的简短名称
  fullName: string;       // 关卡完整名
  shortDesc: string;      // 极简介绍（≤6字）
  isIntro?: boolean;      // 是否为序章（GalGame式）
  introPages?: IntroPage[];
  videoUrl?: string;      // 学习视频URL（占位）
  questions: QuizQuestion[];
}

export interface IntroPage {
  image: string;
  title?: string;
  lines: string[];
}

export const LEVELS: LevelData[] = [
  {
    id: 1,
    mapLabel: '瑞金',
    fullName: '长征起点',
    shortDesc: '伟大征程开始',
    isIntro: true,
    introPages: [
      {
        image: '/images/intro_1.jpg',
        title: '长征',
        lines: ['1934 — 1936', '第五次反"围剿"失利，中央苏区危在旦夕……'],
      },
      {
        image: '/images/intro_2.jpg',
        lines: ['1933年9月，蒋介石调集百万大军，对中央苏区发动第五次"围剿"。', '由于"左"倾教条主义的错误指挥，红军苦战一年，未能打破围剿。'],
      },
      {
        image: '/images/intro_3.jpg',
        lines: ['1934年10月，中共中央、中革军委率中央红军主力 8.6 万余人，', '被迫撤离中央革命根据地，踏上战略转移的漫漫征程。', '于都河畔，百姓拆门板、架浮桥，夜渡贡水，开启了伟大的长征。'],
      },
      {
        image: '/images/intro_4.jpg',
        lines: ['而你，将跟随这支英勇的队伍……', '穿越 11 个省，翻越 18 座大山，跨过 24 条大河……', '经历 600 余次战役战斗，走过二万五千里。'],
      },
      {
        image: '/images/intro_5.jpg',
        lines: ['准备好了吗？'],
        title: '出发',
      },
    ],
    questions: [],
  },
  {
    id: 2,
    mapLabel: '湘江',
    fullName: '血战湘江',
    shortDesc: '惨烈突围之战',
    videoUrl: 'BV1fP4y1M7r5',
    questions: [
      { question: '血战湘江发生在哪一年？', options: ['1933年', '1934年', '1935年', '1936年'], correctIndex: 1 },
      { question: '湘江战役中，中央红军突破的是国民党军的第几道封锁线？', options: ['第一道', '第二道', '第三道', '第四道'], correctIndex: 3 },
      { question: '湘江战役后，中央红军人数从出发时的8.6万余人锐减至约多少人？', options: ['5万余人', '4万余人', '3万余人', '2万余人'], correctIndex: 2 },
      { question: '湘江战役的主要战场位于今天的哪个省份？', options: ['湖南和江西', '广西和湖南', '贵州和云南', '四川和甘肃'], correctIndex: 1 },
      { question: '湘江战役的重要意义是什么？', options: ['红军首次使用游击战术', '突破重兵封锁线，粉碎将红军歼灭于湘江以东的企图', '红军与红四方面军胜利会师', '确立了毛泽东的领导地位'], correctIndex: 1 },
    ],
  },
  {
    id: 3,
    mapLabel: '遵义',
    fullName: '遵义会议',
    shortDesc: '生死攸关转折',
    videoUrl: 'BV1RQ4y1z7ay',
    questions: [
      { question: '遵义会议召开的时间是？', options: ['1934年10月', '1935年1月', '1935年3月', '1935年5月'], correctIndex: 1 },
      { question: '遵义会议纠正了谁的军事指挥错误？', options: ['毛泽东和周恩来', '朱德和彭德怀', '博古和李德', '张国焘和徐向前'], correctIndex: 2 },
      { question: '遵义会议后，实际负责军事指挥的三人小组由谁组成？', options: ['毛泽东、周恩来、王稼祥', '毛泽东、朱德、彭德怀', '周恩来、博古、李德', '毛泽东、刘少奇、张闻天'], correctIndex: 0 },
      { question: '遵义会议被誉为什么？', options: ['长征的起点', '中国共产党历史上生死攸关的转折点', '中国革命的最终胜利', '抗日战争的序幕'], correctIndex: 1 },
      { question: '遵义会议后，代替博古负总责（主持中央工作）的是谁？', options: ['毛泽东', '周恩来', '张闻天', '王稼祥'], correctIndex: 2 },
    ],
  },
  {
    id: 4,
    mapLabel: '赤水',
    fullName: '四渡赤水',
    shortDesc: '用兵如神',
    videoUrl: 'BV1mK3yzjESc',
    questions: [
      { question: '四渡赤水发生在哪一年？', options: ['1934年', '1935年', '1936年', '1933年'], correctIndex: 1 },
      { question: '四渡赤水中，红军兵力约多少？', options: ['8万余人', '5万余人', '3万余人', '1万余人'], correctIndex: 2 },
      { question: '毛泽东称四渡赤水是他军事生涯的什么？', options: ['最艰难的战斗', '得意之笔', '最后一战', '最大失误'], correctIndex: 1 },
      { question: '四渡赤水主要发生在哪几个省交界？', options: ['江西、湖南、广东', '贵州、四川、云南', '四川、甘肃、陕西', '广西、湖南、贵州'], correctIndex: 1 },
      { question: '四渡赤水的战略意义是什么？', options: ['红军与二方面军会师', '摆脱了国民党几十万大军的围追堵截，扭转了被动局面', '标志着长征的胜利结束', '创立了川陕革命根据地'], correctIndex: 1 },
    ],
  },
  {
    id: 5,
    mapLabel: '金沙江',
    fullName: '巧渡金沙江',
    shortDesc: '跳出包围圈',
    videoUrl: 'BV1yRRXBZEJ7',
    questions: [
      { question: '红军巧渡金沙江发生在哪一年？', options: ['1934年', '1935年', '1936年', '1937年'], correctIndex: 1 },
      { question: '红军主力是在哪个渡口渡过金沙江的？', options: ['龙街渡', '洪门渡', '皎平渡', '安顺场'], correctIndex: 2 },
      { question: '巧渡金沙江中，红军缴获了多少只渡船？', options: ['3只', '5只', '7只', '10只'], correctIndex: 2 },
      { question: '巧渡金沙江的战略意义是什么？', options: ['红军首次翻越雪山', '红军彻底跳出了数十万敌军的围追堵截', '红军与四方面军会师', '红军到达陕北'], correctIndex: 1 },
      { question: '巧渡金沙江之前，红军采取了什么计策迷惑敌人？', options: ['正面强攻', '佯攻贵阳、威逼昆明', '静待敌军撤退', '分兵突围'], correctIndex: 1 },
    ],
  },
  {
    id: 6,
    mapLabel: '泸定桥',
    fullName: '飞夺泸定桥',
    shortDesc: '大渡桥横铁索寒',
    videoUrl: 'BV1aTGwzzED9',
    questions: [
      { question: '飞夺泸定桥发生在哪一天？', options: ['1935年5月25日', '1935年5月29日', '1935年6月12日', '1935年4月29日'], correctIndex: 1 },
      { question: '飞夺泸定桥时，共有多少名勇士攀踏铁索夺桥？', options: ['17名', '22名', '30名', '18名'], correctIndex: 1 },
      { question: '泸定桥横跨的是哪条河流？', options: ['金沙江', '乌江', '大渡河', '赤水河'], correctIndex: 2 },
      { question: '飞夺泸定桥前，红四团一昼夜急行军多少里？', options: ['120里', '180里', '240里', '300里'], correctIndex: 2 },
      { question: '泸定桥是什么样的桥？', options: ['石拱桥', '铁索桥', '木桥', '浮桥'], correctIndex: 1 },
    ],
  },
  {
    id: 7,
    mapLabel: '雪山',
    fullName: '翻越雪山',
    shortDesc: '翻越夹金山',
    videoUrl: 'BV1uZTW6TEpj',
    questions: [
      { question: '中央红军翻越的第一座大雪山叫什么？', options: ['梦笔山', '夹金山', '六盘山', '岷山'], correctIndex: 1 },
      { question: '夹金山的海拔约为多少米？', options: ['3000米', '3500米', '4114米', '5000米'], correctIndex: 2 },
      { question: '翻越雪山时红军面临的最大困难不包括以下哪项？', options: ['严寒低温', '空气稀薄', '敌军轰炸', '道路险峻'], correctIndex: 2 },
      { question: '中央红军在长征途中一共翻越了多少座海拔4000米以上的雪山？', options: ['3座', '5座', '7座', '10座'], correctIndex: 1 },
      { question: '翻越夹金山后，中央红军与哪支部队胜利会师？', options: ['红二方面军', '红二十五军', '红四方面军', '陕北红军'], correctIndex: 2 },
    ],
  },
  {
    id: 8,
    mapLabel: '草地',
    fullName: '穿越草地',
    shortDesc: '松潘大草地',
    videoUrl: 'BV1ZU4y1p7eb',
    questions: [
      { question: '红军穿越的草地位于今天的哪个区域？', options: ['四川若尔盖（松潘草地）', '内蒙古呼伦贝尔', '青海湖周边', '甘肃河西走廊'], correctIndex: 0 },
      { question: '右路军穿越草地用了多少天？', options: ['三天三夜', '六天六夜', '十天十夜', '半个月'], correctIndex: 1 },
      { question: '过草地时红军面临的最大威胁不包括以下哪项？', options: ['沼泽陷阱', '粮食极度匮乏', '国民党飞机猛烈轰炸', '恶劣天气'], correctIndex: 2 },
      { question: '过草地时，红军战士以什么充饥？', options: ['军粮和干粮', '当地百姓提供的食物', '野菜、草根、皮带等', '缴获的敌军物资'], correctIndex: 2 },
      { question: '过草地前，红军分为左、右两路军，率领右路军的是谁？', options: ['张国焘、朱德', '毛泽东、周恩来', '贺龙、任弼时', '徐向前、陈昌浩'], correctIndex: 1 },
    ],
  },
  {
    id: 9,
    mapLabel: '腊子口',
    fullName: '突破腊子口',
    shortDesc: '攻克天险',
    videoUrl: 'BV1AygE6HEtJ',
    questions: [
      { question: '腊子口位于哪个省的交界处？', options: ['四川与云南', '四川与甘肃', '甘肃与陕西', '贵州与四川'], correctIndex: 1 },
      { question: '指挥红军攻克腊子口的是谁？', options: ['林彪', '杨成武', '彭德怀', '刘伯承'], correctIndex: 1 },
      { question: '腊子口战役发生在哪一年？', options: ['1934年', '1935年', '1936年', '1937年'], correctIndex: 1 },
      { question: '腊子口的地形特点是？', options: ['一望无际的平原', '两侧悬崖绝壁的险要隘口', '沼泽遍布的草地', '森林密布的山区'], correctIndex: 1 },
      { question: '突破腊子口后，红军到达了哪里从而得知陕北有根据地？', options: ['遵义', '哈达铺', '吴起镇', '会宁'], correctIndex: 1 },
    ],
  },
  {
    id: 10,
    mapLabel: '吴起镇',
    fullName: '胜利会师',
    shortDesc: '长征胜利！',
    videoUrl: 'BV1M5411E7Qs',
    questions: [
      { question: '中央红军（红一方面军）长征到达陕北的时间是？', options: ['1935年8月', '1935年10月', '1936年1月', '1936年10月'], correctIndex: 1 },
      { question: '中央红军长征的终点是？', options: ['甘肃会宁', '陕西延安', '陕北吴起镇', '宁夏将台堡'], correctIndex: 2 },
      { question: '中央红军长征历时约多久？', options: ['6个月', '1年', '2年', '3年'], correctIndex: 1 },
      { question: '长征出发时8.6万余人，到达陕北时还剩约多少人？', options: ['约3万人', '约2万人', '约1万人', '约7000人'], correctIndex: 3 },
      { question: '1936年10月，红军三大主力在哪个地方会师，标志着长征全面胜利？', options: ['吴起镇', '延安', '会宁', '哈达铺'], correctIndex: 2 },
    ],
  },
];

// 获取所有答题关（排除序章）
export const getQuizLevels = () => LEVELS.filter((l) => !l.isIntro);

// 获取关卡总数（不含序章）
export const getTotalQuizLevels = () => getQuizLevels().length;
