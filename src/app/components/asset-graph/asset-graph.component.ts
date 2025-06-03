import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AvailableInitialNodePositioning,
  FillInput,
  LayoutAlgorithm,
  SimulationConfig,
  TextStyleAlign,
  TextStyleFontWeight,
  TyrAssetGraphNode,
  TyrAssetGraphClusterRule,
  TyrAssetGraphConfig,
} from 'tyr-js';

@Component({
  selector: 'app-asset-graph',
  templateUrl: './asset-graph.component.html',
  styleUrl: './asset-graph.component.scss',
})

/**
 * AssetGraphComponent is where the asset graph visualization will be hosted.
 * It contains the AssetGraphRenderer configuration which will be sent to tyrJS through HomeComponent -> AssetGraphComponent.getConfig()
 */
export class AssetGraphComponent {
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @Input() isVisible: boolean;
  @Input() attackStepMap: any;
  @Input() onNodeClick: (node: TyrAssetGraphNode) => void;
  @Output() simulationStatusEmitter = new EventEmitter<any>();

  private config: TyrAssetGraphConfig;
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

  public cursorStyle = 'grab';
  public simulationEnded = false;

  constructor() {}

  /**
   * The AssetGraph's configuration is written here. Since it contains some functions that must interact with this component, we deemed this was the best place to configure the visualization.
   */
  ngAfterViewInit() {
    //Configuration for the asset graph - modify this to modify the asset graph visualization style / behaviour
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
      textConfig: {
        fontFamily: 'arial',
        fontSize: 40,
        fill: 0xffffff as FillInput,
        align: 'left' as TextStyleAlign,
        fontWeight: 'bold' as TextStyleFontWeight,
        stroke: 'black',
      },
      nodes: {
        initialPositioning: {
          type: AvailableInitialNodePositioning.random,
          radiusX: 20000,
          radiusY: 20000,
        },
        imageMargin: 0.5,
        textInvisible: false,
        highlightColor: 0xffa100,
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

  /**
   * Returns the asset graph configuration
   */
  public getConfig() {
    return this.config;
  }
  /**
   * Returns the asset graph HTML element
   */
  public getAssetGraphContainer() {
    return this.graphContainer;
  }
}
