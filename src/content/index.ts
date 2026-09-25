export type {
  Availability,
  CaseStudy,
  CaseStudyMetric,
  CaseStudySection,
  CaseStudySectionHeading,
  CvLink,
  CvVariantId,
  DiagramKey,
  Engagement,
  EngagementStep,
  EducationEntry,
  ExperienceEntry,
  LanguageEntry,
  Profile,
  Project,
  ProjectGlance,
  Service,
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
export { contributions } from './contributions';
export { services, engagement, projectGlance } from './freelance';
