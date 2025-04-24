import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  Assets,
  AvailableInitialNodePositioning,
  FillInput,
  LayoutAlgorithm,
  SimulationConfig,
  TextStyleAlign,
  TextStyleFontWeight,
  Texture,
  TyrAlertStatus,
  TyrAssetGraphNode,
  TyrAssetGraphClusterRule,
  TyrGraphConfig,
  TyrGraphNode,
  TyrAssetGraphNodeStatus,
} from 'tyr-js';

@Component({
  selector: 'app-asset-graph',
  templateUrl: './asset-graph.component.html',
  styleUrl: './asset-graph.component.scss',
})
export class AssetGraphComponent {
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @Input() attackStepMap: any;
  @Input() onNodeClick: (node: TyrAssetGraphNode) => void;
  @Output() simulationStatusEmitter = new EventEmitter<any>();

  private networkSprite?: Texture;
  private shieldSprite?: Texture;
  private connectionRuleSprite?: Texture;
  private idSprite?: Texture;
  private vulnerabilitySprite?: Texture;
  private applicationSprite?: Texture;
  private alertSprite?: Texture;
  private controlledSprite?: Texture;
  private inactiveSprite?: Texture;
  private disconnectedSprite?: Texture;
  private userOffSprite?: Texture;

  private clusterRules: TyrAssetGraphClusterRule[] = [
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
      collideRadius: 200,
      charge: -1000,
      edgeDistance: 400,
    },
  };

  private config: TyrGraphConfig;

  public cursorStyle = 'grab';
  public simulationEnded = false;

  constructor() {
    this.selectIcon = this.selectIcon.bind(this);
    this.getNodeStatusIcon = this.getNodeStatusIcon.bind(this);
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
      graphWorldWidth: 20000,
      graphWorldHeight: 20000,
      backgroundColor: '#212529',
      nodes: {
        initialPositioning: {
          type: AvailableInitialNodePositioning.random,
          radiusX: 20000,
          radiusY: 20000,
        },
        getNodeAlertIcon: this.selectAlertIcon,
        getNodeStatusIcon: this.getNodeStatusIcon,
        getNodeImage: this.selectIcon,
        imageMargin: 0.5,
        textInvisible: false,
        highlightColor: 0xffa100,
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
          this.cursorStyle = 'grab';
        },
        onClick: (node: TyrAssetGraphNode) => {
          this.onNodeClick(node);
        },
        onFirstRendered: () => {
          this.simulationEnded = true;
          this.simulationStatusEmitter.emit();
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
      disconnected: '/assets/icons/suggestions/suggestion-disconnect.png',
      turnoff: '/assets/icons/suggestions/suggestion-turnoff.png',
      user: '/assets/icons/suggestions/suggestion-user.png',
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
      { alias: 'disconnected', src: assetUrls.disconnected },
      { alias: 'turnoff', src: assetUrls.turnoff },
      { alias: 'user', src: assetUrls.user },
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
      disconnectedSprite,
      turnoffSprite,
      userSprite,
    ] = await Promise.all([
      Assets.load('network'),
      Assets.load('shield'),
      Assets.load('connectionRule'),
      Assets.load('id'),
      Assets.load('vulnerability'),
      Assets.load('application'),
      Assets.load('alert'),
      Assets.load('controlled'),
      Assets.load('disconnected'),
      Assets.load('turnoff'),
      Assets.load('user'),
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
    this.disconnectedSprite = disconnectedSprite;
    this.inactiveSprite = turnoffSprite;
    this.userOffSprite = userSprite;

    console.log('✅ All assets added & loaded successfully!');
  }

  public selectIcon(node: TyrAssetGraphNode): Texture {
    switch (node.asset.type) {
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
      case TyrAlertStatus.alerted:
        return this.alertSprite!;
      case TyrAlertStatus.controlled:
        return this.controlledSprite!;
      default:
        return this.alertSprite!;
    }
  }

  public getNodeStatusIcon(status: TyrAssetGraphNodeStatus): Texture {
    switch (status) {
      case TyrAssetGraphNodeStatus.inactive:
        return this.inactiveSprite!;
      case TyrAssetGraphNodeStatus.disconnected:
        return this.disconnectedSprite!;
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
