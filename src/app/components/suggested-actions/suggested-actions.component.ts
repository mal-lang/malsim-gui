import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
} from '@angular/core';

import { ApiService } from 'src/app/services/api-service/api-service.service';

interface SuggestedAction {
  stepId: number;
  weight: string;
  description: string;
  iteration: number;
  system: string;
  agents: Array<string>;
}

@Component({
  selector: 'app-suggested-actions',
  templateUrl: './suggested-actions.component.html',
  styleUrl: './suggested-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuggestedActionsComponent {
  suggestedActions: Array<SuggestedAction> = [];
  selectedAction: number | null = null;

  constructor(
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  updateSuggestedActions(defenderSuggestions: any) {
    let actions: Array<SuggestedAction> = [];
    this.selectedAction = null;
    Object.keys(defenderSuggestions).forEach((agent) => {
      Object.keys(defenderSuggestions[agent]).forEach((stepId) => {
        let index = actions.findIndex(
          (a: SuggestedAction) => a.stepId === Number(stepId)
        );

        if (index !== -1) {
          actions[index].agents.push(agent);
        } else {
          let defenderSuggestion = defenderSuggestions[agent][stepId];
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
              agents: [agent],
            });
          }
        }
      });
    });

    this.suggestedActions = actions;
    console.log(defenderSuggestions);
    this.cdRef.detectChanges();
  }

  selectAction(id: number, iteration: number) {
    this.selectedAction = id;
    this.apiService.postDefenderAction(id, iteration).subscribe(() => {});
  }
}
