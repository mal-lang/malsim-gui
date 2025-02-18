import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DataSet, Network } from 'vis-network/standalone';

import { ApiService } from 'src/app/services/api-service/api-service.service';

@Component({
  selector: 'app-instance-model',
  templateUrl: './instance-model.component.html',
  styleUrl: './instance-model.component.scss',
})
export class InstanceModelComponent {
  @Input() attackStepMap: any;
  @Input() allAttackSteps: any;

  @ViewChild('networkContainer') networkContainer: ElementRef;

  // Network graph
  model: Model;
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
    this.getModel();
  }

  getModel() {
    this.apiService.getModel().subscribe((receivedModel) => {
      this.model = this.extractModel(receivedModel);
      this.createNetwork();
    });
  }

  extractModel(receivedModel: any) {
    let assets: Asset[] = [];

    //Extracts the assets, which have an id, a name, and a list of associated assets
    Object.keys(receivedModel.assets).forEach((assetId) => {
      assets.push({
        id: +assetId,
        name: receivedModel.assets[assetId].name,
        type: receivedModel.assets[assetId].type,
        associatedAssets: this.extractAssociatedAssets(
          receivedModel.assets[assetId].associated_assets
        ),
      });
    });

    //Return model
    return { assets };
  }

  //Extracts the associated assets, a list of simple assets with a given name
  extractAssociatedAssets(associatedAssets: any): AssetAssociationList[] {
    let associatedAssetLists: AssetAssociationList[] = [];
    Object.keys(associatedAssets).forEach((assetListName) => {
      associatedAssetLists.push({
        type: assetListName,
        assets: this.extractSimpleAssets(associatedAssets[assetListName]),
      });
    });
    return associatedAssetLists;
  }

  //Extracts simple assets
  extractSimpleAssets(associatedAssetsTypeList: any): SimpleAsset[] {
    let assetList: SimpleAsset[] = [];
    Object.keys(associatedAssetsTypeList).forEach((assetId) => {
      assetList.push({
        id: +assetId,
        name: associatedAssetsTypeList[assetId],
      });
    });

    return assetList;
  }

  createNetwork() {
    //This array will keep track of the drawn nodes in the network, to avoid duplicating their connections
    let drawnNodes: number[] = [];

    //Create network nodes from assets in model
    this.model.assets.forEach((asset: Asset) => {
      this.networkNodes.add({
        id: asset.id,
        font: { multi: 'html', size: 20 },
        label: asset.type + '\n <b>' + asset.name + '</b>',
        name: asset.name,
        type: asset.type,
        image: this.selectIcon(asset.type),
        defenceMarked: false,
        attackMarked: false,
      });

      //Add node in list
      drawnNodes.push(asset.id);

      //Draw edge only if it has not been drawn yet
      asset.associatedAssets.forEach((associatedAssetTypeList) => {
        associatedAssetTypeList.assets.forEach((associatedAsset) => {
          //Check if node connections have already been drawn
          if (drawnNodes.includes(associatedAsset.id)) return;

          this.networkEdges.add({
            id: asset.id + '-' + associatedAsset.id,
            from: asset.id,
            to: associatedAsset.id,
          });
        });
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

  markNodes(
    enabledAttackSteps: any,
    enabledDefenceSteps: any,
    activeAttackSteps: any,
    activeDefenceSteps: any
  ) {
    if (this.networkGraph) {
      let updatedNodes: Array<any> = [];

      let attackMark: Array<number> = [];
      let defenceMark: Array<number> = [];
      let prevAttackedNodes: Array<number> = [];
      let preDefendedNodes: Array<number> = [];

      Object.keys(activeAttackSteps).forEach((id) => {
        attackMark.push(activeAttackSteps[id].asset);
      });

      Object.keys(activeDefenceSteps).forEach((id) => {
        defenceMark.push(activeDefenceSteps[id].asset);
      });

      enabledAttackSteps.forEach((id: number) => {
        let name = this.attackStepMap.get(Number(id));
        prevAttackedNodes.push(this.allAttackSteps[name].asset);
      });

      enabledDefenceSteps.forEach((id: number) => {
        let name = this.attackStepMap.get(Number(id));
        preDefendedNodes.push(this.allAttackSteps[name].asset);
      });

      this.networkNodes.forEach((node) => {
        if (attackMark.includes(node.name)) {
          let colorOptions = { border: '#ff4c4c', background: '#ff4c4c' };
          updatedNodes.push({
            id: node.id,
            color: colorOptions,
            attackMarked: true,
          });
        } else if (defenceMark.includes(node.name)) {
          let colorOptions = { border: '#4ca6ff', background: '#4ca6ff' };
          updatedNodes.push({
            id: node.id,
            color: colorOptions,
            defenceMarked: true,
          });
        } else if (
          preDefendedNodes.includes(node.name) ||
          prevAttackedNodes.includes(node.name)
        ) {
          let colorOptions = { border: 'aliceblue', background: 'aliceblue' };
          if (
            prevAttackedNodes.includes(node.name) &&
            preDefendedNodes.includes(node.name)
          ) {
            colorOptions = { border: '#cc99cc', background: '#cc99cc' };
          } else if (prevAttackedNodes.includes(node.name)) {
            colorOptions = { border: '#ff9696', background: '#ff9696' };
          } else if (preDefendedNodes.includes(node.name)) {
            colorOptions = { border: '#96cbff', background: '#96cbff' };
          }

          updatedNodes.push({
            id: node.id,
            color: colorOptions,
          });
        } else {
          //Just set to white
          let colorOptions = { border: 'aliceblue', background: 'aliceblue' };
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

interface networkConnection {
  origin: number;
  destinations: number[];
}

// Model interfaces tailored for MAL-Toolbox version 0.3.3
export interface SimpleAsset {
  id: number;
  name: string;
}

export interface AssetAssociationList {
  type: string;
  assets: SimpleAsset[];
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  associatedAssets: AssetAssociationList[];
}

export interface Model {
  assets: Asset[];
}
