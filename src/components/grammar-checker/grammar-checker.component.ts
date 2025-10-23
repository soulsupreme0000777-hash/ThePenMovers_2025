import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService, GrammarError } from '../../services/gemini.service';
import { LoaderComponent } from '../shared/loader/loader.component';

@Component({
  selector: 'app-grammar-checker',
  templateUrl: './grammar-checker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LoaderComponent]
})
export class GrammarCheckerComponent {
  private readonly geminiService = inject(GeminiService);

  readonly text = signal('');
  readonly results = signal<GrammarError[] | null>(null);
  readonly loading = signal(false);
  readonly error = this.geminiService.error;

  async checkText(): Promise<void> {
    if (!this.text().trim()) {
      this.error.set("Please enter some text to check.");
      return;
    }
    this.results.set(null);
    const response = await this.geminiService.checkGrammar(this.loading, this.text());
    if (response) {
      this.results.set(response.corrections);
    }
  }
}
