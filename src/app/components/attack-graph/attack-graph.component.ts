import { NgClass } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AvailableInitialNodePositioning,
  FillInput,
  LayoutAlgorithm,
  TextStyleAlign,
  TextStyleFontWeight,
  Texture,
  TyrAlertStatus,
  TyrAssetGraphNode,
  TyrAssetGraphNodeStatus,
  TyrAttackStep,
  TyrGraphConfig,
  TyrManager,
} from 'tyr-js';

@Component({
  selector: 'app-attack-graph',
  standalone: true,
  imports: [NgClass],
  templateUrl: './attack-graph.component.html',
  styleUrl: './attack-graph.component.scss',
})
export class AttackGraphComponent {
  public isVisible: boolean;
  @Input() tyrManager: TyrManager;
  @Output() stepsEmitter = new EventEmitter<number>();
  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @ViewChild('optionssteps') stepSlider!: ElementRef;

  private config: TyrGraphConfig;
  public selectedSteps: number = 3;
  public maxSteps: number = 5;

  ngAfterViewInit() {
    this.config = {
      centerX:
        (this.graphContainer.nativeElement as HTMLElement).offsetWidth / 2,
      centerY:
        (this.graphContainer.nativeElement as HTMLElement).offsetHeight / 2,
      marginX: 0,
      marginY: 0,
      graphWorldWidth: 20000,
      graphWorldHeight: 20000,
      backgroundColor: '#212529',
      nodes: {
        initialPositioning: {
          type: AvailableInitialNodePositioning.random,
          radiusX: 20000,
          radiusY: 20000,
        },
        getNodeAlertIcon: (alert: TyrAlertStatus) => {
          return new Texture();
        },
        getNodeStatusIcon: (alert: TyrAssetGraphNodeStatus) => {
          return new Texture();
        },
        getNodeImage: (node: TyrAssetGraphNode) => {
          return new Texture();
        },
        imageMargin: 0.5,
        textInvisible: false,
        highlightColor: 0xffa100,
        textConfig: {
          fontFamily: 'arial',
          fontSize: 64,
          fill: 0xffffff as FillInput,
          align: 'left' as TextStyleAlign,
          fontWeight: 'bold' as TextStyleFontWeight,
          stroke: 'black',
        },
        hoverable: true,
        onPointerOn: () => {},
        onPointerOut: () => {},
        onClick: () => {},
        onFirstRendered: () => {},
      },
      edges: {
        animated: true,
        unidirectional: true,
      },
      clusterRules: [],
      simulationConfig: { type: LayoutAlgorithm.sugiyama },
    };
  }

  constructor() {
    this.isVisible = false;
  }

  public openAttackGraph(attackStep: TyrAttackStep) {
    this.isVisible = true;
  }

  public closeAttackGraph() {
    this.isVisible = false;
    this.tyrManager.assetGraphRenderer.deactivateAttackGraphMode();
    this.tyrManager.attackGraphRenderer.setIsVisible(false);
  }

  public getAttackGraphContainer() {
    return this.graphContainer;
  }

  public getConfig() {
    return this.config;
  }

  public updateSliderBackground(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value =
      ((+target.value - +target.min) / (+target.max - +target.min)) * 100;
    target.style.background = `linear-gradient(to right, #00e6ff ${value}%, #343a3e ${value}%)`;
    this.selectedSteps = +target.value;
    this.stepsEmitter.emit(this.selectedSteps);
  }

  public updateStepMax(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (+target.value > 10 || +target.value < 2) {
      target.value = String(this.maxSteps);
    } else {
      this.maxSteps = +target.value;
    }

    let value = 100;
    if (this.selectedSteps > this.maxSteps) {
      this.selectedSteps = this.maxSteps;
      this.stepsEmitter.emit(this.selectedSteps);
    } else value = ((this.selectedSteps - 1) / (this.maxSteps - 1)) * 100;

    this.stepSlider.nativeElement.style.background = `linear-gradient(to right, #00e6ff ${value}%, #343a3e ${value}%)`;
  }
}
