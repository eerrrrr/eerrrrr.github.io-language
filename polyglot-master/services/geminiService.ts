
import { GoogleGenAI, Type } from "@google/genai";
import { TargetLanguage } from "../types";

// PolyGlot Master v7.0 - AI Engine
// The API client is initialized strictly using the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Using gemini-3-flash-preview for general text and reasoning tasks.
const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Analyzes a word or grammar point for language learners.
 */
export const getDictionaryLookup = async (language: TargetLanguage, query: string) => {
  const prompt = `Analyze the input: "${query}" for a ${language} learner. 
  If it's a word, provide definition, POS, related grammar rules, and example sentences. 
  If it's a grammar point, explain it and list related vocabulary.
  System language: Traditional Chinese.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          definition: { type: Type.STRING },
          pos: { type: Type.STRING },
          related_grammar: { type: Type.STRING },
          related_vocab: { type: Type.ARRAY, items: { type: Type.STRING } },
          example: { type: Type.STRING },
        },
        required: ["term", "definition", "pos", "related_grammar", "related_vocab", "example"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates an interactive tutor response for a given conversation history and scenario.
 */
export const getTutorResponse = async (
  language: TargetLanguage,
  history: { role: string; content: string }[],
  userMessage: string,
  scenarioTitle: string
) => {
  const systemInstruction = `You are a native ${language} tutor. Scene: ${scenarioTitle}. 
  User input is Omni-Lingual (Mixed CN/EN/${language}).
  Response logic:
  1. If user practices ${language}: Roleplay + Correction.
  2. If user asks for help (CN/EN): Translate + Explain + Continue roleplay.
  Return JSON strictly matching the provided schema.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [
      ...history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          message: { type: Type.STRING },
          native_subtitle: { type: Type.STRING },
          tokens: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                pos: { type: Type.STRING },
                def: { type: Type.STRING },
                grammar: { type: Type.STRING }
              },
              required: ["text", "pos", "def", "grammar"]
            }
          },
          correction: {
            type: Type.OBJECT,
            properties: {
              original: { type: Type.STRING },
              suggested: { type: Type.STRING },
              explanation: { type: Type.STRING }
            }
          }
        },
        required: ["message", "native_subtitle", "tokens"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Analyzes a journal entry to provide an optimized version and learning tips.
 */
export const getJournalAnalysis = async (language: TargetLanguage, content: string) => {
  const prompt = `Process this journal for a ${language} learner. 
  Input: "${content}" (Mixed languages).
  Provide:
  1. Optimized Native Version.
  2. Detailed analysis (Grammar or translation choices).
  3. Related vocabulary.
  System language: Traditional Chinese.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          optimized: { type: Type.STRING },
          analysis: { type: Type.STRING },
          vocabSuggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING },
                translation: { type: Type.STRING },
                definition: { type: Type.STRING },
                example: { type: Type.STRING }
              },
              required: ["word", "translation", "definition", "example"]
            }
          }
        },
        required: ["optimized", "analysis", "vocabSuggestions"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Gets comprehensive details for a specific word.
 */
export const getWordDetails = async (language: TargetLanguage, word: string) => {
  const prompt = `Detail analysis of ${language} word: "${word}".`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          translation: { type: Type.STRING },
          definition: { type: Type.STRING },
          pronunciation: { type: Type.STRING },
          collocations: { type: Type.ARRAY, items: { type: Type.STRING } },
          context: { type: Type.STRING },
          example: { type: Type.STRING }
        },
        required: ["word", "translation", "definition", "pronunciation", "collocations", "context", "example"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates a practice scenario based on a description.
 */
export const createCustomScenario = async (language: TargetLanguage, description: string) => {
  const prompt = `Create a ${language} practice scenario for: "${description}".`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          icon: { type: Type.STRING },
          description: { type: Type.STRING },
          cheatSheet: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "icon", "description", "cheatSheet"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

/**
 * Generates a story incorporating specified vocabulary words.
 */
export const generateStoryFromVocab = async (language: TargetLanguage, words: string[]) => {
  const prompt = `Write a short ${language} story using these words: ${words.join(', ')}. Return plain text story.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
  });

  return response.text;
};
