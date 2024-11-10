import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface DashboardCardBarsInput {
  value: number;
  maxValue: number;
  icon: string;
  name: string;
  percentage?: number;
};

@Component({
  selector: 'app-dashboard-card-bars',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    MatProgressBarModule,
    MatIconModule
  ],
  templateUrl: './dashboard-card-bars.component.html',
  styleUrls: [
    './dashboard-card-bars.component.scss',
    '../dashboard-card.scss'
  ]
})
export class DashboardCardBarsComponent implements OnInit {
  @Input() title?: string;
  @Input() sections?: DashboardCardBarsInput[];
  percentages: number[] = []
  Math = Math;

  ngOnInit() {
    if (this.sections) {
      this.sections.forEach((row) => {
        row.percentage = (row.value / (row.maxValue || 100)) * 100;
      })
    }
  }
}
