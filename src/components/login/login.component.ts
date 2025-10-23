
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: []
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

    const { data, error } = await this.supabaseService.signInWithPassword(this.email(), this.password());
    
    if (error) {
        this.error.set(error.message);
    } else if (!data.session && data.user) {
        // This case handles when the user has signed up but not confirmed their email.
        this.error.set('Please check your email and click the confirmation link to sign in.');
    }
    // On a fully successful login (data.session is not null), 
    // the onAuthStateChange listener in SupabaseService will update the session signal,
    // and the app component will automatically switch views.

    this.loading.set(false);
  }
}