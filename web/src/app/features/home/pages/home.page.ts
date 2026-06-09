import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SearchFormComponent } from '../../../shared/components/search-form/search-form.component';

@Component({
  selector: 'app-home-page',
  imports: [SearchFormComponent, RouterLink],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly router = inject(Router);

  protected onSearch(query: string): void {
    void this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}
