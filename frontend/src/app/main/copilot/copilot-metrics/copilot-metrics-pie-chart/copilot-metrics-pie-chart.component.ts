import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { CopilotMetrics } from '../../../../services/metrics.service.interfaces';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src';
import { HighchartsChartModule } from 'highcharts-angular';
import { HighchartsService } from '../../../../services/highcharts.service';

@Component({
    selector: 'app-copilot-metrics-ide-completion-pie-chart',
    standalone: true,
    imports: [
        HighchartsChartModule
    ],
    template: `<highcharts-chart [Highcharts]="Highcharts" [options]="chartOptions" [(update)]="updateFlag" style="width: 100%; display: block;">
</highcharts-chart>`,
    // styleUrl: './copilot-metrics-ide-completion-pie-chart.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopilotMetricsPieChartComponent {
    Highcharts: typeof Highcharts = Highcharts;
    @Input() metricsTotals?: CopilotMetrics;
    chartOptions: Highcharts.Options = {
        chart: {
            type: 'pie'
        },
        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: ' +
                '<b>{point.y:.2f}%</b> of total<br/>'
        },
        series: [{
            type: 'pie',
        }, {
            type: 'pie',
        }],
        drilldown: {
            series: [
                {
                    type: 'pie',
                    name: 'Chrome',
                    id: 'Chrome',
                    data: [
                        [
                            'v97.0',
                            36.89
                        ],
                        [
                            'v96.0',
                            18.16
                        ],
                        [
                            'v95.0',
                            0.54
                        ],
                        [
                            'v94.0',
                            0.7
                        ],
                        [
                            'v93.0',
                            0.8
                        ],
                        [
                            'v92.0',
                            0.41
                        ],
                        [
                            'v91.0',
                            0.31
                        ],
                        [
                            'v90.0',
                            0.13
                        ],
                        [
                            'v89.0',
                            0.14
                        ],
                        [
                            'v88.0',
                            0.1
                        ],
                        [
                            'v87.0',
                            0.35
                        ],
                        [
                            'v86.0',
                            0.17
                        ],
                        [
                            'v85.0',
                            0.18
                        ],
                        [
                            'v84.0',
                            0.17
                        ],
                        [
                            'v83.0',
                            0.21
                        ],
                        [
                            'v81.0',
                            0.1
                        ],
                        [
                            'v80.0',
                            0.16
                        ],
                        [
                            'v79.0',
                            0.43
                        ],
                        [
                            'v78.0',
                            0.11
                        ],
                        [
                            'v76.0',
                            0.16
                        ],
                        [
                            'v75.0',
                            0.15
                        ],
                        [
                            'v72.0',
                            0.14
                        ],
                        [
                            'v70.0',
                            0.11
                        ],
                        [
                            'v69.0',
                            0.13
                        ],
                        [
                            'v56.0',
                            0.12
                        ],
                        [
                            'v49.0',
                            0.17
                        ]
                    ]
                },
                {
                    type: 'pie',
                    name: 'Safari',
                    id: 'Safari',
                    data: [
                        [
                            'v15.3',
                            0.1
                        ],
                        [
                            'v15.2',
                            2.01
                        ],
                        [
                            'v15.1',
                            2.29
                        ],
                        [
                            'v15.0',
                            0.49
                        ],
                        [
                            'v14.1',
                            2.48
                        ],
                        [
                            'v14.0',
                            0.64
                        ],
                        [
                            'v13.1',
                            1.17
                        ],
                        [
                            'v13.0',
                            0.13
                        ],
                        [
                            'v12.1',
                            0.16
                        ]
                    ]
                },
                {
                    type: 'pie',
                    name: 'Edge',
                    id: 'Edge',
                    data: [
                        [
                            'v97',
                            6.62
                        ],
                        [
                            'v96',
                            2.55
                        ],
                        [
                            'v95',
                            0.15
                        ]
                    ]
                },
                {
                    type: 'pie',
                    name: 'Firefox',
                    id: 'Firefox',
                    data: [
                        [
                            'v96.0',
                            4.17
                        ],
                        [
                            'v95.0',
                            3.33
                        ],
                        [
                            'v94.0',
                            0.11
                        ],
                        [
                            'v91.0',
                            0.23
                        ],
                        [
                            'v78.0',
                            0.16
                        ],
                        [
                            'v52.0',
                            0.15
                        ]
                    ]
                }
            ]
        }
    };
    _chartOptions?: Highcharts.Options;
    updateFlag = false;

    constructor(
        private highchartsService: HighchartsService,
        private cdr: ChangeDetectorRef
    ) {
        console.log(this.metricsTotals);
    }

    ngOnChanges() {
        if (this.metricsTotals) {
            this._chartOptions = this.highchartsService.transformMetricsToPieDrilldown(this.metricsTotals);
            this.chartOptions = {
                ...this.chartOptions,
                ...this._chartOptions
            };
            console.log('now', this.chartOptions);
            this.updateFlag = true;
            this.cdr.detectChanges();
        }
    }
}
