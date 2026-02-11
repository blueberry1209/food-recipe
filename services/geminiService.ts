
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = (typeof process !== 'undefined' && process.env) ? process.env.API_KEY : undefined;

export interface RecipeResult {
  title: string;
  ingredients: string[];
  steps: string[];
  tips: string;
}

export const getGeminiClient = () => {
  if (!API_KEY) {
    throw new Error("API_KEY environment variable not set. Please set it in your Vercel project settings.");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateRecipe = async (ingredients: string): Promise<RecipeResult | null> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `다음 재료들을 활용한 추천 레시피를 하나 알려주세요: ${ingredients}`,
    config: {
      systemInstruction: "당신은 세계적인 요리사입니다. 레시피를 제목, 재료 리스트, 조리 순서, 팁으로 구성된 JSON 형식으로 응답하세요.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.STRING }
        },
        required: ["title", "ingredients", "steps", "tips"]
      }
    }
  });

  try {
    const text = response.text;
    if (text) {
        return JSON.parse(text) as RecipeResult;
    }
    return null;
  } catch (error) {
    console.error("Failed to parse recipe JSON", error);
    return null;
  }
};

export const generateDishImage = async (dishName: string): Promise<string | null> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `A high-quality, professional food photography of ${dishName}, beautifully plated on a modern table, natural lighting.` }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const editDishImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = getGeminiClient();
  
  // Extract mime type and base64 data
  const mimeType = base64Image.split(';')[0].split(':')[1];
  const data = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: data,
            mimeType: mimeType,
          },
        },
        {
          text: `Modify this food image as requested: ${prompt}. Maintain the original dish structure but apply the edits naturally.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
};
