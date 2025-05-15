import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { ApiService } from 'src/app/services/api-service/api-service.service';
import { TyrManager } from 'tyr-js';

interface SuggestedAction {
  stepId: number;
  weight: string;
  description: string;
  iteration: number;
  system: string;
  agents: Array<AgentSuggestion>;
  image: string;
  performed: boolean;
}

interface SelectedAction {
  id: number;
  iteration: number;
}

interface AgentSuggestion {
  name: string;
  weight: number;
}

@Component({
  selector: 'app-suggested-actions',
  templateUrl: './suggested-actions.component.html',
  styleUrl: './suggested-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestedActionsComponent {
  suggestedActions: Array<SuggestedAction> = [];
  selectedActions: SelectedAction[];

  @Input() tyrManager: TyrManager;
  @Output() onSuggestionSelected = new EventEmitter<any>();

  constructor(
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  updateSuggestedActions(defenderSuggestions: any) {
    let actions: Array<SuggestedAction> = [];
    this.tyrManager.markDefensesAsActive([]);

    Object.keys(defenderSuggestions).forEach((agent) => {
      Object.keys(defenderSuggestions[agent]).forEach((stepId) => {
        let index = actions.findIndex(
          (a: SuggestedAction) => a.stepId === Number(stepId)
        );

        let defenderSuggestion = defenderSuggestions[agent][stepId];
        const agentSuggestion: AgentSuggestion = {
          name: agent,
          weight: +Number(defenderSuggestion.weight).toFixed(2),
        };
        if (index !== -1) {
          actions[index].agents.push(agentSuggestion);
        } else {
          if (
            defenderSuggestion.action.description &&
            defenderSuggestion.action.system
          ) {
            actions.push({
              stepId: Number(stepId),
              weight: Number(defenderSuggestion.weight).toFixed(2),
              iteration: defenderSuggestion.iteration,
              description: defenderSuggestion.action.description,
              system: defenderSuggestion.action.system,
              agents: [agentSuggestion],
              image: this.selectActionImage(
                this.tyrManager.getAttackStepType(stepId)
              ),
              performed: false,
            });
          }
        }
      });
    });
    this.suggestedActions = actions;
    this.cdRef.detectChanges();
  }

  async selectAction(id: number, iteration: number) {
    await this.apiService
      .postDefenderAction(this.suggestedActions[id].stepId, iteration)
      .then(() => {
        this.suggestedActions[id].performed = true;
        this.tyrManager.markDefensesAsActive(
          this.suggestedActions
            .filter((a) => a.performed)
            .map((a) => String(a.stepId))
        );
        this.onSuggestionSelected.emit(this.suggestedActions[id]);
      });
  }

  selectActionImage(type?: string): string {
    switch (type) {
      //TODO
      case 'Application:notPresent':
        return 'assets/icons/suggestions/turnoff.png';
      case 'ConnectionRule:restricted':
        return 'assets/icons/suggestions/disconnect.png';
      case 'Identity:notPresent':
        return 'assets/icons/suggestions/user.png';
      default:
        return '';
    }
  }
}
