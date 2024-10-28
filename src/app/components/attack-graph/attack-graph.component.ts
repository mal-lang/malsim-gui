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
  @Input() stage: number;
  @Input() activeDefenceSteps: any;
  @Input() activeAttackSteps: any;
  @Input() allAttackSteps: any;
  @Input() attackStepMap: any;
  @Input() type: string;
  @ViewChild('logModal') logModal: LogModalComponent;

  attackGraphLinks: Array<AttackLink> = [];
  attackGraphNodes: Array<AttackNode> = [];
  internalStage: number = 0;

  maxDepth: number = 2;
  public layoutSettings = {
    orientation: 'TB',
  };
  zoomToFit$: Subject<NgxGraphZoomOptions> = new Subject();
  update$: Subject<boolean> = new Subject();

  ngOnInit() {}

  fitGraph() {
    this.zoomToFit$.next({ force: true, autoCenter: true });
  }

  updateAttackGraph() {
    let attackGraphNodes: Array<any> = [];
    let attackGraphLinks: Array<any> = [];

    Object.keys(this.activeAttackSteps).forEach((stepId: any) => {
      let name = this.attackStepMap.get(Number(stepId));

      if (name) {
        let step = this.allAttackSteps[name];

        let node = this.createActiveAttackGraphNode(
          name,
          step,
          this.activeAttackSteps[stepId].logs.length
        );

        attackGraphNodes.push(node);

        if (this.type === 'horizon') {
          this.getChildren(attackGraphNodes, attackGraphLinks, name, 1);
        }
        if (this.type === 'historical') {
          this.getParents(attackGraphNodes, attackGraphLinks, name, 1);
        }
      }
    });

    Object.keys(this.activeDefenceSteps).forEach((defenceId: any) => {
      let name = this.attackStepMap.get(Number(defenceId));
      if (name) {
        let step = this.allAttackSteps[name];

        let node = this.createActiveAttackGraphNode(name, step, 0);

        attackGraphNodes.push(node);

        if (this.type === 'horizon')
          this.getChildren(attackGraphNodes, attackGraphLinks, name, 1);

        if (this.type === 'historical') {
          this.getParents(attackGraphNodes, attackGraphLinks, name, 1);
        }
      }
    });

    this.attackGraphLinks = attackGraphLinks;
    this.attackGraphNodes = attackGraphNodes;

    setTimeout(() => {
      if (
        this.attackGraphNodes.length > 0 &&
        this.internalStage !== this.stage
      ) {
        this.fitGraph();
      }
    }, 200);
  }

  getChildren(
    nodes: Array<any>,
    links: Array<any>,
    source: string,
    depth: number
  ) {
    let step = this.allAttackSteps[source];

    Object.keys(step.children).forEach((id) => {
      let childName = step.children[id];
      let childStep = this.allAttackSteps[childName];
      let node = this.createAttackGraphNode(childName, childStep);

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
    let step = this.allAttackSteps[source];

    Object.keys(step.parents).forEach((id) => {
      let parentName = step.parents[id];
      let parentStep = this.allAttackSteps[parentName];
      let node = this.createAttackGraphNode(parentName, parentStep);

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

  createActiveAttackGraphNode(fullName: string, step: any, logLength: number) {
    let capitlized = fullName.charAt(0).toUpperCase() + fullName.slice(1);
    let splitLabel: Array<string> = capitlized.split(/(?=[A-Z])/);

    let label = '';
    splitLabel.forEach((word, index) => {
      if (index > 1) {
        label += ' ';
      }
      label += word;
    });

    let color = this.getNodeColor(step, true);

    return {
      id: step.id.toString(),
      label: label,
      type: step.type,
      active: true,
      color: color,
      logLength: logLength,
    };
  }

  createAttackGraphNode(fullName: string, step: any) {
    let capitlized = fullName.charAt(0).toUpperCase() + fullName.slice(1);
    let splitLabel: Array<string> = capitlized.split(/(?=[A-Z])/);

    let label = '';
    splitLabel.forEach((word, index) => {
      if (index > 1) {
        label += ' ';
      }
      label += word;
    });

    let color = this.getNodeColor(step, false);

    return {
      id: step.id.toString(),
      label: label,
      type: step.type,
      active: false,
      color: color,
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
    if (this.activeAttackSteps[node.id]) {
      this.logModal.open(node, this.activeAttackSteps[node.id].logs);
    }
  }
}
