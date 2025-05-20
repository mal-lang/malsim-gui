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
  Sprite,
} from 'tyr-js';

@Component({
  selector: 'app-asset-graph',
  templateUrl: './asset-graph.component.html',
  styleUrl: './asset-graph.component.scss',
})
export class AssetGraphComponent {
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @Input() isVisible: boolean;
  @Input() attackStepMap: any;
  @Input() getAssetIcon: (node: TyrGraphNode) => Sprite;
  @Input() getNodeStatusIcon: (node: TyrAssetGraphNodeStatus) => Texture;
  @Input() selectAlertIcon: (node: TyrAlertStatus) => Texture;
  @Input() onNodeClick: (node: TyrAssetGraphNode) => void;
  @Output() simulationStatusEmitter = new EventEmitter<any>();

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

  constructor() {}

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
        getNodeImage: this.getAssetIcon,
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

  public getConfig() {
    return this.config;
  }

  public getAssetGraphContainer() {
    return this.graphContainer;
  }
}
