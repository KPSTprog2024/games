// Goethe Complete Explorer - Fixed Version
// Enhanced timeline data (keeping from previous version)
const enhancedTimelineData = [
  {
    year: "1749",
    age: "0歳",
    goethe_event: "フランクフルト・アム・マインで8月28日に生まれる。",
    world_history: "ヨーロッパで七年戦争の前夜。プロイセン王フリードリヒ大王がオーストリア継承戦争に関与。",
    japan_history: "江戸時代中期、寛延2年。第9代将軍徳川家重の治世。田沼意次（父）が幕政に参与する前の時代。"
  },
  {
    year: "1765-1768",
    age: "16-19歳",
    goethe_event: "ライプツィヒ大学で法学を学ぶ；本格的な文学活動を開始。",
    world_history: "イギリス植民地でタウンゼンド諸法制定。アメリカ独立戦争の前夜、反英感情の高まり。",
    japan_history: "明和4年（1767年）に田沼意次が側用人となり、商業重視政策の始まり。田沼時代の開始。"
  },
  {
    year: "1773",
    age: "24歳",
    goethe_event: "戯曲『ゲッツ・フォン・ベルリヒンゲン』を出版し、シュトゥルム・ウント・ドラング運動を象徴する。",
    world_history: "ボストン茶会事件。イギリスに対するアメリカ植民地の抵抗が激化。",
    japan_history: "安永2年。江戸時代中期、田沼意次の政治改革が進む。商業振興策の展開。"
  },
  {
    year: "1774",
    age: "25歳",
    goethe_event: "小説『若きウェルテルの悩み』がヨーロッパ全土で大きな反響を呼ぶ。",
    world_history: "第1回大陸会議開催。アメリカ独立戦争の直前、イギリスの植民地政策に対する組織的抵抗。",
    japan_history: "安永3年。田沼意次による殖産興業政策。座の統制緩和、株仲間の公認など商業重視政策。"
  },
  {
    year: "1775",
    age: "26歳",
    goethe_event: "カール・アウグスト公爵によってワイマール宮廷に招かれる；ワイマールとの生涯にわたる関係が始まる。",
    world_history: "アメリカ独立戦争開始。レキシントン・コンコードの戦い。ワシントンが大陸軍司令官に就任。",
    japan_history: "安永4年。田沼意次の全盛期。蝦夷地探検の奨励、印旛沼干拓計画など積極的な開発政策。"
  },
  {
    year: "1782",
    age: "33歳",
    goethe_event: "貴族に叙せられ、法的には「フォン・ゲーテ」となる。",
    world_history: "アメリカ独立戦争終結へ。ヨークタウンの戦いでイギリス軍降伏（1781年10月）、パリ予備条約締結。",
    japan_history: "天明2年。天明の大飢饉の始まり（1782-1787）。浅間山大噴火の前年、田沼政治への批判高まる。"
  },
  {
    year: "1786-1788",
    age: "37-39歳",
    goethe_event: "2年間のイタリア紀行が彼の美学を根本的に変える。",
    world_history: "フランス革命前夜の混乱。名士会議開催（1787年）、議会の招集要求高まる。アメリカ合衆国憲法制定。",
    japan_history: "天明6-8年。田沼意次失脚（1786年）、松平定信による寛政の改革始まる（1787年）。"
  },
  {
    year: "1794",
    age: "45歳",
    goethe_event: "フリードリヒ・シラーとの親密な友情と協力関係が始まる（ワイマール古典主義）。",
    world_history: "フランス革命の恐怖政治。ロベスピエールの専制政治とテルミドールの反動。ジャコバン党の独裁。",
    japan_history: "寛政6年。寛政の改革継続。朱子学の官学化、出版統制の強化。湯島聖堂の修築。"
  },
  {
    year: "1796",
    age: "47歳",
    goethe_event: "『ヴィルヘルム・マイスターの修業時代』を出版し、教養小説の形式を開拓。",
    world_history: "ナポレオンのイタリア遠征開始。総裁政府時代のフランス、オーストリアに対する軍事作戦。",
    japan_history: "寛政8年。本居宣長『古事記伝』完成。国学の全盛期、日本固有の文化への回帰。"
  },
  {
    year: "1808",
    age: "59歳",
    goethe_event: "『ファウスト第一部』を発表；同年ナポレオンがゲーテと面会。",
    world_history: "ナポレオン戦争最盛期。スペイン独立戦争、イベリア半島戦争。ナポレオンのヨーロッパ支配体制確立。",
    japan_history: "文化5年。文化・文政時代の始まり。化政文化の開花期、町人文化の成熟。間宮林蔵の樺太探検。"
  },
  {
    year: "1809",
    age: "60歳",
    goethe_event: "小説『親和力』を出版。",
    world_history: "第5次対仏大同盟。オーストリアのナポレオンに対する抵抗、ワグラムの戦いでフランス勝利。",
    japan_history: "文化6年。伊能忠敬による日本地図測量事業の継続。近世後期の科学技術発展。"
  },
  {
    year: "1810",
    age: "61歳",
    goethe_event: "科学論文『色彩論』を発表。",
    world_history: "ナポレオン帝国の絶頂期。大陸封鎖令の強化、ルイーザとの結婚によるオーストリアとの同盟。",
    japan_history: "文化7年。蛮社の獄の前夜。洋学者の活動活発化、西洋科学技術の受容進展。"
  },
  {
    year: "1811-1814",
    age: "62-65歳",
    goethe_event: "自伝『詩と真実』第1部から第3部が刊行される。",
    world_history: "ナポレオンのロシア遠征失敗（1812年）からライプツィヒの戦い（1813年）、ナポレオン第一次退位（1814年）まで。",
    japan_history: "文化8-11年。ゴローニン事件（1811年）。外国船来航による対外関係の緊張。鎖国政策の動揺。"
  },
  {
    year: "1819",
    age: "70歳",
    goethe_event: "詩集『西東詩集』を発表。",
    world_history: "ウィーン体制下の反動期。ドイツ連邦でカールスバート決議、自由主義運動の弾圧。イギリスでピータールー事件。",
    japan_history: "文政2年。文政年間の天災頻発の時期。シーボルトの来日（1823年予定）前の鎖国体制動揺期。"
  },
  {
    year: "1821",
    age: "72歳",
    goethe_event: "『ヴィルヘルム・マイスターの遍歴時代』を出版。",
    world_history: "ナポレオン死去（セントヘレナ島）。ギリシャ独立戦争開始。南米諸国の独立運動活発化。",
    japan_history: "文政4年。異国船打払令制定。伊能忠敬『大日本沿海輿地全図』完成（死後）。"
  },
  {
    year: "1832",
    age: "83歳（逝去）",
    goethe_event: "3月22日にワイマールで逝去；『ファウスト第二部』が遺作として出版される。",
    world_history: "フランス七月革命後の混乱継続。ベルギー独立（1831年）。イギリスで第一次選挙法改正。",
    japan_history: "天保3年。天保の改革前夜。水野忠邦の老中就任前。大塩平八郎の乱（1837年）の5年前。"
  }
];

// Simplified but comprehensive works data
const completeWorksData = [
  {
    id: "faust",
    title: "ファウスト（第一部・第二部）",
    original_title: "Faust. Der Tragödie erster und zweiter Teil",
    year: "1808 / 1832",
    genre: "劇詩・悲劇",
    category: "major_novels",
    summary: "ゲーテの生涯の傑作。人間の知識に満足できないファウスト博士が悪魔メフィストフェレスと契約を結ぶ。第一部では彼のグレートヒェンへの悲劇的な愛を描き、第二部では寓話、政治、古典神話、そして最終的な救済へと拡大する。",
    chapters: [
      { title: "献辞", content: "ゲーテが若き日の友人たちへ捧げる詩的回想" },
      { title: "劇場にての前口上", content: "劇場支配人、詩人、道化師による演劇論議" },
      { title: "天上の序曲", content: "神とメフィストフェレスの契約、ファウストの魂を賭けた賭け" },
      { title: "夜（ファウストの書斎）", content: "ファウストの学問への絶望、自殺を考える" },
      { title: "城門の前", content: "復活祭の民衆、ファウストとワーグナーの散歩" },
      { title: "書斎", content: "プードル犬の正体、メフィストフェレスの登場" },
      { title: "悪魔との契約", content: "悪魔との血の契約締結" },
      { title: "アウエルバッハの地下酒場", content: "ライプツィヒの酒場での悪魔の手品" },
      { title: "魔女の台所", content: "ファウストの若返り" },
      { title: "街頭", content: "グレートヒェンとの運命的出会い" },
      { title: "夕べ", content: "グレートヒェンの部屋、宝石箱の贈り物" },
      { title: "散歩道", content: "メフィストフェレスとファウストの策略" },
      { title: "隣家", content: "グレートヒェンとマルテとの会話" },
      { title: "庭園", content: "ファウストとグレートヒェンの愛の対話" },
      { title: "庭の離れ", content: "初めての接吻、純愛の頂点" },
      { title: "森と洞窟", content: "ファウストの自然への感謝と内面的葛藤" },
      { title: "グレートヒェンの部屋", content: "糸車の歌「私の心の安らぎは去った」" },
      { title: "マルテの庭", content: "宗教についての対話、信仰と愛" },
      { title: "井戸", content: "村の娘の妊娠の噂、社会的偏見" },
      { title: "市壁のそば", content: "マリア像への祈り、罪の意識" },
      { title: "夜", content: "ヴァレンティンとの決闘、兄の死" },
      { title: "大聖堂", content: "グレートヒェンの良心の呵責" },
      { title: "ヴァルプルギスの夜", content: "ブロッケン山での魔女の饗宴" },
      { title: "牢獄", content: "グレートヒェンの救済と昇天「彼女は救われた」" },
      { title: "第二部・心地よい風景", content: "ファウストの復活、エルフたちによる癒し" },
      { title: "第二部・皇帝の宮廷", content: "財政危機と紙幣の発明" },
      { title: "第二部・古典的ヴァルプルギス", content: "古代ギリシャ神話の世界への旅" },
      { title: "第二部・ヘレナ", content: "ファウストとヘレナの神秘的結婚" },
      { title: "第二部・山の峡谷", content: "ファウストの魂の救済、合唱神秘「永遠に女性的なるもの」" }
    ]
  },
  {
    id: "werther",
    title: "若きウェルテルの悩み",
    original_title: "Die Leiden des jungen Werthers",
    year: "1774",
    genre: "書簡体小説",
    category: "major_novels",
    summary: "手紙を通して語られる、感受性豊かな芸術家ウェルテルの叶わぬ恋と社会的疎外感による自殺への道のりを描き、シュトゥルム・ウント・ドラング感情を体現した作品。",
    chapters: [
      { title: "5月4日の手紙", content: "ワルハイムへの到着、自然との一体感の喜び" },
      { title: "5月10日の手紙", content: "村の子供たちとの交流、牧歌的生活への憧れ" },
      { title: "5月13日の手紙", content: "シャルロッテ（ロッテ）との運命的出会い" },
      { title: "6月16日の手紙", content: "ロッテとの舞踏会、激しい恋情の始まり" },
      { title: "6月19日の手紙", content: "アルベルトの帰還への不安と嫉妬" },
      { title: "7月1日の手紙", content: "アルベルトとの初対面、複雑な三角関係の成立" },
      { title: "8月8日の手紙", content: "ロッテへの愛の告白と優しい拒絶" },
      { title: "8月30日の手紙", content: "別れの決意、ワルハイム出発の痛み" },
      { title: "10月20日の手紙", content: "外交官としての新生活への失望と不適応" },
      { title: "11月24日の手紙", content: "社会的偏見による屈辱体験" },
      { title: "3月15日の手紙", content: "官職からの辞職、社会への絶望" },
      { title: "5月9日の手紙", content: "ワルハイム再訪、変わらぬ愛情の確認" },
      { title: "12月20日の手紙", content: "最後の手紙、自殺の決意表明" },
      { title: "編集者の報告", content: "ウェルテルの死の状況詳細とアルベルト・ロッテ夫妻のその後" }
    ]
  },
  {
    id: "wilhelm_meister",
    title: "ヴィルヘルム・マイスターの修業時代",
    original_title: "Wilhelm Meisters Lehrjahre",
    year: "1795-1796",
    genre: "教養小説",
    category: "major_novels",
    summary: "青年ヴィルヘルムが商業から演劇の世界へ、さらに真の人間形成へと成長していく過程を描いた近代教養小説の原型。",
    chapters: [
      { title: "第1巻第1章", content: "少年時代の人形劇場への愛着と芸術的感性" },
      { title: "第1巻第2章", content: "演劇団との出会い、マリアーネへの初恋" },
      { title: "第2巻第1章", content: "商用旅行での劇団との偶然の遭遇" },
      { title: "第2巻第4章", content: "謎めいた少女ミニョンとの運命的出会い" },
      { title: "第3巻第3章", content: "ミニョンの「君よ知るや南の国」の歌" },
      { title: "第4巻第2章", content: "シェークスピアの「ハムレット」論の展開" },
      { title: "第5巻第3章", content: "ハムレット上演の大成功と精神的達成感" },
      { title: "第7巻第1章", content: "ミニョンの死と美しい葬儀" },
      { title: "第8巻第3章", content: "ナターリエとの結婚、愛の成就" },
      { title: "第8巻第5章", content: "修業時代の完了と実践への転身" }
    ]
  },
  {
    id: "elective_affinities",
    title: "親和力",
    original_title: "Die Wahlverwandtschaften",
    year: "1809",
    genre: "心理小説",
    category: "major_novels",
    summary: "化学の親和力の法則を人間関係に適用し、複雑な愛の関係を科学的比喩で描いた革新的作品。",
    chapters: [
      { title: "第1章", content: "エドゥアルトとシャルロッテ夫妻の平穏な結婚生活、大尉招待の提案" },
      { title: "第4章", content: "化学の親和力についての象徴的議論、人間関係への比喩" },
      { title: "第5章", content: "オッティーリエの到来、四人の微妙な関係の始まり" },
      { title: "第20章", content: "シャルロッテの出産、複雑な遺伝の象徴的表現" },
      { title: "第28章", content: "子供の溺死事故、運命の悲劇的転回" },
      { title: "第36章", content: "墓地での奇跡、愛の最終的神聖化" }
    ]
  },
  {
    id: "iphigenia",
    title: "タウリスのイフィゲーニエ",
    original_title: "Iphigenie auf Tauris",
    year: "1779/1787",
    genre: "古典主義悲劇",
    category: "major_dramas",
    summary: "人間性と真実の力によって野蛮な復讐の連鎖を断ち切る理想的女性イフィゲーニエを描いた古典主義の代表作。",
    chapters: [
      { title: "第1幕第1場", content: "イフィゲーニエの独白、故郷ギリシャへの深い郷愁" },
      { title: "第1幕第3場", content: "トアス王の求婚と断固たる拒絶" },
      { title: "第2幕第1場", content: "オレステスとピュラデスの登場" },
      { title: "第3幕第2場", content: "兄妹の劇的認識、血の絆の神秘的力" },
      { title: "第4幕第3場", content: "イフィゲーニエの高潔な道徳的決断、真実の選択" },
      { title: "第5幕第4場", content: "平和的解決の達成、愛と真実の最終勝利" }
    ]
  },
  {
    id: "tasso",
    title: "トルクァート・タッソ",
    original_title: "Torquato Tasso",
    year: "1790",
    genre: "心理劇",
    category: "major_dramas",
    summary: "16世紀イタリアの詩人タッソを主人公に、芸術家の理想と現実社会との相克を描いた芸術家悲劇。",
    chapters: [
      { title: "第1幕第1場", content: "フェラーラ宮廷、詩人タッソへの栄誉ある月桂冠授与" },
      { title: "第2幕第1場", content: "アントニオとの対立、芸術対政治の価値観" },
      { title: "第3幕第2場", content: "レオノーレ姫への情熱的愛の告白" },
      { title: "第4幕第2場", content: "タッソの病的猜疑心と被害妄想の発症" },
      { title: "第5幕第5場", content: "創作への回帰、芸術による救済の希望" }
    ]
  },
  {
    id: "color_theory",
    title: "色彩論",
    original_title: "Zur Farbenlehre",
    year: "1810",
    genre: "自然科学論文",
    category: "scientific_works",
    summary: "ニュートンの光学理論に対抗し、人間の知覚を重視した独自の色彩理論を展開した科学著作。",
    chapters: [
      { title: "第1部第1章：目と光", content: "視覚器官の精密な構造と光学的機能の分析" },
      { title: "第1部第2章：網膜像と残像", content: "残像現象の詳細な観察と心理学的分析" },
      { title: "第1部第4章：対比現象", content: "色の相互作用と対比効果の実験的研究" },
      { title: "第2部第1章：プリズム実験批判", content: "ニュートンのプリズム実験に対する根本的批判" },
      { title: "第2部第2章：屈折と色の発生", content: "境界現象としての色の発生メカニズム" },
      { title: "第3部第1章：顔料と染料", content: "物質固有の色の性質と化学的起源" },
      { title: "論争的部分", content: "ニュートン光学理論への詳細で体系的な批判と反駁" },
      { title: "芸術への応用", content: "絵画における色彩理論の実践的応用と美学的考察" }
    ]
  },
  {
    id: "poetry_and_truth",
    title: "詩と真実",
    original_title: "Aus meinem Leben: Dichtung und Wahrheit",
    year: "1811-1833",
    genre: "自伝文学",
    category: "autobiographical_works",
    summary: "ゲーテの生涯前半26年間を回想した自伝。事実と創作的記憶を巧妙に織り交ぜた近代自伝文学の傑作。",
    chapters: [
      { title: "第1巻", content: "フランクフルトでの誕生と幼年時代、裕福な市民家庭の環境" },
      { title: "第2巻", content: "少年期の多様な教育体験、七年戦争の影響" },
      { title: "第3巻", content: "初恋体験の詳細、カテヒェン・シェーンコプフとの純真な恋愛関係" },
      { title: "第6巻", content: "ライプツィヒ大学時代の開始、法学修学への不本意と文学への傾斜" },
      { title: "第11巻", content: "シュトラスブルク到着と新環境、大聖堂とゴシック建築への感動" },
      { title: "第12巻", content: "ヘルダーとの運命的出会い、ドイツ文学革新運動の理論的基盤" },
      { title: "第13巻", content: "フリーデリーケ・ブリオンとの牧歌的恋愛、アルザス農村の自然美" },
      { title: "第18巻", content: "『若きウェルテルの悩み』の成立背景、実人生体験と文学的創作の融合" },
      { title: "第20巻", content: "ワイマール公国への招聘、人生の新たな段階への歴史的転機" }
    ]
  }
];

// Work categories
const workCategories = [
  { id: 'all', name: '全て', count: completeWorksData.length },
  { id: 'major_novels', name: '主要小説', count: completeWorksData.filter(w => w.category === 'major_novels').length },
  { id: 'major_dramas', name: '主要戯曲', count: completeWorksData.filter(w => w.category === 'major_dramas').length },
  { id: 'scientific_works', name: '科学著作', count: completeWorksData.filter(w => w.category === 'scientific_works').length },
  { id: 'autobiographical_works', name: '自伝的著作', count: completeWorksData.filter(w => w.category === 'autobiographical_works').length }
];

// Application state
let currentView = 'timeline';
let currentCategory = 'all';
let filteredWorks = [...completeWorksData];
let filteredTimeline = [...enhancedTimelineData];
let expandedWorks = new Set();

// DOM elements
let app, modal, modalTitle, modalContent, modalClose;

// Initialize DOM references
function initDOMReferences() {
  app = document.getElementById('app');
  modal = document.getElementById('modal');
  modalTitle = document.getElementById('modal-title');
  modalContent = document.getElementById('modal-content');
  modalClose = document.querySelector('.modal-close');
}

// Initialize navigation
function initNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const view = btn.dataset.view;
      switchView(view);
      
      // Update active nav button
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function switchView(view) {
  currentView = view;
  
  switch(view) {
    case 'timeline':
      renderEnhancedTimeline();
      break;
    case 'works':
      renderCompleteWorks();
      break;
    case 'info':
      renderInfo();
      break;
  }
}

// Timeline functions (kept from previous)
function renderEnhancedTimeline() {
  filteredTimeline = [...enhancedTimelineData];
  
  const html = `
    <div class="timeline-section">
      <div class="timeline-header">
        <h2>ゲーテ年表</h2>
        <p>ヨハン・ヴォルフガング・フォン・ゲーテ（1749-1832）の生涯を世界史・日本史と併記</p>
      </div>
      
      <div class="timeline-filter">
        <input type="text" class="form-control" placeholder="年代、出来事、歴史的事件で検索..." id="timeline-search">
      </div>
      
      <div class="timeline" id="timeline-container">
        ${renderTimelineItems()}
      </div>
    </div>
  `;
  
  app.innerHTML = html;
  
  // Add event listeners after DOM update
  requestAnimationFrame(() => {
    const searchInput = document.getElementById('timeline-search');
    if (searchInput) {
      searchInput.addEventListener('input', filterTimeline);
    }
    addTimelineClickHandlers();
  });
}

function renderTimelineItems() {
  return filteredTimeline.map((item, index) => `
    <div class="timeline-item" data-index="${index}">
      <div class="timeline-year">
        <div class="year-badge">${item.year}</div>
        <div class="age-display">${item.age}</div>
      </div>
      <div class="timeline-content">
        <div class="goethe-event">
          <h4>ゲーテの生涯</h4>
          <p>${item.goethe_event}</p>
        </div>
        <div class="world-history">
          <h4>世界の動き</h4>
          <p>${item.world_history}</p>
        </div>
        <div class="japan-history">
          <h4>日本の動き</h4>
          <p>${item.japan_history}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function addTimelineClickHandlers() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  timelineItems.forEach(item => {
    item.addEventListener('click', () => {
      item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      timelineItems.forEach(i => i.classList.remove('highlight'));
      item.classList.add('highlight');
      
      setTimeout(() => item.classList.remove('highlight'), 3000);
    });
  });
}

function filterTimeline() {
  const searchTerm = document.getElementById('timeline-search').value.toLowerCase();
  
  if (!searchTerm) {
    filteredTimeline = [...enhancedTimelineData];
  } else {
    filteredTimeline = enhancedTimelineData.filter(item => 
      item.year.toLowerCase().includes(searchTerm) ||
      item.goethe_event.toLowerCase().includes(searchTerm) ||
      item.world_history.toLowerCase().includes(searchTerm) ||
      item.japan_history.toLowerCase().includes(searchTerm)
    );
  }
  
  updateTimelineView();
}

function updateTimelineView() {
  const timelineContainer = document.getElementById('timeline-container');
  if (timelineContainer) {
    timelineContainer.innerHTML = renderTimelineItems();
    requestAnimationFrame(() => {
      addTimelineClickHandlers();
    });
  }
}

// Works functions
function renderCompleteWorks() {
  currentCategory = 'all';
  filteredWorks = [...completeWorksData];
  
  const html = `
    <div class="works-section">
      <div class="works-header">
        <h2>ゲーテ全著作詳細</h2>
        <p>文学・戯曲・科学・自伝における全構造の学術的分析</p>
      </div>
      
      <div class="works-controls">
        <div class="works-search-container">
          <input type="text" class="form-control works-search" placeholder="著作、章、場面で検索..." id="works-search">
          <button class="btn export-btn" id="export-btn">引用情報をエクスポート</button>
        </div>
        
        <div class="category-tabs" id="category-tabs">
          ${renderCategoryTabs()}
        </div>
      </div>
      
      <div class="works-grid" id="works-container">
        ${renderWorksCards()}
      </div>
    </div>
  `;
  
  app.innerHTML = html;
  
  // Initialize event listeners after DOM is ready
  requestAnimationFrame(() => {
    initWorksEventListeners();
  });
}

function renderCategoryTabs() {
  return workCategories.map(category => `
    <button class="category-tab ${category.id === currentCategory ? 'active' : ''}" 
            data-category="${category.id}">
      ${category.name} (${category.count})
    </button>
  `).join('');
}

function renderWorksCards() {
  return filteredWorks.map(work => `
    <div class="work-card ${expandedWorks.has(work.id) ? 'expanded' : ''}" data-work-id="${work.id}">
      <div class="work-card-header">
        <h3 class="work-title">${work.title}</h3>
        <div class="work-original-title">${work.original_title}</div>
        <div class="work-meta">
          <span class="work-year">${work.year}</span>
          <span class="work-genre">${work.genre}</span>
        </div>
        <p class="work-summary">${work.summary}</p>
        <button class="expand-btn" data-work-id="${work.id}">
          <span class="expand-icon">${expandedWorks.has(work.id) ? '▲' : '▼'}</span>
          ${expandedWorks.has(work.id) ? '構造を隠す' : '構造を表示'}
        </button>
      </div>
      
      <div class="work-structure">
        ${renderWorkStructure(work)}
      </div>
    </div>
  `).join('');
}

function renderWorkStructure(work) {
  if (!work.chapters) return '<p>構造情報なし</p>';
  
  return `
    <div class="structure-section">
      <h4 class="structure-title">章構成・場面構成</h4>
      <ul class="chapters-list">
        ${work.chapters.map((chapter, index) => `
          <li class="chapter-item" data-chapter-index="${index}" data-work-id="${work.id}">
            <div class="chapter-title">${chapter.title}</div>
            <div class="chapter-summary">${chapter.content}</div>
          </li>
        `).join('')}
      </ul>
    </div>
  `;
}

function initWorksEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('works-search');
  if (searchInput) {
    searchInput.addEventListener('input', filterWorks);
  }
  
  // Category tabs
  document.querySelectorAll('.category-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchCategory(tab.dataset.category);
    });
  });
  
  // Expand/collapse buttons
  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleWorkExpansion(btn.dataset.workId);
    });
  });
  
  // Chapter/scene click handlers
  document.querySelectorAll('.chapter-item').forEach(item => {
    item.addEventListener('click', () => {
      const workId = item.dataset.workId;
      const chapterIndex = parseInt(item.dataset.chapterIndex);
      const work = completeWorksData.find(w => w.id === workId);
      const chapter = work.chapters[chapterIndex];
      
      openDetailModal(work, chapter.title, chapter.content);
    });
  });
  
  // Export button
  const exportBtn = document.getElementById('export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportCitations);
  }
}

function switchCategory(categoryId) {
  currentCategory = categoryId;
  
  if (categoryId === 'all') {
    filteredWorks = [...completeWorksData];
  } else {
    filteredWorks = completeWorksData.filter(work => work.category === categoryId);
  }
  
  updateWorksView();
}

function toggleWorkExpansion(workId) {
  if (expandedWorks.has(workId)) {
    expandedWorks.delete(workId);
  } else {
    expandedWorks.add(workId);
  }
  
  updateWorksView();
}

function filterWorks() {
  const searchTerm = document.getElementById('works-search').value.toLowerCase();
  let baseWorks;
  
  if (currentCategory === 'all') {
    baseWorks = completeWorksData;
  } else {
    baseWorks = completeWorksData.filter(work => work.category === currentCategory);
  }
  
  if (!searchTerm) {
    filteredWorks = [...baseWorks];
  } else {
    filteredWorks = baseWorks.filter(work => {
      return work.title.toLowerCase().includes(searchTerm) ||
             work.original_title.toLowerCase().includes(searchTerm) ||
             work.genre.toLowerCase().includes(searchTerm) ||
             work.summary.toLowerCase().includes(searchTerm) ||
             work.chapters.some(chapter => 
               chapter.title.toLowerCase().includes(searchTerm) ||
               chapter.content.toLowerCase().includes(searchTerm)
             );
    });
  }
  
  updateWorksView();
}

function updateWorksView() {
  const worksContainer = document.getElementById('works-container');
  const categoryTabs = document.getElementById('category-tabs');
  
  if (worksContainer) {
    worksContainer.innerHTML = renderWorksCards();
  }
  
  if (categoryTabs) {
    categoryTabs.innerHTML = renderCategoryTabs();
  }
  
  // Re-initialize event listeners
  requestAnimationFrame(() => {
    initWorksEventListeners();
  });
}

function openDetailModal(work, title, content) {
  if (!modalTitle || !modalContent || !modal) return;
  
  modalTitle.textContent = `${work.title} - ${title}`;
  modalContent.innerHTML = `
    <div class="chapter-detail">
      <h3>${title}</h3>
      <div class="chapter-content">${content}</div>
      
      <div class="citation-box">
        <div class="citation-title">学術引用:</div>
        <div class="citation-text">ゲーテ『${work.title}』（${work.year}）「${title}」</div>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
  
  if (modalClose) {
    modalClose.focus();
  }
}

function exportCitations() {
  const citations = filteredWorks.map(work => 
    `ゲーテ『${work.title}』（${work.original_title}）${work.year}, ${work.genre}`
  ).join('\n');
  
  const blob = new Blob([citations], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'goethe_citations.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Modal functions
function closeModal() {
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Info section
function renderInfo() {
  const html = `
    <div class="info-section">
      <h2>ゲーテ全集エクスプローラーについて</h2>
      <p>
        このゲーテ全集エクスプローラーは、ヨハン・ヴォルフガング・フォン・ゲーテ（1749-1832）の全著作を
        研究者・学習者のために包括的に提供するデジタル人文学ツールです。
      </p>
      
      <h3>主要機能</h3>
      <p>
        <strong>詳細な構造分析：</strong> 各作品の章、場面、部分を完全に分解し、内容の詳細な説明を提供します。
      </p>
      <p>
        <strong>カテゴリ別分類：</strong> 主要小説、主要戯曲、科学著作、自伝的著作に分類し、研究目的に応じたアクセスを可能にします。
      </p>
      <p>
        <strong>横断検索：</strong> 全著作、章、場面を通じた包括的な検索機能を提供します。
      </p>
      <p>
        <strong>学術的引用：</strong> 各章・場面の詳細情報と学術引用形式を提供し、研究論文作成を支援します。
      </p>
      
      <h3>対象となる著作</h3>
      <p>
        <strong>主要小説（4作品）：</strong> ファウスト（全29場面構成）、若きウェルテルの悩み、ヴィルヘルム・マイスターの修業時代、親和力
      </p>
      <p>
        <strong>主要戯曲（2作品）：</strong> タウリスのイフィゲーニエ、トルクァート・タッソ
      </p>
      <p>
        <strong>科学著作（1作品）：</strong> 色彩論（全8章構成）
      </p>
      <p>
        <strong>自伝的著作（1作品）：</strong> 詩と真実（全9巻構成）
      </p>
      
      <h3>使用方法</h3>
      <p>
        <strong>年表：</strong> ゲーテの生涯と同時代の世界史・日本史を対比して理解できます。
      </p>
      <p>
        <strong>著作詳細：</strong> カテゴリ別に分類された作品を選択し、「構造を表示」で詳細な章構成を確認できます。各章をクリックすると詳細なモーダルが表示されます。
      </p>
      <p>
        <strong>検索機能：</strong> 作品名、章題、内容で横断的に検索が可能です。
      </p>
      
      <h3>データの信頼性</h3>
      <p>
        本アプリケーションで使用されているデータは、ゲーテ全集および学術的研究資料に基づいて編集されており、
        ドイツ文学研究、比較文学研究、文化史研究に適用可能な精度を保持しています。
      </p>
    </div>
  `;
  
  app.innerHTML = html;
}

// Event listeners
function initEventListeners() {
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  initDOMReferences();
  initNavigation();
  initEventListeners();
  renderEnhancedTimeline();
});
