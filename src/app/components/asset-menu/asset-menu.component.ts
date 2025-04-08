import { Component } from '@angular/core';
import { AssetMenuInformationComponent } from '../asset-menu-information/asset-menu-information.component';

@Component({
  selector: 'app-asset-menu',
  standalone: true,
  imports: [AssetMenuInformationComponent],
  templateUrl: './asset-menu.component.html',
  styleUrl: './asset-menu.component.scss',
})
export class AssetMenuComponent {}
