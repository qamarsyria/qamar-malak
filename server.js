/* ============================================================
   Render Web Service — وسيط Gemini (النسخة النهائية v3)
   ============================================================ */

const express = require('express');
const app = express();

app.use(express.json({ limit: '100kb' }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

const SYSTEM_PROMPT = `أنت مساعد علمي متخصص في الفقه الإسلامي على منهج أهل السنة والجماعة.

قواعد صارمة:
1. لا تكتب آيات قرآنية بنفسك، أعد فقط مراجع بصيغة "السورة:الآية" مثال: "2:255".
2. لا تكتب أحاديث بنفسك، أعد فقط مراجع بصيغة "book:number" حيث book: bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah, ahmad.
3. لا تذكر أي مذهب فقهي (حنفي، مالكي، شافعي، حنبلي) ولا تفضّل بينهم.
4. لا تذكر أي فرقة أو طائفة (صوفية، شيعية، معتزلة، خوارج، أشعرية، ماتريدية، سلفية).
5. لا تذكر شخصًا معاصرًا بالاسم.
6. إذا لم تجد دليلاً قرآنياً أو حديثياً واضحاً، أعد not_enough_evidence = true.
7. ممنوع اختلاق مراجع وهمية.

السياق من قاعدة البيانات المحلية (للاطلاع فقط):
{{CONTEXT}}

أجب بصيغة JSON فقط بدون أي نص إضافي:
{
  "answer": "نص الجواب المختصر",
  "quran_refs": ["سورة:آية"],
  "hadith_refs": ["book:number"],
  "not_enough_evidence": false
}`;

// النماذج المتاحة (محدثة 2026)
const MODELS_TO_TRY = [
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-flash-lite-latest'
];

app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'qamar-malak-api', version: '3' });
});

app.post('/api/ask', async (req, res) => {
    const { query, context } = req.body || {};

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.status(400).json({ error: 'query too short' });
    }
    if (query.length > 500) {
        return res.status(400).json({ error: 'query too long' });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
    }

    const contextText = (context && typeof context === 'string')
        ? context.substring(0, 4000)
        : '(لا يوجد سياق)';

    const finalPrompt = SYSTEM_PROMPT.replace('{{CONTEXT}}', contextText)
        + '\n\nالسؤال من المستخدم: ' + query.trim();

    let lastError = null;

    for (const model of MODELS_TO_TRY) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        topP: 0.8,
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
                lastError = { model, status: response.status, details: errText.substring(0, 400) };

                if (errText.includes('API_KEY_INVALID') || errText.includes('API key not valid')) {
                    return res.status(500).json({
                        error: 'API key invalid',
                        last_error: lastError
                    });
                }
                continue;
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
                lastError = { model, error: 'empty response' };
                continue;
            }

            const text = data.candidates[0].content.parts[0].text;
            let parsed;
            try {
                const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
                parsed = JSON.parse(cleaned);
            } catch (e) {
                lastError = { model, error: 'invalid JSON', raw: text.substring(0, 200) };
                continue;
            }

            if (typeof parsed.answer !== 'string') parsed.answer = '';
            if (!Array.isArray(parsed.quran_refs)) parsed.quran_refs = [];
            if (!Array.isArray(parsed.hadith_refs)) parsed.hadith_refs = [];
            if (typeof parsed.not_enough_evidence !== 'boolean') parsed.not_enough_evidence = false;

            parsed.quran_refs = parsed.quran_refs.slice(0, 5);
            parsed.hadith_refs = parsed.hadith_refs.slice(0, 5);
            parsed._model_used = model;

            return res.status(200).json(parsed);

        } catch (err) {
            lastError = { model, error: err.message };
        }
    }

    return res.status(500).json({
        error: 'All models failed',
        last_error: lastError
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('✓ Server v3 running on port ' + PORT);
});
