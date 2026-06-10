import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Image } from 'primeng/image';
import { Message } from 'primeng/message';

import { WishlistItemStatus } from '../../../core/models/wishlist-item.model';
import { WishlistService } from '../../../core/services/wishlist.service';
import { SourceLabelPipe } from '../../../shared/utils/source-label.pipe';

@Component({
  selector: 'app-wishlist-page',
  imports: [CurrencyPipe, DatePipe, RouterLink, SourceLabelPipe, Button, Card, Image, Message],
  templateUrl: './wishlist.page.html',
  styleUrl: './wishlist.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPage implements OnInit {
  protected readonly wishlist = inject(WishlistService);
  protected readonly pruning = signal(false);
  protected readonly prunedCount = signal(0);

  ngOnInit(): void {
    void this.pruneBrokenOnLoad();
  }

  protected setStatus(id: string, status: WishlistItemStatus): void {
    this.wishlist.setStatus(id, status);
  }

  protected remove(id: string): void {
    this.wishlist.remove(id);
  }

  protected openShop(url: string): void {
    window.open(url, '_blank', 'noopener');
  }

  private async pruneBrokenOnLoad(): Promise<void> {
    this.pruning.set(true);
    try {
      const removed = await this.wishlist.pruneBrokenImages();
      if (removed > 0) {
        this.prunedCount.set(removed);
      }
    } finally {
      this.pruning.set(false);
    }
  }
}
