import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AnimalFusionStyle } from '../../../../core/models/animal-fusion.model';

export interface FusionFormSubmit {
  animal1: string;
  animal2: string;
  style: AnimalFusionStyle;
}

@Component({
  selector: 'app-fusion-form',
  imports: [FormsModule],
  templateUrl: './fusion-form.component.html',
  styleUrl: './fusion-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FusionFormComponent {
  readonly loading = input(false);

  readonly submitFusion = output<FusionFormSubmit>();

  protected animal1 = '';
  protected animal2 = '';
  protected style: AnimalFusionStyle = 'cute';

  protected readonly styles: Array<{ id: AnimalFusionStyle; label: string }> = [
    { id: 'cute', label: 'Милый' },
    { id: 'cartoon', label: 'Мультяшный' },
    { id: 'realistic', label: 'Реалистичный' },
  ];

  protected onSubmit(): void {
    const a1 = this.animal1.trim();
    const a2 = this.animal2.trim();
    if (!a1 || !a2) {
      return;
    }

    this.submitFusion.emit({ animal1: a1, animal2: a2, style: this.style });
  }
}
