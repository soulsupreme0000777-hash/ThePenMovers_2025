import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { LoaderComponent } from '../loader/loader.component';

@Component({
  selector: 'app-download-modal',
  templateUrl: './download-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent],
})
export class DownloadModalComponent {
  imageUrl = input.required<string>();
  close = output<void>();

  isProcessing = signal(false);
  processingMessage = signal('');

  async downloadImage(format: 'png' | 'jpeg', quality?: number): Promise<void> {
    if (!this.imageUrl()) return;
    this.processingMessage.set(`Processing ${format.toUpperCase()}...`);
    this.isProcessing.set(true);

    // Use a short timeout to allow the UI to update with the processing message
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      if (format === 'png') {
        this.triggerDownload(this.imageUrl(), 'generated-image.png');
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      const img = new Image();

      const imageLoadPromise = new Promise<void>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          const qualityPercent = Math.round((quality ?? 1) * 100);
          this.triggerDownload(dataUrl, `generated-image-q${qualityPercent}.jpg`);
          resolve();
        };
        img.onerror = (err) => reject(new Error('Image failed to load for processing.'));
      });

      img.src = this.imageUrl();
      await imageLoadPromise;

    } catch (error) {
      console.error('Failed to process image for download', error);
    } finally {
      this.isProcessing.set(false);
      this.processingMessage.set('');
    }
  }

  private triggerDownload(dataUrl: string, filename: string): void {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
