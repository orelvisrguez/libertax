
export enum ResponseTone {
  SARCASTIC = 'Sarcastic & Sharp',
  ACADEMIC = 'Academic & Economic',
  AGGRESSIVE = 'Aggressive Debunker',
  DIPLOMATIC = 'Diplomatic Libertarian',
  IRONIC = 'Ironic/Meme Style'
}

export enum LibertarianPersona {
  ANCAP = 'Anarcocapitalista (Milei Style)',
  MINARCHIST = 'Minarquista (Estado Mínimo)',
  CLASSIC_LIBERAL = 'Liberal Clásico (Alberdi/Smith)',
  PALEOLIBERTARIAN = 'Paleolibertario (Tradición)'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Fallacy {
  name: string;
  description: string;
}

export interface PostResponse {
  id: string;
  username?: string;
  originalText?: string;
  originalImage?: string;
  generatedContent: string;
  memeCaption?: string; // Short English caption for the image model
  generatedImageUrl?: string;
  timestamp: number;
  tone: ResponseTone;
  persona: LibertarianPersona;
  sources?: GroundingSource[];
  fallacies?: Fallacy[];
  collectivismScore: number; // 0 to 100
}

export interface GeminiResponsePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}
