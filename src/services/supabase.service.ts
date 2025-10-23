import { Injectable, signal } from '@angular/core';

// A simple mock session object to indicate a logged-in state.
const MOCK_SESSION = { user: { email: 'member@thepenmovers.com' } };

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  // The session signal now tracks our simple, hardcoded login state.
  // undefined = initializing, null = logged out, object = logged in.
  readonly session = signal<object | null | undefined>(undefined);

  constructor() {
    // On startup, we check sessionStorage to see if the user was already logged in.
    // This persists the session across page refreshes.
    try {
      const storedSession = sessionStorage.getItem('thepenmovers-session');
      if (storedSession) {
        this.session.set(JSON.parse(storedSession));
      } else {
        this.session.set(null);
      }
    } catch (e) {
      // If sessionStorage is corrupt or unavailable, start fresh.
      this.session.set(null);
    }
  }

  /**
   * Signs in the user with a hardcoded email and password.
   * Returns a simple object indicating success or failure.
   */
  signInWithPassword(email: string, password: string): { success: boolean, error?: string } {
    if (email === 'member@thepenmovers.com' && password === 'thepenmovers2025') {
      this.session.set(MOCK_SESSION);
      // Store the session so the user stays logged in after a refresh.
      sessionStorage.setItem('thepenmovers-session', JSON.stringify(MOCK_SESSION));
      return { success: true };
    } else {
      return { success: false, error: 'The email or password you entered is incorrect. Please try again.' };
    }
  }

  /**
   * Signs out the user by clearing the session state.
   */
  signOut(): void {
    this.session.set(null);
    sessionStorage.removeItem('thepenmovers-session');
  }
}
