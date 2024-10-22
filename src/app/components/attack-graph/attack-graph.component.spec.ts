import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttackGraphComponent } from './attack-graph.component';

describe('AttackGraphComponent', () => {
  let component: AttackGraphComponent;
  let fixture: ComponentFixture<AttackGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttackGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttackGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
