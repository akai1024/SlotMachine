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

exports.db = db;
exports.PlayerModel = PlayerModel;
