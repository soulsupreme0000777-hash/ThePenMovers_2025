import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NanoBananaService {
  /**
   * Simulates generating an image from a free service.
   * In this case, it returns a random image from picsum.photos.
   */
  async generateImage(
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  ): Promise<string> {
    // Simulate network delay for a realistic user experience
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const [w, h] = this.getDimensions(aspectRatio);
    // Use a random seed to ensure a new image is fetched each time
    const seed = Date.now();
    return `https://picsum.photos/seed/${seed}/${w}/${h}`;
  }

  private getDimensions(aspectRatio: string): [number, number] {
    switch (aspectRatio) {
      case '16:9': return [1024, 576];
      case '9:16': return [576, 1024];
      case '4:3': return [1024, 768];
      case '3:4': return [768, 1024];
      case '1:1':
      default:
        return [800, 800];
    }
  }
}
