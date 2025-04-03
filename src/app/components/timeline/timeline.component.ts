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

  private isMouseClicked: Boolean;

  constructor(private renderer: Renderer2) {
    this.alerts = [];
    this.isMouseClicked = false;
  }

  ngAfterViewInit() {
    const element = this.slideCircle.nativeElement;

    this.renderer.listen(
      element,
      'mousedown',
      (event: MouseEvent) => (this.isMouseClicked = true)
    );
    this.renderer.listen(document, 'mousemove', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;
      const offsetX = event.clientX;
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
    this.alerts.push(alert);
    const container = this.scrollContainer.nativeElement;
    container.scrollLeft = container.scrollWidth;
  }

  public deleteAlert(alert: TyrAlert) {
    this.alerts = this.alerts.filter((a) => a === alert);
  }
}
