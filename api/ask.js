/* ============================================================
   Vercel Function — وسيط Gemini مع قيود صارمة
   - لا يُرسل مفتاح API للمتصفح أبدًا
   - يجبر Gemini على إرجاع JSON بمراجع فقط (لا نصوص)
   - الفلترة النهائية في العميل (تحقق من alquran.cloud و hadith-db)
   ============================================================ */

const SYSTEM_PROMPT = `أنت مساعد علمي متخصص في الفقه الإسلامي على منهج أهل السنة والجماعة.

قواعد صارمة لا يجوز خرقها مهما كان السبب:

1. لا تكتب أي آية قرآنية بنفسك. أعد فقط مراجع بصيغة "السورة:الآية" مثال: "2:255".
2. لا تكتب أي حديث بنفسك. أعد فقط مراجع بصيغة "book:number" حيث book هو واحد من: bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah, ahmad.
   مثال: "bukhari:8" يعني صحيح البخاري حديث رقم 8.
3. لا تذكر أي مذهب فقهي (حنفي، مالكي، شافعي، حنبلي) ولا تفضّل بينهم.
4. لا تذكر أي فرقة أو طائفة (صوفية، شيعية، معتزلة، خوارج، أشعرية، ماتريدية، سلفية).
5. لا تذكر أي شخص معاصر بالاسم ولا أي جهة فتوى معاصرة.
6. لا تجتهد برأيك في المسائل الخلافية. إن كانت المسألة خلافية فاذكر أن فيها خلافًا بين أهل العلم في نص answer.
7. إذا لم تجد دليلاً قرآنياً أو حديثياً واضحاً، أعد not_enough_evidence = true ولا تخترع.
8. لا تكتب أي حكم لا تستطيع نسبته إلى مرجع صحيح.
9. ممنوع اختلاق مراجع وهمية. كل مرجع يجب أن يكون موجوداً فعلاً.
10. اختر فقط المراجع الأكيدة تماماً. إذا شككت في رقم الحديث، لا تذكره.

المراجع المتاحة في قاعدة البيانات المحلية (للاطلاع فقط، لا تكررها حرفياً):
{{CONTEXT}}

أجب بصيغة JSON فقط بالشكل التالي بدون أي نص إضافي:
{
  "answer": "نص الجواب العلمي المختصر (لا يحتوي على آيات أو أحاديث مباشرة، بل إشارات إليها)",
  "quran_refs": ["سورة:آية", "سورة:آية"],
  "hadith_refs": ["book:number"],
  "not_enough_evidence": false
}

تذكّر: answer يجب أن يكون وصفاً للجواب، أما الآيات والأحاديث فتُجلَب تلقائياً بعد التحقق.`;

module.exports = async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.status(200).end();
    }

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Body parsing
    let body = req.body;
    if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON body' });
        }
    }
    const { query, context } = body || {};

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.status(400).json({ error: 'query must be at least 2 characters' });
    }

    if (query.length > 500) {
        return res.status(400).json({ error: 'query too long (max 500)' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({
            error: 'GEMINI_API_KEY not configured',
            hint: 'Add GEMINI_API_KEY in Vercel Environment Variables'
        });
    }

    // Build final prompt with context
    const contextText = (context && typeof context === 'string')
        ? context.substring(0, 4000)
        : '(لا يوجد سياق)';

    const finalPrompt = SYSTEM_PROMPT.replace('{{CONTEXT}}', contextText)
        + '\n\nالسؤال من المستخدم: ' + query.trim();

    try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + apiKey;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: finalPrompt }] }
                ],
                generationConfig: {
                    temperature: 0.1,
                    topP: 0.8,
                    topK: 20,
                    maxOutputTokens: 800,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: 'OBJECT',
                        properties: {
                            answer: { type: 'STRING' },
                            quran_refs: {
                                type: 'ARRAY',
                                items: { type: 'STRING' }
                            },
                            hadith_refs: {
                                type: 'ARRAY',
                                items: { type: 'STRING' }
                            },
                            not_enough_evidence: { type: 'BOOLEAN' }
                        },
                        required: ['answer', 'quran_refs', 'hadith_refs', 'not_enough_evidence']
                    }
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ]
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Gemini error:', errText);
            return res.status(500).json({
                error: 'Gemini API error',
                status: response.status,
                details: errText.substring(0, 500)
            });
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            return res.status(500).json({
                error: 'Empty response from Gemini',
                reason: data.promptFeedback || 'unknown'
            });
        }

        const text = data.candidates[0].content.parts[0].text;

        let parsed;
        try {
            parsed = JSON.parse(text);
        } catch (e) {
            return res.status(500).json({
                error: 'Gemini returned invalid JSON',
                raw: text.substring(0, 500)
            });
        }

        // Basic validation
        if (typeof parsed.answer !== 'string') parsed.answer = '';
        if (!Array.isArray(parsed.quran_refs)) parsed.quran_refs = [];
        if (!Array.isArray(parsed.hadith_refs)) parsed.hadith_refs = [];
        if (typeof parsed.not_enough_evidence !== 'boolean') parsed.not_enough_evidence = false;

        // Limit to reasonable numbers
        parsed.quran_refs = parsed.quran_refs.slice(0, 5);
        parsed.hadith_refs = parsed.hadith_refs.slice(0, 5);

        return res.status(200).json(parsed);

    } catch (err) {
        console.error('Handler error:', err);
        return res.status(500).json({ error: err.message || 'Unknown error' });
    }
};
