import { Component, ViewChild } from '@angular/core';

import { InstanceModelComponent } from 'src/app/components/instance-model/instance-model.component';
import { AttackGraphComponent } from 'src/app/components/attack-graph/attack-graph.component';
import { SuggestedActionsComponent } from 'src/app/components/suggested-actions/suggested-actions.component';

import { ApiService } from 'src/app/services/api-service/api-service.service';

//TODO prepare for https calls

//TODO use id instead of name in attack graph

//TODO do two attack graphs (Historic attack graph (parents) and atack graph horizon (children))

//TODO pull every minute

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
  intervalIndex: number = 1;

  activeDefenceSteps: any = {};
  activeAttackSteps: any = {};
  allAttackSteps: any = {};
  attackStepMap = new Map<number, string>();
  defenderSuggestions: any = {};
  loading: boolean = false;
  intervalId: any;
  intervalTime: number = 1000 * 10; // 60 seconds;
  stage: number = 0;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    let attackGraph = this.apiService.getAttackGraph();
    this.allAttackSteps = attackGraph.attack_steps;
    this.mapAvailableAttackSteps();

    this.intervalId = setInterval(() => {
      this.loading = true;
      this.updateCurrentAttackSteps();
    }, this.intervalTime);
  }

  mapAvailableAttackSteps() {
    Object.keys(this.allAttackSteps).forEach((attackName: any) => {
      this.attackStepMap.set(this.allAttackSteps[attackName].id, attackName);
    });
  }

  updateCurrentAttackSteps() {
    this.activeDefenceSteps = this.findDefenceStep(
      this.apiService.getLatestDefenceStep()
    );
    this.activeAttackSteps = this.findAttackSteps(
      this.apiService.getLatestAttackSteps()
    );
    this.defenderSuggestions = this.apiService.getDefenderSuggestions();

    setTimeout(() => {
      this.stage++;
      this.instanceModel.markNodes();
      this.historicAttackGraph.updateAttackGraph();
      this.attackGraphHorizon.updateAttackGraph();
      this.suggestedActions.updateSuggestedActions();
      ++this.intervalIndex;
      this.loading = false;
    }, 2000);
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

    Object.keys(activeSteps).forEach((activeStepId) => {
      let stepName = this.attackStepMap.get(Number(activeStepId));
      if (stepName) {
        steps[activeStepId] = this.allAttackSteps[stepName];
        steps[activeStepId].logs = activeSteps[activeStepId];
        steps[activeStepId].name = stepName;
      }
    });

    return steps;
  }
}
