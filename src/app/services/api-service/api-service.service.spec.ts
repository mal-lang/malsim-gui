import { TestBed } from '@angular/core/testing';

import { ApiService } from './api-service.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

describe('ApiServiceService', () => {
  let service: ApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    }).compileComponents();
    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
