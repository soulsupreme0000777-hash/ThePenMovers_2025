


import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { LoaderComponent } from '../shared/loader/loader.component';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-image-analyzer',
  templateUrl: './image-analyzer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent]
})
export class ImageAnalyzerComponent {
  private readonly geminiService = inject(GeminiService);
  private readonly imageUploadService = inject(ImageUploadService);

  readonly prompt = signal('What is in this image?');
  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly analysis = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = this.geminiService.error;

  async onFileSelected(event: Event): Promise<void> {
    const result = await this.imageUploadService.handleFileSelection(event, this.error);
    if (result) {
      this.selectedFile.set(result.file);
      this.previewUrl.set(result.previewUrl);
      this.analysis.set(null);
      this.error.set(null); // Clear previous errors
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
