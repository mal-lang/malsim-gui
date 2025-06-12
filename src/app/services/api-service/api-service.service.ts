import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private http: HttpClient) {}

  apiUrl: string = 'http://localhost:8888/';
  chosenAlternative: number | null = null;

  //TODO clean service function names
  async getNetworkAttackGraph(): Promise<any> {
    return this.http.get(this.apiUrl + 'attack_graph');
  }
  async getAssetModel(): Promise<any> {
    return this.http.get(this.apiUrl + 'model');
  }

  getAttackGraph(): Observable<any> {
    return this.http.get(this.apiUrl + 'attack_graph');
  }

  getDefenderSuggestions(): Observable<any> {
    return this.http.get(this.apiUrl + 'defender_suggestions');
  }

  getLatestAttackSteps(): Observable<any> {
    return this.http.get(this.apiUrl + 'latest_attack_steps');
  }

  getPerformedNodes(): Observable<any> {
    return this.http.get(this.apiUrl + 'performed_nodes');
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

  async postDefenderAction(stepId: number, iteration: number) {
    this.chosenAlternative = stepId;

    return await fetch(this.apiUrl + 'defender_action', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Or 'application/x-www-form-urlencoded', etc.
        // Add any other headers as needed (e.g., Authorization)
      },
      body: JSON.stringify({
        iteration: iteration,
        node_id: stepId,
      }), // Convert JavaScript object to JSON string
    });
  }

  getRewardValue(): Observable<any> {
    return this.http.get(this.apiUrl + 'reward_value');
  }
}
