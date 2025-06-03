import {
  TyrAssetGraphNode,
  TyrNotification,
  TyrNotificationType,
} from 'tyr-js';

/**
 * Returns the corresponding asset image for each asset type
 *
 * @param {TyrAssetGraphNode} node - The asset node object to determine the image from.
 * @return {string} - The url to the image.
 */
export function selectAssetImage(node: TyrAssetGraphNode): string {
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

/**
 * Returns the corresponding image for each suggestion type
 *
 * @param {TyrNotification} suggestion - The notification object to determine the image from.
 * @return {string} - The url to the image.
 */
function getSuggestionImage(suggestion: TyrNotification) {
  switch (suggestion.attackStep?.langGraphAttackStep) {
    case 'Application:notPresent':
      return 'assets/icons/suggestions/suggestion-turnoff.png';
    case 'ConnectionRule:restricted':
      return 'assets/icons/suggestions/suggestion-disconnect.png';
    case 'Identity:notPresent':
      return 'assets/icons/suggestions/suggestion-user.png';
    default:
      return '';
  }
}

/**
 * Returns the corresponding image for each notification type
 *
 * @param {TyrNotification} notification - The notification object to determine the image from.
 * @return {string} - The url to the image.
 */
export function getNotificationImage(notification: TyrNotification) {
  switch (notification.type) {
    case TyrNotificationType.alert:
      return 'assets/icons/alert.png';
    case TyrNotificationType.suggestion:
      return getSuggestionImage(notification);
    default:
      return '';
  }
}

/**
 * Returns the corresponding image for each action type (Defense step that can be performed)
 *
 * @param {string} type (Optional) - The defense type as a string.
 * @return {string} - The url to the image.
 */
export function selectActionImage(type?: string): string {
  switch (type) {
    case 'Application:notPresent':
      return 'assets/icons/suggestions/turnoff.png';
    case 'ConnectionRule:restricted':
      return 'assets/icons/suggestions/disconnect.png';
    case 'Identity:notPresent':
      return 'assets/icons/suggestions/user.png';
    default:
      return '';
  }
}
