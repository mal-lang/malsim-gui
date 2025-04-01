import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import {
  Assets,
  AvailableInitialNodePositioning,
  FillInput,
  Model,
  parseAssetModel,
  TextStyleAlign,
  TextStyleFontWeight,
  Texture,
  TyrGraphClusterRule,
  TyrGraphNode,
  TyrManager,
} from 'tyr-js';

@Component({
  selector: 'app-asset-graph',
  templateUrl: './asset-graph.component.html',
  styleUrl: './asset-graph.component.scss',
})
export class AssetGraphComponent {
  @ViewChild('networkContainerNew') graphContainer!: ElementRef;
  @Input() attackStepMap: any;

  private apiService: ApiService;
  private tyrManager: TyrManager;
  private assetModel: Model;

  networkSprite?: Texture;
  shieldSprite?: Texture;
  connectionRuleSprite?: Texture;
  idSprite?: Texture;
  vulnerabilitySprite?: Texture;
  applicationSprite?: Texture;

  cursorStyle = 'default';

  constructor(apiService: ApiService) {
    this.apiService = apiService;
  }

  async ngOnInit(): Promise<void> {
    await this.loadSprites();
  }

  async loadSprites() {
    const assetUrls = {
      network: '/assets/icons/network.png',
      shield: '/assets/icons/shield.png',
      connectionRule: '/assets/icons/networking.png',
      id: '/assets/icons/id-card.png',
      vulnerability: '/assets/icons/icognito.png',
      application: '/assets/icons/app.png',
    };

    // Step 1: Add assets to the cache
    Assets.add([
      { alias: 'network', src: assetUrls.network },
      { alias: 'shield', src: assetUrls.shield },
      { alias: 'connectionRule', src: assetUrls.connectionRule },
      { alias: 'id', src: assetUrls.id },
      { alias: 'vulnerability', src: assetUrls.vulnerability },
      { alias: 'application', src: assetUrls.application },
    ]);

    // Step 2: Load all assets in parallel
    const [
      networkSprite,
      shieldSprite,
      connectionRuleSprite,
      idSprite,
      vulnerabilitySprite,
      applicationSprite,
    ] = await Promise.all([
      Assets.load('network'),
      Assets.load('shield'),
      Assets.load('connectionRule'),
      Assets.load('id'),
      Assets.load('vulnerability'),
      Assets.load('application'),
    ]);

    // Step 3: Assign them to class properties
    this.networkSprite = networkSprite;
    this.shieldSprite = shieldSprite;
    this.connectionRuleSprite = connectionRuleSprite;
    this.idSprite = idSprite;
    this.vulnerabilitySprite = vulnerabilitySprite;
    this.applicationSprite = applicationSprite;

    console.log('✅ All assets added & loaded successfully!');
  }

  public selectIcon(node: TyrGraphNode): Texture {
    switch (node.type) {
      case 'Network':
        return this.networkSprite!;
      case 'Application':
        return this.applicationSprite!;
      case 'ConnectionRule':
        return this.connectionRuleSprite!;
      case 'Identity':
        return this.idSprite!;
      case 'SoftwareVulnerability':
        return this.vulnerabilitySprite!;
      default:
        return this.shieldSprite!;
    }
  }
}
