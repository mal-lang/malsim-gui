import { Component } from '@angular/core';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { TimelineComponent } from '../../components/timeline/timeline.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, TimelineComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
