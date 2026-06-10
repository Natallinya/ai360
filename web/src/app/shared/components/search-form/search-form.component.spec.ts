import { TestBed } from '@angular/core/testing';

import { SearchFormComponent } from './search-form.component';

describe('SearchFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFormComponent],
    }).compileComponents();
  });

  it('emits trimmed query on submit', () => {
    const fixture = TestBed.createComponent(SearchFormComponent);
    const component = fixture.componentInstance;
    let emitted = '';
    component.search.subscribe((value) => {
      emitted = value;
    });

    component['queryText'] = '  наушники  ';
    component['onSubmit']();
    expect(emitted).toBe('наушники');
  });

  it('ignores short query', () => {
    const fixture = TestBed.createComponent(SearchFormComponent);
    const component = fixture.componentInstance;
    let emitted: string | null = null;
    component.search.subscribe((value) => {
      emitted = value;
    });

    component['queryText'] = 'a';
    component['onSubmit']();
    expect(emitted).toBeNull();
  });
});
