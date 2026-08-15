import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, category, description, simulate } = body;

    // Check if offline simulation mode is explicitly enabled via DemoControls
    if (simulate === true) {
      return NextResponse.json({
        approved: true,
        confidence: 0.95,
        reason: 'AI Verified (Demo Simulation Mode): Valid hazard detected.',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Fallback if key is missing
      return NextResponse.json({
        approved: true,
        confidence: 0.95,
        reason: 'Auto-approved (API Key not configured in .env.local — Demo Fallback)',
      });
    }

    if (!imageBase64) {
      return NextResponse.json(
        { approved: false, confidence: 0, reason: 'No image provided. Please capture a live photo.' },
        { status: 400 }
      );
    }

    // Clean base64 data to get raw base64 string
    const rawBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

    const promptText = `You are an uncompromising municipal civil infrastructure validator for the CivicShield Smart City system.
Inspect this submitted citizen photo and STRICTLY verify:
Category: "${category || 'unspecified'}"
Description: "${description || 'No description provided'}"

STRICT RULES:
1. MUST REJECT if:
   - Video game screenshot (e.g. Genshin Impact, GTA, Minecraft, 3D RPGs), anime, cartoons, 3D CGI renders, software/game UI, or HUD elements.
   - Indoor scene (bedroom, living room, office, mall, kitchen), human selfie/portrait, pet/animal, food, document, receipt, or random household object.
   - Normal, clean, undamaged road, building, or landscape with no visible infrastructure defect.
   - Spam or gibberish description (e.g. "varesa", "asdf", random letters).
2. MUST APPROVE only if:
   - Genuine, authentic outdoor physical photograph taken in the real world.
   - Visible physical municipal damage (e.g. pothole, broken bridge/slab, dangling power wire, damaged streetlight, fallen tree, severe waterlogging/flooding, open drain).

Return ONLY a valid JSON object matching this schema (no markdown, no backticks):
{"approved": boolean, "confidence": number, "reason": "concise explanation of decision"}`;

    // Try gemini-2.5-flash first, then fallback to gemini-1.5-flash or gemini-2.0-flash
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastError = '';
    
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: promptText },
                  { inlineData: { mimeType: 'image/jpeg', data: rawBase64 } },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              approved: Boolean(parsed.approved),
              confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9,
              reason: parsed.reason || (parsed.approved ? 'Validated by AI' : 'AI validation failed: Image does not meet hazard criteria.'),
            });
          }
        } else {
          lastError = await res.text();
          console.warn(`Gemini model ${model} returned non-200:`, lastError);
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
        console.warn(`Error calling model ${model}:`, lastError);
      }
    }

    // If all direct Gemini model calls failed, log error and provide safe fallback
    console.error('All Gemini API endpoints failed. Last error:', lastError);
    return NextResponse.json({
      approved: false,
      confidence: 0,
      reason: 'Server Error: Could not validate image.',
    });
  } catch (error: any) {
    console.error('Moderation Route Exception:', error);
    return NextResponse.json({
      approved: false,
      confidence: 0,
      reason: 'Server Error: Could not validate image.',
    });
  }
}
