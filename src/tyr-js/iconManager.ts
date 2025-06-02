import {
  Assets,
  AttackGraphSprite,
  ColorMatrixFilter,
  Sprite,
  Texture,
  TyrAlertStatus,
  TyrAssetGraphNodeStatus,
  TyrAttackStep,
} from 'tyr-js';

export interface AssetIcons {
  networkSprite: Texture;
  shieldSprite: Texture;
  connectionRuleSprite: Texture;
  idSprite: Texture;
  vulnerabilitySprite: Texture;
  applicationSprite: Texture;
}

export interface AssetStatusIcons {
  alertSprite: Texture;
  controlledSprite: Texture;
  inactiveSprite: Texture;
  disconnectedSprite: Texture;
}

export interface AttackStepsStatusIcons {
  bulbSprite: Texture;
  checkSprite: Texture;
  warningSprite: Texture;
  eyeSprite: Texture;
}

export class IconManager {
  public assetIcons: AssetIcons;
  public assetStatusIcons: AssetStatusIcons;
  public attackStepsStatusIcons: AttackStepsStatusIcons;
  suggestedActions: any;

  constructor() {
    this.getAssetIcon = this.getAssetIcon.bind(this);
    this.getNodeStatusIcon = this.getNodeStatusIcon.bind(this);
    this.selectAlertIcon = this.selectAlertIcon.bind(this);
    this.getAttackGraphNodeIcon = this.getAttackGraphNodeIcon.bind(this);
  }

  public async load() {
    const assetUrls = {
      network: '/assets/icons/network.png',
      shield: '/assets/icons/shield.png',
      connectionRule: '/assets/icons/networking.png',
      id: '/assets/icons/id-card.png',
      vulnerability: '/assets/icons/icognito.png',
      application: '/assets/icons/app.png',

      alert: '/assets/icons/alert.png',
      controlled: '/assets/icons/controlled.png',
      disconnected: '/assets/icons/suggestions/suggestion-disconnect.png',
      turnoff: '/assets/icons/suggestions/suggestion-turnoff.png',

      bulb: '/assets/icons/attack-graph/light-bulb.png',
      check: '/assets/icons/attack-graph/check.png',
      eye: '/assets/icons/attack-graph/eye.png',
      warning: '/assets/icons/attack-graph/warning-sign.png',
    };

    // Step 1: Add assets to the cache
    Assets.add([
      { alias: 'network', src: assetUrls.network },
      { alias: 'shield', src: assetUrls.shield },
      { alias: 'connectionRule', src: assetUrls.connectionRule },
      { alias: 'id', src: assetUrls.id },
      { alias: 'vulnerability', src: assetUrls.vulnerability },
      { alias: 'application', src: assetUrls.application },
      { alias: 'alert', src: assetUrls.alert },
      { alias: 'controlled', src: assetUrls.controlled },
      { alias: 'disconnected', src: assetUrls.disconnected },
      { alias: 'turnoff', src: assetUrls.turnoff },
      { alias: 'bulb', src: assetUrls.bulb },
      { alias: 'warning', src: assetUrls.warning },
      { alias: 'check', src: assetUrls.check },
      { alias: 'eye', src: assetUrls.eye },
    ]);

    // Step 2: Load all assets in parallel
    const [
      networkSprite,
      shieldSprite,
      connectionRuleSprite,
      idSprite,
      vulnerabilitySprite,
      applicationSprite,
      alertSprite,
      controlledSprite,
      disconnectedSprite,
      turnoffSprite,
      bulbSprite,
      warningSprite,
      eyeSprite,
      checkSprite,
    ] = await Promise.all([
      Assets.load('network'),
      Assets.load('shield'),
      Assets.load('connectionRule'),
      Assets.load('id'),
      Assets.load('vulnerability'),
      Assets.load('application'),
      Assets.load('alert'),
      Assets.load('controlled'),
      Assets.load('disconnected'),
      Assets.load('turnoff'),
      Assets.load('bulb'),
      Assets.load('warning'),
      Assets.load('eye'),
      Assets.load('check'),
    ]);

    // Step 3: Assign them to their interfaces

    this.assetIcons = {
      networkSprite: networkSprite,
      shieldSprite: shieldSprite,
      connectionRuleSprite: connectionRuleSprite,
      idSprite: idSprite,
      vulnerabilitySprite: vulnerabilitySprite,
      applicationSprite: applicationSprite,
    };

    this.assetStatusIcons = {
      alertSprite: alertSprite,
      controlledSprite: controlledSprite,
      disconnectedSprite: disconnectedSprite,
      inactiveSprite: turnoffSprite,
    };

    this.attackStepsStatusIcons = {
      bulbSprite: bulbSprite,
      warningSprite: warningSprite,
      eyeSprite: eyeSprite,
      checkSprite: checkSprite,
    };

    console.log('✅ All assets added & loaded successfully!');
  }

  public getAssetIcon(node: any): Sprite {
    let asset;

    //Get asset from different places depending on the type of node passed
    if (node.asset) asset = node.asset; //AssetGraphNode
    if (node.attackStep) asset = node.attackStep.asset.asset; //AttackGraphNode

    //If does not exist, return empty sprite
    if (!asset) return new Sprite();

    //Get proper icon texture depending on asset
    let texture;
    switch (asset.type) {
      case 'Network':
        texture = this.assetIcons.networkSprite;
        break;
      case 'Application':
        texture = this.assetIcons.applicationSprite;
        break;
      case 'ConnectionRule':
        texture = this.assetIcons.connectionRuleSprite;
        break;
      case 'Identity':
        texture = this.assetIcons.idSprite;
        break;
      case 'SoftwareVulnerability':
        texture = this.assetIcons.vulnerabilitySprite;
        break;
      default:
        texture = this.assetIcons.shieldSprite;
        break;
    }

    const sprite = new Sprite(texture);

    //Invert color to white if attack graph calls it
    if (node.attackStep && !node.attackStep.isActive) {
      const colorMatrix = new ColorMatrixFilter();
      colorMatrix.negative(true); // Invert colors
      sprite.filters = [colorMatrix];
    }

    return sprite;
  }

  public selectAlertIcon(alert: TyrAlertStatus): Sprite {
    let texture;
    switch (alert) {
      case TyrAlertStatus.alerted:
        texture = this.assetStatusIcons.alertSprite;
        break;
      case TyrAlertStatus.controlled:
        texture = this.assetStatusIcons.controlledSprite;
        break;
      default:
        texture = this.assetStatusIcons.alertSprite;
        break;
    }

    return new Sprite(texture);
  }

  public getNodeStatusIcon(status: TyrAssetGraphNodeStatus): Sprite {
    let texture;
    switch (status) {
      case TyrAssetGraphNodeStatus.inactive:
        texture = this.assetStatusIcons.inactiveSprite;
        break;
      case TyrAssetGraphNodeStatus.disconnected:
        texture = this.assetStatusIcons.disconnectedSprite;
        break;
      default:
        texture = this.assetStatusIcons.alertSprite;
        break;
    }
    return new Sprite(texture);
  }

  public getAttackGraphNodeIcon(attackStep: TyrAttackStep): AttackGraphSprite {
    const result: AttackGraphSprite = {
      sprite: undefined,
      background: undefined,
    };

    if (attackStep.type === 'defense') {
      if (attackStep.extras.performed) {
        result.sprite = new Sprite(this.attackStepsStatusIcons.checkSprite);
        result.background = 0x00bdd2;
      }
      if (attackStep.extras.recommended) {
        result.sprite = new Sprite(this.attackStepsStatusIcons.bulbSprite);
        result.background = 0x005c69;
      }
    } else {
      if (attackStep.extras.observable) {
        result.sprite = new Sprite(this.attackStepsStatusIcons.eyeSprite);
        result.background = 0x990000;
      }
      if (attackStep.extras.performed) {
        result.sprite = new Sprite(this.attackStepsStatusIcons.warningSprite);
        result.background = 0xffc300;
      }
    }
    return result;
  }
}
