export type {
  Availability,
  CaseStudy,
  CaseStudyMetric,
  CaseStudySection,
  CaseStudySectionHeading,
  CvLink,
  CvVariantId,
  DiagramKey,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  Profile,
  Project,
  SocialLink,
  SocialPlatform,
  StackGroup,
  StackGroupKind,
} from '@/content/types';

export { profile } from '@/content/profile';
export { experience, education, languages } from '@/content/experience';
export { caseStudies, caseStudiesBySlug, getCaseStudy } from '@/content/case-studies';
export { projects } from '@/content/projects';
export { stack, experienceStack, learningStack } from '@/content/stack';
