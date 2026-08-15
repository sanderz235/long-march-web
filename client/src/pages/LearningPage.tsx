import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

export default function LearningPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const tab = searchParams.get('tab') || 'article'

  const tabs = [
    { key: 'article', label: '图文资料' },
    { key: 'video', label: '视频资料' },
    { key: 'map', label: '历史地图' },
  ]

  // 初始化 activeTab：优先使用 URL 参数（从导航栏进入时带 ?tab=...）
  const [activeTab, setActiveTab] = useState<string>(tab)

  // 图文文章数据 - 微信公众号风格（每篇文章有标题、摘要、正文、图片）
  // 使用真实的长征历史图片
  const articles = [
    {
      title: '长征概述：人类历史上的伟大奇迹',
      cover: 'https://p1.img.cctvpic.com/photoAlbum/page/performance/img/2014/11/28/1417143214249_37.jpg',
      excerpt: '1934年10月至1936年10月，中国工农红军主力从长江南北各根据地向陕甘苏区进行的战略大转移。',
      content: `在人类文明的壮阔长河中，有一段跨越万水千山、镌刻信仰荣光的征程，永远熠熠生辉，那就是中国工农红军长征。1934年至1936年，面对第五次反“围剿”失利的绝境和国民党军队的围追堵截，各路红军义无反顾踏上战略转移之路，历时两年、纵横十余省，以无与伦比的意志与勇气完成了震撼世界的远征，成为人类历史上绝无仅有的伟大奇迹。
长征是绝境求生的悲壮征程，更是冲破黑暗的希望之路。1934年10月，中央红军从江西于都出发，八万余名将士告别故土，开启未知的漫漫征途。彼时的红军身陷绝境，外有数十倍于己的强敌步步紧逼，内有物资匮乏、缺衣少食的极端困境。漫漫征途上，红军将士历经六百余次大小战役战斗，血战湘江、四渡赤水、巧渡金沙江、飞夺泸定桥，每一场战斗都是生死考验。他们跨越近百条江河，攀越四十余座高山险峰，征服终年积雪的皑皑雪山，穿越荒无人烟的茫茫草地，在生死边缘踏出一条救国救民的生路。
长征的奇迹，源于永不磨灭的理想信念。在物资极度匮乏、环境极端恶劣的绝境中，支撑红军将士奋勇前行的，是对革命理想的执着坚守，是对民族解放的坚定信仰。雪山之上，寒风刺骨、氧气稀薄，战士们身着单衣、脚踏草鞋，顶着风雪稳步前行；草地之中，沼泽遍布、粮尽援绝，将士们啃食草根、煮食皮带，依然坚守初心、绝不退缩。无数革命先烈舍生取义，用血肉之躯冲破层层封锁，用生命诠释“革命理想高于天”的崇高信仰，让绝境中的远征始终饱含生生不息的力量。
长征的伟大，更在于其无可替代的历史价值与精神力量。这场远征不仅保存了中国革命的火种，扭转了中国革命的危局，更实现了中国革命的战略转折，为中国革命的最终胜利奠定了坚实基础。它不仅是一次军事战略的伟大转移，更是一次检验真理、唤醒民众、开创新局的伟大远征。长征打破了人类极限的桎梏，刷新了世界战争史的纪录，其历时之长、行程之远、艰险之巨、意志之坚，在人类历史上独一无二。
岁月流转，山河换新，但长征精神永不过时。这段用鲜血和生命铸就的征程，淬炼出不怕牺牲、坚韧不拔、团结奋进、忠诚担当的伟大长征精神，成为中华民族宝贵的精神财富。如今，硝烟散尽，但长征所彰显的信仰力量、奋斗姿态、无畏风骨，依然是激励国人砥砺前行的精神旗帜。
长征是镌刻在人类史册上的不朽丰碑，是震撼世界的英雄史诗。这场伟大奇迹昭示着：只要心怀信仰、不畏艰险、奋勇拼搏，就没有跨不过的高山、闯不过的难关。新时代的我们，当传承长征精神，汲取奋进力量，在新的征程上勇毅前行，续写属于新时代的奋斗华章。`
    },
    {
      title: '血战湘江：长征中最惨烈的战役',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01MqX7Bc1B3h0pXZGg9_!!6000000000166-0-tps-1920-1080.jpg',
      excerpt: '1934年11月27日至12月1日，中央红军在湘江上游广西境内的兴安县、全州县、灌阳县，与国民党军展开长征以来最惨烈的战役。',
      content: `1934年11月27日至12月1日，中央红军在湘江上游广西境内的兴安县、全州县、灌阳县，与国民党军展开长征以来最惨烈的战役。红军苦战五昼夜，终于突破了国民党军的第四道封锁线。但红军也付出了极为惨重的代价，从出发时的8.6万余人锐减至3万余人。

湘江惨败直接导致了遵义会议的召开，是长征中生死攸关的一战。血染湘江的悲壮，让红军将士深刻认识到"左"倾错误路线的危害，为 TString 会议的召开奠定了坚实的群众基础。

这场战役告诉我们：信仰不是空洞的口号，而是用生命铸就的坚定信念。`
    },
    {
      title: '遵义会议：生死攸关的转折点',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01r8BZ1z1E0JvQkX7mY_!!6000000000255-0-tps-1920-1080.jpg',
      excerpt: '1935年1月15日至17日，中共中央在贵州遵义召开政治局扩大会议，纠正了"左"倾军事指挥错误。',
      content: `1935年1月15日至17日，中共中央在贵州遵义召开政治局扩大会议。会议纠正了博古、李德等人的"左"倾军事指挥错误，确立了毛泽东在红军和党中央的领导地位。

遵义会议是中国共产党第一次独立自主地运用马克思主义基本原理解决自己的路线、方针和政策问题，在极其危急的关头挽救了党、挽救了红军、挽救了中国革命，是中国共产党历史上生死攸关的转折点。

会议FileSize在极端危急的历史关头，能够独立自主地运用马克思主义基本原理，解决中国革命的重大问题，体现了中国共产党日益成熟的政治智慧和强大的生命力。`
    },
    {
      title: '四渡赤水：毛泽东的得意之笔',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01MqX7Bc1B3h0pXZGg9_!!6000000000166-0-tps-1920-1080.jpg',
      excerpt: '1935年1月29日至3月22日，毛泽东指挥中央红军在赤水河流域采取高度机动的运动战方针。',
      content: `1935年1月29日至3月22日，毛泽东指挥中央红军在贵州、四川、云南三省交界的赤水河流域，采取高度机动的运动战方针，四次渡过赤水河。红军以3万余人对抗国民党40万大军，巧妙穿插于敌军重兵集团之间，创造了以弱胜强的战争奇迹。

一渡赤水（1935年1月29日）：从土城、元厚渡口西渡赤水，向扎西（今云南威信）集结。
二渡赤水（2月18-21日）：从太平渡、二郎滩等渡口东渡赤水，回师黔北，取桐梓、占娄山关、重占遵义城，取得长征以来最大的一次胜利。
三渡赤水（3月16-17日）：从茅台镇西渡赤水，佯装北渡长江，调动敌人西进。
四渡赤水（3月21-22日）：从二郎滩、太平渡等渡口秘密东渡赤水，南渡乌江，兵临贵阳，威逼昆明，彻底跳出敌军包围圈。

毛泽东称四渡赤水是他军事生涯的"得意之笔"，这是速度与智慧的完美结合，是战略被动转为主动的经典之作。`
    },
    {
      title: '巧渡金沙江：跳出敌军包围圈',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01r8BZ1z1E0JvQkX7mY_!!6000000000255-0-tps-1920-1080.jpg',
      excerpt: '1935年5月3日至9日，中央红军巧取皎平渡，依靠7只木船，经过七天七夜的摆渡，全部安全渡过金沙江。',
      content: `1935年5月3日至9日，中央红军在毛泽东的指挥下，利用滇军被调出的空当，以急行军速向金沙江挺进。红军先遣队化装成国民党军，不费一枪一弹智取皎平渡，控制了渡口。红军主力依靠7只木船，经过七天七夜的摆渡，全部安全渡过金沙江。

从此，中央红军跳出了数十万国民党大军的围追堵截，取得了战略转移中具有决定意义的胜利。金沙江的浪涛见证了红军将士的智慧与勇敢，这是一场不战而胜的精彩较量。

金沙江Configure是 army 与自然的搏斗，更是意志与信念的考验。`
    },
    {
      title: '飞夺泸定桥：13根铁索上的传奇',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01MqX7Bc1B3h0pXZGg9_!!6000000000166-0-tps-1920-1080.jpg',
      excerpt: '1935年5月29日，红四团官兵冒雨急行军240里，22名突击队员攀踏悬空铁索，成功夺占泸定桥。',
      content: `1935年5月29日，红四团官兵冒着大雨，一昼夜山路急行军240里，创造了人类行军史上的奇迹。泸定桥桥面木板已被敌军拆去，只剩下13根铁索横跨在奔腾咆哮的大渡河上。22名突击队员在连长廖大珠带领下，冒着敌人密集的火力，攀踏着悬空的铁索向对岸冲去。经过两小时激战，成功夺占泸定桥，打开了中央红军北上的通道。

这是一场勇气与信念的较量。13根冰冷的铁索，22个勇敢的生命，在敌人的枪林弹雨中，用鲜血和生命铺就了一条通往胜利的道路。

泸定桥的铁索至今仍在风中铮铮作响，诉说着那段惊心动魄的往事。`
    },
    {
      title: '翻越夹金山：海拔4114米的生命极限',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01r8BZ1z1E0JvQkX7mY_!!6000000000255-0-tps-1920-1080.jpg',
      excerpt: '1935年6月，中央红军翻越了长征途中的第一座大雪山——夹金山，海拔4114米，空气稀薄，终年积雪。',
      content: `1935年6月，中央红军翻越了长征途中的第一座大雪山——夹金山。夹金山海拔4114米，山上终年积雪，空气稀薄，人迹罕至。红军战士穿着单薄的衣衫，在零下二三十度的严寒中艰难攀登。高原缺氧使许多战士头晕目眩、呼吸困难，有的战士坐下后就再也没有站起来。

中央红军在长征途中一共翻越了5座海拔4000米以上的雪山，展现了人类意志力的极限。雪山之巅，红军的旗帜迎风招展，那是信仰的力量，那是生命的奇迹。

翻越雪山，不仅是身体的考验，更是精神的升华。`
    },
    {
      title: '穿越松潘草地：最艰苦的行程',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01MqX7Bc1B3h0pXZGg9_!!6000000000166-0-tps-1920-1080.jpg',
      excerpt: '1935年8月，红军进入川西北的松潘草地——一片面积约1.5万平方公里的高原沼泽地带。',
      content: `1935年8月，红军进入川西北的松潘草地——一片面积约1.5万平方公里的高原沼泽。草地表面是水草掩盖的泥潭，一旦陷落便难以自拔。红军断粮多日，以野菜、草根、树皮甚至皮带充饥。许多战士因饥饿、寒冷、疾病而永远倒在了草地上。经过六天六夜的艰难跋涉，右路军终于走出了草地。据不完全统计，红军在过草地期间减员约6000人。

草地，是红军长征中最为艰难的一段行程。这里没有路，战士们只能踩着前面同志的脚印前行；这里没有食物，战士们只能以草根树皮充饥；这里没有住宿，夜晚只能互相依偎取暖。

但红军战士们凭借坚定的信念和顽强的意志，最终走出了这片死亡之旅。`
    },
    {
      title: '突破腊子口：天险隘口的胜利',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01r8BZ1z1E0JvQkX7mY_!!6000000000255-0-tps-1920-1080.jpg',
      excerpt: '1935年9月，红军到达甘肃南部的腊子口——"一夫当关，万夫莫开"的天险隘口，经过猛烈战斗，成功攻克。',
      content: `1935年9月，红军到达甘肃南部的腊子口——"一夫当关，万夫莫开"的天险隘口。腊子口两侧是悬崖绝壁，中间只有一条窄路通过。红军采取正面强攻与侧翼迂回相结合的战术，由杨成武指挥红四团，组织敢死队攀上悬崖，从背后突袭敌军。经过猛烈战斗，成功攻克腊子口。随后红军抵达哈达铺，从报纸上得知陕北有红军根据地的消息，为长征指明了方向。

腊子口的胜利，是战术与勇敢的完美结合。敌人以为天险难攻，却没想到红军将士能攀上绝壁，从背后发起致命一击。

这座天险隘口，最终成为了红军北上的重要通道。`
    },
    {
      title: '胜利会师：长征全面结束的伟大时刻',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01MqX7Bc1B3h0pXZGg9_!!6000000000166-0-tps-1920-1080.jpg',
      excerpt: '1935年10月19日，中央红军到达陕北吴起镇；1936年10月，红军三大主力在甘肃会宁胜利会师。',
      content: `1935年10月19日，中央红军（红一方面军）到达陕北吴起镇，历时一年的长征胜利结束。出发时8.6万余人，到达时仅剩约7000人。1936年10月，红军三大主力（红一、红二、红四方面军）在甘肃会宁胜利会师，标志着长征的全面胜利。

长征的胜利，宣告了国民党反动派消灭中国共产党和红军的图谋彻底失败，为开展抗日战争和发展中国革命事业创造了重要条件。这是一次人类历史上的伟大壮举，是一次精神与信念的奇迹。

会宁会师的钟声至今仍在历史的长河中回响，诉说着那段波澜壮阔的历史。`
    },
  ]

  const videos = [
    { title: '第一集：英雄史诗', bvid: 'BV1pKaVzBEg6', p: 1 },
    { title: '第二集：路在何方', bvid: 'BV1pKaVzBEg6', p: 2 },
    { title: '第三集：伟大转折', bvid: 'BV1pKaVzBEg6', p: 3 },
    { title: '第四集：战史奇观', bvid: 'BV1pKaVzBEg6', p: 4 },
    { title: '第五集：民心所向', bvid: 'BV1pKaVzBEg6', p: 5 },
    { title: '第六集：跨越极限', bvid: 'BV1pKaVzBEg6', p: 6 },
    { title: '第七集：百川归海', bvid: 'BV1pKaVzBEg6', p: 7 },
    { title: '第八集：永远长征', bvid: 'BV1pKaVzBEg6', p: 8 },
  ]

  const maps = [
    {
      title: '长征路线全图',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01r8BZ1z1E0JvQkX7mY_!!6000000000255-0-tps-1920-1080.jpg',
      desc: '详细描述红一方面军长征的完整路线：瑞金出发→突破四道封锁线→湘江战役→通道转兵→黎平会议→强渡乌江→遵义会议→四渡赤水→巧渡金沙江→彝海结盟→强渡大渡河→飞夺泸定桥→翻越夹金山→懋功会师→两河口会议→穿越松潘草地→巴西会议→突破腊子口→哈达铺整编→翻越六盘山→到达吴起镇。全程约二万五千里，历时368天。',
    },
    {
      title: '四渡赤水示意图',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01MqX7Bc1B3h0pXZGg9_!!6000000000166-0-tps-1920-1080.jpg',
      desc: '详细描述四渡赤水的全过程。一渡赤水（1935年1月29日）：从土城、元厚渡口西渡赤水，向扎西（今云南威信）集结。二渡赤水（2月18-21日）：从太平渡、二郎滩等渡口东渡赤水，回师黔北，取桐梓、占娄山关、重占遵义城，取得长征以来最大的一次胜利。三渡赤水（3月16-17日）：从茅台镇西渡赤水，佯装北渡长江，调动敌人西进。四渡赤水（3月21-22日）：从二郎滩、太平渡等渡口秘密东渡赤水，南渡乌江，兵临贵阳，威逼昆明，彻底跳出敌军包围圈。',
    },
    {
      title: '雪山草地路线',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01r8BZ1z1E0JvQkX7mY_!!6000000000255-0-tps-1920-1080.jpg',
      desc: '详细描述翻越雪山和穿越草地的路线。夹金山（海拔4114米）→梦笔山（海拔4470米）→长板山（海拔4800米）→打鼓山（海拔4700米）→仓德山（海拔4600米）。松潘草地：面积约1.5万平方公里，海拔3500米以上，是典型的沼泽草地。红军分左右两路穿越草地，左路军由张国焘率领，右路军由毛泽东、周恩来率领。',
    },
    {
      title: '三大主力会师',
      cover: 'https://img.alicdn.com/imgextra/i1/O1CN01MqX7Bc1B3h0pXZGg9_!!6000000000166-0-tps-1920-1080.jpg',
      desc: '1936年10月9日，红一、红四方面军在甘肃会宁会师。10月22日，红一、红二方面军在宁夏将台堡会师。至此，红军三大主力胜利会师，长征全面结束。',
    },
  ]

  const [selectedArticle, setSelectedArticle] = useState<number | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null)

  const handleTabClick = (key: string) => {
    setActiveTab(key)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', key)
    window.history.pushState({}, '', url)
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm mb-6 transition-all duration-200 hover:opacity-70"
        style={{ color: '#8b3a2a' }}
      >
        <span className="text-lg leading-none">←</span>
        <span>返回上页</span>
      </button>

      <h1 className="text-3xl font-bold mb-8 tracking-wider" style={{ color: '#3b2a1a', fontFamily: 'serif' }}>
        学习资料
      </h1>

      {/* Tab 切换 - 点击展开/收起 */}
      <div className="flex gap-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabClick(t.key)}
            className={`px-6 py-2 text-sm rounded transition-all duration-200 ${
              activeTab === t.key ? 'bg-amber-100 text-red-700 border border-red-300 font-bold' : 'bg-white text-amber-800 border border-amber-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 图文资料 - 微信公众号风格 */}
      {activeTab === 'article' && (
        <>
          {selectedArticle === null ? (
            /* 文章列表 */
            <div className="grid gap-6 max-w-5xl mx-auto px-4">
              {articles.map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer border border-amber-200"
                  style={{
                    background: '#fdf8f0',
                  }}
                  onClick={() => setSelectedArticle(i)}
                >
                  <div className="w-full h-48 md:h-64 overflow-hidden">
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="p-6 md:p-8">
                    <h3
                      className="text-2xl md:text-3xl font-bold mb-3 leading-tight hover:underline"
                      style={{ color: '#3b2a1a', fontFamily: 'serif' }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-base md:text-lg leading-relaxed text-gray-600 mb-3"
                      style={{ color: '#5c3d2e' }}
                    >
                      {item.excerpt}
                    </p>
                    <div
                      className="text-sm leading-relaxed text-gray-500 line-clamp-3"
                      style={{ color: '#6b5b4b' }}
                    >
                      {item.content}
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium">
                      <span className="px-4 py-2 rounded-full text-xs" style={{ background: 'rgba(196,30,58,0.15)', color: '#c41e3a', fontWeight: 'bold' }}>
                        阅读全文
                      </span>
                      <span className="text-gray-400 text-xs">阅读约 5 分钟</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* 文章详情页 */
            <div className="max-w-4xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center gap-1 mb-6 text-sm hover:opacity-70 transition-colors"
                style={{ color: '#8b3a2a' }}
              >
                <span className="text-lg leading-none">←</span>
                <span>返回列表</span>
              </button>
              {articles[selectedArticle] && (
                <article className="rounded-2xl overflow-hidden shadow-xl border border-amber-200" style={{ background: '#fdf8f0' }}>
                  <div className="w-full h-64 md:h-80 overflow-hidden">
                    <img
                      src={articles[selectedArticle].cover}
                      alt={articles[selectedArticle].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 md:p-10">
                    <h1
                      className="text-3xl md:text-4xl font-bold mb-6 leading-tight"
                      style={{ color: '#3b2a1a', fontFamily: 'serif' }}
                    >
                      {articles[selectedArticle].title}
                    </h1>
                    <p className="text-lg leading-loose text-gray-600 mb-8 border-l-4 border-amber-300 pl-4">
                      {articles[selectedArticle].excerpt}
                    </p>
                    <div className="prose prose-lg text-gray-700 leading-loose">
                      <p className="mb-6">{articles[selectedArticle].content}</p>
                    </div>
                  </div>
                </article>
              )}
            </div>
          )}
        </>
      )}

      {/* 视频资料 - B站风格布局（显示完整视频播放器） */}
      {activeTab === 'video' && selectedVideo === null && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
          {videos.map((item, i) => (
            <div
              key={i}
              className="group rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-amber-200"
              style={{
                background: '#fdf8f0',
              }}
              onClick={() => setSelectedVideo(i)}
            >
              <div className="relative aspect-video overflow-hidden">
                {/* B站 iframe 自动封面 */}
                <iframe
                  src={`https://player.bilibili.com/player.html?bvid=${item.bvid}&p=${item.p}&autoplay=0&high_quality=1`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  style={{ border: 'none', borderRadius: '0.75rem' }}
                  title={item.title}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/0 transition-colors" />
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-bold text-white" style={{ background: 'rgba(0,0,0,0.7)' }}>
                  {item.title}
                </div>
              </div>
              <div className="p-4">
                <h3
                  className="text-lg font-bold mb-2 truncate hover:underline"
                  style={{ color: '#3b2a1a' }}
                >
                  {item.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: '#8b7355' }}>
                    央视纪录片《长征》
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(196,30,58,0.15)', color: '#c41e3a', fontWeight: 'bold' }}>
                    点击观看
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 视频详情页 - 完整播放器 */}
      {activeTab === 'video' && selectedVideo !== null && videos[selectedVideo] && (
        <div className="max-w-5xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button
            onClick={() => setSelectedVideo(null)}
            className="flex items-center gap-1 mb-6 text-sm hover:opacity-70 transition-colors"
            style={{ color: '#8b3a2a' }}
          >
            <span className="text-lg leading-none">←</span>
            <span>返回列表</span>
          </button>
          <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-200" style={{ background: '#fdf8f0' }}>
            <div className="w-full aspect-video">
              <iframe
                src={`https://player.bilibili.com/player.html?bvid=${videos[selectedVideo].bvid}&p=${videos[selectedVideo].p}&autoplay=0&high_quality=1`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ border: 'none' }}
                title={videos[selectedVideo].title}
              />
            </div>
            <div className="p-6 md:p-8">
              <h2
                className="text-2xl md:text-3xl font-bold mb-4"
                style={{ color: '#3b2a1a', fontFamily: 'serif' }}
              >
                {videos[selectedVideo].title}
              </h2>
              <p className="text-base" style={{ color: '#5c3d2e' }}>
                央视纪录片《长征》第八集
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 历史地图 - 带地图图片的布局 */}
      {activeTab === 'map' && (
        <div className="grid gap-6 max-w-6xl mx-auto px-4">
          {maps.map((item, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row gap-6 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-amber-200"
              style={{
                background: '#fdf8f0',
              }}
            >
              <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden rounded-lg">
                <img
                  src={item.cover}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="flex-1 p-6 md:p-8">
                <h3
                  className="text-2xl md:text-3xl font-bold mb-4"
                  style={{ color: '#3b2a1a', fontFamily: 'serif' }}
                >
                  {item.title}
                </h3>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: '#5c3d2e' }}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 提示 */}
      <p className="mt-8 text-center text-sm" style={{ color: '#8b7355' }}>
        更多资料持续更新中……
      </p>
    </div>
  )
}
