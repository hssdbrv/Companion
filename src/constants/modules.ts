import type { Href } from 'expo-router';

export type AppModule = {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  tint: string;
  href: Href;
};

export const MODULES: AppModule[] = [
  {
    id: 'wedding-gifts',
    title: 'Wedding gifts',
    subtitle: 'Guests & gift tracker',
    emoji: '🎁',
    tint: '#F59E0B',
    href: '/modules/wedding-gifts',
  },
  {
    id: 'relatives',
    title: 'Relatives',
    subtitle: 'Family & relationships',
    emoji: '👨‍👩‍👧‍👦',
    tint: '#55ABD4',
    href: '/modules/relatives',
  },
  // add more here, e.g. { id: 'notes', title: 'Notes', ... href: '/modules/notes' }
];