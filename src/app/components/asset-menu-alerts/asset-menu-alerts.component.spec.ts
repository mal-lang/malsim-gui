import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetMenuAlertsComponent } from './asset-menu-alerts.component';

describe('AssetMenuAlertsComponent', () => {
  let component: AssetMenuAlertsComponent;
  let fixture: ComponentFixture<AssetMenuAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetMenuAlertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetMenuAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
