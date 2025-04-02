import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import {
  Assets,
  AvailableInitialNodePositioning,
  FillInput,
  LayoutAlgorithm,
  Model,
  parseAssetModel,
  SimulationConfig,
  TextStyleAlign,
  TextStyleFontWeight,
  Texture,
  TyrAlert,
  TyrAlertStatus,
  TyrGraphClusterRule,
  TyrGraphConfig,
  TyrGraphNode,
  TyrManager,
} from 'tyr-js';

@Component({
  selector: 'app-asset-graph',
  templateUrl: './asset-graph.component.html',
  styleUrl: './asset-graph.component.scss',
})
export class AssetGraphComponent {
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @Input() attackStepMap: any;

  private networkSprite?: Texture;
  private shieldSprite?: Texture;
  private connectionRuleSprite?: Texture;
  private idSprite?: Texture;
  private vulnerabilitySprite?: Texture;
  private applicationSprite?: Texture;
  private alertSprite?: Texture;
  private controlledSprite?: Texture;

  private clusterRules: TyrGraphClusterRule[] = [
    {
      type: 'Network',
    },
    {
      type: 'Application',
    },
  ];

  private layout: SimulationConfig = {
    type: LayoutAlgorithm.kamada_kawai,
    alpha: 1,
    alphaDecay: 0.02,
    velocityDecay: 0.03,
    forces: {
      collideRadius: 150,
    },
    kamadaKawaiConfig: {
      L0: 500,
      kFactor: 1,
      repulsionFactor: 500,
      maxForce: 200,
    },
  };

  private config: TyrGraphConfig;

  public cursorStyle = 'default';

  constructor() {
    this.selectIcon = this.selectIcon.bind(this);
    this.selectAlertIcon = this.selectAlertIcon.bind(this);
  }

  ngAfterViewInit() {
    this.config = {
      centerX:
        (this.graphContainer.nativeElement as HTMLElement).offsetWidth / 2,
      centerY:
        (this.graphContainer.nativeElement as HTMLElement).offsetHeight / 2,
      marginX: 0,
      marginY: 0,
      graphWorldWidth: 2000,
      graphWorldHeight: 2000,
      backgroundColor: '#212529',
      nodes: {
        initialPositioning: {
          type: AvailableInitialNodePositioning.random,
          radiusX: 200,
          radiusY: 200,
        },
        getNodeAlertIcon: this.selectAlertIcon,
        getNodeImage: this.selectIcon,
        imageMargin: 0.5,
        textInvisible: false,
        textConfig: {
          fontFamily: 'arial',
          fontSize: 40,
          fill: 0xffffff as FillInput,
          align: 'left' as TextStyleAlign,
          fontWeight: 'bold' as TextStyleFontWeight,
          stroke: 'black',
        },
        hoverable: true,
        onPointerOn: () => {
          this.cursorStyle = 'pointer';
        },
        onPointerOut: () => {
          this.cursorStyle = 'default';
        },
      },
      edges: {
        animated: true,
        unidirectional: true,
      },
      clusterRules: this.clusterRules,
      simulationConfig: this.layout,
    };
  }

  public async loadSprites() {
    const assetUrls = {
      network: '/assets/icons/network.png',
      shield: '/assets/icons/shield.png',
      connectionRule: '/assets/icons/networking.png',
      id: '/assets/icons/id-card.png',
      vulnerability: '/assets/icons/icognito.png',
      application: '/assets/icons/app.png',
      alert: '/assets/icons/alert.png',
      controlled: '/assets/icons/controlled.png',
    };

    // Step 1: Add assets to the cache
    Assets.add([
      { alias: 'network', src: assetUrls.network },
      { alias: 'shield', src: assetUrls.shield },
      { alias: 'connectionRule', src: assetUrls.connectionRule },
      { alias: 'id', src: assetUrls.id },
      { alias: 'vulnerability', src: assetUrls.vulnerability },
      { alias: 'application', src: assetUrls.application },
      { alias: 'alert', src: assetUrls.alert },
      { alias: 'controlled', src: assetUrls.controlled },
    ]);

    // Step 2: Load all assets in parallel
    const [
      networkSprite,
      shieldSprite,
      connectionRuleSprite,
      idSprite,
      vulnerabilitySprite,
      applicationSprite,
      alertSprite,
      controlledSprite,
    ] = await Promise.all([
      Assets.load('network'),
      Assets.load('shield'),
      Assets.load('connectionRule'),
      Assets.load('id'),
      Assets.load('vulnerability'),
      Assets.load('application'),
      Assets.load('alert'),
      Assets.load('controlled'),
    ]);

    // Step 3: Assign them to class properties
    this.networkSprite = networkSprite;
    this.shieldSprite = shieldSprite;
    this.connectionRuleSprite = connectionRuleSprite;
    this.idSprite = idSprite;
    this.vulnerabilitySprite = vulnerabilitySprite;
    this.applicationSprite = applicationSprite;
    this.alertSprite = alertSprite;
    this.controlledSprite = controlledSprite;

    console.log('✅ All assets added & loaded successfully!');
  }

  public selectIcon(node: TyrGraphNode): Texture {
    switch (node.type) {
      case 'Network':
        return this.networkSprite!;
      case 'Application':
        return this.applicationSprite!;
      case 'ConnectionRule':
        return this.connectionRuleSprite!;
      case 'Identity':
        return this.idSprite!;
      case 'SoftwareVulnerability':
        return this.vulnerabilitySprite!;
      default:
        return this.shieldSprite!;
    }
  }

  public selectAlertIcon(alert: TyrAlertStatus): Texture {
    switch (alert) {
      case TyrAlertStatus.alert:
        return this.alertSprite!;
      case TyrAlertStatus.controlled:
        return this.controlledSprite!;
      default:
        return this.alertSprite!;
    }
  }

  public getConfig() {
    return this.config;
  }

  public getAssetGraphContainer() {
    return this.graphContainer;
  }
}
