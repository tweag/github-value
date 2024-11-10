import { Component, Input, SimpleChanges } from '@angular/core';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/modules/sunburst.src';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sunburst-chart',
  standalone: true,
  imports: [
    HighchartsChartModule,
    CommonModule
  ],
  templateUrl: './sunburst-chart.component.html',
  styleUrl: './sunburst-chart.component.scss'
})
export class SunburstChartComponent {
  Highcharts: typeof Highcharts = Highcharts;
  @Input() data: any = [];
  chartOptions: Highcharts.Options = {
    // Let the center circle be transparent
    colors: ['transparent', ...(Highcharts.getOptions().colors || [])],
    series: [{
      type: 'sunburst',
      data: this.data,
      name: 'Root',
      allowTraversingTree: true,
      borderRadius: 3,
      cursor: 'pointer',
      dataLabels: {
        format: '{point.name}',
        filter: {
          property: 'innerArcLength',
          operator: '>',
          value: 16
        }
      },
      levels: [{
        level: 1,
        // levelIsConstant: false,
        dataLabels: {
          filter: {
            property: 'outerArcLength',
            operator: '>',
            value: 64
          }
        }
      }, {
        level: 2,
        colorByPoint: true
      },
      {
        level: 3,
        colorVariation: {
          key: 'brightness',
          to: -0.5
        }
      }, {
        level: 4,
        colorVariation: {
          key: 'brightness',
          to: 0.5
        }
      }]
    }],
    tooltip: {
      headerFormat: '',
      pointFormat: '<b>{point.name}</b>: <b>{point.value}</b> Users'
    }
  };
  updateFlag = false;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      if (this.chartOptions.series && this.chartOptions.series[0]) {
        (this.chartOptions.series[0] as any).data = this.data;
        this.updateFlag = true;
      }
    }
  }
}
