import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { TyrAttackStep } from 'tyr-js';

@Component({
  selector: 'app-attack-graph',
  standalone: true,
  imports: [NgIf],
  templateUrl: './attack-graph.component.html',
  styleUrl: './attack-graph.component.scss',
})
export class AttackGraphComponent {
  public isVisible: boolean;

  constructor() {
    this.isVisible = false;
  }

  public openAttackGraph(attackStep: TyrAttackStep) {
    console.log('Hey!');
    this.isVisible = true;
  }

  public closeAttackGraph() {
    this.isVisible = false;
  }
}
