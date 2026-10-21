/* ============================================================
   Server v5.3 — إصلاح جذري لمشكلة DNS في Wasmer
   ============================================================ */

const express = require('express');
const https = require('https');
const dns = require('dns');
const app = express();

// إجبار السيرفر على استخدام خوادم DNS عالمية (لحل مشكلة ENOTFOUND)
try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
} catch (e) {
    console.log('DNS set error:', e.message);
}

app.use(express.json({ limit: '100kb' }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// ═══════════════════════════════════════════════════════════════════
// مسار جلب الفيديوهات (اتصال مباشر مع إجبار IPv4)
// ═══════════════════════════════════════════════════════════════════
app.get('/api/feed', (req, res) => {
    const options = {
        hostname: 'mhmybkdghxamtviojxjd.supabase.co',
        port: 443,
        path: '/rest/v1/videos?select=*&order=created_at.desc',
        method: 'GET',
        family: 4, // إجبار استخدام IPv4
        headers: {
            'apikey': 'sb_publishable_dSCH3FinzsLnhvPfWiDqbg_lrqT_erA',
            'Authorization': 'Bearer sb_publishable_dSCH3FinzsLnhvPfWiDqbg_lrqT_erA',
            'Accept': 'application/json'
        }
    };

    const reqSupabase = https.request(options, (resSupabase) => {
        let data = '';
        resSupabase.on('data', (chunk) => { data += chunk; });
        resSupabase.on('end', () => {
            if (resSupabase.statusCode >= 200 && resSupabase.statusCode < 300) {
                try {
                    res.status(200).json(JSON.parse(data));
                } catch (e) {
                    res.status(500).json({ error: 'Invalid JSON', details: data.substring(0, 200) });
                }
            } else {
                res.status(resSupabase.statusCode).json({ error: 'Supabase error', details: data.substring(0, 200) });
            }
        });
    });

    reqSupabase.on('error', (e) => {
        console.error('[feed] HTTPS Error:', e);
        res.status(500).json({ error: 'Failed to fetch videos', details: `${e.message} | Code: ${e.code}` });
    });

    reqSupabase.end();
});

// ═══════════════════════════════════════════════════════════════════
// النظام البرمجي (لم يُلمس)
// ═══════════════════════════════════════════════════════════════════
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

function loadKeys() {
    const multi = (process.env.GEMINI_API_KEYS || '').trim();
    const single = (process.env.GEMINI_API_KEY || '').trim();
    const raw = multi || single;
    if (!raw) return [];
    return raw.split(',').map(k => k.trim()).filter(Boolean);
}

const keyState = new Map();
function markKeyExhausted(key, retryAfterMs = 3600_000) {
    keyState.set(key, { ...(keyState.get(key) || {}), exhaustedUntil: Date.now() + retryAfterMs });
}
function markKeyInvalid(key) {
    keyState.set(key, { ...(keyState.get(key) || {}), invalid: true });
}
function getKeysByState() {
    const now = Date.now();
    const usable = [], exhausted = [], invalid = [];
    for (const k of loadKeys()) {
        const s = keyState.get(k);
        if (!s) { usable.push(k); continue; }
        if (s.invalid) { invalid.push(k); continue; }
        if (s.exhaustedUntil && s.exhaustedUntil > now) { exhausted.push(k); continue; }
        usable.push(k);
    }
    return { usable, exhausted, invalid };
}

const MODEL_CACHE_TTL = 6 * 3600 * 1000;
let modelCache = { models: [], fetchedAt: 0, discoveredFrom: null };
const PREFERRED_MODELS = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-lite-latest'];
const FALLBACK_MODELS = [...PREFERRED_MODELS, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest'];

function scoreModel(name) {
    if (/flash-latest/i.test(name)) return 1000;
    let s = 0;
    if (/flash/i.test(name)) s += 100;
    else if (/pro/i.test(name)) s += 50;
    else s -= 100;
    const m = name.match(/(\d+)\.(\d+)/);
    if (m) s += Number(m[1]) * 30 + Number(m[2]) * 3;
    if (/lite/i.test(name)) s -= 40;
    if (/exp|experimental|preview/i.test(name)) s -= 60;
    if (/-00\d$/.test(name)) s -= 30;
    if (/vision|embedding|aqa/i.test(name)) return -999;
    return s;
}

async function fetchModelsFromKey(apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`discovery ${resp.status}`);
    const data = await resp.json();
    const all = Array.isArray(data.models) ? data.models : [];
    const usable = all.filter(m => {
        const methods = m.supportedGenerationMethods || [];
        if (!methods.includes('generateContent')) return false;
        const name = (m.name || '').replace(/^models\//, '');
        if (/embedding|aqa|vision/i.test(name)) return false;
        return true;
    });
    const scored = usable.map(m => ({ name: (m.name || '').replace(/^models\//, ''), score: scoreModel((m.name || '').replace(/^models\//, '')) }))
        .filter(x => x.score > -100 && x.name)
        .sort((a, b) => b.score - a.score);
    const seen = new Set();
    return scored.map(x => x.name).filter(name => !seen.has(name) && seen.add(name));
}

function mergeWithPreferred(discovered) {
    if (!discovered.length) return [...FALLBACK_MODELS];
    const set = new Set(discovered);
    const result = [];
    for (const m of PREFERRED_MODELS) if (set.has(m)) { result.push(m); set.delete(m); }
    for (const m of discovered) if (set.has(m)) { result.push(m); set.delete(m); }
    return result;
}

async function getModels(forceRefresh = false) {
    if (!forceRefresh && modelCache.models.length && (Date.now() - modelCache.fetchedAt) < MODEL_CACHE_TTL) return modelCache.models;
    const { usable, exhausted } = getKeysByState();
    for (const key of [...usable, ...exhausted]) {
        try {
            const discovered = await fetchModelsFromKey(key);
            if (discovered.length) {
                const merged = mergeWithPreferred(discovered);
                modelCache = { models: merged, fetchedAt: Date.now(), discoveredFrom: 'api' };
                return merged;
            }
        } catch (err) { console.warn(`[discovery] key failed: ${err.message}`); }
    }
    modelCache = { models: [...FALLBACK_MODELS], fetchedAt: Date.now(), discoveredFrom: 'fallback' };
    return modelCache.models;
}

async function tryOne(model, apiKey, prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, topP: 0.8, maxOutputTokens: 800, responseMimeType: 'application/json' },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                ]
            })
        });
        if (response.status === 429) return { type: 'key_exhausted' };
        if (response.status === 404) return { type: 'model_not_found' };
        if (response.status === 400 || response.status === 403) {
            const t = await response.text();
            if (/API_KEY_INVALID|API key not valid/i.test(t)) return { type: 'key_invalid' };
            return { type: 'error', status: response.status, details: t.substring(0, 200) };
        }
        if (!response.ok) return { type: 'error', status: response.status, details: (await response.text()).substring(0, 200) };
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) return { type: 'error', status: 200, details: 'empty response' };
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        let parsed;
        try { parsed = JSON.parse(cleaned); } catch (e) { return { type: 'error', status: 200, details: 'invalid JSON' }; }
        if (typeof parsed.answer !== 'string') parsed.answer = '';
        if (!Array.isArray(parsed.quran_refs)) parsed.quran_refs = [];
        if (!Array.isArray(parsed.hadith_refs)) parsed.hadith_refs = [];
        if (typeof parsed.not_enough_evidence !== 'boolean') parsed.not_enough_evidence = false;
        parsed.quran_refs = parsed.quran_refs.slice(0, 5);
        parsed.hadith_refs = parsed.hadith_refs.slice(0, 5);
        parsed._model_used = model;
        return { type: 'success', data: parsed, model };
    } catch (err) { return { type: 'error', status: 0, details: err.message }; }
}

async function runAttempts(models, keys, prompt, maxAttempts = 15) {
    let attempts = 0, lastError = null;
    for (const model of models) {
        if (attempts >= maxAttempts) break;
        for (const key of keys) {
            if (attempts >= maxAttempts) break;
            const s = keyState.get(key);
            if (s?.invalid) continue;
            if (s?.exhaustedUntil && s.exhaustedUntil > Date.now()) continue;
            attempts++;
            const r = await tryOne(model, key, prompt);
            if (r.type === 'success') return r;
            if (r.type === 'model_not_found') { lastError = { model, status: 404, reason: 'model not available' }; break; }
            if (r.type === 'key_invalid') { markKeyInvalid(key); lastError = { model, status: 400, reason: 'key invalid' }; continue; }
            if (r.type === 'key_exhausted') { markKeyExhausted(key); lastError = { model, status: 429, reason: 'key quota exhausted' }; continue; }
            lastError = { model, status: r.status, details: r.details };
        }
    }
    return { type: 'failed', lastError, attempts };
}

app.get('/', (req, res) => res.json({ status: 'ok', service: 'qamar-malak-api', version: '5.3' }));
app.get('/health', (req, res) => {
    const { usable, exhausted, invalid } = getKeysByState();
    res.json({ status: 'ok', uptime_sec: Math.round(process.uptime()), keys: { total: usable.length + exhausted.length + invalid.length, usable: usable.length, exhausted: exhausted.length, invalid: invalid.length }, models: { count: modelCache.models.length, source: modelCache.discoveredFrom, cached_at: modelCache.fetchedAt ? new Date(modelCache.fetchedAt).toISOString() : null } });
});
app.get('/api/models', async (req, res) => {
    try { const models = await getModels(); res.json({ count: models.length, source: modelCache.discoveredFrom, cached_at: new Date(modelCache.fetchedAt).toISOString(), models: models.slice(0, 20) }); }
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/ask', async (req, res) => {
    const { query, context } = req.body || {};
    if (!query || typeof query !== 'string' || query.trim().length < 2) return res.status(400).json({ error: 'query too short' });
    if (query.length > 500) return res.status(400).json({ error: 'query too long' });
    const { usable, exhausted, invalid } = getKeysByState();
    if (usable.length + exhausted.length + invalid.length === 0) return res.status(500).json({ error: 'GEMINI_API_KEYS not set' });
    if (usable.length === 0 && exhausted.length === 0) return res.status(500).json({ error: 'all API keys are invalid' });
    const contextText = (context && typeof context === 'string') ? context.substring(0, 4000) : '(لا يوجد سياق)';
    const finalPrompt = SYSTEM_PROMPT.replace('{{CONTEXT}}', contextText) + '\n\nالسؤال من المستخدم: ' + query.trim();
    const models = await getModels();
    let result = await runAttempts(models, usable, finalPrompt);
    if (result.type === 'failed' && exhausted.length > 0) result = await runAttempts(models, exhausted, finalPrompt);
    if (result.type === 'failed') {
        if (modelCache.discoveredFrom === 'api') modelCache = { models: [], fetchedAt: 0, discoveredFrom: null };
        return res.status(500).json({ error: 'All models and keys failed', last_error: result.lastError, attempts: result.attempts });
    }
    return res.status(200).json(result.data);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server v5.3 running on port ${PORT}`);
    const { usable } = getKeysByState();
    console.log(`[keys] usable=${usable.length}`);
    try {
        const models = await getModels();
        console.log(`[models] ${models.length} available — source=${modelCache.discoveredFrom}`);
    } catch (err) { console.warn(`[models] startup discovery failed: ${err.message}`); }
});
