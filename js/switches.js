import LocalStorage from './localStorage.js'
import Chart from './chart.js'
import UI from './ui.js';

class Switches {

  static manageSwitch(e) {
    let coinSymbol = e.target.id;

    if (e.target.id.startsWith('modal-')) {
      coinSymbol = coinSymbol.slice(6); // remove 'modal-' prefix from coin id on modal
    }

    if (e.target.checked) {      
      $(`#${coinSymbol}`).prop("checked", true);
      LocalStorage.addSelectedCoinSymbol(coinSymbol);
      const symbolsArr = LocalStorage.getSelectedCoinsSymbols();

      // if more than possible coins were selected and modal is not shown yet 
      if ((symbolsArr.length > Chart.getMaxCoinsToShowInReport()) && (! e.target.id.startsWith('modal-'))) { 
        Switches.moreCoinsWereSelected(symbolsArr);
      }

    } else {    
      $(`#${coinSymbol}`).prop("checked", false);
      LocalStorage.removeSelectedCoinSymbol(coinSymbol);      
    }     
  }

  // After returning to main screen from other screen in the site
  static restoreSelectedSwitchesInMainScreen(symbolsArr) {
    symbolsArr.forEach(function(symbol) {
      $(`#${symbol}`).prop("checked", true);
    });
  }

  static checkAllSwitchesInModal() {
    $('.switch-on-modal').each(function() {
      $(this).prop("checked", true);
    });  
  }

  static setSwitchesAccordingToSelection(coinsArr) {
    coinsArr.forEach(function(coin) {
      // If coin was selected, set switch to on
      if (LocalStorage.isSelectedSymbol(coin.symbol)) {
        $(`#${coin.symbol.toUpperCase()}`).prop("checked", true);
      } else {
        $(`#${coin.symbol.toUpperCase()}`).prop("checked", false);
      }
    });
  }

  static moreCoinsWereSelected(symbolsArr) {    
    UI.displayModal(symbolsArr);
    $('#modalCoins').on('change','.switch-on-modal', Switches.manageSwitch);  
  }  
}

export default Switches;
