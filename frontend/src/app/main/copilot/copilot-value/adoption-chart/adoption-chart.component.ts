import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import { HighchartsChartModule } from 'highcharts-angular';
import { ActivityResponse } from '../../../../services/seat.service';
import { HighchartsService } from '../../../../services/highcharts.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-adoption-chart',
  standalone: true,
  imports: [
    HighchartsChartModule
  ],
  providers: [
    DatePipe
  ],
  templateUrl: './adoption-chart.component.html',
  styleUrl: './adoption-chart.component.scss'
})
export class AdoptionChartComponent implements OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  totalUsers = 500;
  @Input() data?: ActivityResponse;
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
        text: 'Percent Active'
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
      // '<b>{point.x:%b %d, %Y}</b><br/>',
      headerFormat: '',
      pointFormatter: function () {
        const parts = [
          `<b>${new DatePipe('en-US').transform(this.x)}</b><br/>`,
          `${this.series.name}: `,
          `<b>${(this as any).raw}</b>`,
          `(<b>${this.y?.toFixed(1)}%</b>)`
        ]
        return parts.join('');
      },
      style: {
        fontSize: '14px'
      }
    },
    series: [{
      name: 'Users',
      type: 'spline',
      data: [],
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
  _chartOptions?: Highcharts.Options;

  constructor(
    private highchartsService: HighchartsService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this._chartOptions = this.highchartsService.transformActivityMetricsToLine(this.data);
      this.setTooltipFormatter();
      this.chartOptions = {
        ...this.chartOptions,
        ...this._chartOptions
      };
      this.updateFlag = true;
    }
  }

  setTooltipFormatter() {
    if (!this.data) return;
    const dateTimes = Object.keys(this.data);
    const isDaily = Math.abs(new Date(dateTimes[1]).getTime() - new Date(dateTimes[0]).getTime()) > 3600000;
    const dateFormat = isDaily ? undefined : 'short';
    console.log(isDaily, dateFormat);
    this.chartOptions.tooltip!.pointFormatter = function () {
      const parts = [
        `<b>${new DatePipe('en-US').transform(this.x, dateFormat)}</b><br/>`,
        `${this.series.name}: `,
        `<b>${(this as any).raw}</b>`,
        `(<b>${this.y?.toFixed(1)}%</b>)`
      ]
      return parts.join('');
    };
  }

}
