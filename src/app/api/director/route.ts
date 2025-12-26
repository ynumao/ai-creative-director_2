import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { url, apiKey, imageBase64 } = await req.json();

        if (!apiKey) {
            return NextResponse.json({ error: "API Key is required" }, { status: 400 });
        }

        if (!url && !imageBase64) {
            return NextResponse.json({ error: "URL or Image is required" }, { status: 400 });
        }

        // 1. Fetch and Extract Content (only if URL provided)
        let pageText = "";
        if (!imageBase64 && url) {
            try {
                const res = await fetch(url);
                const html = await res.text();
                const $ = cheerio.load(html);

                $("script").remove();
                $("style").remove();
                $("nav").remove();
                $("footer").remove();

                pageText = $("body").text().replace(/\s+/g, " ").trim().substring(0, 20000);
            } catch (e) {
                return NextResponse.json({ error: "Failed to fetch URL contents" }, { status: 400 });
            }
        }

        // 2. Generate Analysis with Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelsToTry = ["gemini-2.5-flash"];

        const prompt = `
      You are an elite AI Creative Director. Analyze the following LP ${imageBase64 ? "screenshot (provided as image)" : "content (provided as text)"} and generate a creative brief.
      
      IMPORTANT: All text in the response (analysis, copies, descriptions, rationale) MUST be in JAPANESE.
      
      Response MUST be valid JSON with this structure:
      {
        "analysis": {
          "design_impression": "string (Japanese)",
          "target_audience": "string (Japanese)",
          "structure_summary": "string (Japanese)",
          "price_strategy": "string (Japanese)"
        },
        "swot": {
          "strengths": ["string (Japanese)"],
          "weaknesses": ["string (Japanese)"],
          "opportunities": ["string (Japanese)"],
          "threats": ["string (Japanese)"]
        },
        "three_c": {
          "customer": "string (Japanese)",
          "competitor": "string (Japanese)",
          "company": "string (Japanese)"
        },
        "copies": [
          { "type": "Benefit", "text": "string (Japanese)" },
          { "type": "Empathy", "text": "string (Japanese)" },
          { "type": "Urgency", "text": "string (Japanese)" },
          { "type": "Creative", "text": "string (Japanese)" },
          { "type": "Impact", "text": "string (Japanese)" }
        ],
        "image_suggestion": {
          "description": "string (detailed visual description in Japanese)",
          "search_keywords": "string (Japanese keywords space separated)"
        },
        "banner_prompt": "string (optimized prompt for AI image generator, english, focusing on visual style, composition, no text)",
        "rationale": "string (brief explanation of the creative direction in Japanese)"
      }

      ${imageBase64 ? "Analysis Target: Attached Image" : `LP Text:\n${pageText}`}
    `;

        let result = null;
        let lastError = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`Trying model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                if (imageBase64) {
                    const imagePart = {
                        inlineData: {
                            data: imageBase64,
                            mimeType: "image/png"
                        }
                    };
                    result = await model.generateContent([prompt, imagePart]);
                } else {
                    result = await model.generateContent(prompt);
                }

                if (result && result.response) break;
            } catch (e: any) {
                console.warn(`Model ${modelName} failed:`, e.message);
                lastError = e;
            }
        }

        if (!result) {
            throw new Error(`All models failed. Last error: ${lastError?.message || "Unknown error"}`);
        }

        const output = result.response.text();
        const cleanJson = output.replace(/```json\n|\n```/g, "").trim();
        const jsonResponse = JSON.parse(cleanJson);

        return NextResponse.json(jsonResponse);

    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { error: error.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
