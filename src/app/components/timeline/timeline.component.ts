import { Component } from '@angular/core';
import { TyrAlert } from 'tyr-js';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  public alerts: TyrAlert[];

  constructor() {
    this.alerts = [];
  }

  public addAlert(alert: TyrAlert) {
    this.alerts.push(alert);
  }

  public deleteAlert(alert: TyrAlert) {
    this.alerts = this.alerts.filter((a) => a === alert);
  }
}
