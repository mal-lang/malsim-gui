import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { AssetMenuAlertsComponent } from '../asset-menu-alerts/asset-menu-alerts.component';
import { NgClass, NgIf } from '@angular/common';
import { AssetMenuInformationComponent } from '../asset-menu-information/asset-menu-information.component';
import { CrossComponent } from '../../utils/cross/cross.component';

@Component({
  selector: 'app-asset-menu',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    AssetMenuAlertsComponent,
    AssetMenuInformationComponent,
    CrossComponent,
  ],
  templateUrl: './asset-menu.component.html',
  styleUrl: './asset-menu.component.scss',
})
export class AssetMenuComponent {
  public closed: boolean = true;
  public openedMenu: string = 'information';

  public openMenu(menu: string) {
    this.openedMenu = menu;
  }

  public open() {
    this.closed = false;
  }

  public close() {
    this.closed = true;
  }
}
