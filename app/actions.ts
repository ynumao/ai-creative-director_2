"use server"

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { LPStructureSchema } from "@/lib/schema";
import { LPRequirements } from "@/components/lp-form";

export async function generateLPStructure(apiKey: string, requirements: LPRequirements) {
    const google = createGoogleGenerativeAI({
        apiKey: apiKey,
    });

    // prompt:
    const prompt = `
    あなたは優秀なランディングページ（LP）の構成作家兼デザイナーです。
    以下の製品情報を元に、コンバージョン率の高いLP構成案を作成してください。
    
    製品名: ${requirements.productName}
    ターゲット: ${requirements.targetAudience}
    USP (独自の強み): ${requirements.usp}
    ゴール: ${requirements.goal}
    雰囲気 (Mood): ${requirements.mood}
    その他メモ: ${requirements.otherNotes}

    出力は厳密に指定されたJSONスキーマに従ってください。
    各セクションについて以下を提供してください：
    - 魅力的なタイトル (title)
    - 説得力のある本文コピー (content)
    - AI画像生成用の詳細なプロンプト (imagePrompt)
      ※「Hero」「Features」「Image_Section」などの視覚的要素が重要なセクションでは、**必ず** imagePrompt を生成してください。
      ※imagePromptは、指定された「${requirements.mood}」の雰囲気に合った、シーン、照明、スタイルを英語で記述してください（画像生成AIは英語プロンプトの方が精度が高いため）。
    
    構成は論理的な流れにしてください：ヒーローエリア -> 問題提起 -> 解決策 -> 特徴 -> 社会的証明 -> CTA
    
    【重要】
    - 出力されるタイトルや本文コピーは **すべて日本語** で記述してください。
    - imagePromptのみ **英語** で記述してください。
    - 添付画像がある場合は、そのスタイルを imagePrompt に強く反映させてください。
  `;

    // Helper to try a specific model
    const tryGenerate = async (modelName: string) => {
        let messages: any[] = [
            { role: 'user', content: prompt }
        ];

        // If image exists, append it to the prompt content (multimodal)
        // AI SDK 'generateObject' supports standard string prompts, 
        // but for multimodal we might need to use the `messages` format or specific provider format.
        // However, Vercel AI SDK `generateObject` allows `prompt` to be mixed content in some versions, 
        // OR we can pass `messages` instead of `prompt`.

        // Let's use the 'messages' array approach which is cleaner for multimodal.
        const userContent: any[] = [{ type: 'text', text: prompt }];

        if (requirements.refImage) {
            // refImage is data:image/png;base64,....
            // We need to extract the base64 part.
            const base64Data = requirements.refImage.split(',')[1];
            // And mime type (though typically it's just passed as image)
            // clean prompt update:
            userContent.push({
                type: 'image',
                image: base64Data,
            });

            // Update text prompt to reference the image explicitly
            userContent[0].text += `\n\n【重要】添付された画像を「デザインの雰囲気(Mood)」の参考として強く意識してください。この画像の色彩、レイアウト、スタイルをimagePromptに反映させてください。`;
        }

        return await generateObject({
            model: google(modelName),
            schema: LPStructureSchema,
            messages: [
                { role: 'user', content: userContent }
            ],
        });
    };

    // List of models to try in order of preference
    // gemini-pro is text-only. gemini-1.5-* are multimodal.
    let modelsToTry = [
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-1.5-flash-002",
        "gemini-1.5-pro-latest",
        "gemini-1.5-pro-001",
    ];

    // If NO image, we can try legacy text model too
    if (!requirements.refImage) {
        modelsToTry.push("gemini-pro");
    }

    if (requirements.modelId && requirements.modelId.trim() !== "") {
        modelsToTry.unshift(requirements.modelId.trim());
    }

    let errorLog: string[] = [];

    for (const modelName of modelsToTry) {
        try {
            // console.log(`Attempting to generate with model: ${modelName}`);
            const { object } = await tryGenerate(modelName);
            return { success: true, data: object };
        } catch (e: any) {
            console.warn(`Model ${modelName} failed:`, e.message);
            errorLog.push(`${modelName}: ${e.message}`);
            // Continue to next model
        }
    }

    // If we get here, all models failed
    console.error("All models failed.", errorLog);
    return {
        success: false,
        error: `All models failed. Details: ${errorLog.join(' | ')}`
    };
}
