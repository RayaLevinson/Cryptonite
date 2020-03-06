// Local Storage Class
class LocalStorage {
  static selectedCoinsLable  = 'cryptonite.selectedCoins';  // Label in Local Storage
  
  static addSelectedCoinSymbol(coinSymbol) {
    const label = LocalStorage.selectedCoinsLable;
    const array = LocalStorage.getSelectedCoinsSymbols(label);

    const indx = array.findIndex(current => current === coinSymbol);

    if (indx === -1) {
      array.push(coinSymbol);
    }    

    localStorage.setItem(label, JSON.stringify(array));
  }

  static getSelectedCoinsSymbols() {
    const label = LocalStorage.selectedCoinsLable;

    let array = [];
    let obj = localStorage.getItem(label);
    if (obj != null) {
      array = JSON.parse(obj);
    } 
    return array;
  }

  static getSelectedCoinsAsString() {
    const label = LocalStorage.selectedCoinsLable;

    let array = [];
    let retString = '';
    let obj = localStorage.getItem(label);
    if (obj != null) {
      array = JSON.parse(obj);
    } 

    array.forEach(element => {
      retString += element + ',';
    });

    retString = retString.slice(0, retString.length-1);

    return retString;
  }

  static isSelectedSymbol(symbol) {
    const array = LocalStorage.getSelectedCoinsSymbols();
    const result = array.includes(symbol.toUpperCase());
    
    return result;
  }

  static removeSelectedCoinSymbol(data) {
    const label = LocalStorage.selectedCoinsLable;

    const array = LocalStorage.getSelectedCoinsSymbols(label);

    const indx = array.findIndex(current => current === data);

    if (indx > -1) {
      array.splice(indx, 1);
    }

    localStorage.setItem(label, JSON.stringify(array));
  }

  static addCoinInfoById(data) {
    let coin = {};
    coin.writtenOn = Date.now();
    coin.id = data.id;
    coin.image = data.image;
    coin.market_data = data.market_data;

    localStorage.setItem(data.id, JSON.stringify(coin));
  }

  static getCoinInfoById(coinId) {
    let coin = null;
    const obj = localStorage.getItem(coinId);

    if (obj != null) {
      coin = JSON.parse(obj);
    }

    return coin;
  }
}

export default LocalStorage;