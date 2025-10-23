

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { GeminiService, GroundingChunk } from '../../services/gemini.service';
import { LoaderComponent } from '../shared/loader/loader.component';

@Component({
  selector: 'app-grounded-search',
  templateUrl: './grounded-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent]
})
export class GroundedSearchComponent {
  private readonly geminiService = inject(GeminiService);

  readonly prompt = signal('');
  readonly answer = signal<string | null>(null);
  readonly sources = signal<GroundingChunk[]>([]);
  readonly loading = signal(false);
  readonly error = this.geminiService.error;

  async search(): Promise<void> {
    if (!this.prompt().trim()) return;

    this.answer.set(null);
    this.sources.set([]);

    const result = await this.geminiService.getGroundedAnswer(this.loading, this.prompt());
    if (result) {
      this.answer.set(result.text);
      this.sources.set(result.sources);
    }
  }
}
