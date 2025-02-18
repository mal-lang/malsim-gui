import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstanceModelComponent } from './instance-model.component';
import { ApiService } from 'src/app/services/api-service/api-service.service';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';

describe('InstanceModelComponent', () => {
  let component: InstanceModelComponent;
  let fixture: ComponentFixture<InstanceModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InstanceModelComponent],
      imports: [HttpClientModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InstanceModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
