import { TemplateRef } from '@angular/core';

export interface StepperStep {
  id: string;
  name: string;
  completedIconClass?: string;
  completedIconContent?: string;
  completedIconTemplate?: TemplateRef<unknown>;
}

export interface StepperButtonConfig {
  label?: string;
  labelTemplate?: TemplateRef<{ $implicit: { stepIndex: number; totalSteps: number } }>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  hidden?: boolean;
  disabled?: (currentStep: number) => boolean;
}
