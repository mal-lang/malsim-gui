import { Component, ViewChild } from '@angular/core';

import { InstanceModelComponent } from 'src/app/components/instance-model/instance-model.component';
import { AttackGraphComponent } from 'src/app/components/attack-graph/attack-graph.component';
import { SuggestedActionsComponent } from 'src/app/components/suggested-actions/suggested-actions.component';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import { forkJoin } from 'rxjs';
import {
  AttackGraph,
  AttackStep,
  AttackStepInformation,
  AttackStepTTC,
  AttackStepRelatedNodes,
} from 'src/app/components/attack-graph/attack-graph-interfaces';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  @ViewChild('instanceModel') instanceModel!: InstanceModelComponent;
  @ViewChild('attackGraphHorizon') attackGraphHorizon!: AttackGraphComponent;
  @ViewChild('historicAttackGraph') historicAttackGraph!: AttackGraphComponent;
  @ViewChild('suggestedActions') suggestedActions!: SuggestedActionsComponent;

  //Style
  tooltipPositions = ['auto', 'top', 'right', 'bottom', 'left'];
  tooltipAlignments = [
    { label: 'start', value: '-start' },
    { label: 'center', value: '' },
    { label: 'end', value: '-end' },
  ];
  tooltipTypes = ['popper', 'tooltip', 'popperBorder'];
  noContextText: string | undefined;
  maxWidth = 300;
  show = true;

  //Variables
  allAttackSteps: any = {};
  attackStepMap = new Map<number, string>();
  currentDefenderSuggestions: any = {};
  loading: boolean = false;
  intervalId: any;
  intervalTime: number = 1000 * 10; // 10 seconds;
  rewardValue: { reward: number; iteration: number } = {
    reward: 0,
    iteration: -1,
  };
  latestAttackStepIteration: number = -1;
  activeDefenceSteps: any;
  activeAttackSteps: any;

  //Attack Graph empty object
  attackGraph: AttackGraph = {
    attackSteps: [],
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.getAttackGraph();
  }

  getAttackGraph() {
    this.apiService.getAttackGraph().subscribe({
      next: (attackGraph) => {
        this.allAttackSteps = attackGraph.attack_steps;
        this.mapAvailableAttackSteps();

        this.attackGraph = this.parseAttackGraph(attackGraph);
        console.log(this.attackGraph);
        this.intervalId = setInterval(() => {
          this.updateCurrentAttackSteps();
        }, this.intervalTime);
      },
      error: (e) => {
        console.log(e);
      },
    });
  }

  parseAttackGraph(receivedAttackGraph: any): AttackGraph {
    let newAttackGraph: AttackGraph = { attackSteps: [] };
    Object.keys(receivedAttackGraph.attack_steps).forEach((stepId) => {
      let newAttackStepInfo: AttackStepInformation = receivedAttackGraph
        .attack_steps[stepId] as AttackStepInformation;

      //Get TTC
      if (receivedAttackGraph.attack_steps[stepId].ttc) {
        newAttackStepInfo.ttc = receivedAttackGraph.attack_steps[stepId]
          .ttc as AttackStepTTC;
      }

      //Get Children Nodes
      let childrenNodes: AttackStepRelatedNodes[] = [];
      Object.keys(receivedAttackGraph.attack_steps[stepId].children).forEach(
        (child) => {
          childrenNodes.push({
            id: child,
            name: receivedAttackGraph.attack_steps[stepId].children[child],
          });
        }
      );
      newAttackStepInfo.children = childrenNodes;

      //Get Parent Nodes
      let parentNodes: AttackStepRelatedNodes[] = [];
      Object.keys(receivedAttackGraph.attack_steps[stepId].parents).forEach(
        (parent) => {
          parentNodes.push({
            id: parent,
            name: receivedAttackGraph.attack_steps[stepId].parents[parent],
          });
        }
      );
      newAttackStepInfo.parents = parentNodes;

      newAttackGraph.attackSteps.push({
        id: stepId,
        information: newAttackStepInfo,
      });
    });
    return newAttackGraph;
  }

  mapAvailableAttackSteps() {
    Object.keys(this.allAttackSteps).forEach((attackName: any) => {
      this.attackStepMap.set(this.allAttackSteps[attackName].id, attackName);
    });
  }

  updateCurrentAttackSteps() {
    this.loading = true;

    forkJoin({
      latestAttackSteps: this.apiService.getLatestAttackSteps(),
      defenderSuggestions: this.apiService.getDefenderSuggestions(),
      rewardValue: this.apiService.getRewardValue(),
      enabledDefenceSteps: this.apiService.getEnabledDefenceSteps(),
      enabledAttackSteps: this.apiService.getEnabledAttackSteps(),
    }).subscribe(
      ({
        latestAttackSteps,
        defenderSuggestions,
        rewardValue,
        enabledDefenceSteps,
        enabledAttackSteps,
      }) => {
        this.activeDefenceSteps = this.findDefenceStep(
          this.apiService.getLatestDefenceStep()
        );

        if (this.updateActiveAttackSteps(latestAttackSteps)) {
          let iteration = Object.keys(latestAttackSteps);

          this.activeAttackSteps = this.findAttackSteps(
            latestAttackSteps[iteration[0]]
          );

          this.historicAttackGraph.updateAttackGraph(
            this.activeAttackSteps,
            this.activeDefenceSteps
          );
          this.attackGraphHorizon.updateAttackGraph(
            this.activeAttackSteps,
            this.activeDefenceSteps
          );
        }

        if (this.updateDefenderSuggestions(defenderSuggestions)) {
          this.currentDefenderSuggestions = defenderSuggestions;
          this.suggestedActions.updateSuggestedActions(defenderSuggestions);
        }

        this.rewardValue = rewardValue;
        this.instanceModel.markNodes(
          enabledAttackSteps,
          enabledDefenceSteps,
          this.activeAttackSteps,
          this.activeDefenceSteps
        );

        setTimeout(() => {
          this.loading = false;
        }, 2000);
      }
    );
  }

  updateDefenderSuggestions(defenderSuggestions: any) {
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

  updateActiveAttackSteps(latestAttackSteps: any) {
    let iteration = Object.keys(latestAttackSteps);

    if (Number(iteration[0]) !== Number(this.latestAttackStepIteration)) {
      return true;
    }

    return false;
  }

  findDefenceStep(id: number) {
    let step: any = {};
    let stepName = this.attackStepMap.get(id);
    if (stepName) {
      step[id] = this.allAttackSteps[stepName];
      step[id].name = stepName;
    }
    return step;
  }

  findAttackSteps(activeSteps: any) {
    let steps: any = {};

    if (activeSteps) {
      Object.keys(activeSteps).forEach((activeStepId) => {
        let stepName = this.attackStepMap.get(Number(activeStepId));
        if (stepName) {
          steps[activeStepId] = this.allAttackSteps[stepName];
          steps[activeStepId].logs = activeSteps[activeStepId];
          steps[activeStepId].name = stepName;
        }
      });
    }

    return steps;
  }
}
