import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetGraphComponent } from './asset-graph.component';

describe('AssetGraphComponent', () => {
  let component: AssetGraphComponent;
  let fixture: ComponentFixture<AssetGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssetGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
