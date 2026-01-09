
import { GoogleGenAI, Type } from "@google/genai";
import { ContentType, VideoScript, ViralTrend } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateScript = async (topic: string, type: ContentType): Promise<VideoScript> => {
  const isRemix = type === ContentType.REACTION;
  
  const prompt = isRemix 
    ? `Crie um roteiro de REMIX/REAÇÃO baseado em uma notícia de tecnologia EXTREMAMENTE inovadora e disruptiva (IA avançada, computação quântica, robótica, novos gadgets revolucionários) relacionada a: ${topic}. 
       Use ferramentas de busca para garantir que a notícia seja recente e relevante. 
       O vídeo DEVE ter obrigatoriamente entre 60 e 70 segundos. Isso significa entre 160 e 180 palavras de fala em ritmo acelerado estilo @jornadatop. 
       Dê o roteiro EXATAMENTE como deve ser falado.
       Inclua 3 sugestões de prompts para geração de imagens de fundo.`
    : `Gere um roteiro de vídeo curto (Reels/TikTok) para o tema: ${topic}. 
       O estilo deve ser similar ao do Thiago Augusto (@jornadatop) e @jefdicastech. 
       Duração estrita: 60-70 segundos (160-180 palavras).
       Tipo de conteúdo: ${type}.
       O roteiro deve ser o texto exato da fala.`;

  const scriptResponse = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: isRemix ? [{ googleSearch: {} }] : [],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          hook: { type: Type.STRING },
          body: { type: Type.STRING, description: "O texto exato da fala do locutor. Deve preencher 60-70 segundos." },
          cta: { type: Type.STRING },
          estimatedDuration: { type: Type.STRING, description: "Deve ser '60-70 segundos'." },
          visualCues: { type: Type.ARRAY, items: { type: Type.STRING } },
          viralScore: { type: Type.INTEGER, description: "Probabilidade de viralização 0-100." },
          wordCount: { type: Type.INTEGER },
          backgroundImagesPrompts: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "hook", "body", "cta", "estimatedDuration", "visualCues", "viralScore", "wordCount", "backgroundImagesPrompts"]
      }
    }
  });

  const scriptData: VideoScript = JSON.parse(scriptResponse.text);

  // Generate images if it's a remix/reaction
  if (isRemix && scriptData.backgroundImagesPrompts.length > 0) {
    const imagePromises = scriptData.backgroundImagesPrompts.map(async (imgPrompt) => {
      try {
        const imgResult = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: [{ text: `Vertical 9:16 high-tech cinematic imagery about: ${imgPrompt}. Dark theme, glowing elements, professional studio lighting.` }],
          config: { imageConfig: { aspectRatio: "9:16" } }
        });
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
    contents: "Encontre tendências de tecnologia REAIS e ATUAIS no Instagram/TikTok Brasil que tenham MAIS DE 1 MILHÃO de visualizações. Foque em perfis como Thiago Augusto (@jornadatop), @jefdicastech, @bernardopasqual. Identifique o assunto e o vídeo específico.",
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const trends: ViralTrend[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  
  if (groundingChunks.length > 0) {
    groundingChunks.forEach((chunk: any, index: number) => {
      if (chunk.web) {
        trends.push({
          title: chunk.web.title || `Trending Tech ${index + 1}`,
          url: chunk.web.uri,
          relevance: "Assunto viral com alta retenção.",
          strategy: "Crie um roteiro rápido de 60s focando no 'como fazer' ou na 'novidade absurda'.",
          viewCount: "1M+ views"
        });
      }
    });
  }

  if (trends.length === 0) {
    return [
      {
        title: "Dica Secreta de Privacidade no iPhone/Android",
        url: "https://www.instagram.com/jornadatop",
        relevance: "Segurança Digital",
        strategy: "Remix: Reaja e mostre a utilidade real.",
        viewCount: "3.2M views"
      }
    ];
  }

  return trends.slice(0, 5);
};

export const analyzeCompetitors = async (): Promise<any> => {
  const prompt = `Analise detalhadamente os perfis de tecnologia: 
  1. Thiago Augusto (@jornadatop): Focado em produtividade, truques de Windows/iPhone e inteligência artificial para o dia a dia. Estilo rápido e didático.
  2. @jefdicastech: Especialista em recursos escondidos de smartphones e códigos secretos.
  3. @bernardopasqual: Gadgets premium e review de alta qualidade visual.
  4. @oficial_tech: Notícias e curiosidades do mundo da tecnologia.
  
  Forneça uma análise de como eles estruturam seus vídeos para bater 1 milhão de views constantemente e quais as 2 principais tendências que cada um está usando agora.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });

  return response.text;
};
