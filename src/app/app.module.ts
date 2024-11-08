import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxGraphModule } from '@swimlane/ngx-graph';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { MenuComponent } from './components/menu/menu.component';
import { AttackGraphComponent } from './components/attack-graph/attack-graph.component';
import { InstanceModelComponent } from './components/instance-model/instance-model.component';
import { SuggestedActionsComponent } from './components/suggested-actions/suggested-actions.component';
import {
  provideTippyConfig,
  tooltipVariation,
  popperVariation,
  TippyDirective,
} from '@ngneat/helipopper';
import { LogModalComponent } from './components/modals/log-modal/log-modal.component';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    OverviewComponent,
    MenuComponent,
    AttackGraphComponent,
    InstanceModelComponent,
    SuggestedActionsComponent,
    LogModalComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxGraphModule,
    TippyDirective,
  ],
  providers: [
    provideHttpClient(),
    provideTippyConfig({
      defaultVariation: 'tooltip',
      variations: {
        tooltip: tooltipVariation,
        popper: popperVariation,
      },
    }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
