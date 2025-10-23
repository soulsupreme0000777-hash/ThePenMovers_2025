

import { Injectable, signal, WritableSignal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse, Type } from '@google/genai';

export interface GroundingChunk {
  web: {
    uri: string;
    title: string;
  };
}

export interface GrammarError {
  error_text: string;
  explanation: string;
  suggestion: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  public readonly error = signal<string | null>(null);

  constructor() {
    const apiKey = process.env['API_KEY'];
    if (!apiKey) {
      this.error.set("API_KEY environment variable not set. Please set it to use the application.");
      console.error("API_KEY environment variable not set.");
    } else {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  private async handleApiCall<T>(
    loadingSignal: WritableSignal<boolean>,
    apiCall: () => Promise<T>
  ): Promise<T | null> {
    if (!this.ai) {
      this.error.set('Gemini AI client is not initialized. Check API Key.');
      return null;
    }
    loadingSignal.set(true);
    this.error.set(null);
    try {
      return await apiCall();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      this.error.set(errorMessage);
      console.error(e);
      return null;
    } finally {
      loadingSignal.set(false);
    }
  }

  async fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string; }; }> {
    const base64EncodedData = await this.fileToBase64(file);
    return {
      inlineData: {
        data: base64EncodedData,
        mimeType: file.type,
      },
    };
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  }

  async generateImage(
    loadingSignal: WritableSignal<boolean>,
    prompt: string,
    aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
  ): Promise<string | null> {
    const result = await this.handleApiCall(loadingSignal, async () => {
      return this.ai!.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
      });
    });

    if (result && result.generatedImages.length > 0) {
      const base64ImageBytes = result.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
    return null;
  }

  async analyzeImage(
    loadingSignal: WritableSignal<boolean>,
    prompt: string,
    imagePart: { inlineData: { data: string; mimeType: string; } }
  ): Promise<string | null> {
    // FIX: Explicitly specify the generic type for handleApiCall to resolve a TypeScript type inference issue.
    const result = await this.handleApiCall<GenerateContentResponse>(loadingSignal, () =>
      this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
      })
    );
    return result ? result.text : null;
  }

  async transcribeAudio(
    loadingSignal: WritableSignal<boolean>,
    audioPart: { inlineData: { data: string; mimeType: string; } }
  ): Promise<string | null> {
    const prompt = 'Transcribe the following audio file.';
    // FIX: Explicitly specify the generic type for handleApiCall to resolve a TypeScript type inference issue.
    const result = await this.handleApiCall<GenerateContentResponse>(loadingSignal, () =>
      this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [ { text: prompt }, audioPart] },
      })
    );
    return result ? result.text : null;
  }
  
  async getGroundedAnswer(
    loadingSignal: WritableSignal<boolean>,
    prompt: string
  ): Promise<{ text: string, sources: GroundingChunk[] } | null> {
    // FIX: Explicitly specify the generic type for handleApiCall to resolve a TypeScript type inference issue.
    const response = await this.handleApiCall<GenerateContentResponse>(loadingSignal, () =>
      this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      })
    );
    
    if (response) {
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];
      return { text: response.text, sources };
    }
    return null;
  }

  async checkGrammar(
    loadingSignal: WritableSignal<boolean>,
    text: string
  ): Promise<{ corrections: GrammarError[] } | null> {
    const systemInstruction = `You are an expert grammar checker and writing assistant for a university journalism organization called ThePenMovers. Your task is to analyze the provided text, which can be in English or Filipino (Tagalog), and identify any grammatical errors, spelling mistakes, or awkward phrasing. For each error you find, you must provide a clear explanation of why it is wrong and a corrected suggestion. Do not rewrite the entire text. Instead, provide a list of specific corrections. If there are no errors, return an empty list of corrections.`;
    
    const response = await this.handleApiCall<GenerateContentResponse>(loadingSignal, () =>
      this.ai!.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: text,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              corrections: {
                type: Type.ARRAY,
                description: 'A list of grammatical corrections.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    error_text: {
                      type: Type.STRING,
                      description: 'The exact text snippet from the original article that contains the error.'
                    },
                    explanation: {
                      type: Type.STRING,
                      description: 'A clear and concise explanation of why this is a grammatical error, suitable for a student journalist.'
                    },
                    suggestion: {
                      type: Type.STRING,
                      description: 'The corrected version of the text snippet.'
                    }
                  }
                }
              }
            }
          }
        }
      })
    );
    
    if (response) {
      try {
        return JSON.parse(response.text) as { corrections: GrammarError[] };
      } catch (e) {
        this.error.set('Failed to parse the grammar check response.');
        console.error('JSON parsing error:', e);
        return null;
      }
    }
    return null;
  }
}