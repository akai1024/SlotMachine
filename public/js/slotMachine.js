var vue = new Vue({
	el: '#slotMachine',
	vuetify: new Vuetify({
		theme: {
			dark: true,
		},
	}),

	data: {

		// 靜態定義
		rows: 3,
		columns: 5,
		symbols: [
			{ number: 1, show: 'A' },
			{ number: 2, show: 'K' },
			{ number: 3, show: 'Q' },
			{ number: 4, show: 'J' },
			{ number: 5, show: '10' },
			{ number: 6, show: '9' }
		],
		maxBetCount: 20,
		eachBetMoney: 10,
		loanMoney: 1000,
		defaultSymbolColor: 'blue darken-2',
		bingoSymbolColor: 'amber darken-4',

		// 系統資料
		dialog: {
			enable: false,
			title: '',
			content: '',
		},
		isSpin: false,
		showBingoLines: false,
		bingoLinesInfo: null,

		// 玩家資料
		player: {
			name: 'unknown',
			money: 0,
			bets: 0,
			wins: 0,
			maxWin: 0,
			debt: 0,
		},

		// 機台資料
		symbolMapping: null,
		showRibbons: [
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
			[1, 1, 1, 1, 1],
		],
		screen: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
		spark: true,
		betCount: 1,
		recentScores: [],
		bingoIndex: new Set(),

	},

	created() {
		// 將圖標填入mapping
		let symbolMapping = new Map();
		for (symbol of this.symbols) {
			symbolMapping.set(symbol.number, symbol.show);
		}
		this.symbolMapping = symbolMapping;
		this.getPlayerInfos();
	},

	mounted() {
		this.refreshRibbons(this.screen);
	},

	methods: {
		postData(path, data, callback) {
			let url = 'http://' + window.location.host + path;
			let requestBody = data ? JSON.stringify(data) : '{}';
			console.log('url:' + url + 'requestBody: ' + requestBody);
			// Default options are marked with *
			return fetch(url, {
				body: requestBody, // must match 'Content-Type' header
				// cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
				// credentials: 'same-origin', // include, same-origin, *omit
				headers: {
					// 'user-agent': 'Mozilla/4.0 MDN Example',
					'content-type': 'application/json'
				},
				method: 'POST', // *GET, POST, PUT, DELETE, etc.
				// mode: 'cors', // no-cors, cors, *same-origin
				// redirect: 'follow', // manual, *follow, error
				// referrer: 'no-referrer', // *client, no-referrer
			})
				.then(response => (response) ? response.json() : "empty response")// 輸出成 json
				.then(response => callback(response))
				;
		},

		showDialog(title, content = '') {
			this.dialog.enable = true;
			this.dialog.title = title;
			this.dialog.content = content;
		},

		getPlayerInfos() {
			console.log('getPlayerInfos...');
			this.postData('/getPlayerInfos', {}, this.getPlayerInfoResult);
		},

		getPlayerInfoResult(response) {
			console.log('getPlayerInfoResult:', response);
			// response是server的player結構
			this.player.name = response.name;
			this.player.money = response.money;
			this.player.bets = response.betRounds;
			this.player.wins = response.winRounds;
			this.player.maxWin = response.maxWin;
			this.player.debt = response.debt;
		},

		refreshRibbons(screen) {
			let newScreen = screen ? screen : this.screen;
			for (let idx = 0; idx < newScreen.length; idx++) {
				let col = Math.floor(idx / this.rows) % this.columns;
				let row = idx % this.rows;
				this.showRibbons[row][col] = {
					symbol: this.getShowSymbol(newScreen[idx]),
					color: this.bingoIndex.has(idx) ? this.bingoSymbolColor : this.defaultSymbolColor
				};
			}
		},

		getShowSymbol(symbol) {
			return this.symbolMapping.get(parseInt(symbol, 0));
		},

		playerBet() {
			this.betCount++;
			if (this.betCount > this.maxBetCount) {
				this.betCount = 1;
			}
		},

		playerMaxBet() {
			this.betCount = this.maxBetCount;
		},

		getBetMoney() {
			return this.betCount * this.eachBetMoney;
		},

		playerSpin() {
			if (this.isSpin) {
				return;
			}
			if (this.player.money < this.getBetMoney()) {
				this.showDialog('Error', 'Not enough money');
				return;
			}
			this.postData('/spin', { betCount: this.betCount }, this.spinResult);
			this.spark = false;
			this.player.money -= this.getBetMoney();
			this.isSpin = true;
		},

		spinResult(response) {
			console.log('spinResult:', response);
			this.screen = response.screen;
			this.spark = true;
			this.bingoIndex.clear();

			// 累積數據
			this.player.bets++;
			if (response.totalScore) {
				// 玩家資料異動
				this.player.wins++;
				if (response.totalScore > this.player.maxWin) {
					this.player.maxWin = response.totalScore;
				}
				this.player.money += response.totalScore;

				// 中獎線分析
				let lines = [];
				for (line of response.bingoLines) {
					let lineKeys = line.key.split('-');
					lines.push(this.getShowSymbol(lineKeys[0]) + 'x' + lineKeys[1]);
					// 中獎位置
					for (idx of line.indexes) {
						this.bingoIndex.add(idx);
					}
				}

				// 歷史紀錄
				this.recentScores.push(
					{
						bet: response.betMoney,
						win: response.totalScore,
						lines: lines
					}
				);
				if (this.recentScores.length > 5) {
					this.recentScores.splice(0, 1);
				}
			}

			this.refreshRibbons(this.screen);
			this.isSpin = false;
		},

		playerLoanMoney() {
			this.postData('/loanMoney', { money: this.loanMoney }, this.loanMoneyResult);
		},

		loanMoneyResult(response) {
			console.log('loanMoneyResult:', response);
			let addMoney = response.addMoney;
			if (addMoney) {
				this.player.money += addMoney;
				this.player.debt += addMoney;
			}
		},

		showScore(score) {
			if (!score) {
				return;
			}
			let lineString = score.lines.join(',');
			let content = `bet: ${score.bet}, win: ${score.win}, lines: ${lineString}`;
			this.showDialog('ScoreInfo:', content);
		},

		getShowBingoLines() {
			this.showBingoLines = !this.showBingoLines;
			if (!this.bingoLinesInfo) {
				this.postData('/getBingoLines', {}, this.getBingoLinesResult);
			}
		},

		getBingoLinesResult(response) {
			console.log('getBingoLinesResult:', response);
			this.bingoLinesInfo = response;
		},

	},
});
