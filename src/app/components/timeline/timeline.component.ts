import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { TyrAlert } from 'tyr-js';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
})
export class TimelineComponent {
  public alerts: TyrAlert[];
  @ViewChild('slideCircle') private slideCircle!: ElementRef;
  @ViewChild('slideLine') private slideLine!: ElementRef;

  private isMouseClicked: Boolean;
  private draggableLeftLimit: number;
  private draggableRightLimit: number;

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
      this.isMouseClicked = false;
      const offsetX = event.clientX;
      const element = this.slideCircle.nativeElement;
      const position = this.calculateSelectedItem(offsetX);
      this.renderer.setStyle(
        this.slideCircle.nativeElement,
        'transform',
        `translateX(${position}px)`
      );
      this.updateLineColor(position, element.getBoundingClientRect().width);
    });
  }

  calculateSelectedItem(position: number) {
    if (position < 24) return 0;

    let aux = 24;
    for (let i = 0; aux < position; i++) {
      aux += 136;
    }

    return aux - 88;
  }
  updateLineColor(position: number, width: number) {
    const line = this.slideLine.nativeElement as HTMLElement;

    this.renderer.setStyle(
      line,
      'background',
      `linear-gradient(to right, #ffa100 ${position + width / 2}px, #343a3e ${
        position + width / 2
      }px)`
    );
  }

  updateLineWidth() {
    const line = this.slideLine.nativeElement as HTMLElement;
    this.renderer.setStyle(line, 'width', `${this.draggableRightLimit}px`);
  }

  public addAlert(alert: TyrAlert) {
    if (this.alerts.length > 0)
      this.draggableRightLimit += 136; //128px of item width + 8px of gap +
    else this.draggableRightLimit += 80;
    this.alerts.push(alert);
    this.updateLineWidth();
  }

  public deleteAlert(alert: TyrAlert) {
    this.alerts = this.alerts.filter((a) => a === alert);
  }
}
