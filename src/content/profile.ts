import type { Profile } from '@/content/types';

/**
 * First-screen copy.
 *
 * The headline is the tagline's second half, cut in two and set as a claim.
 * "Integrations, queues, and state that stays correct after the request ends"
 * is accurate but it is a description; "The request ends. The work doesn't."
 * is the same idea as an argument, and it is the one sentence that separates
 * this kind of engineering from the kind everyone else's portfolio shows.
 *
 * Every figure in `stats` is countable and appears again, with its method, in
 * the case study it came from.
 */
export const hero = {
  headline: ['The request ends.', "The work doesn't."],
  lead: `Backend developer for Laravel and Node. I connect your app to the systems it depends on — ERPs, CRMs, listing portals — and keep the data agreeing after the request is over. Seven projects below, with the trade-offs left in.`,
  availability: 'Taking freelance work · ~20h/week · Cairo, GMT+3',
  stats: [
    { value: '20,665', label: 'Lines, sole author' },
    { value: '~5,000', label: 'Platform users' },
    { value: '~50', label: 'Field agents on my sync' },
    { value: '35', label: 'Test files' },
  ],
  portraitSrc: '/portrait.jpg',
} as const;

export const profile = {
  name: 'Nader Adel',
  role: 'Backend Software Engineer',
  location: 'Cairo, Egypt',
  timezone: 'Cairo time',
  tagline:
    'Backend engineer. Laravel and TypeScript. Integrations, queues, and state that stays correct after the request ends.',
  positioning: [
    `I have a year and a half of production Laravel behind me, at a real-estate group in Cairo. The codebase is a modular monolith of 127 bounded contexts, used by about 5,000 people across eight departments, deployed for four companies in the group, and worked on by around 40 engineers. That is the environment I learned in: other people's modules on every side of mine, and changes that have to land without breaking them.`,
    `My strongest work is integration and async. Typed clients for third-party systems, queued jobs, rate-limit handling, and reconciliation sweeps for the cases where the other side has no way to tell you that something changed. Most of what I build runs after the response has already gone out.`,
    `I work in TypeScript as well — including Next.js screens that are in production — and outside work I build Node.js and Express services with the same layering I use in Laravel.`,
  ],
  availability: {
    base: 'Cairo',
    summary:
      'Based in Cairo. Full overlap with EU business hours, and overlap with US East until roughly 1pm ET.',
    points: [
      'Full overlap with EU business hours',
      'Overlap with US East until roughly 1pm ET',
      'Open to remote work',
    ],
  },
  socials: [
    {
      platform: 'email',
      label: 'Email',
      handle: 'naderadelpp@gmail.com',
      href: 'mailto:naderadelpp@gmail.com',
    },
    {
      platform: 'github',
      label: 'GitHub',
      handle: 'github.com/Naderadelp',
      href: 'https://github.com/Naderadelp',
    },
    {
      platform: 'linkedin',
      label: 'LinkedIn',
      handle: 'linkedin.com/in/nader-adel-7a3546196',
      href: 'https://linkedin.com/in/nader-adel-7a3546196',
    },
  ],
  cvs: [
    {
      id: 'laravel',
      label: 'CV — Laravel / PHP',
      href: '/cv/NaderAdel-BackendEngineer-Laravel.pdf',
      description: 'Two pages, weighted towards the production Laravel work.',
    },
    {
      id: 'node',
      label: 'CV — Node / TypeScript',
      href: '/cv/NaderAdel-BackendEngineer-Node.pdf',
      description: 'Two pages, weighted towards the TypeScript and Node work.',
    },
  ],
} satisfies Profile;
