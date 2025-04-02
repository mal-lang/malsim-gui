import { Component, Input } from '@angular/core';
import { Texture, TyrAlert } from 'tyr-js';

@Component({
  selector: 'app-timeline-item',
  standalone: true,
  imports: [],
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.scss',
})
export class TimelineItemComponent {
  @Input() alert: TyrAlert;
  @Input() alertImageURL: string;
}
