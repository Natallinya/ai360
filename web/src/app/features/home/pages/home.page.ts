import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { SearchFormComponent } from '../../../shared/components/search-form/search-form.component';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-home-page',
  imports: [SearchFormComponent, RouterLink, Card, Tag],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly router = inject(Router);

  protected readonly sampleQueries = ['кружка', 'наушники', 'phone'] as const;

  protected readonly quickLinks = [
    { label: 'Добавить по ссылке', route: '/add-by-url' },
    { label: 'Скрестить животных', route: '/fusion' },
  ] as const;

  protected onSearch(query: string): void {
    void this.router.navigate(['/search'], { queryParams: { q: query } });
  }
}
