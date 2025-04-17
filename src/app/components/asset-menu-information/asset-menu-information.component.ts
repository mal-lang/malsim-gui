import { NgFor, NgIf } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { TyrGraphNode, TyrManager } from 'tyr-js';

@Component({
  selector: 'app-asset-menu-information',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './asset-menu-information.component.html',
  styleUrl: './asset-menu-information.component.scss',
})
export class AssetMenuInformationComponent {
  @Input() node: TyrGraphNode;
  @Input() status: string;
  @Input() tyrManager: TyrManager;
  @Input() selectAssetImage: (node: TyrGraphNode) => void;
  public relatedNodes: TyrGraphNode[];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['node']) {
      if (!this.node) return;
      const ids = this.node.connections.childrenIds;
      this.relatedNodes = this.node.connections.paths
        .filter((p) => ids.includes(p.destiny.id))
        .map((p) => p.destiny);
    }
  }

  public hoverItem(node: TyrGraphNode) {
    this.tyrManager.highlightNode(node);
  }

  public unhoverItem() {
    this.tyrManager.unhighlightNodes();
  }
}
