import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { MenuComponent } from './components/menu/menu.component';
import { AgGridModule } from 'ag-grid-angular';
import { NgxGraphModule } from '@swimlane/ngx-graph';

@NgModule({
  declarations: [AppComponent, OverviewComponent, MenuComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AgGridModule,
    NgxGraphModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
