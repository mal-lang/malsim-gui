import { Component, Input } from '@angular/core';
import { AssetMenuAlertsComponent } from '../asset-menu-alerts/asset-menu-alerts.component';
import { NgClass, NgIf } from '@angular/common';
import { AssetMenuInformationComponent } from '../asset-menu-information/asset-menu-information.component';
import { CrossComponent } from '../../utils/components/cross/cross.component';
import {
  TyrManager,
  getEmptyNodeStyle,
  getEmptyNodeConnectionInfo,
  getEmptyNodeCluster,
  TyrNotification,
  TyrAssetGraphNode,
  TyrAssetGraphNodeStatus,
  TyrAttackStep,
  getEmptyAnimationHelper,
  getEmptyAssetGraphNode,
} from 'tyr-js';

enum AvailableAssetMenus {
  information,
  alerts,
}

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

/**
 * AssetMenuComponent its the main component for the menu that appears on the right when an asset is clicked.
 * It displays information about the asset, its CIA values, its status, its alerts and its connected assets.
 */
export class AssetMenuComponent {
  @Input() tyrManager: TyrManager;
  @Input() openAttackGraph: (attackStep: TyrAttackStep) => void;
  public node: TyrAssetGraphNode;
  public notifications: TyrNotification[] = [];
  public closed: boolean = true;
  AvailableAssetMenus = AvailableAssetMenus; //expose to html
  public openedMenu: AvailableAssetMenus = AvailableAssetMenus.information;

  constructor() {
    //Dummy node for init purposes
    this.node = getEmptyAssetGraphNode();
    this.close = this.close.bind(this);
  }

  /**
   * Select the node. Meant to be used when the targetted node is changed.
   */
  public selectNode(node: TyrAssetGraphNode) {
    this.node = node;
    this.closed = false;
  }

  /**
   * Opens the selected menu
   */
  public open(menu: AvailableAssetMenus) {
    this.openedMenu = menu;
  }

  /**
   * Closes all the menu
   */
  public close() {
    this.closed = true;
    this.node.style.selected = false;
    this.tyrManager.assetGraphRenderer.resetStyleToNodeStatus(this.node);
  }

  /**
   * Opens the attack graph window.
   * Meant to be used when an alert(attackStep) has been selected.
   */
  openAttackGraphWindow = (attackStep: TyrAttackStep) => {
    this.close();
    this.openAttackGraph(attackStep);
  };
}
