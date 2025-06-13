import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftArrowsComponent } from './left-arrows.component';

describe('LeftArrowsComponent', () => {
  let component: LeftArrowsComponent;
  let fixture: ComponentFixture<LeftArrowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeftArrowsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftArrowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
