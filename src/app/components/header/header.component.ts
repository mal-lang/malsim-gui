import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

/**
 * HeaderComponent is the component for the project's header, where the title and the IMPACT value is being displayed
 */
export class HeaderComponent {
  @Input() impact: number;

  constructor() {
    this.impact = 0;
  }

  /**
   * Set the impact value.
   *
   * @param {number} impact - The new impact value.
   */
  setImpact(impact: number) {
    this.impact = impact;
  }
}
