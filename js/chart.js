class Chart {
  static intervalInSeconds = 2;
  static updateInterval = Chart.intervalInSeconds * 1000;
  static maxCoinsToShowInReport = 5;
  static wasInit = false;
  
  static time = new Date();

  static options;

  static init(chartTitle, labelsArray, axisYValuesArray) {   
    Chart.options = {
      title: {
        text: `${chartTitle}`
      },
      axisX: {
        title: `Chart updates every ${Chart.intervalInSeconds} secs. Click on legend items to hide /unhide dataseries.`,
        valueFormatString: "mm:ss" ,
      },
      axisY: {
        title: 'Coin Value',
        includeZero: false        
      },
      toolTip: {
        shared: true
      },
      legend: {
        cursor: "pointer",
        verticalAlign: "top",
        fontSize: 22,
        fontColor: "dimGrey",
        itemclick: Chart.toggleDataSeries // Click on legend items to hide /unhide dataseries.
      },
      data: []          
    };    
    
    labelsArray.forEach(function(val) {
      let obj = {};

      obj.type = "line";
      obj.xValueType = 'dateTime';
      obj.xValueFormatString = 'HH:mm:ss';
      obj.showInLegend = true;
      obj.name = val;
      let dataPoints = [];
      obj.dataPoints = dataPoints;
      Chart.options.data.push(obj);
    });
  
    $j("#chartContainer").CanvasJSChart(Chart.options);

    Chart.wasInit = true;
    
    Chart.updateChart(labelsArray, axisYValuesArray);
  }
      
  static updateChart(labelsArray, axisYValuesArray) {
    Chart.time.setTime(Chart.time.getTime() + Chart.updateInterval);

    axisYValuesArray.forEach(function(val, indx) {

      Chart.options.data[indx].dataPoints.push({
        x: Chart.time.getTime(),
        y: val
      });

      // updating legend text with updated y Value 
      Chart.options.data[indx].legendText = `${labelsArray[indx]}: ${axisYValuesArray[indx]}`;
    });

    $j("#chartContainer").CanvasJSChart().render();    
  }

  // Click on legend items to hide /unhide dataseries.
  static toggleDataSeries(e) {
    if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
      e.dataSeries.visible = false;
    }
    else {
      e.dataSeries.visible = true;
    }
    e.chart.render();
  }

  static getWasInit() {
    return Chart.wasInit;
  }

  static setWasInit(flag) {
    Chart.wasInit = flag;
  }  

  static getMaxCoinsToShowInReport() {
    return Chart.maxCoinsToShowInReport;
  }
}

export default Chart;
