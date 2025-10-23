import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule]
})
export class LoginComponent {
  private readonly supabaseService = inject(SupabaseService);

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async handleLogin(): Promise<void> {
    if (!this.email().trim() || !this.password().trim()) {
      this.error.set('Please enter both email and password.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { error } = await this.supabaseService.signInWithPassword(this.email(), this.password());
    
    if (error) {
        this.error.set(error.message);
    } 
    // On successful login, the app component's session signal will trigger the view change.

    this.loading.set(false);
  }
}