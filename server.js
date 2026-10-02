/* ============================================================
   Render Web Service — وسيط Gemini مع قيود صارمة + تشخيص
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

// ============================================================
// تشخيص المفتاح
// ============================================================
function getKeyDiagnostics() {
    const raw = process.env.GEMINI_API_KEY || '';
    const trimmed = raw.trim();
    return {
        exists: !!raw,
        length_raw: raw.length,
        length_trimmed: trimmed.length,
        had_whitespace: raw !== trimmed,
        first_6: trimmed.substring(0, 6),
        last_4: trimmed.length > 4 ? trimmed.substring(trimmed.length - 4) : '',
        has_spaces_inside: /\s/.test(trimmed.replace(/^\s+|\s+$/g, '')),
        has_newline: /[\r\n]/.test(raw),
        has_tab: /\t/.test(raw)
    };
}

// ============================================================
// اختبار مباشر للـ Gemini
// ============================================================
app.get('/api/diagnose', async (req, res) => {
    const diag = getKeyDiagnostics();
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();

    if (!apiKey) {
        return res.status(500).json({ step: 'no_key', ...diag });
    }

    // اختبار 1: قائمة النماذج المتاحة
    let modelsResult = null;
    try {
        const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
        const t = await r.text();
        modelsResult = {
            status: r.status,
            ok: r.ok,
            body_preview: t.substring(0, 600)
        };
    } catch (e) {
        modelsResult = { error: e.message };
    }

    return res.json({
        key: diag,
        models_endpoint: modelsResult
    });
});

// ============================================================
// الدالة الرئيسية: سؤال → Gemini
// ============================================================
const SYSTEM_PROMPT = `أنت مساعد علمي متخصص في الفقه الإسلامي على منهج أهل السنة والجماعة.

قواعد صارمة:
1. لا تكتب آيات قرآنية بنفسك، أعد فقط مراجع بصيغة "السورة:الآية".
2. لا تكتب أحاديث بنفسك، أعد فقط مراجع بصيغة "book:number" حيث book: bukhari, muslim, abudawud, tirmidhi, nasai, ibnmajah, ahmad.
3. لا تذكر أي مذهب ولا أي فرقة.
4. إذا لم تجد دليلاً، أعد not_enough_evidence = true.

السياق:
{{CONTEXT}}

أجب بـ JSON فقط:
{
  "answer": "...",
  "quran_refs": ["2:255"],
  "hadith_refs": ["bukhari:8"],
  "not_enough_evidence": false
}`;

app.post('/api/ask', async (req, res) => {
    const { query, context } = req.body || {};

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
        return res.status(400).json({ error: 'query too short' });
    }

    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY not set' });
    }

    const contextText = (context && typeof context === 'string')
        ? context.substring(0, 4000)
        : '(لا يوجد سياق)';

    const finalPrompt = SYSTEM_PROMPT.replace('{{CONTEXT}}', contextText)
        + '\n\nالسؤال: ' + query.trim();

    // نجرّب عدة نماذج بالترتيب
    const modelsToTry = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b'
    ];

    let lastError = null;

    for (const model of modelsToTry) {
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
                    }
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                lastError = { model, status: response.status, details: errText.substring(0, 400) };
                // إذا كان الخطأ API_KEY_INVALID لا فائدة من تجربة النماذج الأخرى
                if (errText.includes('API_KEY_INVALID') || errText.includes('API key not valid')) {
                    break;
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

            // نجاح
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
        last_error: lastError,
        key_diag: getKeyDiagnostics()
    });
});

app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'qamar-malak-api', version: '2' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('✓ Server v2 running on port ' + PORT);
});
