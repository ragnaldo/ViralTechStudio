
export enum ContentType {
  REACTION = 'REACTION',
  TECH_TIP = 'TECH_TIP',
  GADGET_REVIEW = 'GADGET_REVIEW',
  SECURITY_ALARM = 'SECURITY_ALARM'
}

export interface VideoScript {
  title: string;
  hook: string;
  body: string;
  cta: string;
  estimatedDuration: string;
  visualCues: string[];
  viralScore: number;
  wordCount: number;
  backgroundImagesPrompts: string[];
  generatedImages?: string[];
}

export interface ViralTrend {
  title: string;
  url: string;
  relevance: string;
  strategy: string;
  viewCount: string;
}

export interface ProfileAnalysis {
  name: string;
  style: string;
  strengths: string[];
  viralHooks: string[];
}
