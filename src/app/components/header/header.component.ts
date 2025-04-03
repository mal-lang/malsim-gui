import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  impact: number;

  constructor() {
    this.impact = 0;
  }

  setImpact(impact: number) {
    this.impact = impact;
  }
}
