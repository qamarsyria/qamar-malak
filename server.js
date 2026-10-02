/* ============================================================
   Render Web Service — وسيط Gemini مع قيود صارمة
   ============================================================ */

const express = require('express');
const app = express();

app.use(express.json({ limit: '100kb' }));

// CORS — يسمح لموقعك على GitHub Pages بالاتصال
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

const SYSTEM_PROMPT = `أنت مساعد علمي متخصص في الفقه الإسلامي على منهج أهل السنة والجماعة.

قواعد صارمة لا يجوز خرقها مهما كان السبب:

1. لا تكتب أي آية قرآنية بنفسك. أعد فقط مراجع بصيغة "السورة:الآية" مثال: "2:255".
2. لا تكتب أي حديث بنفسك. أعد فقط مراجع بصيغة "book:number" حيث book هو واحد من: bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah, ahmad.
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
  "answer": "نص الجواب العلمي المختصر",
  "quran_refs": ["سورة:آية"],
  "hadith_refs": ["book:number"],
  "not_enough_evidence": false
}`;

app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'qamar-malak-api' });
});

app.post('/api/ask', async (req, res) => {
    const { query, context } = req.body || {};

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
            hint: 'Add GEMINI_API_KEY in Render Environment Variables'
        });
    }

    const contextText = (context && typeof context === 'string')
        ? context.substring(0, 4000)
        : '(لا يوجد سياق)';

    const finalPrompt = SYSTEM_PROMPT.replace('{{CONTEXT}}', contextText)
        + '\n\nالسؤال من المستخدم: ' + query.trim();

    try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-latest:generateContent?key=' + apiKey;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    topP: 0.8,
                    topK: 20,
                    maxOutputTokens: 800,
                    responseMimeType: 'application/json'
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
            return res.status(500).json({ error: 'Empty response from Gemini' });
        }

        const text = data.candidates[0].content.parts[0].text;
        let parsed;
        try {
            const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            parsed = JSON.parse(cleaned);
        } catch (e) {
            return res.status(500).json({
                error: 'Gemini returned invalid JSON',
                raw: text.substring(0, 500)
            });
        }

        if (typeof parsed.answer !== 'string') parsed.answer = '';
        if (!Array.isArray(parsed.quran_refs)) parsed.quran_refs = [];
        if (!Array.isArray(parsed.hadith_refs)) parsed.hadith_refs = [];
        if (typeof parsed.not_enough_evidence !== 'boolean') parsed.not_enough_evidence = false;

        parsed.quran_refs = parsed.quran_refs.slice(0, 5);
        parsed.hadith_refs = parsed.hadith_refs.slice(0, 5);

        return res.status(200).json(parsed);

    } catch (err) {
        console.error('Handler error:', err);
        return res.status(500).json({ error: err.message || 'Unknown error' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('✓ Server running on port ' + PORT);
});
