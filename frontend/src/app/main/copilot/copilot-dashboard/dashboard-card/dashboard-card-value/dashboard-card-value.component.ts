import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-card-value',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './dashboard-card-value.component.html',
  styleUrls: [
    './dashboard-card-value.component.scss',
    '../dashboard-card.scss'
  ]
})
export class DashboardCardValueComponent {
  @Input() title?: string;
  @Input() value?: number;
  @Input() description?: string;
  @Input() change?: number;
  @Input() changeSuffix?: string = '%';
  @Input() changeDescription?: string;
  @Input() icon?: string;
  Math = Math;
}
