import { TestBed } from '@angular/core/testing';

import { FusionFormComponent } from './fusion-form.component';

describe('FusionFormComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FusionFormComponent],
    }).compileComponents();
  });

  it('emits animals and selected style', () => {
    const fixture = TestBed.createComponent(FusionFormComponent);
    const component = fixture.componentInstance;
    let payload: { animal1: string; animal2: string; style: string } | null = null;
    component.submitFusion.subscribe((value) => {
      payload = value;
    });

    component['animal1'] = 'кот';
    component['animal2'] = 'сова';
    component['style'] = 'cartoon';
    component['onSubmit']();

    expect(payload).toEqual({ animal1: 'кот', animal2: 'сова', style: 'cartoon' });
  });

  it('does not emit when fields are empty', () => {
    const fixture = TestBed.createComponent(FusionFormComponent);
    const component = fixture.componentInstance;
    let emitted = false;
    component.submitFusion.subscribe(() => {
      emitted = true;
    });

    component['onSubmit']();
    expect(emitted).toBe(false);
  });
});
