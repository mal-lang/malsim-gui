import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestedActionsComponent } from './suggested-actions.component';
import { HttpClientModule } from '@angular/common/http';

describe('SuggestedActionsComponent', () => {
  let component: SuggestedActionsComponent;
  let fixture: ComponentFixture<SuggestedActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuggestedActionsComponent],
      imports: [HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SuggestedActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
