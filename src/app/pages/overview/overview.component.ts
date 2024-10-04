import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  CellClickedEvent,
  ColDef,
  GridApi,
  GridReadyEvent,
  _,
} from 'ag-grid-community';
import { Network, DataSet, Node, Edge } from 'vis-network/standalone';
import MODEL from '../../../assets/2024_09_10_11_58_generated_model.json';
import ATTACKGRAPH from '../../../assets/2024_09_10_11_58_generated_attack_graph.json';

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
}

interface AttackLink {
  id: string;
  source: string;
  target: string;
}

//TODO decide if you are going to use ngx-graph or vis.js

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

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
  };

  // Network graph
  networkGraph: Network;
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
  };

  // Attack graph
  attackLinks: Array<AttackLink> = [];
  attackNodes: Array<AttackNode> = [];

  constructor() {}

  ngOnInit(): void {
    this.createAttackGraph();
    this.createModelData();
  }

  onGridReady(params: GridReadyEvent<CLObject>) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  createAttackGraph() {
    let attackNodes: Array<any> = [];
    let attackLinks: Array<any> = [];

    let steps: any = ATTACKGRAPH.attack_steps;
    Object.keys(steps).forEach((event: any, index: number) => {
      let step: any = steps[event];
      let capitlized = step.name.charAt(0).toUpperCase() + step.name.slice(1);
      let splitLabel: Array<string> = capitlized.split(/(?=[A-Z])/);

      let label = '';
      splitLabel.forEach((word, index) => {
        if (index > 1) {
          label += ' ';
        }
        label += word;
      });

      if (step.id) {
        attackNodes.push({
          id: step.id.toString(),
          label: label,
          type: step.type,
        });
      }

      Object.keys(step.children).forEach((link, index) => {
        attackLinks.push({
          id: index + '_id:' + step.id + '_link',
          from: step.id.toString(),
          to: link,
        });
      });
    });
    console.log(attackLinks);
    console.log(attackNodes);

    //TODO does not work with this large file
    //this.attackLinks = attackLinks;
    //this.attackNodes = attackNodes;
  }

  createModelData() {
    let assets: { [key: string]: any } = MODEL.assets;
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
    }, 500);
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
