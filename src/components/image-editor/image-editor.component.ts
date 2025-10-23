
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { NanoBananaService } from '../../services/nano-banana.service';
import { LoaderComponent } from '../shared/loader/loader.component';
import { DownloadModalComponent } from '../shared/download-modal/download-modal.component';
import { ImageUploadService } from '../../services/image-upload.service';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent, DownloadModalComponent],
})
export class ImageEditorComponent {
  private readonly nanoBananaService = inject(NanoBananaService);
  private readonly imageUploadService = inject(ImageUploadService);

  readonly prompt = signal('');
  readonly selectedFile = signal<File | null>(null);
  readonly originalImageUrl = signal<string | null>(null);
  readonly editedImageUrl = signal<string | null>(null);
  readonly loading = signal(false);
  readonly loadingMessage = signal('');
  readonly error = signal<string| null>(null);
  readonly showDownloadModal = signal(false);

  async onFileSelected(event: Event): Promise<void> {
    const result = await this.imageUploadService.handleFileSelection(event, this.error);
    if (result) {
      this.selectedFile.set(result.file);
      this.originalImageUrl.set(result.previewUrl);
      this.editedImageUrl.set(null);
      this.error.set(null); // Clear previous errors
    }
  }

  async editImage(): Promise<void> {
    const userPrompt = this.prompt();
    if (!this.selectedFile() || !userPrompt.trim()) {
      this.error.set('Please upload an image and provide an edit instruction.');
      return;
    }

    this.error.set(null);
    this.loading.set(true);
    this.loadingMessage.set('Generating edited image...');
    
    try {
      const newImageUrl = await this.nanoBananaService.generateImage(userPrompt, '1:1');
      if (newImageUrl) {
        this.editedImageUrl.set(newImageUrl);
      }
    } catch (e) {
      this.error.set('An error occurred while generating the edited image.');
      console.error(e);
    } finally {
      this.loading.set(false);
      this.loadingMessage.set('');
    }
  }
}
