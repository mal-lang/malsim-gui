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
  Sprite,
  TextStyleAlign,
  TextStyleFontWeight,
  Texture,
  TyrAttackStep,
  TyrGraphConfig,
  TyrGraphNode,
  TyrManager,
  ColorSource,
  TyrAttackGraphConfig,
} from 'tyr-js';
import { CrossComponent } from '../../utils/cross/cross.component';
@Component({
  selector: 'app-attack-graph',
  standalone: true,
  imports: [NgClass, CrossComponent],
  templateUrl: './attack-graph.component.html',
  styleUrl: './attack-graph.component.scss',
})
export class AttackGraphComponent {
  @Input() tyrManager: TyrManager;
  @Input() getAssetIcon: (node: TyrGraphNode) => Sprite;
  @Input() getAttackStepIcon: (node: TyrAttackStep) =>
    | {
        texture: Texture;
        background: ColorSource;
      }
    | undefined;
  @Input() parentCloseAttackGraph: () => void;
  @Output() emitter = new EventEmitter<any>();

  @ViewChild('graphContainer') graphContainer!: ElementRef;
  @ViewChild('depthSlider') depthSlider!: ElementRef;
  @ViewChild('suggestionSlider') suggestionSlider!: ElementRef;
  @ViewChild('currentDepthSign') currentDepthSign!: ElementRef;
  @ViewChild('currentSuggestionSign') currentSuggestionSign!: ElementRef;

  @ViewChild('forward') forward!: ElementRef;
  @ViewChild('backward') backward!: ElementRef;

  private config: TyrAttackGraphConfig;

  public isVisible: boolean;
  public selectedDepth: number = 3;
  public maxDepth: number = 5;
  public selectedSuggestionDist: number = 2;
  public maxSuggestionDist: number = 3;
  public cursorStyle = 'grab';
  public isForward: boolean = true;

  ngAfterViewInit() {
    this.config = {
      marginX: 0,
      marginY: 0,
      backgroundColor: '#00080d',
      textConfig: {
        fontFamily: 'arial',
        fontSize: 64,
        fill: 0xffffff as FillInput,
        align: 'left' as TextStyleAlign,
        fontWeight: 'bold' as TextStyleFontWeight,
        stroke: 'white',
      },
      nodes: {
        imageMargin: 0,
      },
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
    this.isForward = true;

    this.parentCloseAttackGraph();
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
      forward: this.isForward,
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

  public selectForward() {
    if (this.isForward) return;
    this.isForward = true;
    this.emitValues();
  }

  public selectBackwards() {
    if (!this.isForward) return;
    this.isForward = false;
    this.emitValues();
  }
}
