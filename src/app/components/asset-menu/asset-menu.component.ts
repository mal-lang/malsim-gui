import { Component } from '@angular/core';
import { AssetMenuAlertsComponent } from '../asset-menu-alerts/asset-menu-alerts.component';
import { NgClass, NgIf } from '@angular/common';
import { AssetMenuInformationComponent } from '../asset-menu-information/asset-menu-information.component';

@Component({
  selector: 'app-asset-menu',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    AssetMenuAlertsComponent,
    AssetMenuInformationComponent,
  ],
  templateUrl: './asset-menu.component.html',
  styleUrl: './asset-menu.component.scss',
})
export class AssetMenuComponent {
  public openedMenu: string = 'information';

  public openMenu(menu: string) {
    this.openedMenu = menu;
  }
}
