import { Component, ViewChild } from '@angular/core';

import PERFORMEDACTIONS1 from '../../../assets/performed_actions_1.json';
import PERFORMEDACTIONS2 from '../../../assets/performed_actions_2.json';
import PERFORMEDACTIONS3 from '../../../assets/performed_actions_3.json';
import PERFORMEDACTIONS4 from '../../../assets/performed_actions_4.json';
import PERFORMEDACTIONS5 from '../../../assets/performed_actions_5.json';
import PERFORMEDACTIONS6 from '../../../assets/performed_actions_6.json';
import PERFORMEDACTIONS7 from '../../../assets/performed_actions_7.json';
import ATTACKGRAPH from '../../../assets/2024_09_10_11_58_generated_attack_graph.json';
import { InstanceModelComponent } from 'src/app/components/instance-model/instance-model.component';
import { AttackGraphComponent } from 'src/app/components/attack-graph/attack-graph.component';
import { SuggestedActionsComponent } from 'src/app/components/suggested-actions/suggested-actions.component';

//TODO prepare for https calls

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  @ViewChild('instanceModel') instanceModel!: InstanceModelComponent;
  @ViewChild('attackGraph') attackGraph!: AttackGraphComponent;
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

  currentAttackSteps: any = {};
  currentDefenceSteps: any = {};
  attackSteps: any = ATTACKGRAPH.attack_steps;
  attackStepMap = new Map<number, string>();
  loading: boolean = false;
  intervalId: any;

  constructor() {}

  ngOnInit() {
    this.mapAvailableAttackSteps();

    this.intervalId = setInterval(() => {
      this.loading = true;
      this.updateCurrentAttackSteps();
    }, 10000);
  }

  mapAvailableAttackSteps() {
    let availableAttackSteps: any = this.attackSteps;

    Object.keys(availableAttackSteps).forEach((attackName: any) => {
      this.attackStepMap.set(availableAttackSteps[attackName].id, attackName);
    });
  }

  updateCurrentAttackSteps() {
    switch (this.intervalIndex) {
      case 1:
        this.currentAttackSteps = PERFORMEDACTIONS1.attacks;
        this.currentDefenceSteps = PERFORMEDACTIONS1.defenses;
        break;
      case 2:
        this.currentAttackSteps = PERFORMEDACTIONS2.attacks;
        this.currentDefenceSteps = PERFORMEDACTIONS2.defenses;
        break;
      case 3:
        this.currentAttackSteps = PERFORMEDACTIONS3.attacks;
        this.currentDefenceSteps = PERFORMEDACTIONS3.defenses;
        break;
      case 4:
        this.currentAttackSteps = PERFORMEDACTIONS4.attacks;
        this.currentDefenceSteps = PERFORMEDACTIONS4.defenses;
        break;
      case 5:
        this.currentAttackSteps = PERFORMEDACTIONS5.attacks;
        this.currentDefenceSteps = PERFORMEDACTIONS5.defenses;
        break;
      case 6:
        this.currentAttackSteps = PERFORMEDACTIONS6.attacks;
        this.currentDefenceSteps = PERFORMEDACTIONS6.defenses;
        break;
      case 7:
        this.currentAttackSteps = PERFORMEDACTIONS7.attacks;
        this.currentDefenceSteps = PERFORMEDACTIONS7.defenses;
        this.intervalIndex = 0;
        break;
      default:
      //
    }

    setTimeout(() => {
      this.instanceModel.markNodes();
      this.attackGraph.updateAttackGraph();
      this.suggestedActions.updateSuggestedActions();
      ++this.intervalIndex;
      this.loading = false;
    }, 3000);
  }
}
