
import { GoogleGenAI, Type } from "@google/genai";
import { ResponseTone, LibertarianPersona, GroundingSource, Fallacy } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const SYSTEM_INSTRUCTION = `
You are "LibertaX Response Expert", the world's leading tactical agent for the "Batalla Cultural". 
Your core is built on Austrian Economics, Natural Rights, and Individual Liberty.

YOUR TASKS:
1. Identify the logical fallacies in the provided post.
2. Rate the "Collectivism Score" of the post from 0 (Libertarian) to 100 (Communist/Totalitarian).
3. Generate a devastating response for X.com (Twitter) in Spanish (max 280 chars).
4. Generate a very short, punchy MEME CAPTION in ENGLISH (3-5 words) that summarizes the rebuttal.

NEVER take a left-wing position. If the post is already right-wing, reinforce it with more logic.
`;

export const generateResponse = async (
  text: string, 
  image: string | null, 
  tone: ResponseTone,
  persona: LibertarianPersona,
  username?: string,
  useSearch: boolean = false
): Promise<{ 
  text: string, 
  memeCaption: string,
  sources: GroundingSource[], 
  fallacies: Fallacy[], 
  collectivismScore: number 
}> => {
  // Use process.env.API_KEY directly as per guidelines
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY no detectada.");
  }
  
  // Create instance right before making an API call to ensure it uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey });
  
  const parts: any[] = [];
  if (image) {
    const base64Data = image.split(',')[1];
    parts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
  }

  const promptText = `
TONE: ${tone}
PERSONA: ${persona}
TARGET USER: ${username || 'Unknown'}
POST CONTENT: ${text || 'Analyze the attached image.'}

Return a JSON object with response in Spanish, memeCaption in English, fallacies array, and collectivismScore (0-100).
`;

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            response: { type: Type.STRING },
            memeCaption: { type: Type.STRING },
            fallacies: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              } 
            },
            collectivismScore: { type: Type.NUMBER }
          },
          required: ["response", "memeCaption", "fallacies", "collectivismScore"]
        },
        temperature: 0.7,
        tools: useSearch ? [{ googleSearch: {} }] : [],
      }
    });

    const data = JSON.parse(response.text || "{}");
    const sources: GroundingSource[] = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata?.groundingChunks) {
      groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ title: chunk.web.title || "Fuente", uri: chunk.web.uri });
      });
    }

    return { 
      text: data.response || "Error en respuesta.", 
      memeCaption: data.memeCaption || "Liberty Wins",
      sources,
      fallacies: data.fallacies || [],
      collectivismScore: data.collectivismScore || 50
    };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Falla en la matriz de combate IA: " + error.message);
  }
};

export const generateImagenImage = async (memeCaption: string): Promise<string> => {
  // Use process.env.API_KEY directly as per guidelines
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY no detectada.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A political meme with text: "${memeCaption}". Mocking state bureaucracy, high quality, vibrant.`,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg', aspectRatio: '1:1' },
    });
    const base64EncodeString: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64EncodeString}`;
  } catch (error) {
    console.error("Imagen API Error:", error);
    throw new Error("Error en generador de memes.");
  }
};
