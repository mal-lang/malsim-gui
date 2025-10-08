import { Component, Input } from '@angular/core';
import { selectAssetImage } from 'src/app/utils/functions/utils';
import { MALNotification } from '@mal-lang/mal-js';

@Component({
  selector: 'app-timeline-item',
  standalone: true,
  imports: [],
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.scss',
})
export class TimelineItemComponent {
  @Input() notification: MALNotification;
  alertImageURL: string;
  timestamp: string;

  /**
   * On created, it gets the timestamp and parses it to a readable format. It also fetches the correct image to be displayed.
   */
  ngOnInit() {
    this.timestamp = new Date(this.notification.timestamp)
      .toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(',', '');

    this.alertImageURL = selectAssetImage(this.notification.node);
  }
}
