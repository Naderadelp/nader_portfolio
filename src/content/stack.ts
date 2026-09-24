import type { StackGroup } from '@/content/types';

/**
 * Flat tag lists, deliberately. No proficiency percentages, no star ratings,
 * no "advanced/intermediate" labels. Either it is something I have worked in,
 * or it sits in the `learning` group and is labelled as such.
 */
export const stack = [
  {
    id: 'languages',
    label: 'Languages',
    kind: 'experience',
    items: ['PHP', 'TypeScript', 'JavaScript', 'SQL'],
  },
  {
    id: 'backend',
    label: 'Backend',
    kind: 'experience',
    items: [
      'Laravel 9–12',
      'Laravel Octane (FrankenPHP)',
      'Passport',
      'Sanctum',
      'Fortify',
      'Filament',
    ],
  },
  {
    id: 'data',
    label: 'Data',
    kind: 'experience',
    items: ['PostgreSQL', 'MySQL', 'Redis'],
  },
  {
    id: 'async-realtime',
    label: 'Async & realtime',
    kind: 'experience',
    items: [
      'Laravel Queues',
      'Task Scheduling',
      'Laravel Reverb',
      'Laravel Echo',
      'Server-Sent Events',
      'Webhooks',
    ],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    kind: 'experience',
    items: [
      'Modular Monolith',
      'Bounded Contexts',
      'Repository Pattern',
      'REST API Design',
      'Event-Driven Architecture',
      'DDD-style layering',
    ],
  },
  {
    id: 'testing-tooling',
    label: 'Testing & tooling',
    kind: 'experience',
    items: ['PHPUnit', 'Pest', 'Postman', 'Git', 'Linux', 'Laravel Telescope', 'Sentry'],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    kind: 'experience',
    items: ['Next.js', 'React', 'Tailwind CSS'],
  },
  {
    // Kept separate from `backend` on purpose. The backend group means
    // production; this group means my own repositories. Putting Node.js
    // beside Laravel 12 would imply production Node, which is not true yet.
    id: 'side-projects',
    label: 'Own projects, not production',
    kind: 'experience',
    items: ['Node.js', 'Express', 'Vue 3', 'Inertia'],
  },
  {
    id: 'learning',
    label: 'Currently learning',
    kind: 'learning',
    items: ['NestJS'],
  },
] satisfies StackGroup[];

export const experienceStack = stack.filter((group) => group.kind === 'experience');
export const learningStack = stack.filter((group) => group.kind === 'learning');
