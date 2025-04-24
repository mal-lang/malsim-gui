import { NgFor } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { TyrAssetGraphNode, TyrAssetGraphNodeStatus, TyrManager } from 'tyr-js';

@Component({
  selector: 'app-asset-menu-information',
  standalone: true,
  imports: [NgFor],
  templateUrl: './asset-menu-information.component.html',
  styleUrl: './asset-menu-information.component.scss',
})
export class AssetMenuInformationComponent {
  @Input() node: TyrAssetGraphNode;

  @Input() tyrManager: TyrManager;
  @Input() selectAssetImage: (node: TyrAssetGraphNode) => void;
  public relatedNodes: TyrAssetGraphNode[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['node']) {
      if (!this.node) return;
      this.relatedNodes = this.node.connections.children as TyrAssetGraphNode[];
    }
  }

  public getStatus() {
    return TyrAssetGraphNodeStatus[this.node.status];
  }

  public hoverItem(node: TyrAssetGraphNode) {
    this.tyrManager.assetGraphRenderer.highlightNode(node);
  }

  public unhoverItem() {
    this.tyrManager.assetGraphRenderer.unhighlightNodes();
  }
}
