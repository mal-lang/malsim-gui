import { NgFor } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { selectAssetImage } from 'src/app/utils/functions/utils';
import { MALAssetGraphNode, MALAssetGraphNodeStatus, MALManager } from 'mal-js';

@Component({
  selector: 'app-asset-menu-information',
  standalone: true,
  imports: [NgFor],
  templateUrl: './asset-menu-information.component.html',
  styleUrl: './asset-menu-information.component.scss',
})
/**
 * AssetMenuInformationComponent is the dedicated menu that display the asset's information. This is:
 * + Name
 * + Icons
 * + Status
 * + CIA values
 * + Connections with other assets
 */
export class AssetMenuInformationComponent {
  @Input() node: MALAssetGraphNode; //The currently displayed node

  @Input() MALManager: MALManager;

  public relatedNodes: MALAssetGraphNode[]; //Nodes connected to the currently displayed node
  public selectAssetImage: (node: MALAssetGraphNode) => void = selectAssetImage;

  /**
   * When the node is updated, it also updated the related nodes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['node']) {
      if (!this.node) return;
      this.relatedNodes = this.node.connections.children as MALAssetGraphNode[];
    }
  }

  /**
   * Returns the current node's status.
   */
  public getStatus() {
    return MALAssetGraphNodeStatus[this.node.status];
  }

  /**
   * Highlights the node that is currently being hovered.
   *
   * @param {MALAssetGraphNode} node - The node being hovered.
   */
  public hoverItem(node: MALAssetGraphNode) {
    this.MALManager.assetGraphRenderer.highlightNode(node);
  }

  /**
   * Unhighlights all nodes
   */
  public unhoverItem() {
    this.MALManager.assetGraphRenderer.unhighlightNodes();
  }
}
