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
  TyrGraphNode,
  TyrManager,
  TyrNotification,
  TyrNotificationType,
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
  @Input() attackGraphMode: boolean;
  @ViewChild('slideCircleLeft') private slideCircleLeft!: ElementRef;
  @ViewChild('slideCircleRight') private slideCircleRight!: ElementRef;
  @ViewChild('slideLine') private slideLine!: ElementRef;

  private isMouseClicked: Boolean;
  private draggableLeftLimit: number;
  private draggableRightLimit: number;
  private clickedCircleDraggableLeftLimit: number;
  private clickedCircleDraggableRightLimit: number;
  private clickedCircle: HTMLElement | null;

  public notifications: TyrNotification[];
  public selectedNotifications: TyrNotification[];
  public automaticUpdate: boolean;

  constructor(private renderer: Renderer2, private cdRef: ChangeDetectorRef) {
    this.notifications = [];
    this.isMouseClicked = false;
    this.draggableRightLimit = 0;
    this.draggableLeftLimit = 0;
    this.clickedCircleDraggableRightLimit = 0;
    this.clickedCircleDraggableLeftLimit = 0;
    this.automaticUpdate = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['attackGraphMode']) {
      //Update color
      if (!this.slideCircleRight) return;
      if (!this.attackGraphMode) {
        this.slideCircleLeft.nativeElement.style.transform = `translateX(${this.draggableLeftLimit}px)`;
        this.updateLineColor();
      }
      const circle = this.slideCircleRight.nativeElement as HTMLElement;
      this.moveSlide(
        circle.getBoundingClientRect().left,
        this.slideCircleRight.nativeElement
      );
    }
  }

  ngAfterViewInit() {
    const startPosition = 0;
    this.draggableLeftLimit = startPosition;
    this.draggableRightLimit = startPosition;
    this.renderer.setStyle(
      this.slideCircleRight.nativeElement,
      'transform',
      `translateX(${startPosition}px)`
    );
    this.updateLineColor();

    this.renderer.listen(
      this.slideCircleLeft.nativeElement,
      'mousedown',
      () => {
        this.isMouseClicked = true;
        this.clickedCircle = this.slideCircleLeft.nativeElement;
        console.log('ITS ME!');
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
      const offsetX = event.clientX;

      //Get limits depending on moving circle
      this.clickedCircleDraggableRightLimit = this.draggableRightLimit;
      this.clickedCircleDraggableLeftLimit = this.draggableLeftLimit;
      if (this.clickedCircle === this.slideCircleLeft.nativeElement) {
        this.clickedCircleDraggableRightLimit =
          this.slideCircleRight.nativeElement.getBoundingClientRect().right -
          88;
        this.clickedCircleDraggableLeftLimit = this.draggableLeftLimit;
      } else {
        if (this.attackGraphMode)
          this.clickedCircleDraggableLeftLimit =
            this.slideCircleLeft.nativeElement.getBoundingClientRect().right +
            88;
        else this.clickedCircleDraggableLeftLimit = this.draggableLeftLimit;
        this.clickedCircleDraggableRightLimit = this.draggableRightLimit;
      }
      if (offsetX > this.clickedCircleDraggableRightLimit) return;
      if (offsetX <= this.clickedCircleDraggableLeftLimit) return;
      this.updateLineColor();
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
      if (offsetX > this.clickedCircleDraggableRightLimit)
        offsetX = this.clickedCircleDraggableRightLimit;
      if (offsetX <= this.clickedCircleDraggableLeftLimit)
        offsetX = this.clickedCircleDraggableLeftLimit;
      this.moveSlide(offsetX, this.clickedCircle!);

      if (
        this.slideCircleRight.nativeElement.getBoundingClientRect().left <
        this.clickedCircleDraggableRightLimit
      )
        this.automaticUpdate = false;
    });
  }

  private moveSlide(slidePosition: number, circle: HTMLElement) {
    const position = this.calculateSelectedItem(slidePosition);
    this.renderer.setStyle(circle, 'transform', `translateX(${position}px)`);
    this.updateLineColor();
    this.updateSelectedNotifications();
  }

  private updateSelectedNotifications() {
    let notifications: TyrNotification[] = [];
    let attackGraphAlerts: TyrNotification[] = [];

    const rightRect =
      this.slideCircleRight.nativeElement.getBoundingClientRect();
    const rightCenter =
      rightRect.left == 0 ? 0 : rightRect.left + rightRect.width / 2;
    const rightPosition = this.calculateSelectedItem(rightCenter);
    const rightAlertPosition =
      Math.trunc(rightPosition / 136) + (rightPosition == 0 ? 0 : 1);

    notifications = this.notifications.slice(0, rightAlertPosition);

    if (this.attackGraphMode) {
      const leftRect =
        this.slideCircleLeft.nativeElement.getBoundingClientRect();
      const leftCenter =
        leftRect.left == 0 ? 0 : leftRect.left + leftRect.width / 2;
      const leftPosition = this.calculateSelectedItem(leftCenter);
      const leftAlertPosition =
        Math.trunc(leftPosition / 136) + (leftPosition == 0 ? 0 : 1);

      attackGraphAlerts = this.notifications.slice(
        leftAlertPosition,
        rightAlertPosition
      );

      this.selectedNotifications = attackGraphAlerts;
    } else this.selectedNotifications = notifications;

    this.tyrManager.updateAlertVisibility(notifications);

    this.cdRef.detectChanges();
  }

  private calculateSelectedItem(position: number) {
    if (position < 24) {
      return 0;
    }

    let aux = 24;
    for (let i = 0; aux <= position; i++) {
      aux += 136;
    }

    return aux - 88;
  }

  private updateLineColor() {
    const line = this.slideLine.nativeElement as HTMLElement;
    const leftRect = this.slideCircleLeft.nativeElement.getBoundingClientRect();
    const rightRect =
      this.slideCircleRight.nativeElement.getBoundingClientRect();

    const leftCenter =
      leftRect.left == 0 ? 0 : leftRect.left + leftRect.width / 2;
    const rightCenter = rightRect.left + rightRect.width / 2;
    console.log(leftCenter);
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
    const line = this.slideLine.nativeElement as HTMLElement;
    this.renderer.setStyle(line, 'width', `${this.draggableRightLimit}px`);
  }

  public getColor() {
    if (this.attackGraphMode) return '#00e6ff';
    return '#ffa100';
  }

  public onTimelineItemClick(itemPosition: number) {
    this.tyrManager.assetGraphRenderer.moveAndZoomCameraToNode(
      this.notifications[itemPosition].node
    );
    this.openAssetMenu(this.notifications[itemPosition].node);
    const element = this.slideCircleRight.nativeElement;
    const position = 24 + 136 * itemPosition;

    //Only move scroll if the clicked item is further in the timeline
    if (position < element.getBoundingClientRect().left) return;
    this.moveSlide(position, this.slideCircleRight.nativeElement);
  }

  public addAlert(alert: TyrNotification) {
    if (this.notifications.length > 0)
      this.draggableRightLimit += 136; //128px of item width + 8px of gap +
    else this.draggableRightLimit += 80;

    this.notifications.push(alert);
    this.cdRef.detectChanges();
    this.updateLineWidth();

    if (!this.automaticUpdate) return;
    this.moveSlide(
      this.draggableRightLimit,
      this.slideCircleRight.nativeElement
    );
  }

  public addPerformedSuggestion(suggestion: TyrNotification) {
    if (this.notifications.length > 0)
      this.draggableRightLimit += 136; //128px of item width + 8px of gap +
    else this.draggableRightLimit += 80;

    this.notifications.push(suggestion);
    this.cdRef.detectChanges();
    this.updateLineWidth();

    if (!this.automaticUpdate) return;
    this.moveSlide(
      this.draggableRightLimit,
      this.slideCircleRight.nativeElement
    );
  }

  public deleteAlert(alert: TyrNotification) {
    this.notifications = this.notifications.filter((a) => a === alert);
  }

  public toggleAutomaticUpdate() {
    this.automaticUpdate = !this.automaticUpdate;
    if (this.automaticUpdate)
      this.moveSlide(
        this.draggableRightLimit,
        this.slideCircleRight.nativeElement
      );
  }

  public hoverItem(notification: TyrNotification) {
    this.tyrManager.assetGraphRenderer.highlightNode(notification.node);
  }

  public unhoverItem() {
    this.tyrManager.assetGraphRenderer.unhighlightNodes();
  }
}
