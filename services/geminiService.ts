
import { GoogleGenAI, Type } from "@google/genai";
import { ResponseTone, LibertarianPersona, GroundingSource, Fallacy } from "../types";

const SYSTEM_INSTRUCTION = `
You are "LibertaX Response Expert", the world's leading tactical agent for the "Batalla Cultural". 
Your core is built on Austrian Economics, Natural Rights, and Individual Liberty.

YOUR TASKS:
1. Identify the logical fallacies in the provided post.
2. Rate the "Collectivism Score" of the post from 0 (Libertarian) to 100 (Communist/Totalitarian).
3. Generate a devastating response for X.com (Twitter) in Spanish (max 280 chars).
4. Generate a very short, punchy MEME CAPTION in ENGLISH (3-5 words) that summarizes the rebuttal. This caption is for an image generator, so it must be in English for better accuracy.

PERSONA DEFINITIONS:
- ANCAP: Focus on the Non-Aggression Principle (NAP), "Taxation is theft", and private cities.
- MINARCHIST: Focus on the inefficiency of government except for justice and security.
- CLASSIC_LIBERAL: Focus on rule of law, historical institutions, and individual rights.
- PALEOLIBERTARIAN: Focus on liberty combined with traditional Western cultural values.

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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [];
  if (image) {
    const base64Data = image.split(',')[1];
    parts.push({ inlineData: { mimeType: "image/jpeg", data: base64Data } });
  }

  const promptText = `
TONE: ${tone}
PERSONA: ${persona}
TARGET USER: ${username || 'Unknown'}
SEARCH ENABLED: ${useSearch}
POST CONTENT: ${text || 'Analyze the attached image.'}

Return a JSON object with:
{
  "response": "The tweet text in Spanish (max 275 chars)",
  "memeCaption": "Short 3-5 word punchy English phrase for a meme",
  "fallacies": [{"name": "Name", "description": "Short explanation"}],
  "collectivismScore": number
}
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

    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr);
    const sources: GroundingSource[] = [];

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks;

    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web && chunk.web.uri) {
          sources.push({ title: chunk.web.title || "Evidencia", uri: chunk.web.uri });
        }
      });
    }

    return { 
      text: data.response || "Error generando respuesta.", 
      memeCaption: data.memeCaption || "Liberty Wins",
      sources: sources.filter((v, i, a) => a.findIndex(t => t.uri === v.uri) === i),
      fallacies: data.fallacies || [],
      collectivismScore: data.collectivismScore || 50
    };
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error("Falla en la matriz de combate IA.");
  }
};

export const generateImagenImage = async (memeCaption: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    // We use the English memeCaption for better text rendering in the image model.
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: `A high-impact political meme with a clear and legible text overlay that says: "${memeCaption}". Caricature style, vibrant colors, mocking state bureaucracy and collectivism. Professional editorial cartoon aesthetic. The text "${memeCaption}" must be the central focus and spelled correctly.`,
      config: { 
        numberOfImages: 1, 
        outputMimeType: 'image/jpeg', 
        aspectRatio: '1:1' 
      },
    });
    return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;
  } catch (error) {
    throw new Error("Error en generador de memes.");
  }
};
