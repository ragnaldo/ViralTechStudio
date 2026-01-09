
export enum ContentType {
  REACTION = 'REACTION',
  TECH_TIP = 'TECH_TIP',
  GADGET_REVIEW = 'GADGET_REVIEW',
  SECURITY_ALARM = 'SECURITY_ALARM'
}

export interface ScriptScene {
  visual: string;
  audio: string;
  isStaticImage: boolean; // Indica se esta cena deve usar uma imagem gerada ou um vídeo de referência
  imageIndex?: number;    // Índice da imagem correspondente no array generatedImages
}

export interface VideoScript {
  title: string;
  hook: string;
  scenes: ScriptScene[];
  cta: string;
  estimatedDuration: string;
  viralScore: number;
  wordCount: number;
  referenceLinks: string[]; // Links para vídeos/artigos que servem de base para o remix
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
