import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  _,
} from 'ag-grid-community';
import { Subject } from 'rxjs';
//import { Network, DataSet, Node, Edge } from 'vis-network/standalone';
import MODEL from '../../../assets/2024_09_10_11_58_generated_model.json';
import ATTACKGRAPH from '../../../assets/2024_09_10_11_58_generated_attack_graph.json';

import FIRSTATTACKSTEP from '../../../assets/performed_actions_1.json';
import { NgxGraphZoomOptions } from '@swimlane/ngx-graph';

interface CLObject {
  eid: string;
  metaconcept: string;
  name: string;
}

interface Association {
  id1: string;
  id2: string;
  type1: string;
  type2: string;
}

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

//TODO implement suggested actions
//TODO implement instance model
//TODO light up active attack/defence steps
//TODO light up nodes in instance model that is connected to the active attack/defence steps
//TODO show nr of logs on hover active nodes (attack graph)
//TODO show modal with logs on active node click
//TODO prepare for https calls

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;
  @ViewChild('networkContainer') networkContainer: ElementRef;
  @ViewChild('attackGraphContainer') attackGraphContainer: ElementRef;

  // Table variables
  gridApi!: GridApi<CLObject>;
  rowData: Array<CLObject> = [];
  columnDefs: ColDef[] = [{ field: 'name' }, { field: 'type' }];
  attackStepMap = new Map<number, string>();
  maxDepth: number = 2;
  public layoutSettings = {
    orientation: 'TB',
  };
  zoomToFit$: Subject<NgxGraphZoomOptions> = new Subject();

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };

  // Network graph
  /*networkGraph: Network;
  attackGraph: Network;
  networkNodes: DataSet<Node>;
  networkEdges: DataSet<Edge>;
  networkOptions = {
    autoResize: true,
    layout: {
      hierarchical: {
        enabled: true,
        direction: 'UD',
        nodeSpacing: 400,
        levelSeparation: 370,
        shakeTowards: 'leaves',
      },
    },
    height: '100%',
    width: '100%',
    edges: { color: 'grey' },
    nodes: {
      color: {
        background: 'white',
        highlight: {
          border: 'white',
          background: 'white',
        },
        hover: {
          border: 'white',
        },
      },
      font: {
        color: 'white',
      },
      shape: 'circularImage',
      imagePadding: 10,
      shapeProperties: {
        borderRadius: 2,
      },
    },
    physics: {
      enabled: false,
    },
  };*/

  // Attack graph
  attackGraphLinks: Array<AttackLink> = [];
  attackGraphNodes: Array<AttackNode> = [];

  constructor() {}

  ngOnInit(): void {
    this.mapAvailableAttackSteps();
    this.updateAttackGraph();
    this.createModelData();
  }

  onGridReady(params: GridReadyEvent<CLObject>) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  fitGraph() {
    this.zoomToFit$.next({ force: true, autoCenter: true });
  }

  mapAvailableAttackSteps() {
    let availableAttackSteps: any = ATTACKGRAPH.attack_steps;

    Object.keys(availableAttackSteps).forEach((attackName: any) => {
      this.attackStepMap.set(availableAttackSteps[attackName].id, attackName);
    });
  }
  //TODO: Show all visualizations and suggested actions at the same time
  updateAttackGraph() {
    let attackGraphNodes: Array<any> = [];
    let attackGraphLinks: Array<any> = [];

    let availableAttackSteps: any = ATTACKGRAPH.attack_steps;
    let currentAttackSteps: any = FIRSTATTACKSTEP.attacks;

    Object.keys(currentAttackSteps).forEach((attackId: any) => {
      let name = this.attackStepMap.get(Number(attackId));

      if (name) {
        let step = availableAttackSteps[name];

        let node = this.createAttackGraphNode(step, true);

        attackGraphNodes.push(node);

        this.getChildren(attackGraphNodes, attackGraphLinks, name, 1);
        this.getParents(attackGraphNodes, attackGraphLinks, name, 1);
      }
    });

    this.attackGraphLinks = attackGraphLinks;
    this.attackGraphNodes = attackGraphNodes;

    setTimeout(() => {
      this.fitGraph();
    }, 100);
  }

  getChildren(
    nodes: Array<any>,
    links: Array<any>,
    source: string,
    depth: number
  ) {
    //console.log('Get children, depth:', depth);
    let availableAttackSteps: any = ATTACKGRAPH.attack_steps;
    let step = availableAttackSteps[source];

    Object.keys(step.children).forEach((id) => {
      let childName = step.children[id];
      let childStep = availableAttackSteps[childName];
      let node = this.createAttackGraphNode(childStep, false);

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
    let availableAttackSteps: any = ATTACKGRAPH.attack_steps;
    let step = availableAttackSteps[source];

    Object.keys(step.parents).forEach((id) => {
      let parentName = step.parents[id];
      let parentStep = availableAttackSteps[parentName];
      let node = this.createAttackGraphNode(parentStep, false);

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

  createAttackGraphNode(event: any, active: boolean) {
    let capitlized = event.name.charAt(0).toUpperCase() + event.name.slice(1);
    let splitLabel: Array<string> = capitlized.split(/(?=[A-Z])/);

    let label = '';
    splitLabel.forEach((word, index) => {
      if (index > 1) {
        label += ' ';
      }
      label += word;
    });

    return {
      id: event.id.toString(),
      label: label,
      type: event.type,
      active: active,
    };
  }

  createAttackGraphLink(links: Array<any>, source: string, target: string) {
    let newId = source + '_' + target + '_link';
    //Check if node already exists
    let linkIndex = links.indexOf((l: AttackLink) => l.id === newId);
    if (linkIndex !== -1) {
      console.log('Link already exists!!');
    }

    links.push({
      id: newId,
      source: source,
      target: target,
    });
  }

  createModelData() {
    /*let assets: { [key: string]: any } = MODEL.assets;
    let associations: Array<any> = MODEL.associations;

    var visData: { nodes: Array<Node>; edges: Array<Edge> } = {
      nodes: [],
      edges: [],
    };

    Object.keys(assets).forEach((index: string) => {
      let asset: any = assets[index];
      this.rowData.push(asset);
      let colorOptions = { border: '#FF4C4C', background: '#FF4C4C' };
      if (asset.type === 'SoftwareVulnerability') {
        colorOptions.border = '#4CA6FF';
        colorOptions.background = '#4CA6FF';
      }

      visData.nodes.push({
        id: Number(index),
        font: { multi: 'html', size: 20 },
        label: asset.type + '\n <b>' + asset.name + '</b>',
        color: colorOptions,
        image: this.selectIcon(asset.type),
      });
    });

    associations.forEach((association) => {
      let edgePoints: Array<number> = [];
      Object.keys(association).forEach((a) => {
        Object.keys(association[a]).forEach((connection) => {
          edgePoints.push(association[a][connection][0]);
        });
      });
      visData.edges.push({
        from: edgePoints[0],
        to: edgePoints[1],
      });
    });

    // Create network graph
    setTimeout(() => {
      var visContainer = this.networkContainer.nativeElement;
      this.networkGraph = new Network(
        visContainer,
        visData,
        this.networkOptions
      );

      this.networkGraph.on('stabilized', () => {
        this.networkGraph.fit();
      });
    }, 500);*/
  }

  selectIcon(type: string) {
    switch (type) {
      case 'Network':
        return '../../../assets/icons/network.png';
      case 'ConnectionRule':
        return '../../../assets/icons/networking.png';
      case 'Attacker':
        return '../../../assets/icons/icognito.png';
      case 'Application':
        return '../../../assets/icons/programming-language.png';
      case 'SoftwareVulnerability':
        return '../../../assets/icons/shield.png';
      case 'Identity':
        return '../../../assets/icons/id-card.png';
      default:
        return '';
    }
  }
}
