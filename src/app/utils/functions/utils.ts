import { TyrAssetGraphNode } from 'tyr-js';

export function selectAssetImage(node: TyrAssetGraphNode): string {
  console.log(node);
  switch (node.asset.type) {
    case 'Network':
      return '/assets/icons/network.png';
    case 'Application':
      return '/assets/icons/app.png';
    case 'ConnectionRule':
      return '/assets/icons/networking.png';
    case 'Identity':
      return '/assets/icons/id-card.png';
    case 'SoftwareVulnerability':
      return '/assets/icons/icognito.png';
    default:
      return '/assets/icons/shield.png';
  }
}
