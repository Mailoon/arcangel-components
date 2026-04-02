import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '@arcange/components/button';
import { DocHighlightedCodeComponent } from '../../shared/doc-highlighted-code/doc-highlighted-code.component';

@Component({
  standalone: true,
  selector: 'app-button-docs',
  imports: [CommonModule, MatIconModule, ButtonComponent, DocHighlightedCodeComponent],
  templateUrl: './button-docs.component.html',
  styleUrls: ['./button-docs.component.css'],
})
export class ButtonDocsComponent {
  readonly codeIconsIntro = `<button-component
  label="Home"
  [leftIconTemplate]="iconHome"
  [backgroundClass]="'bg-dark-graySC'"
  [hoverClass]="'hover:bg-dark-gray-contrastSC'"
  [textClass]="'text-white'"
  [borderClass]="'rounded-full'">
</button-component>`;

  readonly isLoading = signal(false);
  readonly currentState = signal<'default' | 'success' | 'error'>('default');

  simulateLoading() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
    }, 2000);
  }

  setSuccess() {
    this.currentState.set('success');
    setTimeout(() => {
      this.currentState.set('default');
    }, 2000);
  }

  setError() {
    this.currentState.set('error');
    setTimeout(() => {
      this.currentState.set('default');
    }, 2000);
  }

  onKeyboardClick() {
    console.log('Keyboard click detected!');
  }

  onLongPress() {
    console.log('Long press detected!');
  }

  onDebouncedClick() {
    console.log('Debounced click!');
  }
}
