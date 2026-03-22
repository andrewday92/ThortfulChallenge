import { TestBed } from '@angular/core/testing';
import { CardTransformService } from './card-transform.service';
import { CardTranslations } from '@models';

describe('CardTransformService', () => {
  let service: CardTransformService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CardTransformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default translations of zero', () => {
    const current = service.getCurrentTranslations();
    expect(current).toEqual({ wholeCard: { x: 0, y: 0, z: 0 } });
  });

  it('should update translations', () => {
    const newTranslations: CardTranslations = { wholeCard: { x: 10, y: 20, z: 5 } };
    service.updateTranslations(newTranslations);
    expect(service.getCurrentTranslations()).toEqual(newTranslations);
  });

  it('should emit updated translations to subscribers', (done) => {
    const expected: CardTranslations = { wholeCard: { x: 15, y: -10, z: 3 } };
    // Skip the initial emission
    let first = true;
    service.cardTranslations$.subscribe((val) => {
      if (first) { first = false; return; }
      expect(val).toEqual(expected);
      done();
    });
    service.updateTranslations(expected);
  });

  it('should clamp zoom within bounds', () => {
    expect(service.clampZoom(-100)).toBe(-50);
    expect(service.clampZoom(100)).toBe(30);
    expect(service.clampZoom(0)).toBe(0);
    expect(service.clampZoom(-50)).toBe(-50);
    expect(service.clampZoom(30)).toBe(30);
  });
});
