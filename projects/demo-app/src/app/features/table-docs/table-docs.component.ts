import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import {
  TableComponent,
  type TableHeader,
  type TableAction,
  type TableActionEvent,
  type TablePaginationChangeEvent,
} from '@arcange/components/table';
import { CardComponent } from '@arcange/components/card';
import { TableResponsiveComponent } from '@arcange/components/table-responsive';
import { DocHighlightedCodeComponent } from '../../shared/doc-highlighted-code/doc-highlighted-code.component';

@Component({
  standalone: true,
  selector: 'app-table-docs',
  imports: [
    CommonModule,
    MatIconModule,
    RouterLink,
    TableComponent,
    CardComponent,
    TableResponsiveComponent,
    DocHighlightedCodeComponent,
  ],
  templateUrl: './table-docs.component.html',
  styleUrls: ['./table-docs.component.css'],
})
export class TableDocsComponent {
  readonly lastAction = signal<string>('');

  readonly headers: TableHeader[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Rol' },
  ];

  readonly items: Record<string, unknown>[] = [
    { name: 'Juan Pérez', email: 'juan@test.com', role: 'Admin' },
    { name: 'María García', email: 'maria@test.com', role: 'Usuario' },
    { name: 'Carlos López', email: 'carlos@test.com', role: 'Editor' },
  ];

  readonly actionsWithIcons: TableAction[] = [
    {
      id: 'edit',
      iconClass: 'material-icons',
      iconContent: 'edit',
      tooltip: 'Editar',
      variant: 'ghost',
    },
    {
      id: 'delete',
      iconClass: 'material-icons',
      iconContent: 'delete',
      tooltip: 'Eliminar',
      variant: 'danger',
    },
  ];

  readonly actionsWithLabels: TableAction[] = [
    { id: 'edit', label: 'Editar', variant: 'primary' },
    { id: 'delete', label: 'Eliminar', variant: 'danger' },
  ];

  readonly codeStriped = `<table-component
  [headers]="headers"
  [items]="items"
  [actions]="actionsWithLabels"
  [actionsPosition]="'start'"
  [striped]="true"
  (actionClicked)="onAction($event)">
</table-component>`;

  readonly actionsMixed: TableAction[] = [
    {
      id: 'edit',
      label: 'Editar',
      iconClass: 'material-icons',
      iconContent: 'edit',
      variant: 'ghost',
    },
  ];

  /** 28 filas para demos de paginación (modo cliente) */
  readonly manyItems: Record<string, unknown>[] = Array.from({ length: 28 }, (_, i) => ({
    name: `Usuario ${i + 1}`,
    email: `user${i + 1}@test.com`,
    role: i % 3 === 0 ? 'Admin' : 'Usuario',
  }));

  readonly pageIndex = signal(0);
  readonly pageSize = signal(5);

  readonly pageIndexResponsive = signal(0);
  readonly pageSizeResponsive = signal(5);

  onAction(event: TableActionEvent) {
    this.lastAction.set(`${event.actionId} en fila ${event.index + 1}`);
  }

  onActionPaginated(event: TableActionEvent) {
    const global = this.pageIndex() * this.pageSize() + event.index + 1;
    this.lastAction.set(`${event.actionId} en fila visible ${event.index + 1} (global ~${global})`);
  }

  onPagination(event: TablePaginationChangeEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onPaginationResponsive(event: TablePaginationChangeEvent) {
    this.pageIndexResponsive.set(event.pageIndex);
    this.pageSizeResponsive.set(event.pageSize);
  }
}
