module.exports = class Player {
    constructor(name, money, betRounds, winRounds, maxWin, debt) {
        this.name = name;
        this.money = money;
        this.betRounds = betRounds;
        this.winRounds = winRounds;
        this.maxWin = maxWin;
        this.debt = debt;
    }

    // 下注
    subBet(money) {
        if (money && money <= this.money) {
            this.money -= money;
            this.betRounds++;
            return true;
        }
        return false;
    }

    // 得分
    addScore(money) {
        if (money) {
            this.money += money;
            this.winRounds++;
        }
    }

    toString() {
        return JSON.stringify(this);
    }

}
