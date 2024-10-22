import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgxGraphZoomOptions } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';
import { LogModalComponent } from '../modals/log-modal/log-modal.component';

interface AttackNode {
  id: string;
  label: string;
  type: string;
  active: boolean;
}

interface AttackLink {
  id: string;
  source: string;
  target: string;
}

@Component({
  selector: 'app-attack-graph',
  templateUrl: './attack-graph.component.html',
  styleUrl: './attack-graph.component.scss',
})
export class AttackGraphComponent implements OnInit {
  @Input() currentAttackSteps: any;
  @Input() currentDefenceSteps: any;
  @Input() attackSteps: any;
  @Input() attackStepMap: any;
  @ViewChild('logModal') logModal: LogModalComponent;

  attackGraphLinks: Array<AttackLink> = [];
  attackGraphNodes: Array<AttackNode> = [];

  maxDepth: number = 2;
  public layoutSettings = {
    orientation: 'TB',
  };
  zoomToFit$: Subject<NgxGraphZoomOptions> = new Subject();

  ngOnInit() {}

  fitGraph() {
    this.zoomToFit$.next({ force: true, autoCenter: true });
  }

  updateAttackGraph() {
    let attackGraphNodes: Array<any> = [];
    let attackGraphLinks: Array<any> = [];

    Object.keys(this.currentAttackSteps).forEach((attackId: any) => {
      let name = this.attackStepMap.get(Number(attackId));
      if (name) {
        let step = this.attackSteps[name];

        let node = this.createAttackGraphNode(
          step,
          true,
          this.currentAttackSteps[attackId].length
        );

        attackGraphNodes.push(node);

        this.getChildren(attackGraphNodes, attackGraphLinks, name, 1);
        this.getParents(attackGraphNodes, attackGraphLinks, name, 1);
      }
    });

    Object.keys(this.currentDefenceSteps).forEach((defenceId: any) => {
      let name = this.attackStepMap.get(Number(defenceId));
      if (name) {
        let step = this.attackSteps[name];

        let node = this.createAttackGraphNode(
          step,
          true,
          this.currentDefenceSteps[defenceId].length
        );

        attackGraphNodes.push(node);

        this.getChildren(attackGraphNodes, attackGraphLinks, name, 1);
        this.getParents(attackGraphNodes, attackGraphLinks, name, 1);
      }
    });

    this.attackGraphLinks = attackGraphLinks;
    this.attackGraphNodes = attackGraphNodes;

    setTimeout(() => {
      if (this.attackGraphNodes.length > 0) {
        this.fitGraph();
      }
    }, 100);
  }

  getChildren(
    nodes: Array<any>,
    links: Array<any>,
    source: string,
    depth: number
  ) {
    let step = this.attackSteps[source];

    Object.keys(step.children).forEach((id) => {
      let childName = step.children[id];
      let childStep = this.attackSteps[childName];
      let node = this.createAttackGraphNode(childStep, false, undefined);

      let nodeIndex = nodes.findIndex((n: any) => n.id === node.id);
      if (nodeIndex === -1) {
        nodes.push(node);
        this.createAttackGraphLink(links, step.id.toString(), node.id);

        if (depth < this.maxDepth) {
          this.getChildren(nodes, links, childName, depth + 1);
        }
      } else {
        this.createAttackGraphLink(
          links,
          step.id.toString(),
          nodes[nodeIndex].id
        );
      }
    });
  }

  getParents(
    nodes: Array<any>,
    links: Array<any>,
    source: string,
    depth: number
  ) {
    let step = this.attackSteps[source];

    Object.keys(step.parents).forEach((id) => {
      let parentName = step.parents[id];
      let parentStep = this.attackSteps[parentName];
      let node = this.createAttackGraphNode(parentStep, false, undefined);

      let nodeIndex = nodes.findIndex((n: any) => n.id === node.id);
      if (nodeIndex === -1) {
        nodes.push(node);
        nodes.push(node);
        this.createAttackGraphLink(links, node.id, step.id.toString());

        if (depth < this.maxDepth) {
          this.getParents(nodes, links, parentName, depth + 1);
        }
      } else {
        this.createAttackGraphLink(
          links,
          step.id.toString(),
          nodes[nodeIndex].id
        );
      }
    });
  }

  createAttackGraphNode(
    event: any,
    active: boolean,
    logLength: number | undefined
  ) {
    let capitlized = event.name.charAt(0).toUpperCase() + event.name.slice(1);
    let splitLabel: Array<string> = capitlized.split(/(?=[A-Z])/);

    let label = '';
    splitLabel.forEach((word, index) => {
      if (index > 1) {
        label += ' ';
      }
      label += word;
    });

    let color = this.getNodeColor(event, active);

    return {
      id: event.id.toString(),
      label: label,
      type: event.type,
      active: active,
      color: color,
      logLength: logLength,
    };
  }

  createAttackGraphLink(links: Array<any>, source: string, target: string) {
    let newId = source + '_' + target + '_link';

    links.push({
      id: newId,
      source: source,
      target: target,
    });
  }

  getNodeColor(event: any, active: boolean) {
    if (event.type === 'defense') {
      return active ? '#4CA6FF' : '#2a5c8e';
    } else {
      return active ? '#FF4C4C' : '#902a2a';
    }
  }

  onNodeClick(event: any, node: AttackNode) {
    this.logModal.open(node, this.currentAttackSteps[node.id]);
  }
}
