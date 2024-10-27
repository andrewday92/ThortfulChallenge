import { TestBed } from '@angular/core/testing';

import { BrowserStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
  let service: BrowserStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
