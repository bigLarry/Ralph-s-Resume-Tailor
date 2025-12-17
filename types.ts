
export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedIn?: string;
  github?: string;
}

export interface Skill {
  name: string;
  category?: string;
  level?: string;
}

export interface Experience {
  id?: string;
  title: string;
  company: string;
  location?: string;
  employmentType?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  bullets?: string[];
  technologies?: string[];
  keywords?: string[];
}

export interface Project {
  id?: string;
  name: string;
  role?: string;
  description?: string;
  bullets?: string[];
  technologies?: string[];
  links?: string[];
}

export interface Education {
  id?: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date?: string;
  url?: string;
}

export interface UserProfile {
  id?: string;
  fullName: string;
  headline?: string;
  contactInfo?: ContactInfo;
  summary?: string;
  skills?: Skill[];
  experience?: Experience[];
  projects?: Project[];
  education?: Education[];
  certifications?: Certification[];
  interests?: string[];
  rawResumeMarkdown?: string;
}

export interface JobDescription {
  id?: string;
  source?: string;
  title?: string;
  company?: string;
  location?: string;
  seniority?: string;
  employmentType?: string;
  pastedText?: string;
  requirements?: string[];
  responsibilities?: string[];
  preferredSkills?: string[];
  keywords?: string[];
}

export interface GenerationSettings {
  targetLength: '1-page' | '2-page' | 'unrestricted';
  includeSections: string[];
  skillsMaxCount: number;
  experienceMaxItems: number;
  projectsMaxItems: number;
  tone: 'concise' | 'neutral' | 'storytelling' | 'technical';
  showKeywordMatchComments: boolean;
  generateCoverLetter: boolean;
  markdownHeadingStyle?: string;
}

export interface MatchSummary {
  overallScore: number;
  hardSkillCoverage: number;
  softSkillCoverage: number;
  topMatchedKeywords: string[];
  missingImportantKeywords: string[];
}

export interface TailoredResume {
  id: string;
  userProfileId?: string;
  jobDescriptionId?: string;
  createdAt: string;
  markdown: string;
  matchSummary?: MatchSummary;
}

export interface TailoredCoverLetter {
  id: string;
  createdAt: string;
  content: string;
}

export const DEFAULT_SETTINGS: GenerationSettings = {
  targetLength: '1-page',
  includeSections: [
    'contact',
    'summary',
    'skills',
    'experience',
    'education'
  ],
  skillsMaxCount: 15,
  experienceMaxItems: 4,
  projectsMaxItems: 2,
  tone: 'neutral',
  showKeywordMatchComments: true,
  generateCoverLetter: true
};
