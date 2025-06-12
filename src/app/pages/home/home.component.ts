import { Component, ViewChild } from '@angular/core';
import { AssetGraphComponent } from 'src/app/components/asset-graph/asset-graph.component';
import { SuggestedActionsComponent } from 'src/app/components/suggested-actions/suggested-actions.component';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import { forkJoin } from 'rxjs';

import {
  parseLatestAttackSteps,
  TyrAssetGraphNode,
  TyrAssetGraphNodeStatus,
  TyrAttackStep,
  TyrManager,
  TyrNotification,
  TyrNotificationType,
  ExternalUtils,
  TyrAlertStatus,
  TyrAttackGraphNode,
} from 'tyr-js';
import { TimelineComponent } from 'src/app/components/timeline/timeline.component';
import { AssetMenuComponent } from 'src/app/components/asset-menu/asset-menu.component';
import { AttackGraphComponent } from 'src/app/components/attack-graph/attack-graph.component';
import { assetGraphRendererRules } from 'src/tyr-js/assetGraphRendererRules';
import { IconManager } from 'src/tyr-js/iconManager';

interface RewardValue {
  reward: number;
  iteration: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})

/**
 * HomeComponent acts like the main component of this project. It aims to initialize the rest of components as well as TyrJS, and act like
 * central point where all information from all components, TyrJS and the API converge.
 */
export class HomeComponent {
  //All child components
  @ViewChild('suggestedActions') suggestedActions!: SuggestedActionsComponent;
  @ViewChild('assetGraph') assetGraph!: AssetGraphComponent;
  @ViewChild('attackGraph') attackGraph!: AttackGraphComponent;
  @ViewChild('assetMenu') assetMenu!: AssetMenuComponent;
  @ViewChild('timeline') timeline!: TimelineComponent;

  //Interval information, determines every how much information is retrieved from the API
  private intervalId: any;
  private intervalTime: number = 1000 * 10; // 10 seconds;
  private iteration = -1;

  private apiService;
  private iconManager: IconManager;
  private externalTools: ExternalUtils;

  public tyrManager: TyrManager;
  public rewardValue: RewardValue;
  public cursorStyle: string;
  public displayAssetGraph: boolean;
  public currentDefenderSuggestions: any;
  public notifyClick = (node: TyrAssetGraphNode) => {};

  constructor(apiService: ApiService) {
    //Default data
    this.apiService = apiService;
    this.iconManager = new IconManager();
    this.rewardValue = {
      reward: 0,
      iteration: this.iteration,
    };
    this.cursorStyle = 'default';
    this.displayAssetGraph = true;
    this.currentDefenderSuggestions = {};
  }

  /**
   * Intializes the retrieval of data as soon as this component is initialized.
   * It starts off by loading all icons through the icon manager. Once finished
   * it retrieves the initial information from the API.
   */
  async ngAfterViewInit() {
    //Load icons, and once they are loaded, retrieve initial information from API
    await this.iconManager.load().then(() => {
      this.externalTools = {
        getAttackStepIcon: this.iconManager.getAttackGraphNodeIcon,
        getAssetIcon: this.iconManager.getAssetIcon,
        getAssetNodeStatusIcon: this.iconManager.getNodeStatusIcon,
        getAlertIcon: this.iconManager.selectAlertIcon,
      };
    });
    this.retrieveInitialData();

    /** It also initializes notifyClick, a function meant to be called each time
     * the user clicks, in this case, in the asset graph visualization.
     *
     * This is necessary since these interactions are triggered in the tyrJS library
     * and not this project, and therefore, we need to "listen" to them.
     */
    this.notifyClick = (node: TyrAssetGraphNode) => {
      if (!this.tyrManager.attackGraphRenderer.getIsVisible()) {
        this.assetMenu.selectNode(node);
      }
    };
  }

  /**
   * Helper function meant to check if the received defender suggestions
   * are indeed correct and different from the ones already displayed.
   *
   * @param {any} defenderSuggestions - The received raw JSON with the defender suggestions
   * @returns {boolean} - If the suggestions should be updated or not.
   */
  private checkDefenderSuggestions(defenderSuggestions: any): boolean {
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

  //API data retriever functions

  /**
   * Receives the model and attack graph from the API. Then, it initializes TyrJS and
   * the asset and attack graph visualizations by initializing their renderers.
   */
  private async retrieveInitialData() {
    forkJoin([
      this.apiService.getModel(),
      this.apiService.getAttackGraph(),
      this.apiService.getPerformedNodes(),
    ]).subscribe({
      next: async ([receivedModel, receivedAttackGraph]) => {
        //Once the model and attack graph is received, this data is used to initialize tyr-js
        this.tyrManager = new TyrManager(
          receivedModel,
          receivedAttackGraph,
          this.externalTools
        );

        //Get the HTMLElements where to render both graphs
        const assetGraphContainer =
          this.assetGraph.getAssetGraphContainer().nativeElement;
        const attackGraphContainer =
          this.attackGraph.getAttackGraphContainer().nativeElement;

        //Initialize renderers for the asset and attack graphs
        this.tyrManager.assetGraphRenderer.init(
          assetGraphContainer,
          assetGraphRendererRules,
          this.assetGraph.getConfig()
        );

        this.tyrManager.attackGraphRenderer.init(
          attackGraphContainer,
          [],
          this.attackGraph.getConfig()
        );
      },
      complete: () => {
        this.apiService.getPerformedNodes().subscribe({
          next: async (performedNodes) => {
            if (performedNodes.length < 1) return;
            this.parsePerformedNodes(performedNodes);
            const iterations = performedNodes.map((n: any) => n.iteration);
            this.iteration = Math.max(...iterations) + 1;
          },
        });
      },
    });
  }

  private async parsePerformedNodes(performedNodes: any) {
    for (let i = 0; i < performedNodes.length; i++) {
      const node = performedNodes[i];

      this.getNotificationFromPerformedNode(node.node_id);
    }
  }

  private getNotificationFromPerformedNode(nodeId: string) {
    let alert: TyrNotification;
    const attackGraph = this.tyrManager.getAttackGraphNodes();
    const step = attackGraph.find((n) => n.id == nodeId);
    if (!step) throw new Error('Step not found');

    if (step.attackStep.type === 'defense') {
      const step = attackGraph.find((n) => n.id === nodeId);

      const asset = step!.attackStep.asset;
      alert = {
        type: TyrNotificationType.suggestion,
        node: asset,
        description: '',
        status: TyrAlertStatus.alerted,
        timestamp: Date.now(),
        attackStep: step!.attackStep,
        hidden: this.timeline.automaticUpdate,
        currentColor: 0x000000,
        otherAffectedNodes: [],
      };

      this.createDefense(
        step!.attackStep,
        step!.attackStep.langGraphAttackStep,
        step!.attackStep.name
      );
    } else {
      alert = this.tyrManager.receiveLatestAttackStep(
        nodeId,
        this.timeline.automaticUpdate
      )!;
      this.timeline.addAlert(alert);
    }
  }

  /**
   * Retrieves the latest attacker's performed attack step, the reward value,
   * and the current ML's agent suggestions from the API.
   *
   * This function is meant to be executed iteratively.
   */
  private async retrieveAlerts() {
    forkJoin({
      newPerformedNodes: this.apiService.getPerformedNodes(this.iteration),
      rewardValue: this.apiService.getRewardValue(),
      defenderSuggestions: this.apiService.getDefenderSuggestions(),
    }).subscribe(({ newPerformedNodes, rewardValue, defenderSuggestions }) => {
      //Store the Reward
      this.rewardValue = rewardValue;

      //Gets the latest performed nodes
      if (newPerformedNodes.length > 0) {
        this.parsePerformedNodes(newPerformedNodes);
        const iterations = newPerformedNodes.map((n: any) => {
          return n.iteration;
        });
        this.iteration = Math.max(...iterations) + 1;
      }

      //If the agents suggestions are new, it send the data to tyrJS and updates the project's defender suggestion list (the one in the left side of the screen)
      if (this.checkDefenderSuggestions(defenderSuggestions)) {
        this.currentDefenderSuggestions = defenderSuggestions;
        this.suggestedActions.updateSuggestedActions(defenderSuggestions);
        this.tyrManager.attackGraphRenderer.updateSuggestedDefenses(
          this.suggestedActions.suggestedActions.map((a) => String(a.stepId))
        );
      }
    });
  }

  //FUNCTIONS PASSED TO CHILD COMPONENTS

  /**
   * Initializes the interval to call retrieveAlerts() iteratively
   * This function is passed to the asset graph component, which contains the asset graph renderer configuration. This is done so, so that
   * TyrJS can call this once everything, and not get any alert prior to the initialization of the asset graph visualization.
   */
  public setAlertsInterval() {
    this.intervalId = setInterval(() => {
      this.retrieveAlerts();
    }, this.intervalTime);
  }

  //Timeline related functions
  /**
   * Adds the executed suggestion to the timeline, and sends the suggestion to TyrJS to visualize its effects in the network.
   *
   * @param { any } suggestion - the performed suggestion
   */
  addExecutedSuggestionToTimeline(suggestion: any) {
    //Finds the suggested step in the attack graph
    const attackstep = this.tyrManager
      .getAttackSteps()
      .find((a) => a.id == suggestion.stepId);

    if (!attackstep) throw new Error('TODO');

    this.createDefense(attackstep, suggestion.type, suggestion.description);
  }

  createDefense(attackStep: TyrAttackStep, type: string, description?: string) {
    const getNodeChildren = (
      node: TyrAssetGraphNode,
      isShutdownMachine: boolean
    ) => {
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
    };

    //Creates the notification with its information
    const tyrSuggestion: TyrNotification = {
      node: attackStep.asset,
      attackStep: attackStep,
      type: TyrNotificationType.suggestion,
      timestamp: Date.now(),
      hidden: false,
      currentColor: 0x9fd4f2,
      description: description ?? '',
      otherAffectedNodes: [],
    };

    /*
    Depending on the suggestion type, it will be visualized in different ways in the graph visualization. For instance,
    application:notPresent will shutdown the application, and therefore all its children (users and connection rules), which means 
    they also need to be "shutdown". All of this is decided here
    */
    switch (type) {
      case 'Application:notPresent':
        tyrSuggestion.nodeStatus = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.node.status = TyrAssetGraphNodeStatus.inactive;

        //All its children are also shutdown
        tyrSuggestion.otherAffectedNodes = getNodeChildren(
          tyrSuggestion.node,
          true
        ) as TyrAssetGraphNode[];
        break;
      case 'Identity:notPresent':
        tyrSuggestion.nodeStatus = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.node.status = TyrAssetGraphNodeStatus.inactive;

        //All its children, except applications will be shutdown
        tyrSuggestion.otherAffectedNodes = getNodeChildren(
          tyrSuggestion.node,
          false
        ) as TyrAssetGraphNode[];
        break;
      case 'ConnectionRule:restricted':
        tyrSuggestion.nodeStatus = TyrAssetGraphNodeStatus.inactive;
        tyrSuggestion.node.status = TyrAssetGraphNodeStatus.inactive;
        //There are no other affected nodes in this case, only the CR will be turned off.
        break;
      default:
        break;
    }

    //Send the performed suggestion to TyrJS for its effect to be visualized in the asset graph.
    this.tyrManager.receivePerformedSuggestion(
      tyrSuggestion,
      this.timeline.automaticUpdate
    );

    //Add the suggestion to the timeline
    this.timeline.addPerformedSuggestion(tyrSuggestion);

    if (this.timeline.automaticUpdate)
      tyrSuggestion.node.style.timelineStatus = tyrSuggestion.node.status;
    this.tyrManager.assetGraphRenderer.resetStyleToNodeStatus(
      tyrSuggestion.node
    );
  }

  //Attack graph related functions
  isAttackGraphMode() {
    return this.tyrManager?.attackGraphRenderer?.getIsVisible?.();
  }

  /**
   * Creates the attack graph from the àssed attack steps
   *
   * @param { TyrAttackStep[] } attackSteps - the attack step(s) to build the attack graph(s) from
   */
  displayAttackGraph = (attackSteps: TyrAttackStep[]) => {
    this.tyrManager.attackGraphRenderer.displaySubgraph(
      attackSteps,
      this.attackGraph.selectedDepth,
      this.attackGraph.selectedSuggestionDist,
      true
    );
    //Center camera to graph
    this.tyrManager.attackGraphRenderer.resizeViewport();
  };

  /**
   * Creates the attack graph and expands its HTML element to allow for its visualization.
   *
   * @param { TyrAttackStep } attackStep - the attack step to build the attack graph from
   */
  openAttackGraph = (attackStep: TyrAttackStep) => {
    //Activate the attack graph mode
    this.tyrManager.assetGraphRenderer.activateAttackGraphMode();

    //Expand the attack graph HTML element so its visible now
    this.attackGraph.openAttackGraph();

    //Set the timeline slide to this particular attack step
    this.timeline.setSlideOnStep(attackStep);

    //Generate the attack graph
    this.displayAttackGraph([attackStep]);
    this.displayAssetGraph = false;
  };

  /**
   * Closes the attack graph, shrinking its HTML element and setting everything necessary to only display the asset graph
   */
  closeAttackGraph = () => {
    this.tyrManager.assetGraphRenderer.deactivateAttackGraphMode();
    this.tyrManager.attackGraphRenderer.setIsVisible(false);
    this.displayAssetGraph = true;
  };

  /**
   * Updates the current visualization, displaying the attack graph but now with the setted depth, suggestion distance
   * and forward (if we are looking forward or backwards in the graph)
   *
   * @param {any} event - the emitted value with depth, suggestionDist and forward to update the visualization
   */
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
