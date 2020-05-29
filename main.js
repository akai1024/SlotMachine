const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const mongoDb = require('./mongoManager');
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

    let playerName = request.name;
    mongoDb.PlayerModel.
        findOne().
        where('name').equals(playerName).
        exec((error, playerModel) => {
            if (!error && playerModel) {
                // 有找到就直接回傳
                res.send(JSON.stringify(playerModel));
            } else {
                createPlayer(playerName, res);
            }
        });
});

function createPlayer(playerName, res) {
    let newPlayer = new mongoDb.PlayerModel(new Player(playerName, 2000, 0, 0, 0, 0));
    newPlayer.save((error, playerModel) => {
        if (error) {
            console.log('createPlayerModelResult!', error);
        }
        res.send(JSON.stringify(playerModel));
    });
}

// 玩家spin
app.post('/spin', (req, res) => {
    let request = req.body;
    console.log('spin! req:' + JSON.stringify(request));

    let playerName = request.player.name;

    // 計算下注額
    let betMoney = slotCore.getBetMoney(request.betCount);
    // 更新玩家錢
    updatePlayerMoney(playerName, false, 0, betMoney, betBack, res, betMoney);
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
    let playerName = request.name;
    let addMoney = request.money;

    // 更新玩家錢
    updatePlayerMoney(playerName, true, addMoney, 0, loanMoneyBack, res, addMoney);
});

// 更新玩家錢
function updatePlayerMoney(playerName, isDebt, addMoney, subMoney, callback, ...callbackParams) {
    let isSuccess = false;
    if (!addMoney && !subMoney) {
        return updatePlayerMoneyCallback(isSuccess, null, callback, callbackParams);
    }

    mongoDb.PlayerModel.
        findOne().
        where('name').equals(playerName).
        exec((error, playerModel) => {
            if (!error && playerModel) {
                // 有找到就更新
                if (isDebt) {
                    playerModel.debt += addMoney;
                }
                
                if (addMoney) {
                    playerModel.winRounds++;
                    playerModel.money += addMoney;
                    // 除了貸款之外的加錢都是得分
                    if (!isDebt && addMoney > playerModel.maxWin) {
                        playerModel.maxWin = addMoney;
                    }
                }
                
                // 目前只有下注會扣錢
                if (subMoney) {
                    playerModel.betRounds++;
                    playerModel.money -= subMoney;
                    if (playerModel.money < 0) {
                        return updatePlayerMoneyCallback(isSuccess, null, callback, callbackParams);
                    }
                }

                let newPlayer = new mongoDb.PlayerModel(playerModel);
                newPlayer.save((error, playerModel) => {
                    if (error) {
                        console.log('updatePlayerMoney error!', error);
                    }
                    isSuccess = true;
                    return updatePlayerMoneyCallback(isSuccess, playerModel, callback, callbackParams);
                });
            } else {
                return updatePlayerMoneyCallback(isSuccess, null, callback, callbackParams);
            }
        });
}

// 更新玩家錢callback
function updatePlayerMoneyCallback(isSuccess, playerModel, callback, callbackParams) {
    console.log('updatePlayerMoneyCallback isSuccess:', isSuccess)
    callback(isSuccess, playerModel, callbackParams);
}

// 下注callback
function betBack(isSuccess, playerModel, callbackParams) {
    let res = callbackParams[0];
    let betMoney = callbackParams[1];

    if (!isSuccess) {
        res.send(JSON.stringify({
            isSuccess: isSuccess
        }));
        return;
    }

    // 計算盤面
    let screen = slotCore.getRandomScreen();
    let bingoLines = slotCore.getBingoLines(screen);
    let totalScore = slotCore.getBingoScore(betMoney, bingoLines);
    let roundInfo = {
        betMoney: betMoney,
        screen: screen,
        bingoLines: bingoLines,
        totalScore: totalScore
    };

    // 有獲得金錢
    if (totalScore) {
        // 處理玩家加錢
        updatePlayerMoney(playerModel.name, false, totalScore, 0, scoreBack, res, roundInfo);
        return;
    }

    // 沒獲得金錢
    roundInfo.isSuccess = true;
    res.send(JSON.stringify(roundInfo));
}

// 玩家增加得分back
function scoreBack(isSuccess, playerModel, callbackParams) {
    let res = callbackParams[0];
    let roundInfo = callbackParams[1];
    roundInfo.isSuccess = isSuccess;
    res.send(JSON.stringify(roundInfo));
}

// 借貸callback
function loanMoneyBack(isSuccess, playerModel, callbackParams) {
    let res = callbackParams[0];
    let addMoney = callbackParams[1];
    res.send(JSON.stringify({
        isSuccess: isSuccess,
        addMoney: addMoney,
        player: playerModel
    }));
}

app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

