import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SearchableSelectComponent } from '@arcange/components/searchable-select';
import type { DropdownItem } from '@arcange/components/dropdown';
import { DocHighlightedCodeComponent } from '../../shared/doc-highlighted-code/doc-highlighted-code.component';

@Component({
  standalone: true,
  selector: 'app-searchable-select-docs',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, SearchableSelectComponent, DocHighlightedCodeComponent],
  templateUrl: './searchable-select-docs.component.html',
  styleUrls: ['./searchable-select-docs.component.css'],
})
export class SearchableSelectDocsComponent implements OnInit {
  readonly basicItems: DropdownItem[] = [
    { label: 'Opción A', value: 'a' },
    { label: 'Opción B', value: 'b' },
    { label: 'Opción C', value: 'c' },
  ];

  private readonly allLazySource: DropdownItem[] = Array.from({ length: 48 }, (_, i) => ({
    label: `Elemento ${i + 1}`,
    value: i + 1,
  }));

  private readonly lazyBatch = 12;

  readonly lazyItems = signal<DropdownItem[]>([]);
  readonly lazyHasMore = signal(true);
  readonly lazyLoadingMore = signal(false);

  private readonly filterPool: DropdownItem[] = Array.from({ length: 40 }, (_, i) => ({
    label: `Usuario ${String(i + 1).padStart(2, '0')} — ${i % 2 ? 'Activo' : 'Inactivo'}`,
    value: `u${i + 1}`,
  }));

  readonly filteredItems = signal<DropdownItem[]>([]);

  readonly lastSelection = signal<string>('');

  readonly selectControl = new FormControl<string | number | null>('b');

  readonly multiSelectControl = new FormControl<string[]>(['a', 'c'], { nonNullable: true });

  ngOnInit() {
    this.resetLazyWindow();
    this.filteredItems.set([...this.filterPool]);
  }

  private resetLazyWindow() {
    const first = this.allLazySource.slice(0, this.lazyBatch);
    this.lazyItems.set(first);
    this.lazyHasMore.set(this.allLazySource.length > first.length);
  }

  onLazyLoadMore() {
    if (this.lazyLoadingMore() || !this.lazyHasMore()) return;
    this.lazyLoadingMore.set(true);
    setTimeout(() => {
      const cur = this.lazyItems();
      const more = this.allLazySource.slice(cur.length, cur.length + this.lazyBatch);
      const next = [...cur, ...more];
      this.lazyItems.set(next);
      this.lazyHasMore.set(next.length < this.allLazySource.length);
      this.lazyLoadingMore.set(false);
    }, 450);
  }

  /** Filtro en el padre según el texto emitido por el select */
  onFilterQuery(query: string) {
    const q = query.trim().toLowerCase();
    if (!q) {
      this.filteredItems.set([...this.filterPool]);
      return;
    }
    this.filteredItems.set(
      this.filterPool.filter((i) => i.label.toLowerCase().includes(q))
    );
  }

  onSelection(item: DropdownItem) {
    this.lastSelection.set(String(item.label));
  }

  readonly code = {
    basic: `<searchable-select-component
  placeholder="Elegir..."
  [items]="basicItems"
  [selectedValue]="'a'"
  (selectionChange)="onSelection($event)">
</searchable-select-component>`,

    lazy: `<searchable-select-component
  placeholder="Scroll para cargar más…"
  [items]="lazyItems()"
  [hasMore]="lazyHasMore()"
  [loadingMore]="lazyLoadingMore()"
  (loadMore)="onLazyLoadMore()"
  variant="outline">
</searchable-select-component>`,

    filter: `<searchable-select-component
  placeholder="Filtrar usuarios…"
  [items]="filteredItems()"
  [filterable]="true"
  searchPlaceholder="Escribe para filtrar…"
  (filterQueryChange)="onFilterQuery($event)"
  variant="secondary">
</searchable-select-component>`,

    formTs: `readonly selectControl = new FormControl<string | number | null>('b');`,

    formTpl: `<searchable-select-component
  placeholder="Control..."
  [items]="basicItems"
  [formControl]="selectControl">
</searchable-select-component>`,

    multiTs: `readonly multiSelectControl = new FormControl<string[]>(['a', 'c'], { nonNullable: true });`,

    multiTpl: `<searchable-select-component
  placeholder="Elige varias…"
  [items]="basicItems"
  [multiple]="true"
  [formControl]="multiSelectControl"
  variant="outline">
</searchable-select-component>`,

    disabled: `<searchable-select-component
  placeholder="No disponible"
  [items]="basicItems"
  [disabled]="true">
</searchable-select-component>`,
  };
}
