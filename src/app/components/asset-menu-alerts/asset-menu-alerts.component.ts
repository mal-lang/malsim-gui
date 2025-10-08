import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { getNotificationImage } from 'src/app/utils/functions/utils';
import { MALNotificationType, MALAssetGraphNode, MALAttackStep } from '@mal-lang/mal-js';

@Component({
  selector: 'app-asset-menu-alerts',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './asset-menu-alerts.component.html',
  styleUrl: './asset-menu-alerts.component.scss',
})

/**
 * AssetMenuAlertsComponent is the dedicated menu that display the asset's alerts.
 */
export class AssetMenuAlertsComponent {
  @Input() node: MALAssetGraphNode;
  @Input() openAttackGraph: (attackStep: MALAttackStep) => void;

  /**
   * Utils function that returns the correct image depending on the notification type.
   */
  public getNotificationImage = getNotificationImage;

  /**
   * Transforms a timestamp into a readable format.
   *
   * @param {number} timestamp - The timestamp.
   * @returns {string} - The date of the timestamp in a string format.
   */
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

  /**
   * Returns the notification name depending on its type
   *
   * @param {MALNotificationType} value - The notification type.
   * @returns {string} - The name of the notification.
   */
  public getName(value: MALNotificationType) {
    switch (value) {
      case MALNotificationType.alert:
        return 'Alert';
      case MALNotificationType.suggestion:
        return 'Performed Suggestion';
      default:
        return '';
    }
  }

  public manageAttackGraph(attackStep: MALAttackStep) {
    if (attackStep.type != 'defense') this.openAttackGraph(attackStep);
  }
}
