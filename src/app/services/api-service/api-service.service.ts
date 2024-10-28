import { Injectable } from '@angular/core';

import ATTACKGRAPH from '../../../assets/api_examples/get_attack_graph.json';
import MODEL from '../../../assets/api_examples/get_model.json';
import DEFENDERSUGGESTIONS from '../../../assets/api_examples/get_defender_suggestions.json';
import ENABLEDATTACKSTEPS from '../../../assets/api_examples/get_enabled_attack_steps.json';
import ENABLEDEFENSESTEPS from '../../../assets/api_examples/get_enabled_defense_steps.json';
import LATESTATTACKSTEPS from '../../../assets/api_examples/get_latest_attack_steps.json';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor() {}

  chosenAlternative: number | null = null;

  getAttackGraph() {
    return ATTACKGRAPH;
  }

  getDefenderSuggestions() {
    return DEFENDERSUGGESTIONS;
  }

  getEnabledAttackSteps() {
    return ENABLEDATTACKSTEPS;
  }

  getEnabledDefenceSteps() {
    return ENABLEDEFENSESTEPS;
  }

  getLatestAttackSteps() {
    return LATESTATTACKSTEPS;
  }

  getLatestDefenceStep() {
    // Copy alternative before reset
    let latestDefenceStep = JSON.parse(JSON.stringify(this.chosenAlternative));
    this.chosenAlternative = null;
    return latestDefenceStep;
  }

  getModel() {
    return MODEL;
  }

  postDefenderAction(stepId: number) {
    this.chosenAlternative = stepId;
    //TODO
  }
}
