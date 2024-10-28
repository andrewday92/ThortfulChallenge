import { TestBed } from '@angular/core/testing';

import { CardTransformService } from './card-transform.service';

describe('CardTransformService', () => {
  let service: CardTransformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardTransformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
