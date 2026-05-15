import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: 'Create a hyper-realistic photographic background for a luxury brand. A cinematic close-up of a real young couple in a warm embrace. High-end photography, 8k, sharp focus on faces with authentic skin textures and emotional expressions. Their bodies are NOT solid; they are elegantly dissolving and dispersing into a high-density cloud of millions of glowing emerald and mint micro-particles. Subjects are strictly on the RIGHT side. The left side is a vast, empty negative space of solid deep emerald green (#022B1E) for overlaying website text. Dramatic rim lighting to catch the edges of the particles. NO text, NO buttons, NO logos, NO icons, NO wireframes, NO 2D illustrations.',
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
          imageSize: "2K"
        }
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const base64EncodeString = part.inlineData.data;
          const buffer = Buffer.from(base64EncodeString, 'base64');
          const dir = path.join(process.cwd(), 'public', 'images');
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.writeFileSync(path.join(dir, 'ai-particles-bg.webp'), buffer);
          console.log("Image saved successfully.");
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error generating image:", error);
  }
}

generate();
