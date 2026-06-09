import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-url-import-form',
  imports: [FormsModule],
  templateUrl: './url-import-form.component.html',
  styleUrl: './url-import-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UrlImportFormComponent {
  readonly loading = input(false);
  readonly submitLabel = input('Загрузить товар');

  readonly submitUrl = output<string>();

  protected urlText = '';

  protected onSubmit(): void {
    const value = this.urlText.trim();
    if (!value) {
      return;
    }
    this.submitUrl.emit(value);
  }
}
