import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StepperComponent, type StepperStep, type StepperButtonConfig } from '@arcange/components/stepper';
import { DocHighlightedCodeComponent } from '../../shared/doc-highlighted-code/doc-highlighted-code.component';

@Component({
  standalone: true,
  selector: 'app-stepper-docs',
  imports: [CommonModule, RouterLink, StepperComponent, DocHighlightedCodeComponent],
  templateUrl: './stepper-docs.component.html',
  styleUrls: ['./stepper-docs.component.css'],
})
export class StepperDocsComponent {
  readonly currentStep = signal(0);
  readonly currentStepCustom = signal(0);
  readonly currentStepIcons = signal(0);
  readonly currentStepTpl = signal(0);

  readonly steps: StepperStep[] = [
    { id: 'info', name: 'Información' },
    { id: 'details', name: 'Detalles' },
    { id: 'confirm', name: 'Confirmar' },
  ];

  readonly stepsWithIcons: StepperStep[] = [
    { id: 'info', name: 'Información' },
    {
      id: 'details',
      name: 'Detalles',
      completedIconClass: 'material-icons',
      completedIconContent: 'check',
    },
    { id: 'confirm', name: 'Confirmar' },
  ];

  readonly previousBtn: StepperButtonConfig = { label: 'Anterior' };
  readonly nextBtn: StepperButtonConfig = { label: 'Siguiente' };
  readonly cancelBtn: StepperButtonConfig = { label: 'Cancelar', variant: 'ghost' };

  readonly codeStepsWithIcons = `readonly stepsWithIcons: StepperStep[] = [
  { id: 'info', name: 'Información' },
  {
    id: 'details',
    name: 'Detalles',
    completedIconClass: 'material-icons',
    completedIconContent: 'check',
  },
  { id: 'confirm', name: 'Confirmar' },
];`;

  stepDisplay(index: number): number {
    return index + 1;
  }

  onCancel() {
    this.currentStep.set(0);
    this.currentStepCustom.set(0);
    this.currentStepIcons.set(0);
    this.currentStepTpl.set(0);
  }
}
