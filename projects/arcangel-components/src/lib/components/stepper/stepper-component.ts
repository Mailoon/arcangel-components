import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectionStrategy,
  computed,
} from '@angular/core';
import { ButtonComponent } from '../button';
import type { StepperStep, StepperButtonConfig } from './types';

const DEFAULT_PREVIOUS: StepperButtonConfig = { label: 'Anterior' };
const DEFAULT_NEXT: StepperButtonConfig = { label: 'Siguiente' };
const DEFAULT_CANCEL: StepperButtonConfig = { label: 'Cancelar', variant: 'ghost' };

@Component({
  selector: 'stepper-component',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './stepper-component.html',
  styleUrls: ['./stepper-component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperComponent {
  readonly DEFAULT_PREVIOUS = DEFAULT_PREVIOUS;
  readonly DEFAULT_NEXT = DEFAULT_NEXT;
  readonly DEFAULT_CANCEL = DEFAULT_CANCEL;

  @Input() steps: StepperStep[] = [];
  @Input() currentStep = 0;
  @Input() previousButton: StepperButtonConfig = DEFAULT_PREVIOUS;
  @Input() nextButton: StepperButtonConfig = DEFAULT_NEXT;
  @Input() cancelButton: StepperButtonConfig = DEFAULT_CANCEL;
  @Input() inactiveColor = '#ffffff';
  @Input() inactiveBorderColor = '#e5e7eb';
  @Input() activeColor = '#2563eb';
  @Input() completedColor = '#16a34a';
  @Input() customClass = '';
  @Input() showCancelButton = true;
  @Input() breakpoint: 'sm' | 'md' | 'lg' = 'md';

  @Output() previousClicked = new EventEmitter<number>();
  @Output() nextClicked = new EventEmitter<number>();
  @Output() cancelClicked = new EventEmitter<void>();
  @Output() stepChange = new EventEmitter<number>();

  readonly totalSteps = computed(() => this.steps.length);

  get isFirstStep(): boolean {
    return this.currentStep <= 0;
  }

  get isLastStep(): boolean {
    return this.currentStep >= this.steps.length - 1;
  }

  readonly buttonContext = computed(() => ({
    stepIndex: this.currentStep,
    totalSteps: this.steps.length,
  }));

  getStepState(index: number): 'inactive' | 'active' | 'completed' {
    if (index < this.currentStep) return 'completed';
    if (index === this.currentStep) return 'active';
    return 'inactive';
  }

  getStepStyles(index: number): Record<string, string> {
    const state = this.getStepState(index);
    if (state === 'inactive') {
      return {
        'background-color': this.inactiveColor,
        'border-color': this.inactiveBorderColor,
        color: this.inactiveBorderColor,
      };
    }
    if (state === 'active') {
      return {
        'background-color': this.activeColor,
        'border-color': this.activeColor,
        color: '#ffffff',
      };
    }
    return {
      'background-color': this.completedColor,
      'border-color': this.completedColor,
      color: '#ffffff',
    };
  }

  getConnectorColor(index: number): string {
    return index < this.currentStep ? this.completedColor : this.inactiveBorderColor;
  }

  isPreviousDisabled(): boolean {
    const cfg = this.previousButton ?? DEFAULT_PREVIOUS;
    return cfg.disabled?.(this.currentStep) ?? this.isFirstStep;
  }

  isNextDisabled(): boolean {
    const cfg = this.nextButton ?? DEFAULT_NEXT;
    return cfg.disabled?.(this.currentStep) ?? this.isLastStep;
  }

  onPrevious() {
    if (this.isPreviousDisabled()) return;
    const newIndex = Math.max(0, this.currentStep - 1);
    this.previousClicked.emit(this.currentStep);
    this.stepChange.emit(newIndex);
  }

  onNext() {
    if (this.isNextDisabled()) return;
    const newIndex = Math.min(this.steps.length - 1, this.currentStep + 1);
    this.nextClicked.emit(this.currentStep);
    this.stepChange.emit(newIndex);
  }

  onCancel() {
    this.cancelClicked.emit();
  }

  getButtonVariant(cfg: StepperButtonConfig): 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' {
    const v = cfg.variant ?? 'primary';
    return v as 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  }
}
