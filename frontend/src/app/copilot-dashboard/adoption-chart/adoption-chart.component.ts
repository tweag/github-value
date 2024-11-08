import { Component } from '@angular/core';
// import Highcharts from 'highcharts';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-adoption-chart',
  standalone: true,
  imports: [
    HighchartsChartModule
  ],
  templateUrl: './adoption-chart.component.html',
  styleUrl: './adoption-chart.component.scss'
})
export class AdoptionChartComponent {
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  data = [1, 2, 3, 4];

  chartOptions: Highcharts.Options = {
    title: {
      text: 'Adoption Chart'
    },
    series: [
      {
        type: 'line',
        data: this.data,
      },
    ],
  };

  constructor() {
    Highcharts.theme = {
      colors: ['#058DC7', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572',
        '#FF9655', '#FFF263', '#6AF9C4'],
      chart: {
        backgroundColor: {
          pattern: {
            opacity: 0,
          }
        },
      },
      title: {
        style: {
          color: '#fff',
          font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      subtitle: {
        style: {
          color: '#666666',
          font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      legend: {
        itemStyle: {
          font: '9pt Trebuchet MS, Verdana, sans-serif',
          color: '#fff'
        },
        itemHoverStyle: {
          color: 'gray'
        }
      }
    };
    Highcharts.setOptions(Highcharts.theme);
  }
}
