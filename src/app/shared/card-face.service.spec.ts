import { TestBed } from '@angular/core/testing';
import { CardFaceService } from './card-face.service';
import { ApiHttpService } from '../core/services/api-http.service';
import { BrowserStorageService, StorageTypes } from '../core/services/browser-storage.service';
import { of } from 'rxjs';
import { CardFace } from '@models';

describe('CardFaceService', () => {
  let service: CardFaceService;
  let apiHttpService: ApiHttpService;
  let browserStorageService: BrowserStorageService;
  let apiHttpServiceMock: jasmine.SpyObj<ApiHttpService>;
  let browserStorageServiceMock: jasmine.SpyObj<BrowserStorageService>;
  beforeEach(() => {
    apiHttpServiceMock = jasmine.createSpyObj(apiHttpService, ['get']);
    browserStorageServiceMock = jasmine.createSpyObj(browserStorageService, ['setItem', 'getItem']);

    TestBed.configureTestingModule({
      providers: [
        CardFaceService,
        { provide: ApiHttpService, useValue: apiHttpServiceMock },
        { provide: BrowserStorageService, useValue: browserStorageServiceMock }
      ]
    });

    service = TestBed.inject(CardFaceService);

    browserStorageServiceMock.setItem.and.callFake((key: string, value: any) => {});
    browserStorageServiceMock.getItem.and.callFake((key: string) => {});
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

});
