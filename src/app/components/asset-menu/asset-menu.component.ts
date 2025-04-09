import { Component, Input } from '@angular/core';
import { AssetMenuAlertsComponent } from '../asset-menu-alerts/asset-menu-alerts.component';
import { NgClass, NgIf } from '@angular/common';
import { AssetMenuInformationComponent } from '../asset-menu-information/asset-menu-information.component';
import { CrossComponent } from '../../utils/cross/cross.component';
import { TyrAlertItem, TyrGraphNode, TyrManager } from 'tyr-js';

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
  public alerts: TyrAlertItem[] = [];
  public status: string;
  public closed: boolean = true;
  public openedMenu: string = 'information';

  constructor() {
    //Dummy node for init purposes
    this.node = {
      id: '',
      name: '',
      type: '',
      childrenIds: [],
      paths: [],
      x: 0,
      y: 0,
      alertList: [],
      nodeReward: 0,
      clusterReward: 0,
    };
  }

  public openMenu(menu: string) {
    this.openedMenu = menu;
  }

  public open(node: TyrGraphNode) {
    this.node = node;
    this.alerts = this.node.alertList.filter(
      (a) => a.alertedNode.id === this.node.id
    );

    if (this.alerts.length > 0) this.status = 'alerted';
    else this.status = 'active';

    this.closed = false;
  }

  public close() {
    this.closed = true;
  }

  public selectAssetImage(node: TyrGraphNode) {
    switch (node.type) {
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
