import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DataSet, Network } from 'vis-network/standalone';
import MODEL from '../../../assets/2024_09_10_11_58_generated_model.json';

@Component({
  selector: 'app-instance-model',
  templateUrl: './instance-model.component.html',
  styleUrl: './instance-model.component.scss',
})
export class InstanceModelComponent {
  @Input() currentAttackSteps: any;
  @Input() currentDefenceSteps: any;
  @Input() attackSteps: any;
  @Input() attackStepMap: any;

  @ViewChild('networkContainer') networkContainer: ElementRef;

  // Network graph
  networkGraph: Network;
  networkNodes: DataSet<any> = new DataSet([]);
  networkEdges: DataSet<any> = new DataSet([]);
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

  ngOnInit(): void {
    this.createModelData();
  }

  createModelData() {
    let assets: { [key: string]: any } = MODEL.assets;
    let associations: Array<any> = MODEL.associations;

    Object.keys(assets).forEach((index: string) => {
      let asset: any = assets[index];
      let colorOptions = { border: '#902a2a', background: '#902a2a' };
      if (asset.type === 'SoftwareVulnerability') {
        colorOptions.border = '#2a5c8e';
        colorOptions.background = '#2a5c8e';
      }

      this.networkNodes.add({
        id: Number(index),
        font: { multi: 'html', size: 20 },
        label: asset.type + '\n <b>' + asset.name + '</b>',
        name: asset.name,
        color: colorOptions,
        type: asset.type,
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
        this.networkGraph.fit();
      });
    }, 500);
  }

  markNodes() {
    if (this.networkGraph) {
      let affectedAssets: Array<string> = [];

      Object.keys(this.currentAttackSteps).forEach((stepId) => {
        let stepName = this.attackStepMap.get(Number(stepId));

        if (stepName && this.attackSteps[stepName]) {
          if (!affectedAssets.includes(this.attackSteps[stepName].asset))
            affectedAssets.push(this.attackSteps[stepName].asset);
        }
      });

      Object.keys(this.currentDefenceSteps).forEach((stepId) => {
        let stepName = this.attackStepMap.get(Number(stepId));

        if (stepName && this.attackSteps[stepName]) {
          if (!affectedAssets.includes(this.attackSteps[stepName].asset))
            affectedAssets.push(this.attackSteps[stepName].asset);
        }
      });

      this.networkNodes.forEach((node) => {
        let colorOptions = { border: '#902a2a', background: '#902a2a' };
        if (node.type === 'SoftwareVulnerability') {
          colorOptions.border = '#2a5c8e';
          colorOptions.background = '#2a5c8e';
        }

        if (affectedAssets.includes(node.name)) {
          colorOptions = { border: '#FFFFFF', background: '#FF4C4C' };
          if (node.type === 'SoftwareVulnerability') {
            colorOptions.border = '#FFFFFF';
            colorOptions.background = '#4CA6FF';
          }
        }

        this.networkNodes.update({ id: node.id, color: colorOptions });
      });
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
