import { Injectable, signal, effect } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

export interface Profile {
    id: string;
    email: string;
    has_set_password?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  readonly session = signal<Session | null>(null);
  readonly currentUser = signal<User | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      this.session.set(session);
      this.currentUser.set(session?.user ?? null);
    });
  }

  async signInWithPassword(email: string, password: string): Promise<{ data: { session: Session | null; user: User | null; }; error: any; }> {
    // Attempt to sign in
    const { data: signInData, error } = await this.supabase.auth.signInWithPassword({ email, password });

    // After the attempt, immediately refresh the session state from Supabase.
    // This is more reliable than relying on onAuthStateChange or the return value of signInWithPassword.
    const { data: { session } } = await this.supabase.auth.getSession();
    this.session.set(session);
    this.currentUser.set(session?.user ?? null);
    
    // Return the original response from the sign-in attempt for the component to handle errors.
    return { data: signInData, error };
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
        // Log the error but proceed to clear local state
        console.error('Error during sign out:', error.message);
    }
    // Regardless of error, clear the local session state to ensure the user is logged out in the UI.
    this.session.set(null);
    this.currentUser.set(null);
  }
  
  async sendPasswordResetEmail(email: string): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    return { error };
  }

  async checkUserProfile(email: string): Promise<{ profile: Profile | null; error: any }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    return { profile: data, error };
  }
}