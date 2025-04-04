import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() impact: number;

  constructor() {
    this.impact = 0;
  }

  setImpact(impact: number) {
    this.impact = impact;
  }
}
