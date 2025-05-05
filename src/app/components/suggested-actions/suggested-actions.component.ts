import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';

import { ApiService } from 'src/app/services/api-service/api-service.service';

interface SuggestedAction {
  stepId: number;
  weight: string;
  description: string;
  iteration: number;
  system: string;
  agents: Array<string>;
  image: string;
}

interface SelectedAction {
  id: number;
  iteration: number;
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
  @Output() onSuggestionSelected = new EventEmitter<any>();

  constructor(
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef
  ) {}

  updateSuggestedActions(defenderSuggestions: any) {
    let actions: Array<SuggestedAction> = [];
    this.selectedActions = [];
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
              image: this.selectActionImage(defenderSuggestion),
            });
          }
        }
      });
    });

    this.suggestedActions = actions;
    this.cdRef.detectChanges();
  }

  async selectAction(id: number, iteration: number) {

    this.selectedActions.push({ id: this.suggestedActions[id].stepId, iteration: iteration });
    this.suggestedActions[id].weight = 'SENT';
    await this.apiService.postDefenderAction(this.suggestedActions[id].stepId, iteration).then(() => {
      this.suggestedActions[id].weight = 'DONE';

      this.onSuggestionSelected.emit(this.suggestedActions[id]);
    });
  }

  isSelected(id: number, iteration: number) {
    return this.selectedActions.some(
      (a) => a.id === id && a.iteration === iteration
    );
  }

  selectActionImage(suggestion: any): string {
    switch (suggestion.action.description) {
      //TODO
      case 'Shutdown machine':
        return 'assets/icons/suggestions/turnoff.png';
      default:
        return '';
    }
  }
}
