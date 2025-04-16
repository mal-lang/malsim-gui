import { Component, Input } from '@angular/core';
import { AssetMenuAlertsComponent } from '../asset-menu-alerts/asset-menu-alerts.component';
import { NgClass, NgIf } from '@angular/common';
import { AssetMenuInformationComponent } from '../asset-menu-information/asset-menu-information.component';
import { CrossComponent } from '../../utils/cross/cross.component';
import {
  TyrNotificationItem,
  TyrGraphNode,
  TyrManager,
  TyrNotificationType,
} from 'tyr-js';

@Component({
  selector: 'app-asset-menu',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    AssetMenuAlertsComponent,
    AssetMenuInformationComponent,
    CrossComponent,
  ],
  templateUrl: './asset-menu.component.html',
  styleUrl: './asset-menu.component.scss',
})
export class AssetMenuComponent {
  @Input() tyrManager: TyrManager;
  public node: TyrGraphNode;
  public notifications: TyrNotificationItem[] = [];
  public status: string;
  public closed: boolean = true;
  public openedMenu: string = 'information';

  constructor() {
    //Dummy node for init purposes
    this.node = {
      id: '',
      asset: {
        id: '',
        name: '',
        type: '',
        associatedAssets: [],
      },
      childrenIds: [],
      paths: [],
      x: 0,
      y: 0,
      notificationList: [],
      nodeReward: 0,
      clusterReward: 0,
    };
  }

  public openMenu(menu: string) {
    this.openedMenu = menu;
  }

  public open(node: TyrGraphNode) {
    this.node = node;
    this.notifications = this.node.notificationList.filter(
      (a) => a.notifiedNode.id === this.node.id
    );

    if (
      this.notifications.some(
        (n) => n.notification.type === TyrNotificationType.alert
      )
    )
      this.status = 'alerted';
    else this.status = 'active';

    this.closed = false;
  }

  public close() {
    this.closed = true;
    this.tyrManager.unhighlightNodeBorders();
  }

  public selectAssetImage(node: TyrGraphNode) {
    switch (node.asset.type) {
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
}
