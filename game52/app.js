// 200 grumbles data
const grumbles = [
  "この歳になると、階段を上るだけで息が切れる",
  "この歳になると、膝が痛くて歩くのがつらい",
  "この歳になると、腰が重くて朝起きるのに時間がかかる",
  "この歳になると、足がむくんで靴がきつい",
  "この歳になると、肩こりが慢性化している",
  "この歳になると、目がかすんで地図が読めない",
  "この歳になると、夜中にトイレに起きる回数が増えた",
  "この歳になると、疲れが翌日まで残る",
  "この歳になると、重いリュックが肩に食い込む",
  "この歳になると、長時間歩くと足の裏が痛い",
  "この歳になると、駅名を覚えられない",
  "この歳になると、どこに何を置いたか忘れる",
  "この歳になると、昨日泊まった宿の名前が出てこない",
  "この歳になると、スマホの操作がわからない",
  "この歳になると、乗り換えの仕方を間違える",
  "この歳になると、新しいことを覚えるのに時間がかかる",
  "この歳になると、人の名前が思い出せない",
  "この歳になると、今日が何日かわからなくなる",
  "この歳になると、財布をどこにしまったか忘れる",
  "この歳になると、予定を立てても忘れてしまう",
  "この歳になると、安い宿の布団が体に合わない",
  "この歳になると、コンビニ弁当ばかりでは胃がもたれる",
  "この歳になると、硬いせんべいが歯にしみる",
  "この歳になると、冷たいものを食べると腹を壊す",
  "この歳になると、夜遅い食事は消化に悪い",
  "この歳になると、アルコールが翌日まで残る",
  "この歳になると、塩分の多い食事で血圧が気になる",
  "この歳になると、相部屋では眠れない",
  "この歳になると、枕が変わると首が痛い",
  "この歳になると、朝食抜きでは力が出ない",
  "この歳になると、雨に濡れると風邪をひきやすい",
  "この歳になると、暑さに弱くなった",
  "この歳になると、寒さが骨身にしみる",
  "この歳になると、湿気で関節が痛む",
  "この歳になると、強風で体がふらつく",
  "この歳になると、紫外線が気になる",
  "この歳になると、気圧の変化で頭痛がする",
  "この歳になると、花粉症がひどくなった",
  "この歳になると、エアコンの効いた部屋から出るのがつらい",
  "この歳になると、標高の高いところで息苦しい",
  "この歳になると、夜行バスはきつい",
  "この歳になると、長時間の電車移動で腰が痛い",
  "この歳になると、満員電車に押し潰されそう",
  "この歳になると、乗り物酔いしやすくなった",
  "この歳になると、自転車に長時間乗れない",
  "この歳になると、歩くスピードが遅くなった",
  "この歳になると、急な坂道がきつい",
  "この歳になると、荷物を持って移動するのが大変",
  "この歳になると、時刻表を見るのに老眼鏡が必要",
  "この歳になると、終電を逃すと困る",
  "この歳になると、宿泊費がバカにならない",
  "この歳になると、交通費だけで予算オーバー",
  "この歳になると、食費を削るのもつらい",
  "この歳になると、お土産代も考えないと",
  "この歳になると、医療費も旅費に含めないと",
  "この歳になると、保険料が気になる",
  "この歳になると、年金生活が心配",
  "この歳になると、子供の教育費もかかる",
  "この歳になると、住宅ローンもまだ残ってる",
  "この歳になると、老後資金を貯めないと",
  "この歳になると、家族に心配をかける",
  "この歳になると、妻に怒られる",
  "この歳になると、子供に呆れられる",
  "この歳になると、親の介護も考えないと",
  "この歳になると、会社を長期間空けられない",
  "この歳になると、同僚に迷惑をかける",
  "この歳になると、友人も忙しくて連絡が取れない",
  "この歳になると、一人旅が寂しい",
  "この歳になると、若い人についていけない",
  "この歳になると、世代ギャップを感じる",
  "この歳になると、スマホの地図アプリが使いこなせない",
  "この歳になると、QRコードの読み方がわからない",
  "この歳になると、キャッシュレス決済が面倒",
  "この歳になると、Wi-Fiの接続方法がわからない",
  "この歳になると、SNSの使い方がわからない",
  "この歳になると、オンライン予約が苦手",
  "この歳になると、デジタルカメラの操作が複雑",
  "この歳になると、充電器を忘れがち",
  "この歳になると、新しいアプリが覚えられない",
  "この歳になると、パスワードを忘れる",
  "この歳になると、早起きがつらい",
  "この歳になると、夜更かしができない",
  "この歳になると、時間の余裕がない",
  "この歳になると、予定を詰め込みすぎる",
  "この歳になると、移動時間を甘く見がち",
  "この歳になると、休憩時間が長くなる",
  "この歳になると、昼寝が必要",
  "この歳になると、夕方には疲れ切る",
  "この歳になると、朝の準備に時間がかかる",
  "この歳になると、計画通りに進まない",
  "この歳になると、鏡を見るのがつらい",
  "この歳になると、白髪が目立つ",
  "この歳になると、お腹が出てきた",
  "この歳になると、服装に気を使わなくなった",
  "この歳になると、靴擦れしやすい",
  "この歳になると、汗をかきやすい",
  "この歳になると、体臭が気になる",
  "この歳になると、歯が黄ばんできた",
  "この歳になると、姿勢が悪くなった",
  "この歳になると、若い頃の服が似合わない",
  "この歳になると、やる気が続かない",
  "この歳になると、新しい挑戦が怖い",
  "この歳になると、失敗を恐れる",
  "この歳になると、人目が気になる",
  "この歳になると、自信がなくなった",
  "この歳になると、諦めが早い",
  "この歳になると、感動が薄れた",
  "この歳になると、涙もろくなった",
  "この歳になると、孤独感を感じる",
  "この歳になると、昔を懐かしむ",
  "この歳になると、全国制覇なんて無謀だった",
  "この歳になると、芭蕉の偉大さがわかる",
  "この歳になると、昔の旅人はすごかった",
  "この歳になると、観光地が混みすぎてる",
  "この歳になると、有名な場所より静かな所がいい",
  "この歳になると、歴史の重みを感じる",
  "この歳になると、日本の美しさに気づく",
  "この歳になると、方言が聞き取れない",
  "この歳になると、郷土料理が胃に重い",
  "この歳になると、温泉が一番の楽しみ",
  "この歳になると、若い頃はよかった",
  "この歳になると、昔はもっと元気だった",
  "この歳になると、学生時代が懐かしい",
  "この歳になると、新婚旅行を思い出す",
  "この歳になると、子供の頃の夏休みが恋しい",
  "この歳になると、親父の気持ちがわかる",
  "この歳になると、先輩の言葉が身にしみる",
  "この歳になると、時の流れの早さを感じる",
  "この歳になると、人生の折り返し地点",
  "この歳になると、残り時間を意識する",
  "この歳になると、家でゴロゴロしていたい",
  "この歳になると、温泉宿でのんびりしたい",
  "この歳になると、マッサージを受けたい",
  "この歳になると、美味しいものを食べたい",
  "この歳になると、早く家に帰りたい",
  "この歳になると、布団が恋しい",
  "この歳になると、テレビを見ていたい",
  "この歳になると、新聞をゆっくり読みたい",
  "この歳になると、庭いじりでもしていたい",
  "この歳になると、孫と遊んでいたい",
  "この歳になると、薬を忘れがち",
  "この歳になると、血圧が気になる",
  "この歳になると、コレステロール値が心配",
  "この歳になると、定期検診を受けないと",
  "この歳になると、持病が悪化しそう",
  "この歳になると、救急病院の場所を確認したい",
  "この歳になると、保険証を忘れると不安",
  "この歳になると、かかりつけ医が恋しい",
  "この歳になると、健康第一だと実感",
  "この歳になると、無理は禁物",
  "この歳になると、B級グルメが胃にもたれる",
  "この歳になると、辛いものが苦手",
  "この歳になると、油っこいものは避けたい",
  "この歳になると、量より質を重視",
  "この歳になると、地酒が飲みたくなる",
  "この歳になると、郷土料理に興味が湧く",
  "この歳になると、野菜不足が心配",
  "この歳になると、食べ歩きがきつい",
  "この歳になると、立ち食いは腰が痛い",
  "この歳になると、消化の良いものがいい",
  "この歳になると、ビジネスホテルでは疲れが取れない",
  "この歳になると、畳の部屋で足を伸ばしたい",
  "この歳になると、大浴場でゆっくりしたい",
  "この歳になると、早めにチェックインしたい",
  "この歳になると、朝食付きプランがありがたい",
  "この歳になると、部屋でくつろぐ時間が必要",
  "この歳になると、Wi-Fiより静寂が欲しい",
  "この歳になると、エレベーターのある宿がいい",
  "この歳になると、駅から近い宿を選びたい",
  "この歳になると、個室でないと落ち着かない",
  "この歳になると、無理をしてはいけない",
  "この歳になると、身の程を知るべき",
  "この歳になると、計画を見直すべき",
  "この歳になると、家族の意見を聞くべき",
  "この歳になると、安全第一で行くべき",
  "この歳になると、近場で満足すべき",
  "この歳になると、ツアーに参加すべき",
  "この歳になると、一人旅は危険",
  "この歳になると、若い頃の夢は夢のまま",
  "この歳になると、現実を受け入れるべき",
  "この歳になると、でも諦めたくない気持ちもある",
  "この歳になると、今しかできないこともある",
  "この歳になると、後悔したくない",
  "この歳になると、挑戦することに意味がある",
  "この歳になると、完走より完歩が大事",
  "この歳になると、旅の途中で得るものがある",
  "この歳になると、人との出会いが財産",
  "この歳になると、景色の美しさが心にしみる",
  "この歳になると、一歩一歩が貴重",
  "この歳になると、家族に自慢できる話ができる",
  "この歳になると、やれるところまでやってみよう",
  "この歳になると、明日のことは明日考えよう",
  "この歳になると、今日一日を大切にしよう",
  "この歳になると、小さな幸せを見つけよう",
  "この歳になると、旅は人生の縮図だと思う",
  "この歳になると、歩けるうちに歩こう",
  "この歳になると、見られるうちに見ておこう",
  "この歳になると、体験できるうちに体験しよう",
  "この歳になると、生きているだけで儲けもの",
  "この歳になると、それでもやっぱり歩き続けたい"
];

// App state
let messageHistory = [];
const MAX_MESSAGES = 50;

// DOM elements
const chatMessages = document.getElementById('chatMessages');
const grumbleBtn = document.getElementById('grumbleBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to grumble button
    grumbleBtn.addEventListener('click', addGrumbleMessage);
    
    // Remove welcome message on first click
    let isFirstClick = true;
    grumbleBtn.addEventListener('click', function() {
        if (isFirstClick) {
            const welcomeMessage = document.querySelector('.welcome-message');
            if (welcomeMessage) {
                welcomeMessage.remove();
            }
            isFirstClick = false;
        }
    });
});

// Get random grumble
function getRandomGrumble() {
    const randomIndex = Math.floor(Math.random() * grumbles.length);
    return grumbles[randomIndex];
}

// Format current time
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Add grumble message to chat
function addGrumbleMessage() {
    // Disable button temporarily to prevent spam
    grumbleBtn.disabled = true;
    
    const grumbleText = getRandomGrumble();
    const timestamp = getCurrentTime();
    
    // Create message object
    const message = {
        text: grumbleText,
        time: timestamp,
        id: Date.now()
    };
    
    // Add to history
    messageHistory.push(message);
    
    // Keep only last 50 messages
    if (messageHistory.length > MAX_MESSAGES) {
        messageHistory.shift();
        // Remove oldest message from DOM
        const oldestMessage = chatMessages.querySelector('.message');
        if (oldestMessage) {
            oldestMessage.remove();
        }
    }
    
    // Create and add message element
    const messageElement = createMessageElement(message);
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    scrollToBottom();
    
    // Re-enable button after animation
    setTimeout(() => {
        grumbleBtn.disabled = false;
    }, 300);
}

// Create message element
function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    messageDiv.dataset.messageId = message.id;
    
    messageDiv.innerHTML = `
        <div class="message-bubble">
            <p class="message-text">${message.text}</p>
            <p class="message-time">${message.time}</p>
        </div>
    `;
    
    return messageDiv;
}

// Scroll chat to bottom
function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Add some visual feedback for button interaction
grumbleBtn.addEventListener('mousedown', function() {
    this.style.transform = 'translateY(1px)';
});

grumbleBtn.addEventListener('mouseup', function() {
    this.style.transform = '';
});

grumbleBtn.addEventListener('mouseleave', function() {
    this.style.transform = '';
});
