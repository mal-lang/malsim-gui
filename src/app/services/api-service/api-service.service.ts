import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

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
  constructor(private http: HttpClient) {}

  apiUrl: string = 'api/';
  chosenAlternative: number | null = null;

  getAttackGraph(): Observable<any> {
    return this.http.get(this.apiUrl + 'attack_graph');
  }

  getDefenderSuggestions(): Observable<any> {
    return this.http.get(this.apiUrl + 'defender_suggestions');
  }

  getLatestAttackSteps(): Observable<any> {
    return this.http.get(this.apiUrl + 'latest_attack_steps');
  }

  getLatestDefenceStep() {
    // Copy alternative before reset
    let latestDefenceStep = JSON.parse(JSON.stringify(this.chosenAlternative));
    return latestDefenceStep;
  }

  getModel() {
    return this.http.get(this.apiUrl + 'model');
  }

  getEnabledAttackSteps(): Observable<any> {
    return this.http.get(this.apiUrl + 'enabled_attack_steps');
  }

  getEnabledDefenceSteps(): Observable<any> {
    return this.http.get(this.apiUrl + 'enabled_defense_steps');
  }

  postDefenderAction(stepId: number, iteration: number) {
    this.chosenAlternative = stepId;

    return this.http.post(this.apiUrl + 'defender_action', {
      iteration: iteration,
      node_id: stepId,
    });
  }

  getRewardValue(): Observable<any> {
    return this.http.get(this.apiUrl + 'reward_value');
  }
}
