import { Injectable, WritableSignal } from '@angular/core';

export interface ImageUploadResult {
  file: File;
  previewUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  async handleFileSelection(
    event: Event, 
    errorSignal: WritableSignal<string | null>,
    allowedTypes: string[] = ['image/png', 'image/jpeg', 'image/webp']
  ): Promise<ImageUploadResult | null> {
    errorSignal.set(null);
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return null;
    }

    const file = input.files[0];
    if (!allowedTypes.includes(file.type)) {
      errorSignal.set(`Invalid file type. Please select a valid image file (${allowedTypes.join(', ')}).`);
      input.value = ''; // Reset file input
      return null;
    }

    try {
      const previewUrl = await this.readFileAsDataURL(file);
      return { file, previewUrl };
    } catch (e) {
      errorSignal.set('There was an error reading the file.');
      console.error(e);
      return null;
    }
  }

  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}