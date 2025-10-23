

import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { LoaderComponent } from '../shared/loader/loader.component';
import { DownloadModalComponent } from '../shared/download-modal/download-modal.component';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, LoaderComponent, DownloadModalComponent],
})
export class ImageEditorComponent {
  private readonly geminiService = inject(GeminiService);

  readonly prompt = signal('');
  readonly selectedFile = signal<File | null>(null);
  readonly originalImageUrl = signal<string | null>(null);
  readonly editedImageUrl = signal<string | null>(null);
  readonly loading = signal(false);
  readonly loadingMessage = signal('');
  readonly error = this.geminiService.error;
  readonly showDownloadModal = signal(false);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processFile(input.files[0]);
    }
  }

  private processFile(file: File): void {
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = (e: any) => this.originalImageUrl.set(e.target.result);
    reader.readAsDataURL(file);
    this.editedImageUrl.set(null);
    this.error.set(null);
  }

  async editImage(): Promise<void> {
    const file = this.selectedFile();
    const userPrompt = this.prompt();
    if (!file || !userPrompt.trim()) {
      this.error.set('Please upload an image and provide an edit instruction.');
      return;
    }

    try {
      this.loadingMessage.set('Step 1/2: Analyzing original image...');
      const imagePart = await this.geminiService.fileToGenerativePart(file);

      const analysisPrompt = "Briefly describe this image in a way that can be used as a prompt for an image generator.";
      const imageDescription = await this.geminiService.analyzeImage(this.loading, analysisPrompt, imagePart);
      
      if (!imageDescription) {
        if (!this.error()) this.error.set('Failed to analyze the image.');
        return;
      }

      this.loadingMessage.set('Step 2/2: Generating the edited image...');
      const finalPrompt = `${imageDescription}, with the following change: ${userPrompt}`;
      
      const newImageUrl = await this.geminiService.generateImage(this.loading, finalPrompt, '1:1');
      if (newImageUrl) {
        this.editedImageUrl.set(newImageUrl);
      }
    } finally {
      this.loadingMessage.set('');
    }
  }
}
