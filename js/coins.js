class Coins {
  static coinsArray = [];
  static intervalId;

  static getCoins(startIndx, quantityPerPage) {
    Coins.currentStartIndx = startIndx;
    Coins.currentQuantityPerPage = quantityPerPage;
    return Coins.coinsArray.slice(startIndx, quantityPerPage);
  }

  static getQuantityOfCoins() {
    return Coins.coinsArray.length;
  }

  static setIntervalId(id) {
    Coins.intervalId = id;
  }

  static getIntervalId() {
    return Coins.intervalId;
  }

  static getCoinsBySymbol(symbol) {
    const result = Coins.coinsArray.filter(coin => coin.symbol===symbol.toUpperCase() || coin.symbol===symbol.toLowerCase());
    return result;
  }

  static getCoinsBySymbolsArray(symbolsArr) {
    let result = [];
    let currCoin;

    symbolsArr.forEach(symbol => {
      currCoin = Coins.coinsArray.find(coin => coin.symbol===symbol.toUpperCase() || coin.symbol===symbol.toLowerCase());

      if (currCoin != undefined) {
        result.push(currCoin);
      }
    });

    return result;
  }  
}

export default Coins;