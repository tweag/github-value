import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import * as Highcharts from 'highcharts';
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
export class AdoptionChartComponent implements OnInit, OnChanges {
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  totalUsers = 500;
  @Input() data?: ActivityResponse;
  @Input() stripped = false;
  @Input() chartOptions?: Highcharts.Options;
  notStrippedChartOptions: Highcharts.Options = {
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
    }
  }
  _chartOptions: Highcharts.Options = {
    yAxis: {
      min: 0,
      max: 100,
      labels: {
        enabled: false
      }
    },
    series: [{
      name: 'Users',
      type: 'spline',
      data: []
    }],
    tooltip: {
      headerFormat: '',
    },
    legend: {
      enabled: false
    },
  };
  @Output() chartInstanceChange = new EventEmitter<Highcharts.Chart>();
  strippedChartOptions: Highcharts.Options = JSON.parse(JSON.stringify(this._chartOptions));
  charts: Highcharts.Chart[] = [];

  constructor(
    private highchartsService: HighchartsService,
  ) { }

  ngOnInit() {
    this._chartOptions = {
      ...this._chartOptions,
      ...this.chartOptions
    }
    this._chartOptions = this.stripped ? this.strippedChartOptions : {
      ...this._chartOptions,
      ...this.notStrippedChartOptions
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      const options = this.highchartsService.transformActivityMetricsToLine(this.data);
      this._chartOptions = {
        ...this._chartOptions,
        ...options,
        tooltip: {
          ...options.tooltip,
          ...this._chartOptions.tooltip
        }
      };
      this.updateFlag = true;
    }
  }

}
