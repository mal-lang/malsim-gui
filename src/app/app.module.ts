import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxGraphModule } from '@swimlane/ngx-graph';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
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
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './components/header/header.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { AssetGraphComponent } from './components/asset-graph/asset-graph.component';
import { TimelineItemComponent } from './components/timeline/timeline-item/timeline-item.component';
import { AssetMenuComponent } from './components/asset-menu/asset-menu.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    TimelineComponent,
    AssetGraphComponent,
    MenuComponent,
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
    TimelineItemComponent,
    AssetMenuComponent,
    AttackGraphComponent,
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
