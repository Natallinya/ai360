import { Routes } from '@angular/router';

import { AddByUrlPage } from './features/add-by-url/pages/add-by-url.page';
import { AnimalFusionPage } from './features/animal-fusion/pages/animal-fusion.page';
import { HomePage } from './features/home/pages/home.page';
import { SearchResultsPage } from './features/search/pages/search-results.page';
import { WishlistPage } from './features/wishlist/pages/wishlist.page';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Поиск — Wishlist' },
  { path: 'search', component: SearchResultsPage, title: 'Результаты — Wishlist' },
  { path: 'add-by-url', component: AddByUrlPage, title: 'По ссылке — Wishlist' },
  { path: 'fusion', component: AnimalFusionPage, title: 'Гибриды — Wishlist' },
  { path: 'wishlist', component: WishlistPage, title: 'Вишлист — Wishlist' },
  { path: '**', redirectTo: '' },
];
