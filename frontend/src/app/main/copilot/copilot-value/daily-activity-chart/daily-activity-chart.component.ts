import { Component } from '@angular/core';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-daily-activity-chart',
  standalone: true,
  imports: [
    HighchartsChartModule
  ],
  templateUrl: './daily-activity-chart.component.html',
  styleUrl: './daily-activity-chart.component.scss'
})
export class DailyActivityChartComponent {
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  totalUsers = 500;
  data = [
    // April 2023
    [1680307200000, 265],  // Week 1 
    [1680912000000, 258],  // Week 2
    [1681516800000, 272],  // Week 3
    [1682121600000, 267],  // Week 4
    // May 2023
    [1682726400000, 275],  // Week 5
    [1683331200000, 269],  // Week 6
    [1683936000000, 282],  // Week 7
    [1684540800000, 278],  // Week 8
    // June 2023
    [1685145600000, 290],  // Week 9
    [1685750400000, 285],  // Week 10
    [1686355200000, 298],  // Week 11
    [1686960000000, 292],  // Week 12
    // July 2023
    [1687564800000, 305],  // Week 13
    [1688169600000, 299],  // Week 14
    [1688774400000, 312],  // Week 15
    [1689379200000, 308],  // Week 16
    // August 2023
    [1689984000000, 320],  // Week 17
    [1690588800000, 315],  // Week 18
    [1691193600000, 328],  // Week 19
    [1691798400000, 322],  // Week 20
    // September 2023
    [1692403200000, 335],  // Week 21
    [1693008000000, 329],  // Week 22
    [1693612800000, 342],  // Week 23
    [1694217600000, 337],  // Week 24
    // October 2023
    [1694822400000, 345],  // Week 25
    [1695427200000, 338],  // Week 26
    [1696032000000, 352],  // Week 27
    [1696636800000, 348],  // Week 28
    // November 2023
    [1697241600000, 356],  // Week 29
    [1697846400000, 351],  // Week 30
    [1698451200000, 362],  // Week 31
    [1699056000000, 358],  // Week 32
    // December 2023
    [1699660800000, 366],  // Week 33
    [1700265600000, 361],  // Week 34
    [1700870400000, 372],  // Week 35
    [1701475200000, 368],  // Week 36
    // January 2024
    [1702080000000, 375],  // Week 37
    [1702684800000, 371],  // Week 38
    [1703289600000, 382],  // Week 39
    [1703894400000, 378],  // Week 40
    // February 2024
    [1704499200000, 385],  // Week 41
    [1705104000000, 381],  // Week 42
    [1705708800000, 388],  // Week 43
    [1706313600000, 385],  // Week 44
    // March 2024
    [1706918400000, 390],  // Week 45
    [1707523200000, 387],  // Week 46
    [1708128000000, 393],  // Week 47
    [1708732800000, 389],  // Week 48
    [1709337600000, 394],  // Week 49
    [1709942400000, 391],  // Week 50
    [1710547200000, 396],  // Week 51
    [1711152000000, 398]   // Week 52 - Final
  ];

  chartOptions: Highcharts.Options = {
    chart: {
      zooming: {
        type: 'x'
      },
      width: undefined,
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
        text: 'Daily Activity (%)'
      },
      min: 0,
      max: 100,
      labels: {
        format: '{value}%'
      },
      plotBands: [{
        from: 50,
        to: 90,
        color: 'var(--sys-surface-variant)',
        label: {
          text: 'Typical Range',
          style: {
            color: 'var(--sys-on-surface-variant)'
          }
        }
      }],
      plotLines: [{
        value: 75,
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
        '<b>{point.raw}</b>',
        '(<b>{point.y:.1f}%</b>)'
      ].join(''),
      style: {
        fontSize: '14px'
      }
    },
    series: [{
      name: 'Active Users',
      type: 'spline',
      data: this.data.map(point => ({
        x: point[0],
        y: (point[1] / this.totalUsers) * 100,
        raw: point[1]  // Store original value for tooltip
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
