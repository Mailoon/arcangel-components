import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-extra',
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-3">Próximamente</h2>
      <p>Esta ruta está reservada para futuras páginas de documentación y ejemplos.</p>
      <ul class="list-disc ml-5 mt-3 text-sm text-slate-700">
        <li>Otras componentes</li>
        <li>API / props</li>
        <li>Casos de uso avanzados</li>
      </ul>
    </div>
  `,
  styles: [
    `p { color: #1e293b; }`
  ]
})
export class ExtraComponent {}
