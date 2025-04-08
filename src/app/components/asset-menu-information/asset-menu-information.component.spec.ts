import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetMenuInformationComponent } from './asset-menu-information.component';

describe('AssetMenuInformationComponent', () => {
  let component: AssetMenuInformationComponent;
  let fixture: ComponentFixture<AssetMenuInformationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetMenuInformationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetMenuInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
