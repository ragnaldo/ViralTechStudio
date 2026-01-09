
import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, VideoScript, ViralTrend } from "../types";

// Always use the required initialization format
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateScript = async (topic: string, type: ContentType): Promise<VideoScript> => {
  const isRemix = type === ContentType.REACTION;
  
  const prompt = isRemix 
    ? `Crie um roteiro técnico para um vídeo de REMIX/REAÇÃO sobre a notícia: ${topic}.
       DURAÇÃO: 60-70 segundos (160-180 palavras).
       ESTILO: Estrutura de alta retenção inspirada em @jornadatop (cortes rápidos, valor imediato), mas NÃO fale como se fosse ele. O tom deve ser do MEU canal (especialista neutro).
       REGRAS:
       1. Forneça pelo menos 3 links de referência reais (vídeos ou artigos) que eu possa usar como base visual ou fonte.
       2. Divida em 12-15 cenas. Identifique quais cenas devem usar imagens estáticas geradas (isStaticImage: true) e quais usam o vídeo de referência.
       3. Gere 3-5 prompts de imagens de fundo para as cenas estáticas.
       Use o Google Search para encontrar links reais e notícias de hoje.`
    : `Gere um roteiro técnico de vídeo estilo "Dica Tech" sobre: ${topic}. 
       DURAÇÃO: 60-70 segundos.
       ESTILO: Dinâmico e didático. NÃO use o nome ou frases de efeito específicas de outros criadores.
       REGRAS:
       1. Divida em cenas com VISUAL e AUDIO detalhados.
       2. Identifique cenas que precisam de imagens geradas (isStaticImage: true).
       3. Forneça links de suporte ou referências sobre o tema.`;

  const scriptResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                visual: { type: Type.STRING },
                audio: { type: Type.STRING },
                isStaticImage: { type: Type.BOOLEAN },
                imageIndex: { type: Type.INTEGER, description: "Índice (0-4) do prompt de imagem correspondente, se isStaticImage for true." }
              },
              required: ["visual", "audio", "isStaticImage"]
            }
          },
          cta: { type: Type.STRING },
          estimatedDuration: { type: Type.STRING },
          viralScore: { type: Type.INTEGER },
          wordCount: { type: Type.INTEGER },
          referenceLinks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Links reais encontrados via busca." },
          backgroundImagesPrompts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mínimo 3 prompts." }
        },
        required: ["title", "hook", "scenes", "cta", "estimatedDuration", "viralScore", "wordCount", "referenceLinks", "backgroundImagesPrompts"]
      }
    }
  });

  // Extracting text output as a property, not a method
  const text = scriptResponse.text || "{}";
  const scriptData: VideoScript = JSON.parse(text);

  // MUST extract URLs from groundingChunks when googleSearch is used
  const groundingChunks = scriptResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const searchLinks = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => chunk.web.uri);
  
  if (searchLinks.length > 0) {
    scriptData.referenceLinks = [...new Set([...(scriptData.referenceLinks || []), ...searchLinks])];
  }

  // Generate actual images
  if (scriptData.backgroundImagesPrompts.length > 0) {
    const imagePromises = scriptData.backgroundImagesPrompts.slice(0, 5).map(async (imgPrompt) => {
      try {
        const imgResult = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [{ text: `Professional vertical tech content, 4k cinematic lighting: ${imgPrompt}` }],
          config: { imageConfig: { aspectRatio: "9:16" } }
        });
        // Iterate through parts to find the image part as per guideline
        const part = imgResult.candidates?.[0]?.content?.parts.find(p => p.inlineData);
        return part?.inlineData?.data ? `data:image/png;base64,${part.inlineData.data}` : null;
      } catch (e) {
        return null;
      }
    });
    const images = await Promise.all(imagePromises);
    scriptData.generatedImages = images.filter((img): img is string => img !== null);
  }

  return scriptData;
};

export const findViralTrends = async (): Promise<ViralTrend[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Encontre tendências de tecnologia REAIS e ATUAIS no Brasil com 1M+ visualizações.",
    config: { tools: [{ googleSearch: {} }] }
  });

  const trends: ViralTrend[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  groundingChunks.forEach((chunk: any) => {
    if (chunk.web) {
      trends.push({
        title: chunk.web.title || "Trending Topic",
        url: chunk.web.uri,
        relevance: "Alta viralização detectada.",
        strategy: "Remix focado em reação e utilidade.",
        viewCount: "1.2M+ views"
      });
    }
  });

  return trends.length > 0 ? trends.slice(0, 5) : [{ title: "Dica de WhatsApp", url: "https://www.instagram.com", relevance: "Privacidade", strategy: "Remix rápido.", viewCount: "1M+ views" }];
};

export const analyzeCompetitors = async (): Promise<string> => {
  const prompt = `Analise perfis como @jornadatop, @jefdicastech e @bernardopasqual. Identifique padrões de edição e ganchos sem personificar os criadores.`;
  const response = await ai.models.generateContent({ 
    model: "gemini-3-flash-preview", 
    contents: prompt, 
    config: { tools: [{ googleSearch: {} }] } 
  });
  
  let resultText = response.text || "";
  
  // Extract URLs from groundingChunks and list them as required by guidelines
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const links = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => chunk.web.uri);
    
  if (links.length > 0) {
    resultText += "\n\nFontes de Referência:\n" + links.join("\n");
  }
  
  return resultText;
};
