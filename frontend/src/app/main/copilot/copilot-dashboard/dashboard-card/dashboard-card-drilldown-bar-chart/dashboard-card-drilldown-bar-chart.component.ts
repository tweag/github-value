import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SunburstChartComponent } from '../../../../../shared/sunburst-chart/sunburst-chart.component';
import { MatCardModule } from '@angular/material/card';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/modules/drilldown.src';
import { HighchartsChartModule } from 'highcharts-angular';
import { CommonModule } from '@angular/common';
import { HighchartsService } from '../../../../../services/highcharts.service';
import { MetricsService } from '../../../../../services/metrics.service';

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
  @Input() data: Highcharts.PointOptionsObject[] = [];
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
    private highchartsService: HighchartsService,
    private metricsService: MetricsService
  ) { }

  ngOnInit() {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const formattedSince = since.toISOString().split('T')[0];
    
    this.metricsService.getMetrics({
      since: formattedSince,
    }).subscribe(data => {
      console.log(data);
      const result = this.highchartsService.transformCopilotDataToDrilldown(data);
      this.chartOptions.series = result.series;
      this.chartOptions.drilldown = result.drilldown;
      console.log(this.chartOptions);
      this.updateFlag = true;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      if (this.chartOptions.series && this.chartOptions.series[0]) {
        (this.chartOptions.series[0] as any).data = this.data;
        this.updateFlag = true;
      }
    }
  }
}
