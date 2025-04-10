import { Component, Input } from '@angular/core';
import { TyrAlert } from 'tyr-js';

@Component({
  selector: 'app-timeline-item',
  standalone: true,
  imports: [],
  templateUrl: './timeline-item.component.html',
  styleUrl: './timeline-item.component.scss',
})
export class TimelineItemComponent {
  @Input() alert: TyrAlert;
  alertImageURL: string;
  timestamp: string;

  ngOnInit() {
    this.timestamp = new Date(this.alert.timestamp)
      .toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(',', '');

    switch (this.alert.node.asset.type) {
      case 'Network':
        this.alertImageURL = '/assets/icons/network.png';
        break;
      case 'Application':
        this.alertImageURL = '/assets/icons/app.png';
        break;
      case 'ConnectionRule':
        this.alertImageURL = '/assets/icons/networking.png';
        break;
      case 'Identity':
        this.alertImageURL = '/assets/icons/id-card.png';
        break;
      case 'SoftwareVulnerability':
        this.alertImageURL = '/assets/icons/icognito.png';
        break;
      default:
        this.alertImageURL = '/assets/icons/shield.png';
        break;
    }
  }
}
