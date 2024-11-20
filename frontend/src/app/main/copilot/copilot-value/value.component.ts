import { Component, OnInit } from '@angular/core';
import { AppModule } from '../../../app.module';
import { AdoptionChartComponent } from "./adoption-chart/adoption-chart.component";
import { ActivityResponse, SeatService } from '../../../services/seat.service';
import { DailyActivityChartComponent } from './daily-activity-chart/daily-activity-chart.component';
import { TimeSavedChartComponent } from './time-saved-chart/time-saved-chart.component';
import { CopilotMetrics } from '../../../services/metrics.service.interfaces';
import { MetricsService } from '../../../services/metrics.service';
import { FormControl } from '@angular/forms';
import { combineLatest, startWith } from 'rxjs';
import { CopilotSurveyService, Survey } from '../../../services/copilot-survey.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'app-value',
  standalone: true,
  imports: [
    AppModule,
    AdoptionChartComponent,
    DailyActivityChartComponent,
    TimeSavedChartComponent
  ],
  templateUrl: './value.component.html',
  styleUrls: [
    './value.component.scss',
    // '../copilot-dashboard/dashboard.component.scss'
  ]
})
export class CopilotValueComponent implements OnInit {
  activityData?: ActivityResponse;
  metricsData?: CopilotMetrics[];
  surveysData?: Survey[];
  daysInactive = new FormControl(30);
  adoptionFidelity = new FormControl<'day' | 'hour'>('day');
  Highcharts: typeof Highcharts = Highcharts;
  charts = [] as Highcharts.Chart[];
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
    plotOptions: {
      series: {
        animation: {
          duration: 300
        }
      }
    },
  };

  constructor(
    private seatService: SeatService,
    private metricsService: MetricsService,
    private copilotSurveyService: CopilotSurveyService
  ) { }

  ngOnInit() {
    combineLatest([
      this.daysInactive.valueChanges.pipe(startWith(this.daysInactive.value || 30)),
      this.adoptionFidelity.valueChanges.pipe(startWith(this.adoptionFidelity.value || 'day'))
    ]).subscribe(([days, fidelity]) => {
      this.seatService.getActivity(days || 30, fidelity || 'day').subscribe(data => {
        this.activityData = data;
      });
    });
    this.metricsService.getMetrics().subscribe(data => {
      this.metricsData = data;
    });
    this.copilotSurveyService.getAllSurveys().subscribe(data => {
      this.surveysData = data;
    });
  }

  chartChanged(chart: Highcharts.Chart) {
    this.charts.push(chart);
    const charts = this.charts;
    for (chart of charts) {
      chart.xAxis[0].update({
        events: {
          afterSetExtremes: function (event) {
            charts.forEach(otherChart => {
              if (otherChart.xAxis[0].min != event.min || otherChart.xAxis[0].max != event.max) {
                otherChart.xAxis[0].setExtremes(event.min, event.max)
              }
            })
          }
        }
      })
    }
  }
}
