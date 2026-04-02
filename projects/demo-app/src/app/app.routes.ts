import { Routes } from '@angular/router';
import { HomePageComponent } from './features/home/home-page.component';
import { ButtonDocsComponent } from './features/button-docs/button-docs.component';
import { DropdownDocsComponent } from './features/dropdown-docs/dropdown-docs.component';
import { TableDocsComponent } from './features/table-docs/table-docs.component';
import { StepperDocsComponent } from './features/stepper-docs/stepper-docs.component';
import { SearchableSelectDocsComponent } from './features/searchable-select-docs/searchable-select-docs.component';
import { InputDocsComponent } from './features/input-docs/input-docs.component';
import { DatePickerDocsComponent } from './features/date-picker-docs/date-picker-docs.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'buttons', component: ButtonDocsComponent },
  { path: 'dropdown', component: DropdownDocsComponent },
  { path: 'table', component: TableDocsComponent },
  { path: 'stepper', component: StepperDocsComponent },
  { path: 'searchable-select', component: SearchableSelectDocsComponent },
  { path: 'input', component: InputDocsComponent },
  { path: 'date-picker', component: DatePickerDocsComponent },
  // Ejemplo adicional, tendrá contenido futuro
  { path: 'extras', loadComponent: () => import('./features/extra/extra.component').then((m) => m.ExtraComponent) },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
