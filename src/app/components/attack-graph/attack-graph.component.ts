import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgxGraphZoomOptions } from '@swimlane/ngx-graph';
import { Subject } from 'rxjs';
import { LogModalComponent } from '../modals/log-modal/log-modal.component';
import {
  AttackGraph,
  AttackStep,
  AttackStepRelatedNodes,
} from './attack-graph-interfaces';
import { chord } from 'd3';

interface AttackNode {
  id: string;
  label: string;
  type: string;
  active: boolean;
  color: string;
  logLength: number;
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
  @Input() attackGraph: AttackGraph;
  @Input() allAttackSteps: any;
  @Input() attackStepMap: any;
  @Input() type: string;
  @ViewChild('logModal') logModal: LogModalComponent;

  attackGraphLinks: Array<AttackLink> = [];
  attackGraphNodes: Array<AttackNode> = [];
  activeAttackSteps: any = {};

  maxDepth: number = 3;
  public layoutSettings = {
    orientation: 'TB',
  };
  zoomToFit$: Subject<NgxGraphZoomOptions> = new Subject();
  update$: Subject<boolean> = new Subject();

  ngOnInit() {}

  fitGraph() {
    this.zoomToFit$.next({ force: true, autoCenter: true });
  }

  notifyNewAlert(alerts: AttackStep[]) {
    let attackGraphNodes: Array<AttackNode> = [];
    let attackGraphLinks: Array<AttackLink> = [];
    alerts.forEach((alert: AttackStep) => {
      //Create Node and append Node
      attackGraphNodes.push(this.createNode(alert, true));
      if (this.type === 'horizon') {
        this.getAlertChildren(alert, attackGraphNodes, attackGraphLinks, 1);
      }
      if (this.type === 'historical') {
        this.getAlertParent(alert, attackGraphNodes, attackGraphLinks, 1);
      }
    });
    this.attackGraphNodes = attackGraphNodes;
    this.attackGraphLinks = attackGraphLinks;
  }

  getAlertChildren(
    step: AttackStep,
    nodes: Array<AttackNode>,
    links: Array<AttackLink>,
    depth: number
  ) {
    step.information.children.forEach((child: AttackStepRelatedNodes) => {
      //Find children information
      const childAttackStep: AttackStep | undefined =
        this.attackGraph.attackSteps.find((step) => step.id === child.id);
      if (!childAttackStep) {
        //Throw error if node can't be found
        console.error(
          'Could not find alerted node in attack graph. Node:',
          child
        );
        return;
      }

      //Create child node
      const node = this.createNode(childAttackStep, false);

      //Push the link between child and father node
      links.push(this.createLink(step, childAttackStep));

      //Push the child node only if it still is not in the graph
      let nodeIndex = nodes.findIndex((n: any) => n.id === node.id);
      if (nodeIndex === -1) {
        nodes.push(node);
        if (depth < this.maxDepth) {
          this.getAlertChildren(childAttackStep, nodes, links, depth + 1);
        }
      }
    });
  }

  getAlertParent(
    step: AttackStep,
    nodes: Array<AttackNode>,
    links: Array<AttackLink>,
    depth: number
  ) {
    step.information.parents.forEach((parent: AttackStepRelatedNodes) => {
      //Find children information
      const parentAttackStep: AttackStep | undefined =
        this.attackGraph.attackSteps.find((step) => step.id === parent.id);
      if (!parentAttackStep) {
        //Throw error if node can't be found
        console.error(
          'Could not find alerted node in attack graph. Node:',
          parent
        );
        return;
      }
      //Create child node
      const node = this.createNode(parentAttackStep, false);

      //Push the link between child and father node
      links.push(this.createLink(parentAttackStep, step));

      //Push the child node only if it still is not in the graph
      let nodeIndex = nodes.findIndex((n: any) => n.id === node.id);
      if (nodeIndex === -1) {
        nodes.push(node);
        if (depth < this.maxDepth) {
          this.getAlertParent(parentAttackStep, nodes, links, depth + 1);
        }
      }
    });
  }

  createNode(step: AttackStep, active: boolean): AttackNode {
    return {
      id: step.id.toString(),
      label: step.information.name,
      type: step.information.type,
      active: active,
      color: this.determineNodeColor(step, active),
      logLength: step.information.logs ? step.information.logs.length : 0,
    };
  }

  determineNodeColor(step: AttackStep, active: boolean) {
    if (step.information.type === 'defense') {
      return active ? '#4CA6FF' : '#2a5c8e';
    } else {
      return active ? '#FF4C4C' : '#902a2a';
    }
  }

  createLink(source: AttackStep, target: AttackStep): AttackLink {
    return {
      id: 'link_' + source.id + '_' + target.id,
      source: source.id,
      target: target.id,
    };
  }

  updateAttackGraph(activeAttackSteps: any, activeDefenceSteps: any) {
    let attackGraphNodes: Array<any> = [];
    let attackGraphLinks: Array<any> = [];

    if (activeAttackSteps) {
      Object.keys(activeAttackSteps).forEach((stepId: any) => {
        let name = this.attackStepMap.get(Number(stepId));

        if (name) {
          let step = this.allAttackSteps[name];

          let node = this.createActiveAttackGraphNode(
            name,
            step,
            activeAttackSteps[stepId].logs.length
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
      this.activeAttackSteps = activeAttackSteps;
    }

    if (activeDefenceSteps) {
      Object.keys(activeDefenceSteps).forEach((defenceId: any) => {
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
    }

    this.attackGraphLinks = attackGraphLinks;
    this.attackGraphNodes = attackGraphNodes;

    setTimeout(() => {
      if (this.attackGraphNodes.length > 0) {
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
    let newId = 'link_' + source + '_' + target;

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
