import { Component, ViewChild } from '@angular/core';
import { AssetGraphComponent } from 'src/app/components/asset-graph/asset-graph.component';
import { SuggestedActionsComponent } from 'src/app/components/suggested-actions/suggested-actions.component';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import { forkJoin } from 'rxjs';

import {
  parseLatestAttackSteps,
  Texture,
  TyrAssetGraphNode,
  TyrAssetGraphNodeStatus,
  TyrAttackStep,
  TyrManager,
  TyrNotification,
  TyrNotificationType,
  Assets,
  TyrAlertStatus,
  Sprite,
  ColorMatrixFilter,
  ColorSource,
  ExternalUtils,
} from 'tyr-js';
import { TimelineComponent } from 'src/app/components/timeline/timeline.component';
import { AssetMenuComponent } from 'src/app/components/asset-menu/asset-menu.component';
import { AttackGraphComponent } from 'src/app/components/attack-graph/attack-graph.component';
import { assetGraphRendererRules } from 'src/tyr-js/assetGraphRendererRules';
import { IconManager } from 'src/tyr-js/iconManager';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  @ViewChild('suggestedActions') suggestedActions!: SuggestedActionsComponent;
  @ViewChild('assetGraph') assetGraph!: AssetGraphComponent;
  @ViewChild('attackGraph') attackGraph!: AttackGraphComponent;
  @ViewChild('assetMenu') assetMenu!: AssetMenuComponent;
  @ViewChild('timeline') timeline!: TimelineComponent;

  private apiService;
  private iconManager: IconManager;

  private intervalId: any;
  private intervalTime: number = 1000 * 10; // 10 seconds;

  public tyrManager: TyrManager;
  public displayAssetGraph: boolean = true;

  public cursorStyle = 'default';
  public rewardValue: { reward: number; iteration: number } = {
    reward: 0,
    iteration: -1,
  };

  public currentDefenderSuggestions: any = {};

  public notifyClick = (node: TyrAssetGraphNode) => {};

  constructor(apiService: ApiService) {
    this.apiService = apiService;
    this.iconManager = new IconManager();
  }

  async ngAfterViewInit() {
    this.notifyClick = (node: TyrAssetGraphNode) => {
      if (!this.tyrManager.attackGraphRenderer.getIsVisible()) {
        this.assetMenu.open(node);
      }
    };
    await this.iconManager.load().then(() => {
      this.retrieveInitialData();
    });
  }

  private async retrieveInitialData() {
    forkJoin({
      receivedModel: this.apiService.getModel(),
      receivedAttackGraph: this.apiService.getAttackGraph(),
    }).subscribe(async ({ receivedModel, receivedAttackGraph }) => {
      const externalTools: ExternalUtils = {
        getAttackStepIcon: this.iconManager.getAttackGraphNodeIcon,
        getAssetIcon: this.iconManager.getAssetIcon,
        getAssetNodeStatusIcon: this.iconManager.getNodeStatusIcon,
        getAlertIcon: this.iconManager.selectAlertIcon,
      };

      this.tyrManager = new TyrManager(
        receivedModel,
        receivedAttackGraph,
        externalTools
      );

      const assetGraphContainer =
        this.assetGraph.getAssetGraphContainer().nativeElement;
      const attackGraphContainer =
        this.attackGraph.getAttackGraphContainer().nativeElement;

      this.tyrManager.assetGraphRenderer.init(
        assetGraphContainer,
        assetGraphRendererRules,
        this.assetGraph.getConfig()
      );
    });
  }

  setAlertsInterval() {
    this.intervalId = setInterval(() => {
      this.retrieveAlerts();
    }, this.intervalTime);
  }

  addExecutedSuggestionToTimeline(suggestion: any) {
    const attackstep = this.tyrManager
      .getAttackSteps()
      .find((a) => a.id == suggestion.stepId);

    if (!attackstep) throw new Error('TODO');

    const tyrSuggestion: TyrNotification = {
      node: attackstep.asset,
      attackStep: attackstep,
      type: TyrNotificationType.suggestion,
      timestamp: Date.now(),
      hidden: false,
      currentColor: 0x9fd4f2,
      description: suggestion.description,
      otherAffectedNodes: [],
    };

    //TODO: Expand
    switch (suggestion.type) {
      case 'Application:notPresent':
        tyrSuggestion.nodeStatus = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.node.status = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.otherAffectedNodes = this.getNodeChildren(
          tyrSuggestion.node,
          true
        ) as TyrAssetGraphNode[];
        break;
      case 'Identity:notPresent':
        tyrSuggestion.nodeStatus = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.node.status = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.otherAffectedNodes = this.getNodeChildren(
          tyrSuggestion.node,
          false
        ) as TyrAssetGraphNode[];
        break;
      case 'ConnectionRule:restricted':
        tyrSuggestion.nodeStatus = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.node.status = TyrAssetGraphNodeStatus.inactive;
        break;
      default:
        break;
    }

    this.tyrManager.receivePerformedSuggestion(
      tyrSuggestion,
      this.timeline.automaticUpdate
    );
    this.timeline.addPerformedSuggestion(tyrSuggestion);

    if (this.timeline.automaticUpdate)
      tyrSuggestion.node.style.timelineStatus = tyrSuggestion.node.status;
    this.tyrManager.assetGraphRenderer.resetStyleToNodeStatus(
      tyrSuggestion.node
    );
  }

  private getNodeChildren(node: TyrAssetGraphNode, isShutdownMachine: boolean) {
    let list = node.connections.children;
    const nodes = this.tyrManager
      .getAssetGraphNodes()
      .filter((n) => list.includes(n));

    //Also add identity children nodes (This is a workaround, wont work for all nodes)
    if (isShutdownMachine) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].asset.type == 'Identity') {
          list.push(...nodes[i].connections.children);
        }
      }
    }

    return list;
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
        const parsedAttackSteps = parseLatestAttackSteps(latestAttackSteps);
        for (let i = 0; i < parsedAttackSteps.length; i++) {
          const alert = this.tyrManager.receiveLatestAttackStep(
            parsedAttackSteps[i].id,
            this.timeline.automaticUpdate
          );
          if (alert) this.timeline.addAlert(alert);
        }
      }

      //Defender Suggestions
      if (this.checkDefenderSuggestions(defenderSuggestions)) {
        this.currentDefenderSuggestions = defenderSuggestions;
        this.suggestedActions.updateSuggestedActions(defenderSuggestions);
        this.tyrManager.attackGraphRenderer.updateSuggestedDefenses(
          this.suggestedActions.suggestedActions.map((a) => String(a.stepId))
        );
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

  isAttackGraphMode() {
    return this.tyrManager?.attackGraphRenderer?.getIsVisible?.();
  }

  openAttackGraph = (attackStep: TyrAttackStep) => {
    this.tyrManager.assetGraphRenderer.activateAttackGraphMode();
    this.attackGraph.openAttackGraph(attackStep);
    this.timeline.setSlideOnStep(attackStep);
    this.displayAttackGraph([attackStep]);
    this.displayAssetGraph = false;
  };

  closeAttackGraph = () => {
    this.tyrManager.assetGraphRenderer.deactivateAttackGraphMode();
    this.tyrManager.attackGraphRenderer.setIsVisible(false);
    this.displayAssetGraph = true;
  };

  displayAttackGraph = (attackSteps: TyrAttackStep[]) => {
    this.tyrManager.attackGraphRenderer.displaySubgraph(
      attackSteps,
      this.attackGraph.selectedDepth,
      this.attackGraph.selectedSuggestionDist,
      true
    );
    this.tyrManager.attackGraphRenderer.resizeViewport();
  };

  updateAttackGraph = (event: any) => {
    this.tyrManager.attackGraphRenderer.displaySubgraph(
      this.timeline.selectedNotifications.map((n) => n.attackStep!),
      event.depth,
      event.suggestionDist,
      event.forward
    );

    this.tyrManager.attackGraphRenderer.resizeViewport();
  };
}
