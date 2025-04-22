import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import {
  TyrNotificationType,
  TyrNotification,
  TyrAssetGraphNode,
} from 'tyr-js';

@Component({
  selector: 'app-asset-menu-alerts',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './asset-menu-alerts.component.html',
  styleUrl: './asset-menu-alerts.component.scss',
})
export class AssetMenuAlertsComponent {
  @Input() node: TyrAssetGraphNode;
  public timestampToLocale(timestamp: number) {
    return new Date(timestamp)
      .toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(',', '');
  }

  public getName(value: TyrNotificationType) {
    switch (value) {
      case TyrNotificationType.alert:
        return 'Alert';
      case TyrNotificationType.suggestion:
        return 'Performed Suggestion';
      default:
        return '';
    }
  }

  public getImage(notification: TyrNotification) {
    switch (notification.type) {
      case TyrNotificationType.alert:
        return 'assets/icons/alert.png';
      case TyrNotificationType.suggestion:
        return this.getSuggestionImage(notification);
      default:
        return '';
    }
  }

  private getSuggestionImage(suggestion: TyrNotification) {
    switch (suggestion.description) {
      //TODO
      case 'Shutdown machine':
        return 'assets/icons/suggestions/suggestion-turnoff.png';
      default:
        return '';
    }
  }
}
