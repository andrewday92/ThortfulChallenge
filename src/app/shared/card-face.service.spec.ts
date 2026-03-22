import { TestBed } from '@angular/core/testing';
import { CardFaceService } from './card-face.service';
import { ApiHttpService } from '../core/services/api-http.service';
import { BrowserStorageService, StorageTypes } from '../core/services/browser-storage.service';
import { of } from 'rxjs';
import { UnsplashImage } from '@models';

describe('CardFaceService', () => {
  let service: CardFaceService;
  let apiHttpServiceMock: jasmine.SpyObj<ApiHttpService>;
  let browserStorageServiceMock: jasmine.SpyObj<BrowserStorageService>;

  beforeEach(() => {
    apiHttpServiceMock = jasmine.createSpyObj('ApiHttpService', ['get']);
    browserStorageServiceMock = jasmine.createSpyObj('BrowserStorageService', ['setItem', 'getItem']);
    browserStorageServiceMock.getItem.and.returnValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        CardFaceService,
        { provide: ApiHttpService, useValue: apiHttpServiceMock },
        { provide: BrowserStorageService, useValue: browserStorageServiceMock }
      ]
    });

    service = TestBed.inject(CardFaceService);
    service.cardFaceHistory = [];
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getTopics', () => {
    beforeEach(() => {
      const mockApiResponse = [
        { title: 'Topic 1', slug: 'topic-1' },
        { title: 'Topic 2', slug: 'topic-2' }
      ];
      apiHttpServiceMock.get.and.returnValue(of(mockApiResponse));
    });

    it('should map the response data correctly', (done) => {
      service.getTopics().subscribe((topics) => {
        expect(topics).toEqual([
          { title: 'Topic 1', slug: 'topic-1' },
          { title: 'Topic 2', slug: 'topic-2' }
        ]);
        done();
      });
    });
  });

  describe('#getCardImage', () => {
    const mockImage: UnsplashImage = {
      urls: { full: 'full-url', thumb: 'thumb-url' },
      alt_description: 'test image',
      width: 800,
      height: 600
    };

    beforeEach(() => {
      apiHttpServiceMock.get.and.returnValue(of(mockImage));
    });

    it('should add image to cardFaceHistory', (done) => {
      service.getCardImage({ query: 'test' }).subscribe(() => {
        expect(service.cardFaceHistory.length).toBe(1);
        expect(service.cardFaceHistory[0].src).toBe('full-url');
        expect(service.cardFaceHistory[0].srcThumb).toBe('thumb-url');
        expect(service.cardFaceHistory[0].alt).toBe('test image');
        done();
      });
    });

    it('should save to browser storage without mutating cardFaceHistory order', (done) => {
      service.cardFaceHistory = [{ src: 'existing', srcThumb: 'thumb', alt: 'existing' }];

      service.getCardImage({ query: 'test' }).subscribe(() => {
        // Original array should NOT be reversed
        expect(service.cardFaceHistory[0].src).toBe('existing');
        expect(service.cardFaceHistory[1].src).toBe('full-url');
        expect(browserStorageServiceMock.setItem).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('#_loadHistory', () => {
    it('should load history from BrowserStorageService', () => {
      const stored = JSON.stringify([{ src: 'url', srcThumb: 'thumb', alt: 'alt' }]);
      browserStorageServiceMock.getItem.and.returnValue(stored);

      // Recreate service to trigger constructor
      service = new CardFaceService(apiHttpServiceMock as unknown as ApiHttpService, browserStorageServiceMock as unknown as BrowserStorageService);

      expect(service.cardFaceHistory.length).toBe(1);
      expect(service.cardFaceHistory[0].src).toBe('url');
    });

    it('should default to empty array when storage returns undefined', () => {
      browserStorageServiceMock.getItem.and.returnValue(undefined);
      service = new CardFaceService(apiHttpServiceMock as unknown as ApiHttpService, browserStorageServiceMock as unknown as BrowserStorageService);
      expect(service.cardFaceHistory).toEqual([]);
    });
  });
});
