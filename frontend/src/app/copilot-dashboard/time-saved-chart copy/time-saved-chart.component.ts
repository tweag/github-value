import { Component } from '@angular/core';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-time-saved-chart',
  standalone: true,
  imports: [
    HighchartsChartModule
  ],
  templateUrl: './time-saved-chart.component.html',
  styleUrl: './time-saved-chart.component.scss'
})
export class TimeSavedChartComponent {
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  data = [
    // April 2023
    [1680307200000, 6.2],   // Week 1 
    [1680912000000, 7.1],   // Week 2
    [1681516800000, 6.8],   // Week 3
    [1682121600000, 19.2],  // Week 4 - 🚀 Anomaly spike
    // May 2023
    [1682726400000, 7.8],   // Week 5
    [1683331200000, 8.2],   // Week 6
    [1683936000000, 5.1],   // Week 7 - 📉 Anomaly drop
    [1684540800000, 8.9],   // Week 8
    // June 2023
    [1685145600000, 9.3],   // Week 9
    [1685750400000, 8.7],   // Week 10
    [1686355200000, 9.8],   // Week 11
    [1686960000000, 9.2],   // Week 12
    // July 2023
    [1687564800000, 18.8],  // Week 13 - 🚀 Anomaly spike
    [1688169600000, 10.1],  // Week 14
    [1688774400000, 10.8],  // Week 15
    [1689379200000, 10.2],  // Week 16
    // August 2023
    [1689984000000, 11.4],  // Week 17
    [1690588800000, 10.9],  // Week 18
    [1691193600000, 5.3],   // Week 19 - 📉 Anomaly drop
    [1691798400000, 11.8],  // Week 20
    // September 2023
    [1692403200000, 11.2],  // Week 21
    [1693008000000, 12.5],  // Week 22
    [1693612800000, 12.0],  // Week 23
    [1694217600000, 19.5],  // Week 24 - 🚀 Anomaly spike
    // October 2023
    [1694822400000, 12.8],  // Week 25
    [1695427200000, 12.3],  // Week 26
    [1696032000000, 13.4],  // Week 27
    [1696636800000, 12.9],  // Week 28
    // November 2023
    [1697241600000, 13.8],  // Week 29
    [1697846400000, 13.2],  // Week 30
    [1698451200000, 14.3],  // Week 31
    [1699056000000, 13.9],  // Week 32
    // December 2023
    [1699660800000, 19.8],  // Week 33 - 🚀 Anomaly spike
    [1700265600000, 14.5],  // Week 34
    [1700870400000, 15.1],  // Week 35
    [1701475200000, 14.8],  // Week 36
    // January 2024
    [1702080000000, 15.6],  // Week 37
    [1702684800000, 15.2],  // Week 38
    [1703289600000, 5.5],   // Week 39 - 📉 Anomaly drop
    [1703894400000, 15.9],  // Week 40
    // February 2024
    [1704499200000, 16.4],  // Week 41
    [1705104000000, 15.9],  // Week 42
    [1705708800000, 16.8],  // Week 43
    [1706313600000, 16.3],  // Week 44
    // March 2024
    [1706918400000, 19.9],  // Week 45 - 🚀 Final spike
    [1707523200000, 17.2],  // Week 46
    [1708128000000, 17.8],  // Week 47
    [1708732800000, 17.4],  // Week 48
    [1709337600000, 18.2],  // Week 49
    [1709942400000, 17.9],  // Week 50
    [1710547200000, 18.5],  // Week 51
    [1711152000000, 18.8]   // Week 52 - Final
  ];

  chartOptions: Highcharts.Options = {
    chart: {
      zooming: {
        type: 'x'
      },
      width: undefined,
    },
    title: {
      text: 'Time Saved'
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        // don't display the year
        month: '%b',
        year: '%b'
      },
      crosshair: true
    },
    yAxis: {
      title: {
        text: 'Time Saved (%)'
      },
      min: 0,
      // max: 100,
      labels: {
        format: '{value}%'
      },
      plotBands: [{
        from: 5,
        to: 15,
        color: 'var(--sys-surface-variant)',
        label: {
          text: 'Typical Range',
          style: {
            color: 'var(--sys-on-surface-variant)'
          }
        }
      }],
      plotLines: [{
        value: 10,
        color: 'var(--sys-primary)',
        dashStyle: 'Dash',
        width: 2,
        label: {
          text: 'Target Level',
          align: 'left',
          style: {
            color: 'var(--sys-primary)'
          }
        },
        zIndex: 2
      }]
    },
    tooltip: {
      headerFormat: '<b>{point.x:%b %d, %Y}</b><br/>',
      pointFormat: [
        '{series.name}: ',
        '<b>{point.y:.1f}%</b>'
      ].join(''),
      style: {
        fontSize: '14px'
      }
    },
    series: [{
      name: 'Time Saved',
      type: 'spline',
      data: this.data.map(point => ({
        x: point[0],
        y: point[1],
      })),
      lineWidth: 2,
      marker: {
        enabled: true,
        radius: 4,
        symbol: 'circle'
      },
      states: {
        hover: {
          lineWidth: 3
        }
      }
    }],
    legend: {
      enabled: false
    },
    plotOptions: {
      series: {
        animation: {
          duration: 300
        }
      }
    }
  };

  constructor() {
  }
}
