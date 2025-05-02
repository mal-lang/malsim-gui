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
  @ViewChild('timeline') private timeline!: ElementRef;

  private isMouseClicked = false;
  private draggableLeftLimit = 0;
  private draggableRightLimit = 0;
  private clickedCircleDraggableLeftLimit = 0;
  private clickedCircleDraggableRightLimit = 0;
  private clickedCircle: HTMLElement | null = null;

  private marginLeft: number = 24;
  private itemWidth: number = 128;
  private gap: number = 8;
  private halfDistance: number = 68;

  public notifications: TyrNotification[] = [];
  public selectedNotifications: TyrNotification[] = [];
  public automaticUpdate = true;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['attackGraphMode']) return;
    if (!this.slideCircleRight) return;

    const leftEl = this.slideCircleLeft.nativeElement;
    const rightEl = this.slideCircleRight.nativeElement;
    const container = this.timeline.nativeElement as HTMLElement;

    if (!this.attackGraphMode) {
      leftEl.style.transform = `translateX(${
        this.draggableLeftLimit - container.scrollLeft
      }px)`;
    } else {
      if (leftEl.getBoundingClientRect().left - container.scrollLeft == 0) {
        leftEl.style.transform = `translateX(${
          this.marginLeft - rightEl.getBoundingClientRect().width / 2
        }px)`;
      }
      if (rightEl.getBoundingClientRect().left > 0) {
        rightEl.style.transform = `translateX(${
          rightEl.getBoundingClientRect().left +
          container.scrollLeft +
          this.halfDistance -
          rightEl.getBoundingClientRect().width / 2
        }px)`;
      }
    }

    if (this.draggableRightLimit > 0)
      this.draggableRightLimit +=
        this.halfDistance * (this.attackGraphMode ? 1 : -1);

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

      const container = this.timeline.nativeElement as HTMLElement;
      let offsetX = event.clientX + container.scrollLeft;

      const leftEl = this.slideCircleLeft.nativeElement;
      const rightEl = this.slideCircleRight.nativeElement;

      if (this.clickedCircle === leftEl) {
        this.clickedCircleDraggableRightLimit =
          rightEl.getBoundingClientRect().left - this.halfDistance;
        this.clickedCircleDraggableLeftLimit = this.draggableLeftLimit;
      } else {
        this.clickedCircleDraggableLeftLimit = this.attackGraphMode
          ? leftEl.getBoundingClientRect().left + this.halfDistance
          : this.draggableLeftLimit;
        this.clickedCircleDraggableRightLimit = this.draggableRightLimit;
      }

      this.updateLineColor();

      if (offsetX > this.clickedCircleDraggableRightLimit)
        offsetX = this.clickedCircleDraggableRightLimit;

      if (offsetX <= this.clickedCircleDraggableLeftLimit)
        offsetX = this.clickedCircleDraggableLeftLimit;

      this.renderer.setStyle(
        this.clickedCircle!,
        'transform',
        `translateX(${offsetX}px)`
      );
    });

    this.renderer.listen(document, 'mouseup', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;

      this.isMouseClicked = false;
      const container = this.timeline.nativeElement as HTMLElement;
      let offsetX = event.clientX + container.scrollLeft;

      offsetX = Math.max(this.clickedCircleDraggableLeftLimit, offsetX);
      offsetX = Math.min(this.clickedCircleDraggableRightLimit, offsetX);

      this.moveSlide(
        offsetX -
          this.slideCircleRight.nativeElement.getBoundingClientRect().width,
        this.clickedCircle!
      );

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
    if (
      circle == this.slideCircleRight.nativeElement &&
      this.attackGraphMode &&
      circle.getBoundingClientRect().left > this.clickedCircleDraggableLeftLimit
    )
      translatedX =
        translatedX + this.itemWidth > this.draggableRightLimit
          ? this.draggableRightLimit
          : translatedX + this.itemWidth;

    if (
      circle == this.slideCircleRight.nativeElement &&
      this.attackGraphMode &&
      circle.getBoundingClientRect().left <=
        this.clickedCircleDraggableLeftLimit
    )
      translatedX =
        this.slideCircleLeft.nativeElement.getBoundingClientRect().left +
        this.itemWidth +
        this.gap;
    this.renderer.setStyle(circle, 'transform', `translateX(${translatedX}px)`);
    this.updateLineColor();
    this.updateSelectedNotifications();
  }

  private updateSelectedNotifications() {
    const container = this.timeline.nativeElement as HTMLElement;
    const rightRect =
      this.slideCircleRight.nativeElement.getBoundingClientRect();
    const rightCenter = rightRect.left + container.scrollLeft;
    const rightPosition = this.calculateSelectedItem(rightCenter);
    const rightIndex =
      Math.trunc(rightPosition / (this.itemWidth + this.gap)) +
      (this.attackGraphMode ? 2 : 1);

    const all = this.notifications.slice(0, rightIndex);

    if (this.attackGraphMode) {
      const leftRect =
        this.slideCircleLeft.nativeElement.getBoundingClientRect();
      const leftCenter = leftRect.left + container.scrollLeft;
      const leftPosition = this.calculateSelectedItem(leftCenter);
      const leftIndex = Math.trunc(leftPosition / (this.itemWidth + this.gap));

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
      this.marginLeft -
      this.slideCircleLeft.nativeElement.getBoundingClientRect().width / 2;

    if (position < base) return this.attackGraphMode ? 0 : 0;

    let total = base;
    while (total <= position) total += this.itemWidth + this.gap;

    return (
      total -
      (this.attackGraphMode
        ? this.itemWidth + this.gap
        : this.halfDistance +
          this.slideCircleRight.nativeElement.getBoundingClientRect().width)
    );
  }

  private updateLineColor() {
    const container = this.timeline.nativeElement as HTMLElement;
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
        #343a3e ${leftCenter + container.scrollLeft}px,
        ${this.getColor()} ${leftCenter + container.scrollLeft}px,
        ${this.getColor()} ${rightCenter + container.scrollLeft}px,
        #343a3e ${rightCenter + container.scrollLeft}px,
        #343a3e ${this.draggableRightLimit}px)`
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

    const position = this.marginLeft + (this.itemWidth + this.gap) * index;
    const current =
      this.slideCircleRight.nativeElement.getBoundingClientRect().left;
    if (position < current) return;

    this.moveSlide(position, this.slideCircleRight.nativeElement);
  }

  public addAlert(alert: TyrNotification) {
    const container = this.timeline.nativeElement as HTMLElement;
    this.draggableRightLimit +=
      container.scrollLeft + this.notifications.length > 0
        ? this.itemWidth + this.gap
        : this.itemWidth / 2 + this.marginLeft;
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
    const container = this.timeline.nativeElement as HTMLElement;
    this.draggableRightLimit +=
      container.scrollLeft + this.notifications.length > 0
        ? this.itemWidth + this.gap
        : this.itemWidth / 2 + this.marginLeft;
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
