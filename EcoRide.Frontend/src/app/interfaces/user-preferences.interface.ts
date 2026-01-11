export interface UserPreferences {
  smokingAllowed?: boolean;
  musicAllowed?: boolean;
  petsAllowed?: boolean;
  maxDetourMinutes?: number;
  preferredDepartureTime?: string;
  conversationLevel?: 'quiet' | 'moderate' | 'chatty';
}
