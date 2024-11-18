import { ChangeDetectionStrategy, Component } from '@angular/core';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import 'highcharts/es-modules/masters/modules/gantt.src';
import 'highcharts/es-modules/masters/modules/accessibility.src';
import { HighchartsChartModule } from 'highcharts-angular';

@Component({
  selector: 'app-copilot-seat',
  standalone: true,
  imports: [
    HighchartsChartModule
  ],
  templateUrl: './copilot-seat.component.html',
  styleUrl: './copilot-seat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopilotSeatComponent {
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  chartOptions: Highcharts.Options = {
    title: {
      text: 'Gantt Chart with Progress Indicators',
      align: 'left'
    },
    xAxis: {
      type: 'datetime',
      min: Date.UTC(2014, 10, 17),
      max: Date.UTC(2014, 10, 30)
    },
    accessibility: {
      point: {
        descriptionFormat: '{yCategory}. ' +
          '{#if completed}Task {(multiply completed.amount 100):.1f}% ' +
          'completed. {/if}' +
          'Start {x:%Y-%m-%d}, end {x2:%Y-%m-%d}.'
      }
    },
    lang: {
      accessibility: {
        axis: {
          xAxisDescriptionPlural: 'The chart has a two-part X axis ' +
            'showing time in both week numbers and days.'
        }
      }
    },
    series: [{
      name: 'Project 1',
      type: 'gantt',
      data: [{
        name: 'Start prototype',
        start: Date.UTC(2014, 10, 18),
        end: Date.UTC(2014, 10, 25),
        completed: {
          amount: 0.25
        }
      }, {
        name: 'Test prototype',
        start: Date.UTC(2014, 10, 27),
        end: Date.UTC(2014, 10, 29)
      }, {
        name: 'Develop',
        start: Date.UTC(2014, 10, 20),
        end: Date.UTC(2014, 10, 25),
        completed: {
          amount: 0.12,
          fill: '#fa0'
        }
      }, {
        name: 'Run acceptance tests',
        start: Date.UTC(2014, 10, 23),
        end: Date.UTC(2014, 10, 26)
      }]
    } as any]
  }

  constructor() { }

}
