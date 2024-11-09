import { Component } from '@angular/core';
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
  totalUsers = 500;
  data = [
    // April 2023
    [1680307200000, 0],    // Week 1 
    [1680912000000, 15],   // Week 2
    [1681516800000, 35],   // Week 3
    [1682121600000, 65],   // Week 4
    // May 2023
    [1682726400000, 95],   // Week 5
    [1683331200000, 125],  // Week 6
    [1683936000000, 155],  // Week 7
    [1684540800000, 180],  // Week 8
    // June 2023
    [1685145600000, 205],  // Week 9
    [1685750400000, 225],  // Week 10
    [1686355200000, 245],  // Week 11
    [1686960000000, 260],  // Week 12
    // July 2023
    [1687564800000, 275],  // Week 13
    [1688169600000, 285],  // Week 14
    [1688774400000, 295],  // Week 15
    [1689379200000, 300],  // Week 16
    // August 2023
    [1689984000000, 305],  // Week 17
    [1690588800000, 310],  // Week 18
    [1691193600000, 315],  // Week 19
    [1691798400000, 320],  // Week 20
    // September 2023
    [1692403200000, 325],  // Week 21
    [1693008000000, 330],  // Week 22
    [1693612800000, 335],  // Week 23
    [1694217600000, 338],  // Week 24
    // October 2023
    [1694822400000, 341],  // Week 25
    [1695427200000, 344],  // Week 26
    [1696032000000, 347],  // Week 27
    [1696636800000, 350],  // Week 28
    // November 2023
    [1697241600000, 352],  // Week 29
    [1697846400000, 354],  // Week 30
    [1698451200000, 356],  // Week 31
    [1699056000000, 358],  // Week 32
    // December 2023
    [1699660800000, 360],  // Week 33
    [1700265600000, 361],  // Week 34
    [1700870400000, 362],  // Week 35
    [1701475200000, 363],  // Week 36
    // January 2024
    [1702080000000, 364],  // Week 37
    [1702684800000, 365],  // Week 38
    [1703289600000, 366],  // Week 39
    [1703894400000, 367],  // Week 40
    // February 2024
    [1704499200000, 368],  // Week 41
    [1705104000000, 369],  // Week 42
    [1705708800000, 370],  // Week 43
    [1706313600000, 371],  // Week 44
    // March 2024
    [1706918400000, 372],  // Week 45
    [1707523200000, 373],  // Week 46
    [1708128000000, 374],  // Week 47
    [1708732800000, 375],  // Week 48
    [1709337600000, 376],  // Week 49
    [1709942400000, 377],  // Week 50
    [1710547200000, 378],  // Week 51
    [1711152000000, 378]   // Week 52 - Final ~75%
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
        text: 'Adoption (%)'
      },
      min: 0,
      max: 100,
      labels: {
        format: '{value}%'
      },
      plotBands: [{
        from: 40,
        to: 60,
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
        }
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
      name: 'Users',
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
