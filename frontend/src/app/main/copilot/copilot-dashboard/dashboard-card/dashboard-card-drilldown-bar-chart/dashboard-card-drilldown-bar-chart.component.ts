import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SunburstChartComponent } from '../../../../../shared/sunburst-chart/sunburst-chart.component';
import { MatCardModule } from '@angular/material/card';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/modules/drilldown.src';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { HighchartsService } from '../../../../../services/highcharts.service';
import { CopilotMetrics } from '../../../../../services/metrics.service.interfaces';

@Component({
  selector: 'app-dashboard-card-drilldown-bar-chart',
  standalone: true,
  imports: [
    SunburstChartComponent,
    MatCardModule,
    CommonModule,
    HighchartsChartModule
  ],
  templateUrl: './dashboard-card-drilldown-bar-chart.component.html',
  styleUrls: [
    './dashboard-card-drilldown-bar-chart.component.scss',
    '../dashboard-card.scss'
  ]
})
export class DashboardCardDrilldownBarChartComponent implements OnChanges {
  @Input() title?: string;
  Highcharts: typeof Highcharts = Highcharts;
  @Input() data?: CopilotMetrics[] = [];
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'column'
    },
    xAxis: {
      type: 'category',
    },
    tooltip: {
        headerFormat: '<span>{series.name}</span><br>',
        pointFormat: '<span style="color:{point.color}">{point.name}</span>: ' +
            '<b>{point.y}</b> users<br/>'
    },
    legend: {
      enabled: false
    },
    series: [{
      type: 'column',
    }],
    drilldown: {
      series: [{        
        type: 'column'
      }]
    }
  };
  updateFlag = false;

  constructor(
    private highchartsService: HighchartsService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      const result = this.highchartsService.transformCopilotMetricsToBarChatDrilldown(this.data);
      this.chartOptions.series = result.series;
      this.chartOptions.drilldown = result.drilldown;
      this.updateFlag = true;
    }
  }
}
