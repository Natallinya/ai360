import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { BffWarmupService } from './core/services/bff-warmup.service';
import { WishlistService } from './core/services/wishlist.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly wishlist = inject(WishlistService);

  constructor() {
    inject(BffWarmupService).warmup();
  }
}
