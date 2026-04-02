import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';

export type DocPrismLanguage = 'markup' | 'typescript' | 'css' | 'javascript';

@Component({
  selector: 'app-doc-highlighted-code',
  standalone: true,
  imports: [CommonModule],
  template: `<pre
    class="docs-code-block docs-code-block--prism"
    role="region"
    [attr.aria-label]="ariaLabel"
  ><code [class]="codeClass" [innerHTML]="html"></code></pre>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocHighlightedCodeComponent implements OnChanges {
  private readonly sanitizer = inject(DomSanitizer);

  @Input({ required: true }) code!: string;
  @Input() language: DocPrismLanguage = 'markup';
  @Input() ariaLabel = 'Fragmento de código';

  html: SafeHtml = '';

  get codeClass(): string {
    return `language-${this.language}`;
  }

  ngOnChanges(_changes: SimpleChanges): void {
    const raw = this.code ?? '';
    const langKey =
      this.language === 'javascript'
        ? 'javascript'
        : this.language === 'typescript'
          ? 'typescript'
          : this.language === 'css'
            ? 'css'
            : 'markup';
    const grammar = Prism.languages[langKey];
    const highlighted: string =
      grammar != null
        ? Prism.highlight(raw, grammar, langKey)
        : String(Prism.util.encode(raw));
    this.html = this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}
