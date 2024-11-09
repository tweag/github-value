import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule
  ],
  templateUrl: './dashboard-card.component.html',
  styleUrl: './dashboard-card.component.scss'
})
export class DashboardCardComponent {
  @Input() title?: string;
  @Input() value?: number;
  @Input() description?: string;
  @Input() change?: number;
  @Input() changeSuffix?: string = '%';
  @Input() changeDescription?: string;
  @Input() icon?: string;
  Math = Math;
}
