import { Component, Input } from '@angular/core';
import { AssetMenuAlertsComponent } from '../asset-menu-alerts/asset-menu-alerts.component';
import { NgClass, NgIf } from '@angular/common';
import { AssetMenuInformationComponent } from '../asset-menu-information/asset-menu-information.component';
import { CrossComponent } from '../../utils/components/cross/cross.component';
import {
  MALManager,
  MALNotification,
  MALAssetGraphNode,
  MALAttackStep,
  getEmptyAssetGraphNode,
} from 'mal-js';

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
  @Input() MALManager: MALManager;
  @Input() openAttackGraph: (attackStep: MALAttackStep) => void;
  public node: MALAssetGraphNode;
  public notifications: MALNotification[] = [];
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
   *
   * @param {MALAssetGraphNode} node - The node to be selected.
   */
  public selectNode(node: MALAssetGraphNode) {
    this.node = node;
    this.closed = false;
  }

  /**
   * Opens the selected menu
   *
   * @param {AvailableAssetMenus} menu - The menu to be opened.
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
    this.MALManager.assetGraphRenderer.resetStyleToNodeStatus(this.node);
  }

  /**
   * Opens the attack graph window.
   * Meant to be used when an alert(attackStep) has been selected.
   *
   * @param {MALAttackStep} attackStep - The attack step to build the attack graph from.
   */
  openAttackGraphWindow = (attackStep: MALAttackStep) => {
    this.close();
    this.openAttackGraph(attackStep);
  };
}
