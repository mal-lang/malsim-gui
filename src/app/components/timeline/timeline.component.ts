import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { TyrAlert, TyrManager } from 'tyr-js';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  @Input() tyrManager: TyrManager;
  @ViewChild('slideCircle') private slideCircle!: ElementRef;
  @ViewChild('slideLine') private slideLine!: ElementRef;

  private isMouseClicked: Boolean;
  private draggableLeftLimit: number;
  private draggableRightLimit: number;
  private selectedAlert: number | null;

  public alerts: TyrAlert[];
  public automaticUpdate: boolean;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef) {
    this.alerts = [];
    this.isMouseClicked = false;
    this.draggableRightLimit = 0;
    this.draggableLeftLimit = 0;
    this.automaticUpdate = true;
  }

  ngAfterViewInit() {
    const element = this.slideCircle.nativeElement;

    const startPosition = 0;
    this.draggableLeftLimit = startPosition;
    this.draggableRightLimit = startPosition;
    this.renderer.setStyle(
      this.slideCircle.nativeElement,
      'transform',
      `translateX(${startPosition}px)`
    );
    this.updateLineColor(startPosition, element.getBoundingClientRect().width);

    this.renderer.listen(
      element,
      'mousedown',
      () => (this.isMouseClicked = true)
    );
    this.renderer.listen(document, 'mousemove', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;
      const offsetX = event.clientX;
      if (offsetX > this.draggableRightLimit) return;
      if (offsetX <= this.draggableLeftLimit) return;
      this.updateLineColor(offsetX, element.getBoundingClientRect().width);
      this.renderer.setStyle(
        this.slideCircle.nativeElement,
        'transform',
        `translateX(${offsetX}px)`
      );
    });

    this.renderer.listen(document, 'mouseup', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;
      this.isMouseClicked = false;
      let offsetX = event.clientX;
      if (offsetX > this.draggableRightLimit)
        offsetX = this.draggableRightLimit;
      if (offsetX <= this.draggableLeftLimit) offsetX = 0;
      this.moveSlide(offsetX);
    });
  }

  private moveSlide(slidePosition: number) {
    const position = this.calculateSelectedItem(slidePosition);
    this.renderer.setStyle(
      this.slideCircle.nativeElement,
      'transform',
      `translateX(${position}px)`
    );
    this.updateLineColor(
      position,
      this.slideCircle.nativeElement.getBoundingClientRect().width
    );

    let alerts: TyrAlert[] = [];
    if (position >= 24) {
      const alertPosition = Math.trunc(position / 136);
      alerts = this.alerts.slice(0, alertPosition + 1);
    }

    this.tyrManager.updateAlertVisibility(alerts);

    //this.tyrManager.updateAlertVisibility();
    this.cdRef.detectChanges();
  }

  private calculateSelectedItem(position: number) {
    if (position < 24) {
      this.selectedAlert = null;
      return 0;
    }

    let aux = 24;
    let i;
    for (i = 0; aux <= position; i++) {
      aux += 136;
    }
    this.selectedAlert = i;

    return aux - 88;
  }

  private updateLineColor(position: number, width: number) {
    const line = this.slideLine.nativeElement as HTMLElement;

    this.renderer.setStyle(
      line,
      'background',
      `linear-gradient(to right, #ffa100 ${position + width / 2}px, #343a3e ${
        position + width / 2
      }px)`
    );
  }

  private updateLineWidth() {
    const line = this.slideLine.nativeElement as HTMLElement;
    this.renderer.setStyle(line, 'width', `${this.draggableRightLimit}px`);
  }

  public getClass(index: number) {
    if (this.selectedAlert) return index < this.selectedAlert ? 'active' : '';
    return '';
  }

  public onTimelineItemClick(itemPosition: number) {
    this.tyrManager.moveCameraToNode(this.alerts[itemPosition].node);
    const element = this.slideCircle.nativeElement;
    const position = 24 + 136 * itemPosition;

    //Only move scroll if the clicked item is further in the timeline
    if (position < element.getBoundingClientRect().left) return;
    this.moveSlide(position);
  }

  public addAlert(alert: TyrAlert) {
    if (this.alerts.length > 0)
      this.draggableRightLimit += 136; //128px of item width + 8px of gap +
    else this.draggableRightLimit += 80;
    this.alerts.push(alert);
    this.cdRef.detectChanges();
    this.updateLineWidth();

    if (!this.automaticUpdate) return;
    this.moveSlide(this.draggableRightLimit);
  }

  public deleteAlert(alert: TyrAlert) {
    this.alerts = this.alerts.filter((a) => a === alert);
  }

  public toggleAutomaticUpdate() {
    this.automaticUpdate = !this.automaticUpdate;
    if (this.automaticUpdate) this.moveSlide(this.draggableRightLimit);
  }
}
