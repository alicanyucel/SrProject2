import { Injectable, OnDestroy } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslocoService } from '@ngneat/transloco';
import { Subscription } from 'rxjs';

@Injectable()
export class TranslocoPaginatorIntl extends MatPaginatorIntl implements OnDestroy {
  private langChangeSub: Subscription;

  constructor(private translocoService: TranslocoService) {
    super();
    this.setLabels();
    this.langChangeSub = this.translocoService.langChanges$.subscribe(() => {
      this.setLabels();
      this.changes.next();
    });
  }

  setLabels() {
    this.itemsPerPageLabel = this.translocoService.translate('paginator.pageSizeLabel');
    this.nextPageLabel = this.translocoService.translate('paginator.nextPageLabel');
    this.previousPageLabel = this.translocoService.translate('paginator.previousPageLabel');
    this.firstPageLabel = this.translocoService.translate('paginator.firstPageLabel');
    this.lastPageLabel = this.translocoService.translate('paginator.lastPageLabel');
  }

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 / ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} / ${length}`;
  };

  ngOnDestroy() {
    if (this.langChangeSub) {
      this.langChangeSub.unsubscribe();
    }
  }
}
