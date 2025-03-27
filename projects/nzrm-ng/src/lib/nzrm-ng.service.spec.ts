import { TestBed } from '@angular/core/testing';

import { NzrmNgService } from './nzrm-ng.service';

describe('NzrmNgService', () => {
  let service: NzrmNgService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NzrmNgService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
