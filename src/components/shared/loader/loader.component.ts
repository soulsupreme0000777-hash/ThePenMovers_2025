import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center space-y-2">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      @if (text()) {
        <p class="text-green-400">{{ text() }}</p>
      }
    </div>
  `
})
export class LoaderComponent {
  text = input<string>();
}
