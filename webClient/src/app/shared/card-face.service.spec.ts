import { TestBed } from '@angular/core/testing';

import { CardFaceService} from './card-face.service';

describe('CardFaceServiceService', () => {
  let service: CardFaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardFaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
