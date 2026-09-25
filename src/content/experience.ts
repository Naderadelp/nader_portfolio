import type { EducationEntry, ExperienceEntry, LanguageEntry } from '@/content/types';

export const experience = [
  {
    id: 'address-investments-engineer',
    title: 'Backend Software Engineer',
    company: 'The Address Investments',
    location: 'Cairo, Egypt',
    start: 'Aug 2025',
    end: 'Present',
    period: 'Aug 2025 – Present',
    current: true,
    summary:
      'Feature work across seven modules, plus the integrations that connect the platform to the systems outside it.',
    highlights: [
      'Own features end to end across the HR, Unit, Deal, Lead, Learning, Developer Project and Task Management modules: schema, domain logic, queued jobs, API and tests.',
      'Build the third-party integrations: typed clients, rate-limit handling, and scheduled reconciliation for the systems that never send anything back.',
      'Alongside the current platform, still maintain the older Laravel 9 CRM that serves the rest of the group.',
      'Land changes in modules other engineers own without breaking them — reading more code than I change, and writing the tests that prove nothing adjacent moved.',
    ],
  },
  {
    id: 'address-investments-intern',
    title: 'Backend Engineering Intern',
    company: 'The Address Investments',
    location: 'Cairo, Egypt',
    start: 'Apr 2025',
    end: 'Aug 2025',
    period: 'Apr 2025 – Aug 2025',
    current: false,
    summary: 'Four months on the Laravel 9 CRM the group was running at the time.',
    highlights: [
      'Shipped lead and deal features into the group\u2019s production CRM during the internship.',
      'Built a concurrency-safe booking flow that claims an agent time slot and creates the linked lead inside one locked transaction, so two agents can never hold the same slot.',
    ],
  },
] satisfies ExperienceEntry[];

export const education = [
  {
    id: 'cic-beng',
    degree: 'BEng, Communication & Electronics',
    institution: 'Canadian International College',
    location: 'Cairo, Egypt',
    year: '2022',
  },
] satisfies EducationEntry[];

export const languages = [
  { language: 'Arabic', level: 'Native' },
  { language: 'English', level: 'C1' },
] satisfies LanguageEntry[];
