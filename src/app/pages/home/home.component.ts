import { Component, ViewChild } from '@angular/core';
import { AssetGraphComponent } from 'src/app/components/asset-graph/asset-graph.component';
import { SuggestedActionsComponent } from 'src/app/components/suggested-actions/suggested-actions.component';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import { forkJoin } from 'rxjs';

import {
  EdgeAffectedCondition,
  NodeAffectedCondition,
  parseLatestAttackSteps,
  RendererRule,
  RendererRuleScope,
  TyrGraphNode,
  TyrManager,
  TyrNotification,
  TyrNotificationType,
} from 'tyr-js';
import { TimelineComponent } from 'src/app/components/timeline/timeline.component';
import { AssetMenuComponent } from 'src/app/components/asset-menu/asset-menu.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  @ViewChild('suggestedActions') suggestedActions!: SuggestedActionsComponent;
  @ViewChild('assetGraph') assetGraph!: AssetGraphComponent;
  @ViewChild('assetMenu') assetMenu!: AssetMenuComponent;
  @ViewChild('timeline') timeline!: TimelineComponent;

  private apiService;
  private intervalId: any;
  private intervalTime: number = 1000 * 10; // 10 seconds;

  public tyrManager: TyrManager;

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
  public rewardValue: { reward: number; iteration: number } = {
    reward: 0,
    iteration: -1,
  };

  public currentDefenderSuggestions: any = {};

  public notifyClick = (node: TyrGraphNode) => {};

  constructor(apiService: ApiService) {
    this.apiService = apiService;
    this.cursorStyle = 'default';
  }

  async ngAfterViewInit() {
    this.notifyClick = (node: TyrGraphNode) => {
      this.assetMenu.open(node);
    };
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
        });
    });
  }

  setAlertsInterval() {
    this.intervalId = setInterval(() => {
      this.retrieveAlerts();
    }, this.intervalTime);
  }

  addExecutedSuggestionToTimeline(suggestion: any) {
    const attackstep = this.tyrManager.findNodeAttackStepId(suggestion.stepId);
    if (!attackstep) throw new Error('TODO');

    const tyrSuggestion: TyrNotification = {
      node: attackstep.asset,
      type: TyrNotificationType.suggestion,
      timestamp: Date.now(),
      hidden: false,
      currentColor: 0x9fd4f2,
      description: suggestion.description,
    };

    this.tyrManager.injectPerformedSuggestion(tyrSuggestion);
    this.timeline.addPerformedSuggestion(tyrSuggestion);
  }

  async retrieveAlerts() {
    forkJoin({
      latestAttackSteps: this.apiService.getLatestAttackSteps(),
      rewardValue: this.apiService.getRewardValue(),
      defenderSuggestions: this.apiService.getDefenderSuggestions(),
    }).subscribe(({ latestAttackSteps, rewardValue, defenderSuggestions }) => {
      //Reward
      this.rewardValue = rewardValue;

      //Latest Attack Step
      if (Object.keys(latestAttackSteps).length > 0) {
        parseLatestAttackSteps(latestAttackSteps)[0];
        const alert = this.tyrManager.injestLatestAttackStep(
          parseLatestAttackSteps(latestAttackSteps)[0],
          this.timeline.automaticUpdate
        );
        if (alert) this.timeline.addAlert(alert);
      }

      //Defender Suggestions
      if (this.checkDefenderSuggestions(defenderSuggestions)) {
        this.currentDefenderSuggestions = defenderSuggestions;
        this.suggestedActions.updateSuggestedActions(defenderSuggestions);
      }
    });
  }

  checkDefenderSuggestions(defenderSuggestions: any): boolean {
    if (!defenderSuggestions) {
      return false;
    }

    let newDefenderSuggestions: any = Object.keys(defenderSuggestions);
    let oldDefenderSuggestions: any = Object.keys(
      this.currentDefenderSuggestions
    );

    if (newDefenderSuggestions.length !== oldDefenderSuggestions.length) {
      return true;
    } else {
      for (let agent of newDefenderSuggestions) {
        for (let stepId of Object.keys(defenderSuggestions[agent])) {
          if (
            !this.currentDefenderSuggestions[agent] ||
            !this.currentDefenderSuggestions[agent][stepId]
          ) {
            return true;
          } else if (
            defenderSuggestions[agent][stepId].iteration !==
            this.currentDefenderSuggestions[agent][stepId].iteration
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
