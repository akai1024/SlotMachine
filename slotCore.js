// 圖標定義
const symbols = [
    1, 2, 3, 4, 5, 6
];

// 中獎線位置
const bingoIndexes = [
    [0, 3, 6, 9, 12],
    [0, 3, 7, 10, 13],
    [0, 3, 7, 11, 14],
    [0, 4, 7, 11, 14],

    [1, 4, 7, 10, 13],
    [1, 3, 7, 9, 13],
    [1, 5, 7, 11, 13],
    [1, 3, 7, 10, 12],
    [1, 5, 7, 10, 14],

    [2, 5, 8, 11, 14],
    [2, 5, 7, 10, 13],
    [2, 5, 7, 9, 12],
    [2, 4, 7, 9, 12],

];

// 最小連線數
const minBingos = 3;
// 中獎賠率
const bingoLines = [
    { key: '1-3', rate: 8 },
    { key: '1-4', rate: 9 },
    { key: '1-5', rate: 10 },
    { key: '2-3', rate: 6 },
    { key: '2-4', rate: 7 },
    { key: '2-5', rate: 8 },
    { key: '3-3', rate: 4 },
    { key: '3-4', rate: 5 },
    { key: '3-5', rate: 6 },
    { key: '4-3', rate: 3 },
    { key: '4-4', rate: 4 },
    { key: '4-5', rate: 5 },
    { key: '5-3', rate: 1 },
    { key: '5-4', rate: 2 },
    { key: '5-5', rate: 3 },
    { key: '6-3', rate: 1 },
    { key: '6-4', rate: 2 },
    { key: '6-5', rate: 3 },
];
// 中獎賠率map
const bingoLinesMap = () => {
    let map = new Map();
    for (bingoLine of bingoLines) {
        map.set(bingoLine.key, bingoLine.rate);
    }
    return map;
}

const rows = 3;
const cols = 5;
const betMoney = 10;

// 取得中獎線資訊
function getBingoIndexes() {
    return bingoIndexes;
}

// 取得下注金額
function getBetMoney(betCount) {
    return betCount ? betCount * betMoney : betMoney;
}

// 隨機產生盤面
function getRandomScreen() {
    let screen = [];
    let symbolSize = rows * cols;
    for (let idx = 0; idx < symbolSize; idx++) {
        var index = Math.floor(Math.random() * symbols.length);
        screen.push(symbols[index]);
    }
    return screen;
}

// 取得中獎線
function getBingoLines(screen) {
    let bingoLines = [];
    for (line of bingoIndexes) {
        let firstSymbol = null;
        let combo = 0;
        let indexes = [];
        for (let idx = 0; idx < line.length; idx++) {
            let screenIdx = line[idx];
            let symbol = screen[screenIdx];
            let isCombo = false;
            if (!firstSymbol) {
                firstSymbol = symbol;
                isCombo = true;
            } else if (firstSymbol === symbol) {
                isCombo = true;
            }

            if (isCombo) {
                combo++;
                indexes.push(screenIdx);
            } else {
                break;
            }
        }

        if (combo >= minBingos) {
            let bingoKey = firstSymbol + '-' + combo;
            bingoLines.push({ key: bingoKey, indexes: indexes });
        }
    }
    return bingoLines;
}

// 計算中獎分數
function getBingoScore(bet, lines) {
    let totalScore = 0;
    // for (bingoLine of lines) {
    // 在 for element of literal 的寫法中，js會new一個reference叫做element，因此對element賦值無法改變literal的內容
    for (let idx = 0; idx < lines.length; idx++) {
        let bingoLine = lines[idx];
        let rate = bingoLinesMap().get(bingoLine.key);
        if (rate) {
            let lineScore = bet * rate;
            totalScore += lineScore;
            // 填上中獎線得分
            bingoLine.score = lineScore;
        }
    }
    return totalScore;
}

exports.getBingoIndexes = getBingoIndexes;
exports.getBetMoney = getBetMoney;
exports.getRandomScreen = getRandomScreen;
exports.getBingoLines = getBingoLines;
exports.getBingoScore = getBingoScore;