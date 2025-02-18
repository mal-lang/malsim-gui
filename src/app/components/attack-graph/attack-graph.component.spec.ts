import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttackGraphComponent } from './attack-graph.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('AttackGraphComponent', () => {
  let component: AttackGraphComponent;
  let fixture: ComponentFixture<AttackGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttackGraphComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(AttackGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
