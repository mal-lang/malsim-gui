import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { TyrAlert } from 'tyr-js';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  public alerts: TyrAlert[];
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;
  @ViewChild('slideCircle') private slideCircle!: ElementRef;
  @ViewChild('timelineList') private timelineList!: ElementRef;

  private isMouseClicked: Boolean;
  private draggableLeftLimit: number;
  private draggableRightLimit: number;
  private hasBeenChecked: Boolean = false;

  constructor(private renderer: Renderer2) {
    this.alerts = [];
    this.isMouseClicked = false;
    this.draggableRightLimit = 0;
    this.draggableLeftLimit = 0;
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

    this.renderer.listen(
      element,
      'mousedown',
      (event: MouseEvent) => (this.isMouseClicked = true)
    );
    this.renderer.listen(document, 'mousemove', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;
      const offsetX = event.clientX;
      if (offsetX > this.draggableRightLimit) return;
      if (offsetX <= this.draggableLeftLimit) return;
      this.renderer.setStyle(
        this.slideCircle.nativeElement,
        'transform',
        `translateX(${offsetX}px)`
      );
    });
    this.renderer.listen(
      document,
      'mouseup',
      () => (this.isMouseClicked = false)
    );
  }

  public addAlert(alert: TyrAlert) {
    if (this.alerts.length > 0)
      this.draggableRightLimit += 136; //128px of item width + 8px of gap
    else this.draggableRightLimit += 72;
    this.alerts.push(alert);
  }

  public deleteAlert(alert: TyrAlert) {
    this.alerts = this.alerts.filter((a) => a === alert);
  }
}
