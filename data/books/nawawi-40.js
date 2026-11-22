<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>السنة النبوية الصحيحة — ملاك المعرفة</title>
<meta name="description" content="موسوعة السنة النبوية الصحيحة من الصحيحين والسنن، مصنّفة موضوعيًا مع بيان الراوي والحكم الحديثي والتخريج الكامل.">
<link rel="stylesheet" href="style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🕌</text></svg>">
<meta name="theme-color" content="#0b4133">
<style>
.hadith-hero {
    background: var(--bg-card);
    border: 1.5px solid var(--border-strong);
    border-radius: 20px;
    padding: 32px 20px;
    text-align: center;
    margin-bottom: 24px;
    box-shadow: var(--shadow);
}
.hadith-hero h1 {
    font-family: 'Amiri', serif;
    font-size: 32px;
    color: var(--text-accent);
    margin-bottom: 10px;
}
.hadith-hero p {
    color: var(--text-muted);
    max-width: 720px;
    margin: 0 auto;
    font-size: 15px;
    line-height: 1.85;
}

.controls-bar {
    max-width: 860px;
    margin: 0 auto 22px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}
.search-box {
    flex: 1;
    min-width: 240px;
    position: relative;
}
.search-box input {
    width: 100%;
    padding: 13px 46px 13px 16px;
    background: var(--bg-input);
    border: 2px solid var(--border-soft);
    border-radius: 28px;
    color: var(--text-main);
    font-family: inherit;
    font-size: 15px;
    outline: none;
    transition: border-color 0.25s;
}
.search-box input:focus { border-color: var(--gold); }
.search-box .search-icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-accent);
    font-size: 18px;
    pointer-events: none;
}

.book-filter {
    min-width: 180px;
    padding: 12px 16px;
    background: var(--bg-input);
    border: 2px solid var(--border-soft);
    border-radius: 28px;
    color: var(--text-main);
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    outline: none;
    cursor: pointer;
}
.book-filter:focus { border-color: var(--gold); }

.filters {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 22px;
}
.filter-btn {
    padding: 8px 15px;
    background: var(--bg-panel);
    border: 1px solid var(--border-soft);
    color: var(--text-main);
    border-radius: 22px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: all 0.2s;
}
.filter-btn:hover,
.filter-btn.active {
    background: var(--gold);
    color: var(--text-on-gold);
    border-color: var(--gold);
}

.stats-line {
    text-align: center;
    color: var(--text-muted);
    font-size: 14px;
    margin-bottom: 18px;
}
.stats-line strong { color: var(--text-accent); font-size: 16px; }

.hadith-list {
    max-width: 880px;
    margin: 0 auto;
}
.hadith-card {
    background: var(--bg-card);
    border: 1px solid var(--border-soft);
    border-right: 4px solid var(--gold);
    border-radius: 16px;
    padding: 22px;
    margin-bottom: 16px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, border-color 0.2s;
}
.hadith-card:hover {
    transform: translateX(-3px);
    border-color: var(--gold);
}

.hadith-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}
.hadith-cat {
    display: inline-block;
    background: rgba(212, 175, 55, 0.16);
    color: var(--text-accent);
    padding: 3px 12px;
    border-radius: 12px;
    font-size: 11.5px;
    font-weight: 700;
    border: 1px solid var(--border-soft);
}
.hadith-grade {
    display: inline-block;
    background: rgba(16, 185, 129, 0.16);
    color: #34d399;
    padding: 3px 11px;
    border-radius: 12px;
    font-size: 11.5px;
    font-weight: 700;
    border: 1px solid rgba(16, 185, 129, 0.35);
}
html[data-theme="light"] .hadith-grade { color: #047857; }

.hadith-text {
    font-family: 'Amiri', 'Scheherazade New', serif;
    font-size: 21.5px;
    line-height: 2.1;
    color: var(--text-main);
    text-align: justify;
    margin-bottom: 14px;
}
.hadith-text .highlight {
    background: rgba(212, 175, 55, 0.28);
    color: var(--text-accent);
    padding: 1px 4px;
    border-radius: 4px;
    font-weight: 700;
}

.hadith-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
    padding-top: 12px;
    border-top: 1px dashed var(--border-soft);
}
.hadith-rawi {
    color: var(--text-muted);
    font-size: 13px;
}
.hadith-rawi strong { color: var(--text-accent); }

.hadith-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.source-pill {
    background: var(--bg-panel);
    color: var(--text-accent);
    padding: 4px 10px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid var(--border-soft);
}
.copy-hadith-btn {
    padding: 5px 12px;
    border-radius: 14px;
    border: 1px solid var(--border-strong);
    background: transparent;
    color: var(--text-accent);
    font-family: inherit;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
}
.copy-hadith-btn:hover {
    background: var(--gold);
    color: var(--text-on-gold);
}

.empty-state {
    text-align: center;
    padding: 50px 20px;
    color: var(--text-muted);
}

.h-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #059669;
    color: #fff;
    padding: 9px 20px;
    border-radius: 24px;
    font-size: 13.5px;
    font-weight: 700;
    z-index: 3500;
    display: none;
}
.h-toast.show { display: block; }

@media (max-width: 640px) {
    .hadith-hero h1 { font-size: 24px; }
    .hadith-text { font-size: 18.5px; line-height: 2; }
    .hadith-meta { flex-direction: column; align-items: stretch; }
}
</style>
</head>
<body>

<div id="app-header"></div>
<div id="app-nav"></div>

<main class="main-container">

<section class="hadith-hero">
    <h1>🕌 السنة النبوية الصحيحة</h1>
    <p>موسوعة منتقاة من الأحاديث الصحيحة والحسنة الثابتة في الصحيحين والسنن — مضبوطة الألفاظ، ومخرّجة بالأرقام الصحيحة، وخالية من الضعيف والموضوع.</p>
</section>

<div class="controls-bar">
    <div class="search-box">
        <input type="text" id="search-input" placeholder="ابحث في نص الحديث أو الراوي أو رقم الحديث...">
        <span class="search-icon">🔍</span>
    </div>
    <select class="book-filter" id="book-filter" aria-label="تصفية حسب الكتاب">
        <option value="all">📚 كل كتب الحديث</option>
        <option value="صحيح البخاري">صحيح البخاري</option>
        <option value="صحيح مسلم">صحيح مسلم</option>
        <option value="سنن أبي داود">سنن أبي داود</option>
        <option value="سنن الترمذي">سنن الترمذي</option>
        <option value="سنن ابن ماجه">سنن ابن ماجه</option>
        <option value="مسند أحمد">مسند أحمد</option>
    </select>
</div>

<div class="filters" id="cat-filters"></div>

<div class="hadith-list" id="hadith-container"></div>

</main>

<footer id="app-footer"></footer>
<div class="h-toast" id="h-toast">✓ تم نسخ الحديث مع التخريج</div>

<script src="layout.js"></script>
<script src="hadith-db.js"></script>
<script>
(function () {
'use strict';

if (typeof window.getHadithCatalog !== 'function') {
    document.getElementById('hadith-container').innerHTML =
        '<div class="empty-state">⚠️ تعذر تحميل قاعدة الأحاديث (hadith-db.js).</div>';
    return;
}

const ALL_HADITHS = window.getHadithCatalog();
let currentCat = 'all';
let currentBook = 'all';
let currentSearch = '';
let toastTimer = null;

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = String(text || '');
    return div.innerHTML;
}

function highlight(text, query) {
    if (!query) return escapeHtml(text);
    const escaped = escapeHtml(text);
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    return escaped.replace(regex, '<span class="highlight">$1</span>');
}

function showToast(msg) {
    const t = document.getElementById('h-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function renderCategoryFilters() {
    const cats = ['all', ...new Set(ALL_HADITHS.map(h => h.cat).filter(Boolean))];
    const wrap = document.getElementById('cat-filters');
    wrap.innerHTML = cats.map(c => {
        const count = c === 'all' ? ALL_HADITHS.length : ALL_HADITHS.filter(h => h.cat === c).length;
        const label = c === 'all' ? 'الكل' : c;
        return `<button type="button" class="filter-btn ${c === currentCat ? 'active' : ''}" data-cat="${escapeHtml(c)}">${escapeHtml(label)} (${count})</button>`;
    }).join('');

    wrap.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCat = btn.dataset.cat;
            renderCategoryFilters();
            renderHadiths();
        });
    });
}

function renderHadiths() {
    const container = document.getElementById('hadith-container');
    const q = currentSearch.trim();

    const filtered = ALL_HADITHS.filter(h => {
        const matchCat = currentCat === 'all' || h.cat === currentCat;
        const matchBook = currentBook === 'all' || h.book === currentBook || (h.otherSources || '').includes(currentBook);
        if (!matchCat || !matchBook) return false;
        if (!q) return true;
        return (h.text || '').includes(q) ||
               (h.rawi || '').includes(q) ||
               (h.book || '').includes(q) ||
               String(h.num) === q ||
               (h.otherSources || '').includes(q);
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">🔍 لا توجد نتائج مطابقة لبحثك.</div>';
        return;
    }

    container.innerHTML = `
        <div class="stats-line">عدد الأحاديث المحقّقة المعروضة: <strong>${filtered.length}</strong></div>
        ${filtered.map(h => {
            const fullRef = `${h.book} (${h.num})${h.otherSources ? ' • ' + h.otherSources : ''}`;
            return `
                <article class="hadith-card">
                    <div class="hadith-top">
                        <span class="hadith-cat">${escapeHtml(h.cat || 'عام')}</span>
                        <span class="hadith-grade">✓ ${escapeHtml(h.grade || 'صحيح')}</span>
                    </div>
                    <div class="hadith-text">«${highlight(h.text, q)}»</div>
                    <div class="hadith-meta">
                        <div class="hadith-rawi">👤 الراوي: <strong>${escapeHtml(h.rawi || '—')}</strong></div>
                        <div class="hadith-actions">
                            <span class="source-pill">📚 ${escapeHtml(fullRef)}</span>
                            <button type="button" class="copy-hadith-btn" data-key="${escapeHtml(h.key)}">📋 نسخ</button>
                        </div>
                    </div>
                </article>
            `;
        }).join('')}
    `;

    container.querySelectorAll('.copy-hadith-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const h = ALL_HADITHS.find(x => x.key === btn.dataset.key);
            if (!h) return;
            const ref = `${h.book} (${h.num})${h.otherSources ? ' — ' + h.otherSources : ''} [${h.grade}]`;
            const out = `عن ${h.rawi} أن النبي ﷺ قال:\n«${h.text}»\n\n— ${ref}`;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(out).then(() => showToast('✓ تم نسخ الحديث مع التخريج'));
            }
        });
    });
}

document.getElementById('search-input').addEventListener('input', (e) => {
    currentSearch = e.target.value;
    renderHadiths();
});

document.getElementById('book-filter').addEventListener('change', (e) => {
    currentBook = e.target.value;
    renderHadiths();
});

renderCategoryFilters();
renderHadiths();

})();
</script>
</body>
</html>
