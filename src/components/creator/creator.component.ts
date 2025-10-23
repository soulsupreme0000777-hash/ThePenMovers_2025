import { Component, ChangeDetectionStrategy, signal } from '@angular/core';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorComponent {
  showAboutMe = signal(false);

  toggleAboutMe(): void {
    this.showAboutMe.update(value => !value);
  }
}