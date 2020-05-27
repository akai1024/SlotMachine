const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const slotCore = require('./slotCore');
const Player = require('./player');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// 重新導向SlotMachine
app.get('/', function (req, res) {
    res.redirect('/slotMachine.html');
});

// 玩家取得玩家資料
app.post('/getPlayerInfos', (req, res) => {
    let request = req.body;
    console.log('getPlayerInfos! req:' + JSON.stringify(request));

    let player = new Player('Kai', 2000, 0, 0, 0, 0);
    res.send(JSON.stringify(player));
});

// 玩家spin
app.post('/spin', (req, res) => {
    let request = req.body;
    console.log('spin! req:' + JSON.stringify(request));

    let betMoney = slotCore.getBetMoney(request.betCount);
    let screen = slotCore.getRandomScreen();
    let bingoLines = slotCore.getBingoLines(screen);
    let totalScore = slotCore.getBingoScore(betMoney, bingoLines);

    res.send(JSON.stringify({
        betMoney: betMoney,
        screen: screen,
        bingoLines: bingoLines,
        totalScore: totalScore
    }));
});

// 取得中獎線位置
app.post('/getBingoLines', (req, res) => {
    let request = req.body;
    console.log('getBingoLines! req:' + JSON.stringify(request));
    res.send(JSON.stringify(slotCore.getBingoIndexes()));
});

// 玩家借貸
app.post('/loanMoney', (req, res) => {
    let request = req.body;
    console.log('loanMoney! req:' + JSON.stringify(request));
    let addMoney = request.money;
    res.send(JSON.stringify({ addMoney: addMoney }));
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));