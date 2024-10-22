import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceModelComponent } from './instance-model.component';

describe('InstanceModelComponent', () => {
  let component: InstanceModelComponent;
  let fixture: ComponentFixture<InstanceModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstanceModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstanceModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
