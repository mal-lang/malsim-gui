import { NgFor } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { selectAssetImage } from 'src/app/utils/functions/utils';
import { TyrAssetGraphNode, TyrAssetGraphNodeStatus, TyrManager } from 'tyr-js';

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
  @Input() node: TyrAssetGraphNode; //The currently displayed node

  @Input() tyrManager: TyrManager;

  public relatedNodes: TyrAssetGraphNode[]; //Nodes connected to the currently displayed node
  public selectAssetImage: (node: TyrAssetGraphNode) => void = selectAssetImage;

  /**
   * When the node is updated, it also updated the related nodes
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['node']) {
      if (!this.node) return;
      this.relatedNodes = this.node.connections.children as TyrAssetGraphNode[];
    }
  }

  /**
   * Returns the current node's status.
   */
  public getStatus() {
    return TyrAssetGraphNodeStatus[this.node.status];
  }

  /**
   * Highlights the node that is currently being hovered.
   *
   * @param {TyrAssetGraphNode} node - The node being hovered.
   */
  public hoverItem(node: TyrAssetGraphNode) {
    this.tyrManager.assetGraphRenderer.highlightNode(node);
  }

  /**
   * Unhighlights all nodes
   */
  public unhoverItem() {
    this.tyrManager.assetGraphRenderer.unhighlightNodes();
  }
}
