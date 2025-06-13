import { NgClass, NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { ApiService } from 'src/app/services/api-service/api-service.service';
import { selectActionImage } from 'src/app/utils/functions/utils';
import { TyrManager } from 'tyr-js';

interface SuggestedAction {
  stepId: number;
  weight: string;
  description: string;
  iteration: number;
  systems: string;
  agents: Array<AgentSuggestion>;
  image: string;
  performed: boolean;
  type: string;
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

/**
 * SuggestedActionsComponent is the component where all the ML agents' suggestions will be displayed (the window on the left).
 */
export class SuggestedActionsComponent {
  suggestedActions: Array<SuggestedAction> = [];
  selectedActions: SelectedAction[];
  isCollapsed = false;

  @Input() tyrManager: TyrManager;
  @Output() onSuggestionSelected = new EventEmitter<any>();
  @Output() onToggleCollapse = new EventEmitter<any>();

  constructor(
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  /**
   * Parses and updated the suggested actions.
   *
   * @param {any} defenderSuggestions - The received suggestions from the API.
   */
  updateSuggestedActions(defenderSuggestions: any) {
    let actions: Array<SuggestedAction> = [];
    this.tyrManager.markDefensesAsPerformed([]);

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
            defenderSuggestion.action.systems
          ) {
            actions.push({
              stepId: Number(stepId),
              weight: Number(defenderSuggestion.weight).toFixed(2),
              iteration: defenderSuggestion.iteration,
              description: defenderSuggestion.action.description,
              systems: defenderSuggestion.action.systems.join(','),
              agents: [agentSuggestion],
              type: this.tyrManager.getAttackStepType(stepId) ?? '',
              image: selectActionImage(
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

  /**
   * Executes the given suggestion/action
   *
   * @param {number} id - The id of the suggestion to perform.
   * @param {number} iteration - The current iteration.
   */
  async selectAction(id: number, iteration: number) {
    await this.apiService
      .postDefenderAction(this.suggestedActions[id].stepId, iteration)
      .then((response) => {
        if (!response.ok)
          throw new Error(
            `HTTP error: ${response.status}. Something went wrong.`
          );
        this.suggestedActions[id].performed = true;
        this.tyrManager.markDefensesAsPerformed(
          this.suggestedActions
            .filter((a) => a.performed)
            .map((a) => String(a.stepId))
        );
        this.onSuggestionSelected.emit(this.suggestedActions[id]);
      });
  }

  public toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.onToggleCollapse.emit();
  }
}
