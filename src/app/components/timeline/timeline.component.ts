import { Component } from '@angular/core';
import { TyrAlert } from 'tyr-js';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  private alerts: TyrAlert[];

  constructor() {
    this.alerts = [];
  }

  private selectAlertIcon(alert: TyrAlert) {
    switch (alert.node.type) {
      case 'Network':
        return '/assets/icons/network.png';
      case 'Application':
        return '/assets/icons/app.png';
      case 'ConnectionRule':
        return '/assets/icons/networking.png';
      case 'Identity':
        return '/assets/icons/id-card.png';
      case 'SoftwareVulnerability':
        return '/assets/icons/icognito.png';
      default:
        return '/assets/icons/shield.png';
    }
  }

  public addAlert(alert: TyrAlert) {
    this.alerts.push(alert);
  }

  public deleteAlert(alert: TyrAlert) {
    this.alerts = this.alerts.filter((a) => a === alert);
  }
}
