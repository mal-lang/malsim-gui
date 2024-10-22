import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-suggested-actions',
  templateUrl: './suggested-actions.component.html',
  styleUrl: './suggested-actions.component.scss',
})
export class SuggestedActionsComponent {
  @Input() currentDefenceSteps: any;

  suggestedActions: Array<any> = [];

  updateSuggestedActions() {
    console.log('Update suggested actions');
    console.log(this.currentDefenceSteps);
    let actions: Array<any> = [];
    Object.keys(this.currentDefenceSteps).forEach((stepId) => {
      let step = this.currentDefenceSteps[stepId];
      if (step.action.description && step.action.system) {
        actions.push({
          description: step.action.description,
          system: step.action.system,
        });
      }
    });

    this.suggestedActions = actions;
  }
}
