import Coins from './coins.js';
import Switches from './switches.js';
import LocalStorage from './localStorage.js'

class UI {
  static currentStartIndx = 0;
  static quantityPerPage = 1;

  static showCoinsOfFirstPage() {
    if ($(window).innerWidth() < 768) {
      UI.quantityPerPage = 4;
    } else {
      UI.quantityPerPage = 21;
    }

    UI.showCoinsInPage(Coins.getCoins(UI.currentStartIndx, UI.quantityPerPage));

    if (UI.quantityPerPage >= Coins.getQuantityOfCoins()) {
      $('#nextPage').parent().addClass('disabled');
    } else {
      $('#nextPage').parent().removeClass('disabled');
    }    
  }

  static showCoinsOfNextPage() {
    UI.currentStartIndx = UI.currentStartIndx + UI.quantityPerPage;

    if (UI.currentStartIndx < Coins.getQuantityOfCoins()) {

      const endIndx = UI.currentStartIndx + UI.quantityPerPage;

      UI.showCoinsInPage(Coins.getCoins(UI.currentStartIndx, endIndx));
    }

    if (UI.currentStartIndx + 1 < Coins.getQuantityOfCoins()) {
      $('#nextPage').parent().removeClass('disabled');
    } else {
      $('#nextPage').parent().addClass('disabled');
    }

    Switches.restoreSelectedSwitchesInMainScreen(LocalStorage.getSelectedCoinsSymbols());      
  }  

  static showCoinsOfPreviousPage() {
    if (UI.currentStartIndx > 0) {
      UI.currentStartIndx = UI.currentStartIndx - UI.quantityPerPage;

      const endIndx = UI.currentStartIndx + UI.quantityPerPage;

      UI.showCoinsInPage(Coins.getCoins(UI.currentStartIndx, endIndx));
      $('#nextPage').parent().removeClass('disabled');
    }    
    if (UI.currentStartIndx <= 0) {
      $('#prevPage').parent().addClass('disabled');
    } else {
      $('#prevPage').parent().removeClass('disabled');
    }

    Switches.restoreSelectedSwitchesInMainScreen(LocalStorage.getSelectedCoinsSymbols());    
  }

  static showCoinsInPage(coinsArray) {
    let output = '';

    coinsArray.forEach(coin => {
      output += UI.displayCoin(coin);
    });
   
    $('#coins-content').html(output);  
  }

  static displayCoin(coin) {
    let output = `
      <div class="col-md-4">
        <div id="accordion-${coin.id}">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <h4 class="card-title mb-3">${coin.symbol.toUpperCase()}</h4>
                
                <div class="custom-control custom-switch">
                  <input type="checkbox" class="custom-control-input" id="${coin.symbol.toUpperCase()}">
                  <label class="custom-control-label" for="${coin.symbol.toUpperCase()}"></label>
                </div>
              </div>
              <h6 class="card-subtitle text-muted mb-3">${coin.id}</h6>

              <div id="collapse-${coin.id}" class="collapse">
              
              <!--  Progress Bar -->
              <div class="progress mb-4">
                <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style="width: 75%"></div>
              </div>
              <!-- ./ Progress Bar -->

              <!-- API inner-content will be here -->

              </div>

              <a id="${coin.id}" href="#collapse-${coin.id}" data-parent="#accordion-${coin.id}" data-toggle="collapse" class="btn btn-primary btn-coin" href="#">Read More</a>

            </div>
          </div>            
        </div>
      </div>
    `;

    return output;
  }

  static showCoinInfo(coin) {
    let output = `
      <div>
        <img src="${coin.image.large} height="75" width="75" class="mb-3">

        <p>USD <i class="fas fa-dollar-sign"></i> ${coin.market_data.current_price.usd}</p>
        <p>EUR <i class="fas fa-euro-sign"></i> ${coin.market_data.current_price.eur}</p>
        <p>ILS ${coin.market_data.current_price.ils} <i class="fas fa-shekel-sign"></i></p>
      </div>
    `
    $(`#collapse-${coin.id}`).html(output);  
  }

  static toggleButtonName(coinId) {
    $(`#${coinId}`).html()==='Read More' ?  $(`#${coinId}`).html('Read Less') :  $(`#${coinId}`).html('Read More');
  }

  static displayMessage(msg, className, showConstantly) {
    $('.alert').toggleClass('d-none');
    $('.alert').addClass(className);
    $('.alert').text(msg);

    if (! showConstantly) {
      setTimeout(UI.clearAlertMessage, 3000);
    }
  }

  static clearAlertMessage() {
    $('.alert').toggleClass('d-none');
  }

  static displayModal(coinsArray) {   
    let output = `
      <div class="modal" id="modalCoins">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Up to 5 coins only could be selected.</h5>
              <button class="close" data-dismiss="modal">&times;</button>
            </div>
            <div class="modal-body row">
              
            ${coinsArray.map(symbol => 
              `<div class="col-md-6">
                <div class="card">
                  <div class="d-flex justify-content-between">
                    <div>${symbol}</div>
                    <div class="custom-control custom-switch">
                      <input type="checkbox" class="custom-control-input switch-on-modal" id="modal-${symbol.toUpperCase()}">
                      <label class="custom-control-label" for="modal-${symbol.toUpperCase()}"></label>
                    </div>                  
                  </div>
                </div>
               </div>`)
                      .join('')}

            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    // Remove in order to have updated content in the modal.
    $('#modalCoins').remove();
    $('body').append(output);
    $('#modalCoins').modal('show');
    Switches.checkAllSwitchesInModal();
  }

  static uncheckSelectedCheckBox() {
    $('#show-selected').prop("checked", false);

  }
}

export default UI;



