import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiHttpService } from './api-http.service';
import { environment } from '@environments/environment';

describe('ApiHttpService', () => {
  let service: ApiHttpService;
  let httpMock: HttpTestingController;
  environment.apiUrl = 'test-url';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiHttpService
      ]
    });

    service = TestBed.inject(ApiHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call HttpClient.get with the correct URL', () => {
    const mockData = { id: 1, name: 'Test' };
    const endpoint = '/test-endpoint';

    service.get(endpoint).subscribe((response) => {
      expect(response).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}${endpoint}`);

    expect(req.request.method).toBe('GET');

    req.flush(mockData);
  });

  it('should allow params to be passed to the get method', () => {
    const mockData = { id: 2, name: 'Another Test' };
    const endpoint = '/another-endpoint';
    const mockParams: Record<string, string | number> = { search: 'test', per_page: 12 };

    service.get(endpoint, mockParams).subscribe((response) => {
      expect(response).toEqual(mockData);
    });

    const req = httpMock.expectOne((request) =>
      request.url === `${environment.apiUrl}${endpoint}`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('test');
    expect(req.request.params.get('per_page')).toBe('12');

    req.flush(mockData);
  });
});
