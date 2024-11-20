import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_gantt from 'highcharts/modules/gantt';
HC_gantt(Highcharts);
import { HighchartsChartModule } from 'highcharts-angular';
import { Seat, SeatService } from '../../../../services/seat.service';
import { ActivatedRoute } from '@angular/router';
import { HighchartsService } from '../../../../services/highcharts.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-copilot-seat',
  standalone: true,
  imports: [
    HighchartsChartModule,
    MatCardModule,
    CommonModule
  ],
  templateUrl: './copilot-seat.component.html',
  styleUrl: './copilot-seat.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopilotSeatComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;
  chartOptions: Highcharts.Options = {
    "title": {
      "text": "Seat Activity by Editor"
    },
    "xAxis": {
      "type": "datetime"
    },
    legend: {
      enabled: false
    },
    "series": [
      {
        "name": "Seat Activity",
        "type": "gantt",
        "data": []
      }
    ],
    "tooltip": {},
    "yAxis": {
      "categories": [
        "vscode",
        "copilot-summarization-pr"
      ]
    }
  }
  _chartOptions?: Highcharts.Options;
  id?: number;
  seat?: Seat;
  seatActivity?: Seat[];

  constructor(
    private copilotSeatService: SeatService,
    private activatedRoute: ActivatedRoute,
    private highchartsService: HighchartsService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const routeId = this.activatedRoute.snapshot.paramMap.get('id');
    if (!routeId) return;
    this.id = parseInt(routeId);

    this.copilotSeatService.getSeat(this.id).subscribe(seatActivity => {
      this.seatActivity = seatActivity;
      this.seat = seatActivity[this.seatActivity.length - 1];
      this._chartOptions = this.highchartsService.transformSeatActivityToGantt(seatActivity);
      this.chartOptions = {
        ...this.chartOptions,
        ...this._chartOptions
      };
      this.updateFlag = true;
      this.cdr.detectChanges();
    });

  }

}
