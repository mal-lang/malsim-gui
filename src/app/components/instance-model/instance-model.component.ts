import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DataSet, Network } from 'vis-network/standalone';

import { ApiService } from 'src/app/services/api-service/api-service.service';

@Component({
  selector: 'app-instance-model',
  templateUrl: './instance-model.component.html',
  styleUrl: './instance-model.component.scss',
})
export class InstanceModelComponent {
  @Input() activeAttackSteps: any;
  @Input() activeDefenceSteps: any;
  @Input() attackStepMap: any;

  @ViewChild('networkContainer') networkContainer: ElementRef;

  // Network graph
  networkGraph: Network;
  networkNodes: DataSet<any> = new DataSet([]);
  networkEdges: DataSet<any> = new DataSet([]);
  initRender: boolean = true;
  networkOptions = {
    autoResize: true,
    height: '100%',
    width: '100%',
    edges: { color: 'grey' },
    nodes: {
      color: {
        background: 'aliceblue',
        border: 'aliceblue',
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
      solver: 'repulsion',
      repulsion: {
        nodeDistance: 400,
        springLength: 400,
        centralGravity: 0.01,
      },
    },
    interaction: {
      dragNodes: false,
      hover: false,
      selectable: false,
    },
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.createModelData();
  }

  createModelData() {
    let model = this.apiService.getModel();

    let assets: { [key: string]: any } = model.assets;
    let associations: Array<any> = model.associations;

    Object.keys(assets).forEach((index: string) => {
      let asset: any = assets[index];

      this.networkNodes.add({
        id: Number(index),
        font: { multi: 'html', size: 20 },
        label: asset.type + '\n <b>' + asset.name + '</b>',
        name: asset.name,
        type: asset.type,
        image: this.selectIcon(asset.type),
        defenceMarked: false,
        attackMarked: false,
      });
    });

    associations.forEach((association) => {
      let edgePoints: Array<number> = [];
      Object.keys(association).forEach((a) => {
        Object.keys(association[a]).forEach((connection) => {
          edgePoints.push(association[a][connection][0]);
        });
      });
      this.networkEdges.add({
        from: edgePoints[0],
        to: edgePoints[1],
      });
    });

    // Create network graph
    setTimeout(() => {
      var visContainer = this.networkContainer.nativeElement;
      this.networkGraph = new Network(
        visContainer,
        { nodes: this.networkNodes, edges: this.networkEdges },
        this.networkOptions
      );

      this.networkGraph.on('stabilized', () => {
        if (this.initRender) {
          this.networkGraph.fit();
          this.initRender = false;
        }
      });
    }, 500);
  }

  markNodes() {
    if (this.networkGraph) {
      let updatedNodes: Array<any> = [];

      let attackMark: Array<number> = [];
      let defenceMark: Array<number> = [];

      Object.keys(this.activeAttackSteps).forEach((id) => {
        attackMark.push(this.activeAttackSteps[id].asset);
      });

      Object.keys(this.activeDefenceSteps).forEach((id) => {
        defenceMark.push(this.activeDefenceSteps[id].asset);
      });

      this.networkNodes.forEach((node) => {
        if (attackMark.includes(node.name)) {
          let colorOptions = { border: '#ff4c4c', background: '#ff4c4c' };
          updatedNodes.push({
            id: node.id,
            color: colorOptions,
            attackMarked: true,
          });
        }

        if (defenceMark.includes(node.name)) {
          let colorOptions = { border: '#4ca6ff', background: '#4ca6ff' };
          updatedNodes.push({
            id: node.id,
            color: colorOptions,
            defenceMarked: true,
          });
        }

        if (
          !defenceMark.includes(node.name) &&
          !attackMark.includes(node.name)
        ) {
          let colorOptions;
          if (node.attackMarked && node.defenceMarked) {
            colorOptions = { border: '#CC99CC', background: '#CC99CC' };
          } else if (node.attackMarked) {
            colorOptions = { border: '#FFC9C9', background: '#FFC9C9' };
          } else if (node.defenceMarked) {
            colorOptions = { border: '#C9E4FF', background: '#C9E4FF' };
          } else {
            colorOptions = { border: 'aliceblue', background: 'aliceblue' };
          }

          updatedNodes.push({
            id: node.id,
            color: colorOptions,
          });
        }
      });
      this.networkNodes.update(updatedNodes);
    }
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
