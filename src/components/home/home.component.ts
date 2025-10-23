

import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

// This matches the type in app.component.ts
interface NavItem {
  id: any;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  features = input.required<NavItem[]>();
  navigate = output<any>();

  // Filter out 'home' and 'creator' tabs from the feature overview
  featureItems = computed(() => 
    this.features().filter(item => item.id !== 'home' && item.id !== 'creator')
  );

  navigateTo(featureId: any): void {
    this.navigate.emit(featureId);
  }
}