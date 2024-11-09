import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface DashboardBarsCardSection {
  value: number;
  maxValue: number;
  icon: string;
  name: string;
  percentage?: number;
};

@Component({
  selector: 'app-dashboard-bars-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    MatProgressBarModule,
    MatIconModule
  ],
  templateUrl: './dashboard-bars-card.component.html',
  styleUrl: './dashboard-bars-card.component.scss'
})
export class DashboardBarsCardComponent implements OnInit {
  @Input() title?: string;
  @Input() sections?: DashboardBarsCardSection[];
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
