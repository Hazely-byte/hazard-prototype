import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, category, description } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ approved: false, reason: "API key missing from environment variables." });
    }

    // 1. Clean Base64 Data and Extract MIME Type
    const mimeMatch = imageBase64.match(/^data:(.*?);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    // 2. Initialize the Official SDK
    const ai = new GoogleGenAI({ apiKey });

    // 3. Strict AI Rules
    const promptText = `Analyze this image for a smart city hazard app. Category: ${category}. Description: ${description}.
    CRITICAL RULES:
    1. REJECT if the image is a video game, anime, cartoon, 3D render, indoor room, selfie, or screen capture.
    2. REJECT if no physical outdoor infrastructure damage (pothole, broken bridge, wire) is visible.
    3. APPROVE ONLY if it is a real-world outdoor photograph of actual road/city damage.
    Return ONLY a JSON object: {"approved": boolean, "confidence": number, "reason": "string"}`;

    // 4. Call the 3.7 Flash Model via SDK — retry up to 3 times on 503
    const MAX_ATTEMPTS = 3;
    let response: any = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: [
            { text: promptText },
            { inlineData: { mimeType, data: cleanBase64 } }
          ]
        });
        break; // success — exit the retry loop
      } catch (retryErr: any) {
        const is503 = retryErr?.status === 503 || retryErr?.message?.includes('503') || retryErr?.message?.includes('overloaded');
        console.warn(`Attempt ${attempt}/${MAX_ATTEMPTS} failed:`, retryErr?.message || retryErr);
        if (is503 && attempt < MAX_ATTEMPTS) {
          await new Promise(res => setTimeout(res, 2000));
        } else {
          throw retryErr; // non-503, or final attempt — bubble up to outer catch
        }
      }
    }

    if (!response) {
      return NextResponse.json({ approved: false, reason: "Google AI servers are currently overloaded. Please try again in a few minutes." });
    }

    // 5. Parse and Clean the Response
    const rawText = response.text || "{}";
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    return NextResponse.json({
      approved: Boolean(parsed.approved),
      confidence: parsed.confidence || 0,
      reason: parsed.reason || "Processed successfully"
    });

  } catch (error: any) {
    console.error("🔥 Validation Crash:", error);
    return NextResponse.json({ approved: false, reason: "System Error: " + error.message });
  }
}
