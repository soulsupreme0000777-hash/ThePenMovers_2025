
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { LoaderComponent } from '../shared/loader/loader.component';

@Component({
  selector: 'app-image-analyzer',
  templateUrl: './image-analyzer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LoaderComponent]
})
export class ImageAnalyzerComponent {
  private readonly geminiService = inject(GeminiService);

  readonly prompt = signal('What is in this image?');
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly analysis = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = this.geminiService.error;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = (e: any) => this.previewUrl.set(e.target.result);
      reader.readAsDataURL(file);
      this.analysis.set(null);
      this.error.set(null);
    }
  }

  async analyzeImage(): Promise<void> {
    const file = this.selectedFile();
    if (!file) {
      this.error.set("Please upload an image first.");
      return;
    }
    const imagePart = await this.geminiService.fileToGenerativePart(file);
    const result = await this.geminiService.analyzeImage(this.loading, this.prompt(), imagePart);
    if (result) {
      this.analysis.set(result);
    }
  }
}
