import { NgFor, NgIf } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { TyrAlertItem, TyrGraphNode } from 'tyr-js';

@Component({
  selector: 'app-asset-menu-alerts',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './asset-menu-alerts.component.html',
  styleUrl: './asset-menu-alerts.component.scss',
})
export class AssetMenuAlertsComponent {
  @Input() node: TyrGraphNode;
  @Input() alerts: TyrAlertItem[];
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
}
