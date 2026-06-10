import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-search-form',
  imports: [FormsModule, InputText, Button],
  templateUrl: './search-form.component.html',
  styleUrl: './search-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFormComponent {
  readonly initialQuery = input('');
  readonly placeholder = input('Например: наушники, Oral-B, кружка');
  readonly submitLabel = input('Найти');

  readonly search = output<string>();

  protected queryText = '';

  constructor() {
    effect(() => {
      this.queryText = this.initialQuery();
    });
  }

  protected onSubmit(): void {
    const value = this.queryText.trim();
    if (value.length < 2) {
      return;
    }
    this.search.emit(value);
  }
}
