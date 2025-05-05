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
import {
  TyrAssetGraphNode,
  TyrAttackStep,
  TyrManager,
  TyrNotification,
} from 'tyr-js';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent {
  @Input() tyrManager: TyrManager;
  @Input() openAssetMenu: (node: TyrAssetGraphNode) => void;
  @Input() updateAttackGraph: (attackSteps: TyrAttackStep[]) => void;
  @Input() attackGraphMode: boolean;

  @ViewChild('slideCircleLeft') private slideCircleLeft!: ElementRef;
  @ViewChild('slideCircleRight') private slideCircleRight!: ElementRef;
  @ViewChild('slideLine') private slideLine!: ElementRef;
  @ViewChild('timeline') private timeline!: ElementRef;
  @ViewChild('timelineWindow') private timelineWindow!: ElementRef;

  private isMouseClicked = false;
  private isWindowClicked = false;
  private draggableLeftLimit = 0;
  private draggableRightLimit = 0;
  private clickedCircleDraggableLeftLimit = 0;
  private clickedCircleDraggableRightLimit = 0;
  private clickedCircle: HTMLElement | null = null;

  private marginLeft: number = 24;
  private itemWidth: number = 128;
  private gap: number = 8;
  private halfDistance: number = 68;
  private windowDifference: number = 0;

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

    let leftPos = leftEl.getBoundingClientRect().left;
    let rightPos = rightEl.getBoundingClientRect().left;

    if (!this.attackGraphMode) {
      //Set automatic update to true when jumping back to asset graph mode
      this.automaticUpdate = true;
      //Move slide left to the left of the slide when in asset graph mode
      leftEl.style.transform = `translateX(${this.draggableLeftLimit}px)`;
      this.renderer.setStyle(this.timelineWindow.nativeElement, 'width', `0px`);
    } else {
      this.automaticUpdate = false;

      //Move the right slide half an item width to the right, since the braking point now is at the end of the item and not the middle
      if (rightPos > 0) {
        rightPos +=
          this.halfDistance - rightEl.getBoundingClientRect().width / 2;
        rightEl.style.transform = `translateX(${rightPos}px)`;
      }

      //Move the left one to form a one item width window
      leftPos =
        rightPos -
        this.itemWidth -
        this.gap +
        rightEl.getBoundingClientRect().width;
      leftEl.style.transform = `translateX(${leftPos}px)`;
    }

    //Expand the limit to the right half an item, or shrink it depending on the mode
    if (this.draggableRightLimit > 0)
      this.draggableRightLimit +=
        this.halfDistance * (this.attackGraphMode ? 1 : -1);

    //Update slide
    this.updateLineWidth();
    this.updateLineColor(leftPos, rightPos);
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

    this.renderer.listen(
      this.timelineWindow.nativeElement,
      'mousedown',
      (event: MouseEvent) => {
        this.isMouseClicked = true;
        this.isWindowClicked = true;
        this.windowDifference =
          event.clientX -
          this.slideCircleLeft.nativeElement.getBoundingClientRect().left;
      }
    );

    this.renderer.listen(document, 'mousemove', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;
      const container = this.timeline.nativeElement as HTMLElement;
      const slideLeftEl = this.slideCircleLeft.nativeElement as HTMLElement;
      const slideRightEl = this.slideCircleRight.nativeElement as HTMLElement;
      const windowEl = this.timelineWindow.nativeElement as HTMLElement;

      const posLeft = slideLeftEl.getBoundingClientRect().left;
      const posRight = slideRightEl.getBoundingClientRect().left;
      const windowWidth = windowEl.getBoundingClientRect().width;

      let offsetX = event.clientX + container.scrollLeft;
      const diff = event.clientX - posLeft;

      if (this.isWindowClicked) {
        // Always subtract current difference to get base offset
        offsetX -= this.windowDifference;

        // Update difference only when moving into limit zones
        if (
          posLeft <= this.draggableLeftLimit + this.gap &&
          diff > this.windowDifference
        ) {
          this.windowDifference = diff;
        }

        if (
          posRight >= this.draggableRightLimit &&
          diff < this.windowDifference
        ) {
          this.windowDifference = diff > 0 ? diff : 0;
        }

        const minOffset =
          this.draggableLeftLimit +
          this.gap +
          slideLeftEl.getBoundingClientRect().width / 2;
        const maxOffset = this.draggableRightLimit - windowWidth;

        offsetX = Math.max(offsetX, minOffset);
        offsetX = Math.min(offsetX, maxOffset);

        this.renderer.setStyle(
          slideLeftEl,
          'transform',
          `translateX(${offsetX}px)`
        );
        this.renderer.setStyle(
          slideRightEl,
          'transform',
          `translateX(${offsetX + windowWidth}px)`
        );

        this.updateLineColor();
      }

      if (this.clickedCircle) {
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
      }
    });

    this.renderer.listen(document, 'mouseup', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;

      if (this.isWindowClicked) {
        this.isWindowClicked = false;
        const slideLeftEl = this.slideCircleLeft.nativeElement as HTMLElement;
        const windowEl = this.timelineWindow.nativeElement as HTMLElement;

        const posLeft = slideLeftEl.getBoundingClientRect().left;
        const windowWidth = windowEl.getBoundingClientRect().width;
        let offsetX = posLeft;

        this.clickedCircleDraggableLeftLimit = this.draggableLeftLimit;
        this.clickedCircleDraggableRightLimit =
          this.draggableRightLimit - windowWidth;
        this.moveSlide(offsetX, this.slideCircleLeft.nativeElement);

        this.clickedCircleDraggableLeftLimit =
          this.draggableLeftLimit + windowWidth;
        this.clickedCircleDraggableRightLimit = this.draggableRightLimit;
        this.moveSlide(
          slideLeftEl.getBoundingClientRect().left + windowWidth,
          this.slideCircleRight.nativeElement
        );
        this.isWindowClicked = false;
        this.windowDifference = 0;
      }

      if (this.clickedCircle) {
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
        this.clickedCircle = null;
      }
    });
  }

  private moveSlide(position: number, circle: HTMLElement) {
    let translatedX = this.calculateSelectedItem(position);
    if (circle == this.slideCircleRight.nativeElement && this.attackGraphMode) {
      if (
        circle.getBoundingClientRect().left >
        this.clickedCircleDraggableLeftLimit
      )
        translatedX =
          translatedX + this.itemWidth > this.draggableRightLimit
            ? this.draggableRightLimit
            : translatedX + this.itemWidth;
      if (
        circle.getBoundingClientRect().left <=
        this.clickedCircleDraggableLeftLimit
      )
        translatedX =
          this.slideCircleLeft.nativeElement.getBoundingClientRect().left +
          this.itemWidth +
          this.gap;
    }

    if (this.isWindowClicked) {
      if (circle == this.slideCircleLeft.nativeElement) {
      } else {
      }
    }

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

      const attackSteps = this.selectedNotifications
        .map((n) => n.attackStep)
        .filter((step): step is NonNullable<typeof step> => step !== undefined);

      this.updateAttackGraph(attackSteps);
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

  private updateLineColor(leftPos?: number, rightPos?: number) {
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
        #343a3e ${leftPos ?? leftCenter + container.scrollLeft}px,
        ${this.getColor()} ${leftPos ?? leftCenter + container.scrollLeft}px,
        ${this.getColor()} ${rightPos ?? rightCenter + container.scrollLeft}px,
        #343a3e ${rightPos ?? rightCenter + container.scrollLeft}px,
        #343a3e ${this.draggableRightLimit}px)`
    );

    const window = this.timelineWindow.nativeElement as HTMLElement;
    this.renderer.setStyle(
      window,
      'left',
      `${leftCenter + container.scrollLeft}px`
    );
    this.renderer.setStyle(window, 'width', `${rightCenter - leftCenter}px`);
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

  public setSlideOnStep(attackStep: TyrAttackStep) {
    const index = this.notifications.findIndex((n) => {
      if (!n.attackStep) return;
      return n.attackStep.id === attackStep.id;
    });
    if (index == -1) return;
    const pos = (index + 1) * (this.itemWidth + this.gap);
    this.moveSlide(pos, this.slideCircleRight.nativeElement);
  }
}
