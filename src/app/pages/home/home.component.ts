import { Component, ElementRef, ViewChild } from '@angular/core';
import { AssetGraphComponent } from 'src/app/components/asset-graph/asset-graph.component';
import { SuggestedActionsComponent } from 'src/app/components/suggested-actions/suggested-actions.component';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import {
  AvailableInitialNodePositioning,
  EdgeAffectedCondition,
  FillInput,
  LayoutAlgorithm,
  NodeAffectedCondition,
  RendererRule,
  RendererRuleScope,
  SimulationConfig,
  TextStyleAlign,
  TextStyleFontWeight,
  TyrGraphClusterRule,
  TyrGraphConfig,
  TyrManager,
} from 'tyr-js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  @ViewChild('suggestedActions') suggestedActions!: SuggestedActionsComponent;
  @ViewChild('assetGraph') assetGraph!: AssetGraphComponent;
  @ViewChild('assetGraph') graphContainer!: ElementRef;

  private apiService;
  private tyrManager: TyrManager;
  private cursorStyle;
  private config: TyrGraphConfig;
  private clusterRules: TyrGraphClusterRule[] = [
    {
      type: 'Network',
    },
    {
      type: 'Application',
    },
  ];

  private layout: SimulationConfig = {
    type: LayoutAlgorithm.force,
    alpha: 1,
    alphaDecay: 0.02,
    velocityDecay: 0.03,
    forces: {
      charge: -500,
      center: 1,
      edgeDistance: 100,
    },
  };

  private condition: NodeAffectedCondition = {
    _: 'node',
    all: true,
  };
  private nodeRule: RendererRule = {
    scope: RendererRuleScope.node,
    affectedCondition: this.condition,
    vertices: 0,
    color: 'white',
    width: 50,
    height: 50,
  };

  private condition4: NodeAffectedCondition = {
    _: 'node',
    all: false,
    type: 'Network',
  };
  private nodeRule2: RendererRule = {
    scope: RendererRuleScope.node,
    affectedCondition: this.condition4,
    vertices: 8,
    color: 'blue',
    width: 80,
    height: 80,
  };
  private condition2: EdgeAffectedCondition = {
    _: 'edge',
    all: true,
  };
  private edgeRule: RendererRule = {
    scope: RendererRuleScope.edge,
    affectedCondition: this.condition2,
    color: 'white',
    width: 1,
    edgeCurveX: 20,
    edgeCurveY: 20,
  };
  private condition3: EdgeAffectedCondition = {
    _: 'edge',
    all: false,
    sourceType: 'Network',
    targetType: 'Network',
  };
  private edgeRule2: RendererRule = {
    scope: RendererRuleScope.edge,
    affectedCondition: this.condition3,
    color: 'orange',
    width: 2,
  };

  constructor(apiService: ApiService) {
    this.apiService = apiService;
    this.cursorStyle = 'default';
  }

  ngAfterViewInit() {
    console.log(this.graphContainer);
    this.config = {
      centerX:
        (this.graphContainer.nativeElement as HTMLElement).offsetWidth / 2,
      centerY:
        (this.graphContainer.nativeElement as HTMLElement).offsetHeight / 2,
      marginX: 2,
      marginY: 2,
      graphWorldWidth: 2000,
      graphWorldHeight: 2000,
      backgroundColor: '#212529',
      nodes: {
        initialPositioning: {
          type: AvailableInitialNodePositioning.random,
          radiusX: 200,
          radiusY: 200,
        },
        getNodeImage: this.assetGraph.selectIcon,
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
    const promises = [
      this.apiService.getAssetModel(),
      this.apiService.getNetworkAttackGraph(),
    ];
    Promise.all(promises)
      .then(([receivedModel, receivedAttackGraph]) => {
        this.tyrManager = new TyrManager(
          receivedModel,
          receivedAttackGraph,
          this.config,
          [this.nodeRule, this.nodeRule2, this.edgeRule, this.edgeRule2]
        );
      })
      .catch((e) => console.error(e));
  }
}
