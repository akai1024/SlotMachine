const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/slotMachine', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });
mongoose.Promise = global.Promise;

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// 定義schema
/** 
 * mongoose的所有資料型別:
 * String
 * Number
 * Date
 * Buffer
 * Boolean
 * Mixed
 * ObjectId
 * Array
 * Decimal128
 * Map
 * 
*/
let Schema = mongoose.Schema;

// 玩家
let PlayerModel = mongoose.model('player',
    new Schema(
        {
            name: { type: String, required: true, unique: true },
            money: Number,
            betRounds: Number,
            winRounds: Number,
            maxWin: Number,
            debt: Number,
        },
        { versionKey: false }
    )
);

// 遊戲紀錄
let recordScheme = new Schema(
    {
        roundNumber: String,
        gameTime: Number,
        playerName: String,
        screen: [Number],
        betMoney: Number,
        totalScore: Number,
        bingoLines: [
            {
                key: String,
                score: Number,
                indexes: [Number]
            }
        ],
    },
    { versionKey: false }
);
recordScheme.index({ roundNumber: 1 });
recordScheme.index({ playerName: 1 });
recordScheme.index({ gameTime: 1 });
let RecordModel = mongoose.model('record', recordScheme);


exports.db = db;
exports.PlayerModel = PlayerModel;
exports.RecordModel = RecordModel;
