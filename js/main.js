import UI from './ui.js';
import Coins from './coins.js';
import Chart from './chart.js'
import Switches from './switches.js'
import LocalStorage from './localStorage.js'

$(function() {   
  const path = `./inner_pages/main.html`;

  // Stop rendering report (if was rendered previously)
  clearInterval(Coins.getIntervalId());  
    
  $.ajax({
    url: path,
    cache: false
  })
  .done(function(data) {
    $('#inner-content').html(data);
    getAndShowCoins();
    $('#nextPage').on('click', showNextPageWasPressed);
    $('#prevPage').on('click', showPrevPageWasPressed);      
  });
  
  $('#reports').on('click', menuItemWasPressed);
  $('#about').on('click', menuItemWasPressed);  
  $('#search-form').on('submit', searchWasPressed);
  $('#show-selected').on('change', showSelectedCheckBoxWasChanged);

  // Get the current year for site footer
  $('#year').text(new Date().getFullYear());
});

function getAndShowCoins() {
  const urlCoinsList = 'https://api.coingecko.com/api/v3/coins/list';

  $.ajax({
    method:   'GET',
    url:      urlCoinsList,
    dataType: 'json'
  }).done(function(data){
      Coins.coinsArray = data;

      $('.loader_steps').hide();
      UI.showCoinsOfFirstPage();

      Switches.restoreSelectedSwitchesInMainScreen(LocalStorage.getSelectedCoinsSymbols());

      $('#pagination').toggleClass('d-none');

      // Some button on some card was pressed
      $('#inner-content').on('click','.btn-coin', (e) => {
        const coinId = e.target.id;
        
        if (e.target.textContent === 'Read More') {          
          getAndShowCoinInfo(coinId);
        }
        UI.toggleButtonName(coinId);
      });     
     
      // Some switch on some card was toggled
      $('#inner-content').on('change','.custom-switch', switchChanged);     
    })
    .fail(function() {
      console.log(`Error in url ${urlCoinsList}`);
    });  
}

function getAndShowCoinInfo(coinId) {  
  const coin = LocalStorage.getCoinInfoById(coinId);
  let shown = false;

  if (coin) {
    const minutes = 2;
    const elapsedTime = Date.now() - coin.writtenOn;
    if (elapsedTime <= minutes * 60000) {
      UI.showCoinInfo(coin);
      shown = true;
    }
  } 
  
  if (! shown) {

    const urlCoinInfo = 'https://api.coingecko.com/api/v3/coins';

    $.ajax({
      method:   'GET',
      url:      `${urlCoinInfo}/${coinId}`,
      dataType: 'json'
    }).done(function(data){
        LocalStorage.addCoinInfoById(data);
        UI.showCoinInfo(data);
      })
      .fail(function() {
        console.log(`Error in url ${urlCoinInfo}/${coinId}`);
      });
  }
}

function menuItemWasPressed(e) {
  const path = `./inner_pages/${e.target.id}.html`;

  switch(e.target.id) {
    case 'about':
      // Stop rendering report
      clearInterval(Coins.getIntervalId());   

      // Go to selected menu item        
      $.ajax({
        url: path,
        cache: false
      })
        .done(function(data) {        
          $('#inner-content').html(data);
          
          $('.active').toggleClass('active');

          injectProjectInfo();
          injectCompanyInfo();
          injectCallToAction();

          $(e.target).parent().toggleClass('active');           
          // Unckeck selected checkbox
          UI.uncheckSelectedCheckBox();           
        });      
     
      break;
    case 'reports': 
      Chart.setWasInit(false);

      let currentMenuItemId = '';
      const currentMenuItem = document.querySelector('.active');
      if (currentMenuItem != null) {   // if currentMenuItem == null  ==> search was done and results of the search are shown on the screen
        currentMenuItemId = document.querySelector('.active').firstElementChild.id;
      }
      // If current selected menu is not already 'reports'
      if (currentMenuItemId != e.target.id) {
        const symbolsStr = LocalStorage.getSelectedCoinsAsString();
        const symbolsArr = LocalStorage.getSelectedCoinsSymbols();      
    
        const symbolConvertTo = 'USD';    
        if ((symbolsArr.length > 0) && (symbolsArr.length <= Chart.getMaxCoinsToShowInReport())) {

          $.ajax({
            url: path,
            cache: false
          })
            .done(function(data) {          
              $('#inner-content').html(data);  

              $('.active').toggleClass('active');

              $(e.target).parent().toggleClass('active');    
              
              // Unckeck selected checkbox
              UI.uncheckSelectedCheckBox();

              displayReport(symbolsStr, symbolConvertTo); 
        });      
        } 
        else if (symbolsArr.length === 0) {
          UI.displayMessage('Please select at least one coin in order to see report.', 'alert-warning', false);
          } 
          else if (symbolsArr.length > Chart.getMaxCoinsToShowInReport()) {
            Switches.moreCoinsWereSelected(symbolsArr);
          }
        break;      
      }
  }
}

function displayReport(symbolsList, symbolConvertTo) {
  // URL example: 
  // https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,BTC&tsyms=BTC,USD

  // Example when Respnse is "Error"
  // https://min-api.cryptocompare.com/data/pricemulti?relaxedValidation=true&fsyms=O2T&tsyms=USD

  const urlCoinsPrices = `https://min-api.cryptocompare.com/data/pricemulti?relaxedValidation=true&fsyms=${symbolsList}&tsyms=${symbolConvertTo}`;

  const chartTitle = `${symbolsList} to ${symbolConvertTo}`;
  getDataAndShowReport(urlCoinsPrices, chartTitle);

  const intervalId = setInterval(getDataAndShowReport, Chart.updateInterval, urlCoinsPrices, chartTitle);

  Coins.setIntervalId(intervalId);    
}

function getDataAndShowReport(urlCoinsPrices, chartTitle) {
  $.ajax({
    method:   'GET',
    url:      `${urlCoinsPrices}`,
    dataType: 'json'
  }).done(function(response) {
      $('.loader_steps').hide();
      if ((response.Response === 'Error') || ($.isEmptyObject(response))) {
        const msg = `${response.Message} Please select different coins.`;
        UI.displayMessage(msg, 'alert-danger', true);

        clearInterval(Coins.getIntervalId());
      }           
      else {
        const coinsCodes   = [];
        const coinsPrices  = []; 
        for (const key of Object.keys(response)) {
          coinsCodes.push(key);
        }
        for (const valObj of Object.values(response)) {
          for (const val of Object.values(valObj)) {
            coinsPrices.push(val);
          }
        }  
        if (! Chart.getWasInit()) {
          Chart.init(chartTitle, coinsCodes, coinsPrices);
        } else {
          Chart.updateChart(coinsCodes, coinsPrices);
        }
      }
  }); 
}

// Some switch on some card was toggled
function switchChanged(e) {
  Switches.manageSwitch(e);
}

function searchWasPressed(e) {
  e.preventDefault();
  const symbolToSearch = $('#search-field').val();

  if (isValidSymbol(symbolToSearch) ) {
    const path = `./inner_pages/search_result.html`;
    $.ajax({
      url: path,
      cache: false
    })
      .done(function(data) {
        $('#inner-content').html(data);      
        $('.active').toggleClass('active');
        const coinsArr = Coins.getCoinsBySymbol(symbolToSearch);
      
        if (coinsArr.length > 0) {
        UI.showCoinsInPage(coinsArr);
        $('#search-field').val('');      

        Switches.setSwitchesAccordingToSelection(coinsArr);

        // Unckeck selected checkbox
        UI.uncheckSelectedCheckBox();

        // Stop rendering report
        clearInterval(Coins.getIntervalId());

        } else {
          const msg = `There is no coin with ${symbolToSearch} symbol`;
          UI.displayMessage(msg, 'alert-success', true);
        }
      });
  }
}

function showSelectedCheckBoxWasChanged(e) {
  if (e.target.checked) {
    const path = `./inner_pages/search_result.html`;
    $.ajax({
      url: path,
      cache: false
    })
      .done(function(data) {
        $('#inner-content').html(data);        

        $('.active').toggleClass('active');
        const coinsArr = Coins.getCoinsBySymbolsArray(LocalStorage.getSelectedCoinsSymbols());

        if (coinsArr.length > 0) {
        UI.showCoinsInPage(coinsArr); 

        Switches.setSwitchesAccordingToSelection(coinsArr);

        } else {
          const msg = 'There are no selected coins.';
          UI.displayMessage(msg, 'alert-success', true);
        }

        // Stop rendering report
        clearInterval(Coins.getIntervalId());
      });
  } else {
    location.reload();
  }
}

function showNextPageWasPressed(e) {
  UI.showCoinsOfNextPage();

  $('#prevPage').parent().removeClass('disabled');
  e.preventDefault();
}

function showPrevPageWasPressed(e) {
  UI.showCoinsOfPreviousPage();

  e.preventDefault();
}

function injectProjectInfo() {
  // Get local Json data
  // Fetch returns Promises
  fetch('./assets/project.json')
    .then(response => response.json())
    .then(projectInfo => {
        $('.project-description').html(`${projectInfo.description}`);          
        $('.design-approach').html(`${projectInfo.designApproach}`);
        $('.project-technologies').html(`${projectInfo.technologies}`);
        $('.project-tools').html(`${projectInfo.tools}`);          
        $('.created-by').html(`${projectInfo.createdBy}`);    
    })
    .catch(err => console.log(err));    
}

function injectCompanyInfo() {
  // Get local Json data
  // Fetch returns Promises
  fetch('./assets/company.json')
    .then(response => response.json())
    .then(companyInfo => {
        $('.about-img').attr('src', `${companyInfo.imgLocation}`);
        $('.company-email-address').html(`${companyInfo.email}`);
        $('.company-mailto-link').attr('href', `mailto:${companyInfo.email}`);
        $('.company-phone-to-show').html(`${companyInfo.phoneToShow}`);
        $('.company-whatsApp').attr('href', `mailto:${companyInfo.email}`);
        $('.company-whatsApp').attr('href', `https://api.whatsapp.com/send?phone=${companyInfo.fullPhoneNumber}`);
        $('.see-projects').html(`${companyInfo.seeProjects}`)
        $('.company-site-name').html(`${companyInfo.siteName}`);
        $('.company-site-name').attr('href', `${companyInfo.projectsLink}`);
     })
    .catch(err => console.log(err));
}

function injectCallToAction() {
  // Get local Json data
  // Fetch returns Promises
  fetch('./assets/callToAction.json')
    .then(response => response.json())
    .then(actionInfo => {
        $('.create-great').html(`${actionInfo.createGreat}`);
        $('.ask-to-contact').html(`${actionInfo.contactMe}`);
    })
    .catch(err => console.log(err));
}

function isValidSymbol(symbolToSearch) {
  let result = false;

  if (symbolToSearch.length > 0) {
    if (! (/^\s+$/.test(symbolToSearch)))
    result = true;
  }
  return result;
}