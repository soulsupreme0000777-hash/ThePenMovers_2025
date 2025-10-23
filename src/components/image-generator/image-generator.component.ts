
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { NanoBananaService } from '../../services/nano-banana.service';
import { LoaderComponent } from '../shared/loader/loader.component';
import { DownloadModalComponent } from '../shared/download-modal/download-modal.component';

@Component({
  selector: 'app-image-generator',
  templateUrl: './image-generator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LoaderComponent, DownloadModalComponent]
})
export class ImageGeneratorComponent {
  private readonly nanoBananaService = inject(NanoBananaService);

  readonly prompt = signal('');
  readonly generatedImageUrl = signal<string | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedAspectRatio = signal<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  readonly aspectRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];
  readonly showDownloadModal = signal(false);

  async generateImage(): Promise<void> {
    if (!this.prompt().trim()) {
      this.error.set("Please enter a prompt.");
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    
    try {
      const imageUrl = await this.nanoBananaService.generateImage(this.prompt(), this.selectedAspectRatio());
      if (imageUrl) {
        this.generatedImageUrl.set(imageUrl);
      }
    } catch (e) {
      this.error.set('An error occurred while generating the image.');
      console.error(e);
    } finally {
      this.loading.set(false);
    }
  }

  isAspectRatio(value: string): value is '1:1' | '16:9' | '9:16' | '4:3' | '3:4' {
    return this.aspectRatios.includes(value);
  }

  updateAspectRatio(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (this.isAspectRatio(value)) {
        this.selectedAspectRatio.set(value);
    }
  }
}
