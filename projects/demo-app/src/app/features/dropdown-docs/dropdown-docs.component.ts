import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import type { DropdownItem } from '@arcange/components/dropdown';
import { SearchableSelectComponent } from '@arcange/components/searchable-select';
import { DocHighlightedCodeComponent } from '../../shared/doc-highlighted-code/doc-highlighted-code.component';

@Component({
  standalone: true,
  selector: 'app-dropdown-docs',
  imports: [CommonModule, MatIconModule, RouterLink, SearchableSelectComponent, DocHighlightedCodeComponent],
  templateUrl: './dropdown-docs.component.html',
  styleUrls: ['./dropdown-docs.component.css'],
})
export class DropdownDocsComponent {
  readonly selectedItem = signal<DropdownItem | null>(null);
  readonly selectedLabel = signal('');
  readonly lastEvent = signal<string>('');
  readonly basicItems: DropdownItem[] = [
    { label: 'Opción 1', value: '1' },
    { label: 'Opción 2', value: '2' },
    { label: 'Opción 3', value: '3' },
  ];
  readonly itemsWithIcons: DropdownItem[] = [
    { label: 'Inicio', value: 'home', iconClass: 'material-icons', iconContent: 'home' },
    { label: 'Configuración', value: 'settings', iconClass: 'material-icons', iconContent: 'settings' },
    { label: 'Cerrar sesión', value: 'logout', iconClass: 'material-icons', iconContent: 'logout' },
  ];
  readonly itemsWithDividers: DropdownItem[] = [
    { label: 'Perfil' },
    { label: 'Configuración' },
    { label: 'Ayuda', divided: true },
    { label: 'Cerrar sesión' },
  ];
  readonly itemsWithDisabled: DropdownItem[] = [
    { label: 'Activo' },
    { label: 'Deshabilitado', disabled: true },
    { label: 'Otro activo' },
  ];

  readonly codeBasic = `<searchable-select-component
  placeholder="Elegir opción..."
  [items]="basicItems"
  (selectionChange)="onItemSelected($event)">
</searchable-select-component>`;

  onItemSelected(item: DropdownItem) {
    this.selectedItem.set(item);
    this.selectedLabel.set(item.label);
    this.lastEvent.set(`selectionChange: ${item.label}`);
  }

  onOpened() {
    this.lastEvent.set('opened');
  }

  onClosed() {
    this.lastEvent.set('closed');
  }
}
