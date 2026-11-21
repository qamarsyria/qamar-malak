/* ============================================================
   ملاك المعرفة — المكون الموحّد للهيدر والتنقل والمظهر والفوتر
   ============================================================ */
(function () {
'use strict';

const THEME_KEY = 'malak_theme';

function getSavedTheme() {
    try {
        return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
    } catch (e) {
        return 'dark';
    }
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#faf6ec' : '#0b4133');

    const btn = document.getElementById('malak-theme-btn');
    if (btn) {
        btn.innerHTML = theme === 'light'
            ? '🌙 <span class="lbl">الوضع الليلي</span>'
            : '☀️ <span class="lbl">الوضع الورقي</span>';
    }
}

applyTheme(getSavedTheme());

const NAV_MENU = [
    { type: 'link', label: '🏠 الرئيسية', href: 'index.html' },
    {
        type: 'group',
        label: '📖 القرآن والتفسير',
        items: [
            { label: '📖 القرآن الكريم', href: 'quran.html' },
            { label: '📚 التفسير المعتمد', href: 'tafsir.html' },
            { label: '📜 القصص القرآنية', href: 'quranic-stories.html' }
        ]
    },
    {
        type: 'group',
        label: '🕌 السنة والرقائق',
        items: [
            { label: '🕌 السنة النبوية', href: 'hadith.html' },
            { label: '✨ فضائل الأعمال', href: 'fadail.html' },
            { label: '🕋 الزهد والرقائق', href: 'zuhd.html' },
            { label: '🛡️ الوقاية والرقية الشرعية', href: 'sihr.html' }
        ]
    },
    {
        type: 'group',
        label: '⚖️ الفقه والمسائل',
        items: [
            { label: '📖 المسائل الشرعية', href: 'masael.html' },
            { label: '⚖️ الفقه الإسلامي', href: 'fiqh.html' },
            { label: '🌸 المرأة المسلمة', href: 'women.html' }
        ]
    },
    {
        type: 'group',
        label: '🌙 السيرة والتاريخ',
        items: [
            { label: '🌙 السيرة النبوية', href: 'seerah.html' },
            { label: '⚔️ الغزوات والفتوحات', href: 'ghazawat.html' },
            { label: '🕊️ قصص الأنبياء', href: 'prophets.html' },
            { label: '⭐ الصحابة الكرام', href: 'sahaba.html' },
            { label: '🎖️ الشهداء', href: 'shuhada.html' }
        ]
    },
    { type: 'link', label: '📚 المكتبة الداخلية', href: 'library.html', matchAlso: ['book-reader.html'] },
    {
        type: 'group',
        label: '🤲 العبادات والأدوات',
        items: [
            { label: '🤲 الأذكار والأدعية', href: 'adhkar.html' },
            { label: '🕌 مواقيت الصلاة', href: 'prayer.html' },
            { label: '📿 المسبحة الرقمية', href: 'tasbih.html' },
            { label: '📅 التقويم الهجري', href: 'calendar.html' },
            { label: '🔍 البحث الشامل', href: 'search.html' }
        ]
    }
];

function getCurrentFile() {
    const path = window.location.pathname.split('/').pop();
    return path || 'index.html';
}

function isLinkActive(item, currentFile) {
    if (item.href === currentFile) return true;
    if (item.href === 'quran.html' && currentFile === 'surah.html') return true;
    if (Array.isArray(item.matchAlso) && item.matchAlso.includes(currentFile)) return true;
    return false;
}

function buildHeaderHTML() {
    const theme = getSavedTheme();
    const themeLabel = theme === 'light'
        ? '🌙 <span class="lbl">الوضع الليلي</span>'
        : '☀️ <span class="lbl">الوضع الورقي</span>';

    return `
        <div class="header-container">
            <a href="index.html" class="logo">
                <div class="logo-icon"><span>☪</span></div>
                <div class="logo-text">
                    <span class="main">ملاك المعرفة</span>
                    <span class="sub">موسوعة إسلامية موثقة من القرآن والسنة</span>
                </div>
            </a>
            <div class="header-actions">
                <button type="button" class="theme-btn" id="malak-theme-btn" aria-label="تبديل المظهر">${themeLabel}</button>
                <button type="button" class="nav-toggle" id="malak-drawer-open" aria-label="القائمة">☰</button>
            </div>
        </div>
    `;
}

function buildNavHTML(currentFile) {
    const itemsHTML = NAV_MENU.map((entry, idx) => {
        if (entry.type === 'link') {
            const active = isLinkActive(entry, currentFile) ? 'active' : '';
            return `<div class="nav-item"><a href="${entry.href}" class="nav-link ${active}">${entry.label}</a></div>`;
        }
        const groupActive = entry.items.some(sub => isLinkActive(sub, currentFile)) ? 'active' : '';
        const subHTML = entry.items.map(sub => {
            const active = isLinkActive(sub, currentFile) ? 'active' : '';
            return `<a href="${sub.href}" class="${active}">${sub.label}</a>`;
        }).join('');
        return `
            <div class="nav-item" data-group="${idx}">
                <button type="button" class="nav-link ${groupActive}" aria-expanded="false">
                    <span>${entry.label}</span>
                    <span class="nav-caret">▼</span>
                </button>
                <div class="nav-dropdown">${subHTML}</div>
            </div>
        `;
    }).join('');

    return `<div class="nav-wrap">${itemsHTML}</div>`;
}

function buildDrawerHTML(currentFile) {
    const groupsHTML = NAV_MENU.map(entry => {
        if (entry.type === 'link') {
            const active = isLinkActive(entry, currentFile) ? 'active' : '';
            return `
                <div class="drawer-group">
                    <a href="${entry.href}" class="${active}">${entry.label}</a>
                </div>
            `;
        }
        return `
            <div class="drawer-group">
                <div class="drawer-group-title">${entry.label}</div>
                ${entry.items.map(sub => {
                    const active = isLinkActive(sub, currentFile) ? 'active' : '';
                    return `<a href="${sub.href}" class="${active}">${sub.label}</a>`;
                }).join('')}
            </div>
        `;
    }).join('');

    return `
        <div class="drawer-backdrop" id="malak-drawer-backdrop"></div>
        <aside class="mobile-drawer" id="malak-mobile-drawer" aria-label="القائمة الجانبية">
            <div class="drawer-header">
                <span class="drawer-title">☪ ملاك المعرفة</span>
                <button type="button" class="drawer-close" id="malak-drawer-close" aria-label="إغلاق">✕</button>
            </div>
            ${groupsHTML}
        </aside>
    `;
}

function buildFooterHTML() {
    return `
        <p class="footer-ayah">﴿ وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ عَلَيْهِ تَوَكَّلْتُ وَإِلَيْهِ أُنِيبُ ﴾</p>
        <p><strong>ملاك المعرفة</strong> — منصة دعوية علمية غير ربحية على هدي القرآن الكريم والسنة الصحيحة</p>
        <p>تطوير: <strong>Emad Halaweh</strong> — مراجعة ومشاركة: <strong>Malak Kamal Abdel Azim</strong></p>
        <p>© 2026 جميع الحقوق محفوظة — صدقة جارية، نسألكم الدعاء.</p>
    `;
}

function mountLayout() {
    const currentFile = getCurrentFile();

    let headerEl = document.getElementById('app-header') || document.querySelector('header.site-header');
    if (!headerEl) {
        headerEl = document.createElement('header');
        document.body.prepend(headerEl);
    }
    headerEl.className = 'site-header';
    headerEl.innerHTML = buildHeaderHTML();

    let navEl = document.getElementById('app-nav') || document.querySelector('nav.main-nav');
    if (!navEl) {
        navEl = document.createElement('nav');
        headerEl.insertAdjacentElement('afterend', navEl);
    }
    navEl.className = 'main-nav';
    navEl.removeAttribute('style');
    navEl.innerHTML = buildNavHTML(currentFile);

    if (!document.getElementById('malak-mobile-drawer')) {
        const holder = document.createElement('div');
        holder.innerHTML = buildDrawerHTML(currentFile);
        while (holder.firstChild) document.body.appendChild(holder.firstChild);
    }

    let footerEl = document.getElementById('app-footer') || document.querySelector('footer.site-footer');
    if (footerEl) {
        footerEl.className = 'site-footer';
        footerEl.innerHTML = buildFooterHTML();
    }

    if (!document.getElementById('offline-badge')) {
        const badge = document.createElement('div');
        badge.id = 'offline-badge';
        badge.className = 'offline-badge';
        badge.textContent = '📡 أنت غير متصل بالإنترنت — تتوفر الصفحات والكتب المحفوظة';
        document.body.appendChild(badge);
    }

    bindEvents(navEl);
}

function bindEvents(navEl) {
    const themeBtn = document.getElementById('malak-theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const next = getSavedTheme() === 'light' ? 'dark' : 'light';
            applyTheme(next);
        });
    }

    navEl.querySelectorAll('.nav-item[data-group]').forEach(item => {
        const trigger = item.querySelector('button.nav-link');
        if (!trigger) return;
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = item.classList.contains('open');
            navEl.querySelectorAll('.nav-item.open').forEach(x => {
                x.classList.remove('open');
                const b = x.querySelector('button.nav-link');
                if (b) b.setAttribute('aria-expanded', 'false');
            });
            if (!isOpen) {
                item.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    document.addEventListener('click', () => {
        navEl.querySelectorAll('.nav-item.open').forEach(x => {
            x.classList.remove('open');
            const b = x.querySelector('button.nav-link');
            if (b) b.setAttribute('aria-expanded', 'false');
        });
    });

    const openBtn = document.getElementById('malak-drawer-open');
    const closeBtn = document.getElementById('malak-drawer-close');
    const backdrop = document.getElementById('malak-drawer-backdrop');
    const drawer = document.getElementById('malak-mobile-drawer');

    function openDrawer() {
        if (drawer) drawer.classList.add('open');
        if (backdrop) backdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (drawer) drawer.classList.remove('open');
        if (backdrop) backdrop.classList.remove('show');
        document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeDrawer();
            navEl.querySelectorAll('.nav-item.open').forEach(x => x.classList.remove('open'));
        }
    });

    const offlineBadge = document.getElementById('offline-badge');
    if (offlineBadge) {
        const updateNet = () => offlineBadge.classList.toggle('show', !navigator.onLine);
        window.addEventListener('online', updateNet);
        window.addEventListener('offline', updateNet);
        updateNet();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }

    window.MalakLayout = {
        toggleTheme: () => applyTheme(getSavedTheme() === 'light' ? 'dark' : 'light'),
        applyTheme,
        getTheme: getSavedTheme,
        openDrawer,
        closeDrawer
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountLayout);
} else {
    mountLayout();
}

})();
