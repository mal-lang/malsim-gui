import { Component, Input } from '@angular/core';

import { ApiService } from 'src/app/services/api-service/api-service.service';

interface SuggestedAction {
  stepId: number;
  description: string;
  iteration: number;
  system: string;
  agents: Array<string>;
}

@Component({
  selector: 'app-suggested-actions',
  templateUrl: './suggested-actions.component.html',
  styleUrl: './suggested-actions.component.scss',
})
export class SuggestedActionsComponent {
  @Input() defenderSuggestions: any;

  suggestedActions: Array<SuggestedAction> = [];
  selectedAction: number | null = null;

  constructor(private apiService: ApiService) {}

  updateSuggestedActions() {
    let actions: Array<SuggestedAction> = [];
    this.selectedAction = null;
    Object.keys(this.defenderSuggestions).forEach((agent) => {
      Object.keys(this.defenderSuggestions[agent]).forEach((stepId) => {
        let index = actions.findIndex(
          (a: SuggestedAction) => a.stepId === Number(stepId)
        );

        if (index !== -1) {
          actions[index].agents.push(agent);
        } else {
          let defenderSuggestion = this.defenderSuggestions[agent][stepId];
          if (
            defenderSuggestion.action.description &&
            defenderSuggestion.action.system
          ) {
            actions.push({
              stepId: Number(stepId),
              iteration: defenderSuggestion.iteration,
              description: defenderSuggestion.action.description,
              system: defenderSuggestion.action.system,
              agents: [agent],
            });
          }
        }
      });
    });

    this.suggestedActions = actions;
  }

  selectAction(id: number, iteration: number) {
    this.selectedAction = id;
    this.apiService.postDefenderAction(id, iteration).subscribe(() => {});
  }
}
