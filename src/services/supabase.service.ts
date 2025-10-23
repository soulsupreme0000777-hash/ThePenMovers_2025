import { Injectable, signal, effect } from '@angular/core';
import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

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
      'https://lbhspdlljxbruacfuxae.supabase.co', 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiaHNwZGxsanhicnVhY2Z1eGFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyMzQ1NTEsImV4cCI6MjA3NjgxMDU1MX0.Shq0xZwTA3Oj5F0FMjw1zLczMl52h1NRm9sgi17HU4s'
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

  async signInWithPassword(email: string, password: string): Promise<{ error: any }> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    return { error };
  }

  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
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
