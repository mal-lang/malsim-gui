import { Component, ViewChild } from '@angular/core';
import { AssetGraphComponent } from 'src/app/components/asset-graph/asset-graph.component';
import { SuggestedActionsComponent } from 'src/app/components/suggested-actions/suggested-actions.component';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import { forkJoin } from 'rxjs';

import {
  EdgeAffectedCondition,
  LayoutAlgorithm,
  NodeAffectedCondition,
  parseLatestAttackSteps,
  RendererRule,
  RendererRuleScope,
  SimulationConfig,
  TyrGraphClusterRule,
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

  private apiService;
  private tyrManager: TyrManager;
  private intervalId: any;
  private intervalTime: number = 1000 * 10; // 10 seconds;

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

  public cursorStyle = 'default';

  constructor(apiService: ApiService) {
    this.apiService = apiService;
    this.cursorStyle = 'default';
  }

  async ngAfterViewInit() {
    await this.assetGraph.loadSprites().then(() => {
      this.retrieveInitialData();
    });
  }

  private async retrieveInitialData() {
    forkJoin({
      receivedModel: this.apiService.getModel(),
      attackGraph: this.apiService.getAttackGraph(),
    }).subscribe(async ({ receivedModel, attackGraph }) => {
      this.tyrManager = new TyrManager(
        receivedModel,
        attackGraph.attack_steps,
        this.assetGraph.getConfig(),
        [this.nodeRule, this.nodeRule2, this.edgeRule, this.edgeRule2]
      );
      const graphContainer =
        this.assetGraph.getAssetGraphContainer().nativeElement;

      await this.tyrManager
        .initializeRenderer(graphContainer)
        .then(async (app) => {
          graphContainer.appendChild(app.canvas);
          this.tyrManager.startLayoutSimulation();
          this.intervalId = setInterval(() => {
            this.retrieveAlerts();
          }, this.intervalTime);
        });
    });
  }

  async retrieveAlerts() {
    forkJoin({
      latestAttackSteps: this.apiService.getLatestAttackSteps(),
    }).subscribe(({ latestAttackSteps }) => {
      this.tyrManager.injestLatestAttackStep(
        parseLatestAttackSteps(latestAttackSteps)[0]
      );
    });
  }
}
