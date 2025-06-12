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

/**
 * TimelineComponent is the component where all the performed activity (attack and defenses) are displayed in chronological order.
 */
export class TimelineComponent {
  @Input() tyrManager: TyrManager;
  @Input() openAssetMenu: (node: TyrAssetGraphNode) => void;
  @Input() displayAttackGraph: (attackSteps: TyrAttackStep[]) => void;
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
  private settingAttackGraph: boolean = false;

  private colorAssetGraphMode: string = '#ffa100';
  private colorAttackGraphMode: string = '#00e6ff';

  public notifications: TyrNotification[] = [];
  public selectedNotifications: TyrNotification[] = [];
  public automaticUpdate = true;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['attackGraphMode']) return;
    if (!this.slideCircleRight) return;

    const circle = this.slideCircleRight.nativeElement as HTMLElement;
    const leftEl = this.slideCircleLeft.nativeElement as HTMLElement;
    const rightEl = this.slideCircleRight.nativeElement as HTMLElement;
    const container = this.timeline.nativeElement as HTMLElement;

    let leftPos = leftEl.getBoundingClientRect().left + container.scrollLeft;
    let rightPos = rightEl.getBoundingClientRect().left + container.scrollLeft;

    if (!this.attackGraphMode) {
      //Set automatic update to true when jumping back to asset graph mode
      this.automaticUpdate = true;
      //Move slide left to the left of the slide when in asset graph mode
      leftPos = 0;
      this.moveSlide(0, leftEl);
      this.renderer.setStyle(this.timelineWindow.nativeElement, 'width', `0px`);
    } else {
      this.automaticUpdate = false;
      this.settingAttackGraph = true;

      this.moveSlide(rightPos, this.slideCircleLeft.nativeElement);

      rightPos += this.halfDistance;
    }

    //Expand the limit to the right half an item, or shrink it depending on the mode
    if (this.draggableRightLimit > 0)
      this.draggableRightLimit +=
        this.halfDistance * (this.attackGraphMode ? 1 : -1);

    //Update slide
    this.updateLineWidth();
    this.updateLineColor(leftPos, rightPos);
    this.updateSelectedNotifications();

    this.moveSlide(rightPos, circle);
    this.settingAttackGraph = false;
  }

  /**
   * When the component is first renderer, all the event listeners are set.
   */
  ngAfterViewInit() {
    //Sets original position and paints the component accordingly
    const start = 0;
    this.draggableLeftLimit = start;
    this.draggableRightLimit = start;

    this.renderer.setStyle(
      this.slideCircleRight.nativeElement,
      'transform',
      `translateX(${start}px)`
    );
    this.updateLineColor();

    //On mouse press - left circle (for both modes)
    this.renderer.listen(
      this.slideCircleLeft.nativeElement,
      'mousedown',
      () => {
        this.isMouseClicked = true;
        this.clickedCircle = this.slideCircleLeft.nativeElement;
      }
    );

    //On mouse press - right circle (for attack graph mode)
    this.renderer.listen(
      this.slideCircleRight.nativeElement,
      'mousedown',
      () => {
        this.isMouseClicked = true;
        this.clickedCircle = this.slideCircleRight.nativeElement;
      }
    );

    //On mouse press - timeline window (for attack graph mode)
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

    //On mouse move - ony triggers if the mouse is pressed
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
            rightEl.getBoundingClientRect().left +
            container.scrollLeft -
            this.halfDistance;
          this.clickedCircleDraggableLeftLimit = this.draggableLeftLimit;
        } else {
          this.clickedCircleDraggableLeftLimit = this.attackGraphMode
            ? leftEl.getBoundingClientRect().left +
              container.scrollLeft +
              this.halfDistance
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

    //On mouse release
    this.renderer.listen(document, 'mouseup', (event: MouseEvent) => {
      if (!this.isMouseClicked) return;
      const container = this.timeline.nativeElement as HTMLElement;

      if (this.isWindowClicked) {
        this.isWindowClicked = false;
        const slideLeftEl = this.slideCircleLeft.nativeElement as HTMLElement;
        const windowEl = this.timelineWindow.nativeElement as HTMLElement;

        const posLeft = slideLeftEl.getBoundingClientRect().left;
        const windowWidth = windowEl.getBoundingClientRect().width;
        let offsetX = posLeft + container.scrollLeft;

        this.clickedCircleDraggableLeftLimit = this.draggableLeftLimit;
        this.clickedCircleDraggableRightLimit =
          this.draggableRightLimit - windowWidth;
        this.moveSlide(offsetX, this.slideCircleLeft.nativeElement);

        this.clickedCircleDraggableLeftLimit =
          this.draggableLeftLimit + windowWidth - container.scrollLeft;
        this.clickedCircleDraggableRightLimit = this.draggableRightLimit;
        this.moveSlide(
          offsetX + windowWidth - this.itemWidth,
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

  /**
   * Moves the slide circle to the desired position
   *
   * @param {number} position - The position (the notification number to move the circle to).
   * @param {HTMLElement} circle - The HTML element of the circle to be moved (left or right).
   */
  private moveSlide(position: number, circle: HTMLElement) {
    //Gets the target X position from the passed position number. It is calculated with the notifications width and the gaps between them
    let translatedX = this.calculateSelectedItem(position);
    const container = this.timeline.nativeElement as HTMLElement;

    //If its the right circle to move, we need to check its position and check it doesnt exceed the delimited limits -> clickedCircleDraggableLeftLimit (left) & clickedCircleDraggableLeftLimit (right)
    if (circle == this.slideCircleRight.nativeElement && this.attackGraphMode) {
      //Check for right-most limit, and set it instead if translatedX + width exceeds it
      if (
        circle.getBoundingClientRect().left + container.scrollLeft >
        this.clickedCircleDraggableLeftLimit
      )
        translatedX =
          translatedX + this.itemWidth > this.draggableRightLimit
            ? this.draggableRightLimit
            : translatedX + this.itemWidth;

      //Check for left-most limit (in this case, the left circle), and set it instead if translatedX is less than it. ItemWidth is added to allow for a small gap between both circles, so they never touch.
      if (
        circle.getBoundingClientRect().left + container.scrollLeft <=
        this.clickedCircleDraggableLeftLimit
      ) {
        translatedX =
          this.slideCircleLeft.nativeElement.getBoundingClientRect().left +
          container.scrollLeft +
          this.itemWidth;
      }
    }

    //Set the new position, and update the painted section and the selected notifications
    this.renderer.setStyle(circle, 'transform', `translateX(${translatedX}px)`);
    this.updateLineColor();
    this.updateSelectedNotifications();
  }

  /**
   * Calculates which notifications are selected in the timeline, and marks them as selected so they get highlighted.
   */
  private updateSelectedNotifications() {
    //Calculate right circle position
    const container = this.timeline.nativeElement as HTMLElement;
    const rightRect =
      this.slideCircleRight.nativeElement.getBoundingClientRect();
    const rightCenter = rightRect.left + container.scrollLeft;
    const rightPosition = this.calculateSelectedItem(rightCenter);
    const rightIndex =
      Math.trunc(rightPosition / (this.itemWidth + this.gap)) +
      (this.attackGraphMode ? 2 : 1);

    //If asset graph mode, all notifications from 0, up until the circle position (rightIndex) are selected

    let all = this.notifications.slice(0, rightIndex);

    if (rightPosition === 0) all = []; //Empty if nothing selected

    //If attack graph mode, all notifications in between the left and right circle are selected instead
    if (this.attackGraphMode) {
      //Calculate left circle position
      const leftRect =
        this.slideCircleLeft.nativeElement.getBoundingClientRect();
      const leftCenter = leftRect.left + container.scrollLeft;
      const leftPosition = this.calculateSelectedItem(leftCenter);
      const leftIndex = Math.trunc(leftPosition / (this.itemWidth + this.gap));

      //Get selected notifications from left circle to right circle
      this.selectedNotifications = this.notifications.slice(
        leftIndex,
        rightIndex - 1
      );

      //Update the attack graph with these new selected alerts -> only happens because we are in attack graph mode
      const attackSteps = this.selectedNotifications
        .map((n) => n.attackStep)
        .filter((step): step is NonNullable<typeof step> => step !== undefined);

      if (!this.settingAttackGraph) this.displayAttackGraph(attackSteps);
    } else {
      this.selectedNotifications = all;
    }

    //Updates the alert visibility in the tyr-js
    this.tyrManager.updateAlertVisibility(all);
    this.cdRef.detectChanges();
  }

  /**
   * Returns the X position of the item passed, based on its position in the array.
   *
   * @param {number} position - The position of the item in the array.
   * @return {number} The position of the selected icon relative to their width
   */
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

  /**
   * Paints the timeline orange or blue (depending on the mode), from the leftPos to the rightPos.
   *
   * @param {number} leftPos (Optional) - Where to start painting the timeline.
   * @param {number} rightPos (Optional) - Where to stop painting the timeline.
   */
  private updateLineColor(leftPos?: number, rightPos?: number) {
    const container = this.timeline.nativeElement as HTMLElement;
    const line = this.slideLine.nativeElement as HTMLElement;
    const leftRect = this.slideCircleLeft.nativeElement.getBoundingClientRect();
    const rightRect =
      this.slideCircleRight.nativeElement.getBoundingClientRect();

    const leftCenter = leftRect.left + leftRect.width / 2;
    const rightCenter = rightRect.left + rightRect.width / 2;

    const left = this.attackGraphMode ? leftCenter + container.scrollLeft : 0;

    this.renderer.setStyle(line, 'left', `0px`);
    this.renderer.setStyle(line, 'width', `${this.draggableRightLimit}px`);
    this.renderer.setStyle(
      line,
      'background',
      `linear-gradient(to right,
        #343a3e 0px,
        #343a3e ${leftPos ?? left}px,
        ${this.getColor()} ${leftPos ?? left}px,
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

  /**
   * Updates the timeline width depending on the timeline's right limit, which is calculated from the number of alerts that have been received
   */
  private updateLineWidth() {
    this.renderer.setStyle(
      this.slideLine.nativeElement,
      'width',
      `${this.draggableRightLimit}px`
    );
  }

  /**
   * Gets the right color depending on the mode the timeline is in.
   */
  public getColor(): string {
    return this.attackGraphMode
      ? this.colorAttackGraphMode
      : this.colorAssetGraphMode;
  }

  /**
   * It performes different actions when an item in the timeline is clicked:
   *
   * + Opens the asset menu
   * + Moves the timeline to that item
   * + Move the asset graph camera to the node (only in asset graph mode)
   *
   * @param {number} index -
   */
  public onTimelineItemClick(index: number) {
    const notification = this.notifications[index];

    if (!this.attackGraphMode) {
      this.tyrManager.assetGraphRenderer.moveAndZoomCameraToNode(
        notification.node
      );
      this.notifications.forEach((n) => (n.node.style.selected = false));
      notification.node.style.selected = true;
    }

    this.openAssetMenu(notification.node);

    const position = this.marginLeft + (this.itemWidth + this.gap) * index;

    this.moveSlide(position, this.slideCircleRight.nativeElement);
    this.moveSlide(position, this.slideCircleLeft.nativeElement);
  }

  /**
   * Adds an alert to the timeline, rendering it and updating its width and limits.
   *
   * @param {TyrNotification} alert - The alert to be added.
   */
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

  /**
   * Adds a suggestion to the timeline, rendering it and updating its width and limits.
   *
   * @param {TyrNotification} suggestion - The suggestion to be added.
   */
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

  /**
   * Deletes the passed alert from the timeline
   *
   * @param {TyrNotification} alert - The suggestion to be deleted.
   */
  public deleteAlert(alert: TyrNotification) {
    this.notifications = this.notifications.filter((a) => a !== alert);
  }

  /**
   * Activates the automatic update, which will move the circles automatically to include any alert received
   */
  public toggleAutomaticUpdate() {
    this.automaticUpdate = !this.automaticUpdate;
    if (this.automaticUpdate) {
      this.moveSlide(
        this.draggableRightLimit,
        this.slideCircleRight.nativeElement
      );
    }
  }

  /**
   * Tells TyrJS to highlight (in the asset graph) the asset related to the timeline item that is being hovered
   *
   * @param {TyrNotification} notification - The alert whose asset will be highlighted.
   */
  public hoverItem(notification: TyrNotification) {
    this.tyrManager.assetGraphRenderer.highlightNode(notification.node);
  }

  /**
   * Tells TyrJS to unhighlight all nodes from the asset graph
   */
  public unhoverItem() {
    this.tyrManager.assetGraphRenderer.unhighlightNodes();
  }

  /**
   * Finds the attack step and sets the timeline to select it.
   *
   * @param {TyrAttackStep} attackStep - The attack step to be selected.
   */
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
