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
  @Input() tyrManager: TyrManager;

  @Output() emitter = new EventEmitter<any>();

  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @ViewChild('depthSlider') depthSlider!: ElementRef;
  @ViewChild('suggestionSlider') suggestionSlider!: ElementRef;
  @ViewChild('currentDepthSign') currentDepthSign!: ElementRef;
  @ViewChild('currentSuggestionSign') currentSuggestionSign!: ElementRef;

  private config: TyrGraphConfig;

  public isVisible: boolean;
  public selectedDepth: number = 3;
  public maxDepth: number = 5;
  public selectedSuggestionDist: number = 2;
  public maxSuggestionDist: number = 3;

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

    this.depthSlider.nativeElement.addEventListener(
      'mousedown',
      (event: MouseEvent) => {
        this.currentDepthSign.nativeElement.style.visibility = 'visible';
      }
    );

    this.depthSlider.nativeElement.addEventListener(
      'mouseup',
      (event: MouseEvent) => {
        this.currentDepthSign.nativeElement.style.visibility = 'hidden';
      }
    );

    this.suggestionSlider.nativeElement.addEventListener(
      'mousedown',
      (event: MouseEvent) => {
        this.currentSuggestionSign.nativeElement.style.visibility = 'visible';
      }
    );

    this.suggestionSlider.nativeElement.addEventListener(
      'mouseup',
      (event: MouseEvent) => {
        this.currentSuggestionSign.nativeElement.style.visibility = 'hidden';
      }
    );
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

  private emitValues() {
    this.emitter.emit({
      depth: this.selectedDepth,
      suggestionDist: this.selectedSuggestionDist,
    });
  }

  private updateSign(sign: HTMLElement, value: number) {
    const offset = 16; // Fixed offset
    sign.style.left = `calc(${value}% - ${offset}px)`;
  }

  public updateSliderBackground(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value =
      ((+target.value - +target.min) / (+target.max - +target.min)) * 100;
    target.style.background = `linear-gradient(to right, #00e6ff ${value}%, #343a3e ${value}%)`;

    if (target === this.depthSlider.nativeElement) {
      this.selectedDepth = +target.value;

      this.updateSign(this.currentDepthSign.nativeElement, value);
    }
    if (target === this.suggestionSlider.nativeElement) {
      this.selectedSuggestionDist = +target.value;
      this.updateSign(this.currentSuggestionSign.nativeElement, value);
    }
    this.emitValues();
  }

  public updateMaxDepth(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (+target.value > 10 || +target.value < 2) {
      target.value = String(this.maxDepth);
    } else {
      this.maxDepth = +target.value;
    }

    let value = 100;
    if (this.selectedDepth > this.maxDepth) {
      this.selectedDepth = this.maxDepth;
    } else value = ((this.selectedDepth - 1) / (this.maxDepth - 1)) * 100;

    this.depthSlider.nativeElement.style.background = `linear-gradient(to right, #00e6ff ${value}%, #343a3e ${value}%)`;
    this.updateSign(this.currentDepthSign.nativeElement, value);
    this.emitValues();
  }

  public updateMaxSuggestionDist(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (+target.value > 10 || +target.value < 2) {
      target.value = String(this.maxSuggestionDist);
    } else {
      this.maxSuggestionDist = +target.value;
    }
    let value = 100;
    if (this.selectedSuggestionDist > this.maxSuggestionDist) {
      this.selectedSuggestionDist = this.maxSuggestionDist;
    } else
      value =
        ((this.selectedSuggestionDist - 1) / (this.maxSuggestionDist - 1)) *
        100;

    this.suggestionSlider.nativeElement.style.background = `linear-gradient(to right, #00e6ff ${value}%, #343a3e ${value}%)`;
    this.updateSign(this.currentSuggestionSign.nativeElement, value);
    this.emitValues();
  }
}
