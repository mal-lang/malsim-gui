import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  Renderer2,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { TyrAssetGraphNode, TyrManager, TyrNotification } from 'tyr-js';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  @Input() tyrManager: TyrManager;
  @Input() openAssetMenu: (node: TyrAssetGraphNode) => void;
  @Input() attackGraphMode: boolean;

  @ViewChild('slideCircleLeft') private slideCircleLeft!: ElementRef;
  @ViewChild('slideCircleRight') private slideCircleRight!: ElementRef;
  @ViewChild('slideLine') private slideLine!: ElementRef;

  private isMouseClicked = false;
  private draggableLeftLimit = 0;
  private draggableRightLimit = 0;
  private clickedCircleDraggableLeftLimit = 0;
  private clickedCircleDraggableRightLimit = 0;
  private clickedCircle: HTMLElement | null = null;

  public notifications: TyrNotification[] = [];
  public selectedNotifications: TyrNotification[] = [];
  public automaticUpdate = true;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['attackGraphMode']) return;
    if (!this.slideCircleRight) return;

    const leftEl = this.slideCircleLeft.nativeElement;
    const rightEl = this.slideCircleRight.nativeElement;

    if (!this.attackGraphMode) {
      leftEl.style.transform = `translateX(${this.draggableLeftLimit}px)`;
    } else {
      if (leftEl.getBoundingClientRect().left == 0) {
        leftEl.style.transform = `translateX(${
          24 - rightEl.getBoundingClientRect().width / 2
        }px)`;
      }
      if (rightEl.getBoundingClientRect().left > 0) {
        rightEl.style.transform = `translateX(${
          rightEl.getBoundingClientRect().left +
          88 -
          rightEl.getBoundingClientRect().width / 2
        }px)`;
      }
    }

    if (this.draggableRightLimit > 0)
      this.draggableRightLimit +=
        88 * (this.attackGraphMode ? 1 : -1) -
        rightEl.getBoundingClientRect().width *
          (this.attackGraphMode ? 1.5 : -1.5);

    this.updateLineWidth();
    this.updateLineColor();
    this.updateSelectedNotifications();

    const circle = this.slideCircleRight.nativeElement as HTMLElement;
    this.moveSlide(circle.getBoundingClientRect().left, circle);
  }

  ngAfterViewInit() {
    const start = 0;
    this.draggableLeftLimit = start;
    this.draggableRightLimit = start;

    this.renderer.setStyle(
      this.slideCircleRight.nativeElement,
      'transform',
      `translateX(${start}px)`
    );
    this.updateLineColor();

    this.renderer.listen(
      this.slideCircleLeft.nativeElement,
      'mousedown',
      () => {
        this.isMouseClicked = true;
        this.clickedCircle = this.slideCircleLeft.nativeElement;
      }
    );

    this.renderer.listen(
      this.slideCircleRight.nativeElement,
      'mousedown',
      () => {
        this.isMouseClicked = true;
        this.clickedCircle = this.slideCircleRight.nativeElement;
      }
    );

    this.renderer.listen(document, 'mousemove', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;

      let offsetX = event.clientX;

      const leftEl = this.slideCircleLeft.nativeElement;
      const rightEl = this.slideCircleRight.nativeElement;

      if (this.clickedCircle === leftEl) {
        this.clickedCircleDraggableRightLimit =
          rightEl.getBoundingClientRect().left - 88;
        this.clickedCircleDraggableLeftLimit = this.draggableLeftLimit;
      } else {
        this.clickedCircleDraggableLeftLimit = this.attackGraphMode
          ? leftEl.getBoundingClientRect().left + 88
          : this.draggableLeftLimit;
        this.clickedCircleDraggableRightLimit = this.draggableRightLimit;
      }

      this.updateLineColor();

      if (offsetX > this.clickedCircleDraggableRightLimit)
        offsetX = this.clickedCircleDraggableRightLimit;

      if (offsetX <= this.clickedCircleDraggableLeftLimit)
        offsetX = this.clickedCircleDraggableRightLimit;

      this.renderer.setStyle(
        this.clickedCircle!,
        'transform',
        `translateX(${offsetX}px)`
      );
    });

    this.renderer.listen(document, 'mouseup', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;

      this.isMouseClicked = false;
      let offsetX = event.clientX;

      offsetX = Math.max(this.clickedCircleDraggableLeftLimit, offsetX);
      offsetX = Math.min(this.clickedCircleDraggableRightLimit, offsetX);

      this.moveSlide(offsetX, this.clickedCircle!);

      if (
        this.slideCircleRight.nativeElement.getBoundingClientRect().left <
          this.clickedCircleDraggableRightLimit &&
        !this.attackGraphMode
      ) {
        this.automaticUpdate = false;
      }
    });
  }

  private moveSlide(position: number, circle: HTMLElement) {
    let translatedX = this.calculateSelectedItem(position);
    console.log(
      circle.getBoundingClientRect().left,
      this.clickedCircleDraggableLeftLimit
    );
    if (
      circle == this.slideCircleRight.nativeElement &&
      this.attackGraphMode &&
      circle.getBoundingClientRect().left > this.clickedCircleDraggableLeftLimit
    )
      translatedX =
        translatedX + 136 > this.draggableRightLimit
          ? this.draggableRightLimit
          : translatedX + 136;

    this.renderer.setStyle(circle, 'transform', `translateX(${translatedX}px)`);
    this.updateLineColor();
    this.updateSelectedNotifications();
  }

  private updateSelectedNotifications() {
    const rightRect =
      this.slideCircleRight.nativeElement.getBoundingClientRect();
    const rightCenter = rightRect.left + rightRect.width / 2;
    const rightPosition = this.calculateSelectedItem(rightCenter);
    const rightIndex =
      Math.trunc(rightPosition / 136) + (rightPosition === 0 ? 0 : 1);

    const all = this.notifications.slice(0, rightIndex);

    if (this.attackGraphMode) {
      const leftRect =
        this.slideCircleLeft.nativeElement.getBoundingClientRect();
      const leftCenter = leftRect.left + leftRect.width / 2;
      const leftPosition = this.calculateSelectedItem(leftCenter);
      const leftIndex = Math.trunc(leftPosition / 136);

      this.selectedNotifications = this.notifications.slice(
        leftIndex,
        rightIndex - 1
      );
    } else {
      this.selectedNotifications = all;
    }

    this.tyrManager.updateAlertVisibility(all);
    this.cdRef.detectChanges();
  }

  private calculateSelectedItem(position: number): number {
    const base =
      24 -
      (this.attackGraphMode
        ? this.slideCircleLeft.nativeElement.getBoundingClientRect().width / 2
        : 0);

    if (position < base) return this.attackGraphMode ? base : 0;

    let total = base;
    while (total <= position) total += 136;

    return total - (this.attackGraphMode ? 136 : 88);
  }

  private updateLineColor() {
    const line = this.slideLine.nativeElement as HTMLElement;
    const leftRect = this.slideCircleLeft.nativeElement.getBoundingClientRect();
    const rightRect =
      this.slideCircleRight.nativeElement.getBoundingClientRect();

    const leftCenter = leftRect.left + leftRect.width / 2;
    const rightCenter = rightRect.left + rightRect.width / 2;

    this.renderer.setStyle(line, 'left', `0px`);
    this.renderer.setStyle(line, 'width', `${this.draggableRightLimit}px`);
    this.renderer.setStyle(
      line,
      'background',
      `linear-gradient(to right,
        #343a3e 0px,
        #343a3e ${leftCenter}px,
        ${this.getColor()} ${leftCenter}px,
        ${this.getColor()} ${rightCenter}px,
        #343a3e ${rightCenter}px,
        #343a3e 100%)`
    );
  }

  private updateLineWidth() {
    this.renderer.setStyle(
      this.slideLine.nativeElement,
      'width',
      `${this.draggableRightLimit}px`
    );
  }

  public getColor(): string {
    return this.attackGraphMode ? '#00e6ff' : '#ffa100';
  }

  public onTimelineItemClick(index: number) {
    const notification = this.notifications[index];
    this.tyrManager.assetGraphRenderer.moveAndZoomCameraToNode(
      notification.node
    );
    this.openAssetMenu(notification.node);

    const position = 24 + 136 * index;
    const current =
      this.slideCircleRight.nativeElement.getBoundingClientRect().left;
    if (position < current) return;

    this.moveSlide(position, this.slideCircleRight.nativeElement);
  }

  public addAlert(alert: TyrNotification) {
    this.draggableRightLimit += this.notifications.length > 0 ? 136 : 80;
    this.notifications.push(alert);
    this.cdRef.detectChanges();
    this.updateLineWidth();
    if (this.automaticUpdate) {
      this.moveSlide(
        this.draggableRightLimit,
        this.slideCircleRight.nativeElement
      );
    }
  }

  public addPerformedSuggestion(suggestion: TyrNotification) {
    this.draggableRightLimit += this.notifications.length > 0 ? 136 : 80;
    this.notifications.push(suggestion);
    this.cdRef.detectChanges();
    this.updateLineWidth();
    if (this.automaticUpdate) {
      this.moveSlide(
        this.draggableRightLimit,
        this.slideCircleRight.nativeElement
      );
    }
  }

  public deleteAlert(alert: TyrNotification) {
    this.notifications = this.notifications.filter((a) => a !== alert);
  }

  public toggleAutomaticUpdate() {
    this.automaticUpdate = !this.automaticUpdate;
    if (this.automaticUpdate) {
      this.moveSlide(
        this.draggableRightLimit,
        this.slideCircleRight.nativeElement
      );
    }
  }

  public hoverItem(notification: TyrNotification) {
    this.tyrManager.assetGraphRenderer.highlightNode(notification.node);
  }

  public unhoverItem() {
    this.tyrManager.assetGraphRenderer.unhighlightNodes();
  }
}
