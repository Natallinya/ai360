import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SearchApiService } from './search-api.service';

describe('SearchApiService', () => {
  let service: SearchApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchApiService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SearchApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('searches with encoded query', async () => {
    const promise = service.search('кружка');
    const req = http.expectOne((r) => r.url === '/api/search');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('q')).toBe('кружка');
    req.flush({ query: 'кружка', offers: [], sources: {} });
    const result = await promise;
    expect(result.query).toBe('кружка');
  });
});
