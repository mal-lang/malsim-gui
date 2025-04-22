import { Component, Input } from '@angular/core';
import { AssetMenuAlertsComponent } from '../asset-menu-alerts/asset-menu-alerts.component';
import { NgClass, NgIf } from '@angular/common';
import { AssetMenuInformationComponent } from '../asset-menu-information/asset-menu-information.component';
import { CrossComponent } from '../../utils/cross/cross.component';
import {
  TyrGraphNode,
  TyrManager,
  TyrGraphNodeStatus,
  getEmptyNodeStyle,
  getEmptyNodeConnectionInfo,
  getEmptyNodeCluster,
  TyrNotification,
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
  public notifications: TyrNotification[] = [];
  public closed: boolean = true;
  public openedMenu: string = 'information';

  constructor() {
    //Dummy node for init purposes
    this.node = {
      id: '',
      status: TyrGraphNodeStatus.active,
      asset: {
        id: '',
        name: '',
        type: '',
        associatedAssets: [],
      },
      x: 0,
      y: 0,
      originalX: 0,
      originalY: 0,
      notificationList: [],
      nodeReward: 0,
      style: getEmptyNodeStyle(),
      connections: getEmptyNodeConnectionInfo(),
      cluster: getEmptyNodeCluster(),
    };
  }

  public openMenu(menu: string) {
    this.openedMenu = menu;
  }

  public open(node: TyrGraphNode) {
    this.node = node;
    this.closed = false;
  }

  public close() {
    this.closed = true;
    this.node.style.selected = false;
    this.tyrManager.updateNodesStatusStyle([this.node]);
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
