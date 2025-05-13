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
  Texture,
  TyrAssetGraphNode,
  TyrAssetGraphNodeStatus,
  TyrAttackStep,
  TyrGraphNode,
  TyrManager,
  TyrNotification,
  TyrNotificationType,
  Assets,
  TyrAlertStatus,
  Sprite,
  ColorMatrixFilter,
  ColorSource,
} from 'tyr-js';
import { TimelineComponent } from 'src/app/components/timeline/timeline.component';
import { AssetMenuComponent } from 'src/app/components/asset-menu/asset-menu.component';
import { AttackGraphComponent } from 'src/app/components/attack-graph/attack-graph.component';

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
  private intervalId: any;
  private intervalTime: number = 1000 * 10; // 10 seconds;

  private networkSprite?: Texture;
  private shieldSprite?: Texture;
  private connectionRuleSprite?: Texture;
  private idSprite?: Texture;
  private vulnerabilitySprite?: Texture;
  private applicationSprite?: Texture;

  private bulbSprite?: Texture;
  private checkSprite?: Texture;
  private warningSprite?: Texture;
  private eyeSprite?: Texture;

  private alertSprite?: Texture;
  private controlledSprite?: Texture;
  private inactiveSprite?: Texture;
  private disconnectedSprite?: Texture;

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
    color: 0xafafaf,
    width: 5,
    edgeCurveX: 0,
    edgeCurveY: 0,
  };

  private condition3: EdgeAffectedCondition = {
    _: 'edge',
    all: false,
    sourceType: 'Network',
    targetType: 'Network',
  };

  public cursorStyle = 'default';
  public rewardValue: { reward: number; iteration: number } = {
    reward: 0,
    iteration: -1,
  };

  public currentDefenderSuggestions: any = {};

  public notifyClick = (node: TyrAssetGraphNode) => {};

  constructor(apiService: ApiService) {
    this.apiService = apiService;
    this.cursorStyle = 'default';
    this.getAssetIcon = this.getAssetIcon.bind(this);
    this.getNodeStatusIcon = this.getNodeStatusIcon.bind(this);
    this.selectAlertIcon = this.selectAlertIcon.bind(this);
    this.getAttackGraphNodeIcon = this.getAttackGraphNodeIcon.bind(this);
  }

  async ngAfterViewInit() {
    this.notifyClick = (node: TyrAssetGraphNode) => {
      if (!this.tyrManager.attackGraphRenderer.getIsVisible()) {
        this.assetMenu.open(node);
      }
    };
    await this.loadSprites().then(() => {
      this.retrieveInitialData();
    });
  }

  private async retrieveInitialData() {
    forkJoin({
      receivedModel: this.apiService.getModel(),
      receivedAttackGraph: this.apiService.getAttackGraph(),
    }).subscribe(async ({ receivedModel, receivedAttackGraph }) => {
      this.tyrManager = new TyrManager(
        receivedModel,
        receivedAttackGraph.attack_steps,
        this.assetGraph.getConfig(),
        this.attackGraph.getConfig(),
        [this.nodeRule, this.nodeRule2, this.edgeRule]
      );

      const assetGraphContainer =
        this.assetGraph.getAssetGraphContainer().nativeElement;
      const attackGraphContainer =
        this.attackGraph.getAttackGraphContainer().nativeElement;

      this.tyrManager.assetGraphRenderer.init(
        this.assetGraph.getConfig(),
        assetGraphContainer
      );
      this.tyrManager.attackGraphRenderer.init(
        this.attackGraph.getConfig(),
        attackGraphContainer
      );
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
      otherAffectedNodes: [],
    };

    //TODO: Expand
    switch (suggestion.description) {
      case 'Shutdown machine':
        tyrSuggestion.nodeStatus = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.node.status = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.otherAffectedNodes = this.getApplicationNodeChildren(
          tyrSuggestion.node
        ) as TyrAssetGraphNode[];
        break;
      case 'Lockout user':
        tyrSuggestion.nodeStatus = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.node.status = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.otherAffectedNodes = this.getIdentityNodeChildren(
          tyrSuggestion.node
        ) as TyrAssetGraphNode[];
        break;
      default:
        break;
    }

    this.tyrManager.injectPerformedSuggestion(
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

  private getIdentityNodeChildren(node: TyrAssetGraphNode) {
    let list = node.connections.children;
    const nodes = this.tyrManager.getAssets().filter((n) => list.includes(n));

    //Also add identity children nodes (This is a workaround, wont work for all nodes)
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].asset.type != 'Application') {
        list.push(...nodes[i].connections.children);
      }
    }
    return list;
  }

  private getApplicationNodeChildren(node: TyrAssetGraphNode) {
    let list = node.connections.children;
    const nodes = this.tyrManager.getAssets().filter((n) => list.includes(n));

    //Also add identity children nodes (This is a workaround, wont work for all nodes)
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].asset.type == 'Identity') {
        list.push(...nodes[i].connections.children);
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
        parseLatestAttackSteps(latestAttackSteps)[0];
        const alert = this.tyrManager.injestLatestAttackStep(
          parseLatestAttackSteps(latestAttackSteps)[0].id,
          this.timeline.automaticUpdate
        );
        if (alert) this.timeline.addAlert(alert);
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
  };

  displayAttackGraph = (attackSteps: TyrAttackStep[]) => {
    this.tyrManager.attackGraphRenderer.displaySubgraph(
      attackSteps,
      this.attackGraph.selectedDepth,
      this.attackGraph.selectedSuggestionDist
    );
    this.tyrManager.attackGraphRenderer.resizeViewport();
  };

  updateAttackGraph = (event: any) => {
    console.log(event.depth, event.suggestionDist);
    this.tyrManager.attackGraphRenderer.displaySubgraph(
      this.timeline.selectedNotifications.map((n) => n.attackStep!),
      event.depth,
      event.suggestionDist
    );

    this.tyrManager.attackGraphRenderer.resizeViewport();
  };

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
      bulb: '/assets/icons/attack-graph/light-bulb.png',
      check: '/assets/icons/attack-graph/check.png',
      eye: '/assets/icons/attack-graph/eye.png',
      warning: '/assets/icons/attack-graph/warning-sign.png',
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
      { alias: 'bulb', src: assetUrls.bulb },
      { alias: 'warning', src: assetUrls.warning },
      { alias: 'check', src: assetUrls.check },
      { alias: 'eye', src: assetUrls.eye },
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
      bulbSprite,
      bellSprite,
      warningSprite,
      eyeSprite,
      checkSprite,
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
      Assets.load('bulb'),
      Assets.load('bell'),
      Assets.load('warning'),
      Assets.load('eye'),
      Assets.load('check'),
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
    this.bulbSprite = bulbSprite;
    this.warningSprite = warningSprite;
    this.eyeSprite = eyeSprite;
    this.checkSprite = checkSprite;

    console.log('✅ All assets added & loaded successfully!');
  }

  public getAssetIcon(node: any): Sprite {
    let asset;
    if (node.asset)
      //AssetGraphNode
      asset = node.asset;
    if (node.attackStep)
      //AttackGraphNode
      asset = node.attackStep.asset.asset;

    if (!asset) return new Sprite();

    let texture;
    switch (asset.type) {
      case 'Network':
        texture = this.networkSprite!;
        break;
      case 'Application':
        texture = this.applicationSprite!;
        break;
      case 'ConnectionRule':
        texture = this.connectionRuleSprite!;
        break;
      case 'Identity':
        texture = this.idSprite!;
        break;
      case 'SoftwareVulnerability':
        texture = this.vulnerabilitySprite!;
        break;
      default:
        texture = this.shieldSprite!;
        break;
    }

    const sprite = new Sprite(texture);

    //Invert color to white if attack graph calls it
    if (node.attackStep && !node.attackStep.isActive) {
      const colorMatrix = new ColorMatrixFilter();
      colorMatrix.negative(true); // Invert colors
      sprite.filters = [colorMatrix];
    }
    return sprite;
  }

  public getAttackGraphNodeIcon(
    attackStep: TyrAttackStep
  ): { texture: Texture; background: ColorSource } | undefined {
    if (attackStep.type === 'defense') {
      if (attackStep.isActive)
        return { texture: this.checkSprite!, background: 0x00bdd2 };
      if (
        this.suggestedActions.suggestedActions
          .map((a) => a.stepId)
          .includes(+attackStep.id)
      )
        return { texture: this.bulbSprite!, background: 0x005c69 };
    } else {
      if (attackStep.isActive)
        return { texture: this.warningSprite!, background: 0xffc300 };
      if (attackStep.isObservable)
        return { texture: this.eyeSprite!, background: 0x990000 };
    }
    return;
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
}
