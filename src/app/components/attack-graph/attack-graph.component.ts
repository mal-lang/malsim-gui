import { NgClass } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { TyrAttackStep } from 'tyr-js';

@Component({
  selector: 'app-attack-graph',
  standalone: true,
  imports: [NgClass],
  templateUrl: './attack-graph.component.html',
  styleUrl: './attack-graph.component.scss',
})
export class AttackGraphComponent {
  public isVisible: boolean;
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  constructor() {
    this.isVisible = false;
  }

  public openAttackGraph(attackStep: TyrAttackStep) {
    this.isVisible = true;
  }

  public closeAttackGraph() {
    this.isVisible = false;
  }

  public getAttackGraphContainer() {
    return this.graphContainer;
  }
}
