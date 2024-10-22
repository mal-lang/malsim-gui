import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestedActionsComponent } from './suggested-actions.component';

describe('SuggestedActionsComponent', () => {
  let component: SuggestedActionsComponent;
  let fixture: ComponentFixture<SuggestedActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestedActionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestedActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
