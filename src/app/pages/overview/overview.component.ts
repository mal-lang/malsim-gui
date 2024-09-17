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
import MODEL from '../../../assets/tyr_scen1_model.json';
import ATTACKGRAPH from '../../../assets/tyr_scen1_model_attack_graph.json';

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
  columnDefs: ColDef[] = [
    { field: 'eid' },
    { field: 'name' },
    { field: 'metaconcept' },
  ];

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
        direction: 'LR',
        nodeSpacing: 150,
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
      enabled: true,
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
    let attackNodes: Array<AttackNode> = [];
    let attackLinks: Array<AttackLink> = [];

    ATTACKGRAPH.forEach((event) => {
      let capitlized =
        event.atkname.charAt(0).toUpperCase() + event.atkname.slice(1);
      let splitLabel = capitlized.split(/(?=[A-Z])/);

      let label = '';
      splitLabel.forEach((word, index) => {
        if (index > 1) {
          label += ' ';
        }
        label += word;
      });

      attackNodes.push({ id: event.id, label: label, type: event.type });
    });

    ATTACKGRAPH.forEach((event) => {
      event.links.forEach((link, index) => {
        attackLinks.push({
          id: event.id + index,
          source: event.id,
          target: link,
        });
      });
    });

    this.attackLinks = attackLinks;
    this.attackNodes = attackNodes;
  }

  createModelData() {
    let objectdict: { [key: string]: CLObject } = MODEL.objects;
    let associations: Array<Association> = MODEL.associations;

    var visData: { nodes: Array<Node>; edges: Array<Edge> } = {
      nodes: [],
      edges: [],
    };

    Object.keys(objectdict).forEach((index: string) => {
      let object: any = objectdict[index];
      this.rowData.push(object);
      console.log(object);
      let colorOptions = { border: '#FF4C4C', background: '#FF4C4C' };
      if (object.metaconcept === 'SoftwareVulnerability') {
        colorOptions.border = '#4CA6FF';
        colorOptions.background = '#4CA6FF';
      }

      visData.nodes.push({
        id: object.eid,
        font: { multi: 'html', size: 20 },
        label: object.metaconcept + '\n <b>' + object.name + '</b>',
        color: colorOptions,
        image: this.selectIcon(object.metaconcept),
      });
    });

    associations.forEach((association) => {
      visData.edges.push({
        to: association.id1,
        from: association.id2,
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
