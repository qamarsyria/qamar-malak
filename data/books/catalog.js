/* ============================================================
   فهرس المكتبة الداخلية — ملاك المعرفة
   كل الكتب المتاحة (ready: true) تُقرأ داخل المنصة عبر book-reader.html
   ============================================================ */

window.MALAK_BOOKS_CATALOG = {
    categories: [
        { id: 'aqeedah', title: 'العقيدة والتوحيد', icon: '🕋' },
        { id: 'hadith',  title: 'الحديث وشروحه (الصحيح فقط)', icon: '🕌' },
        { id: 'tafsir',  title: 'القرآن والتفسير', icon: '📖' },
        { id: 'fiqh',    title: 'الفقه والأحكام بالدليل', icon: '⚖️' },
        { id: 'tazkiyah',title: 'التزكية والكبائر والأذكار', icon: '💎' },
        { id: 'seerah',  title: 'السيرة والشمائل', icon: '🌙' }
    ],
    books: [
        // ========== العقيدة والتوحيد ==========
        {
            id: 'usul-thalathah',
            category: 'aqeedah',
            icon: '🕋',
            title: 'الأصول الثلاثة وأدلتها',
            author: 'الإمام محمد بن عبد الوهاب رحمه الله',
            desc: 'متن جامع في معرفة العبد ربه ودينه ونبيه محمدًا ﷺ بالأدلة من القرآن والسنة الصحيحة، مع تحقيق وتخريج الأحاديث.',
            chaptersCount: 9,
            file: 'data/books/usul-thalathah.js',
            ready: true,
            tags: ['عقيدة', 'توحيد', 'أصول', 'إيمان']
        },
        {
            id: 'qawaid-arbaa',
            category: 'aqeedah',
            icon: '📜',
            title: 'القواعد الأربع',
            author: 'الإمام محمد بن عبد الوهاب رحمه الله',
            desc: 'أربع قواعد محكمة من القرآن الكريم في حقيقة التوحيد، والفرق بين توحيد الربوبية والألوهية، وبطلان الشرك ووسائله.',
            chaptersCount: 5,
            file: 'data/books/qawaid-arbaa.js',
            ready: true,
            tags: ['قواعد', 'توحيد', 'شفاعة', 'شرك']
        },
        {
            id: 'kashf-shubuhat',
            category: 'aqeedah',
            icon: '🛡️',
            title: 'كشف الشبهات في التوحيد',
            author: 'الإمام محمد بن عبد الوهاب رحمه الله',
            desc: 'بيان التوحيد الخالص ودحض أبرز الشبهات التي يُتعلل بها في صرف العبادة لغير الله بالبراهين القرآنية والنبوية.',
            chaptersCount: 8,
            file: 'data/books/kashf-shubuhat.js',
            ready: true,
            tags: ['توحيد', 'شبهات']
        },
        {
            id: 'kitab-tawhid',
            category: 'aqeedah',
            icon: '📖',
            title: 'كتاب التوحيد الذي هو حق الله على العبيد',
            author: 'الإمام محمد بن عبد الوهاب رحمه الله',
            desc: 'أعظم متن مرتب على أبواب التوحيد وما يضاده من الشرك الأكبر والأصغر ووسائله، بالآيات والأحاديث الصحيحة.',
            chaptersCount: 66,
            file: 'data/books/kitab-tawhid.js',
            ready: false,
            tags: ['توحيد']
        },
        {
            id: 'wasitiyyah',
            category: 'aqeedah',
            icon: '🕌',
            title: 'العقيدة الواسطية',
            author: 'شيخ الإسلام ابن تيمية رحمه الله',
            desc: 'تقرير اعتقاد الفرقة الناجية في الإيمان بالله وأسمائه وصفاته، والقدر، واليوم الآخر، والصحابة، والأمر بالمعروف.',
            chaptersCount: 12,
            file: 'data/books/wasitiyyah.js',
            ready: false,
            tags: ['أسماء وصفات', 'واسطية']
        },
        {
            id: 'alam-sunnah',
            category: 'aqeedah',
            icon: '❓',
            title: 'أعلام السنة المنشورة (200 سؤال وجواب في العقيدة)',
            author: 'الشيخ حافظ بن أحمد حكمي رحمه الله',
            desc: 'موسوعة سؤال وجواب في أصول العقيدة والإيمان والتوحيد مدعومة بالآيات والأحاديث الصحيحة.',
            chaptersCount: 20,
            file: 'data/books/alam-sunnah.js',
            ready: false,
            tags: ['سؤال وجواب', 'عقيدة']
        },

        // ========== الحديث وشروحه ==========
        {
            id: 'nawawi-40',
            category: 'hadith',
            icon: '🕌',
            title: 'الأربعون النووية (مع زيادات ابن رجب — 50 حديثًا)',
            author: 'الإمام النووي والحافظ ابن رجب رحمهما الله',
            desc: 'خمسون حديثًا من جوامع كلم النبي ﷺ في أصول الدين وقواعد الإسلام مع التخريج الدقيق والفوائد والتحقيق العلمي.',
            chaptersCount: 50,
            file: 'data/books/nawawi-40.js',
            ready: true,
            tags: ['أربعون', 'أحاديث', 'ابن رجب']
        },
        {
            id: 'umdat-ahkam',
            category: 'hadith',
            icon: '⚖️',
            title: 'عمدة الأحكام من كلام خير الأنام',
            author: 'الحافظ عبد الغني المقدسي رحمه الله',
            desc: 'أحاديث الأحكام الفقهية المنتقاة من صحيحي البخاري ومسلم فقط، مرتبة على أبواب الفقه.',
            chaptersCount: 18,
            file: 'data/books/umdat-ahkam.js',
            ready: false,
            tags: ['عمدة الأحكام', 'البخاري', 'مسلم']
        },

        // ========== التفسير ==========
        {
            id: 'tafseer-saadi-mukhtasar',
            category: 'tafsir',
            icon: '📘',
            title: 'مختارات وفوائد من تيسير الكريم الرحمن',
            author: 'العلامة عبد الرحمن بن ناصر السعدي رحمه الله',
            desc: 'تفسير واضح العبارة عميق الفوائد لمقاصد السور وأمهات الآيات بعيدًا عن الإسرائيليات والتكلف.',
            chaptersCount: 30,
            file: 'data/books/tafseer-saadi.js',
            ready: false,
            tags: ['تفسير', 'السعدي']
        },

        // ========== الفقه ==========
        {
            id: 'fiqh-muyassar',
            category: 'fiqh',
            icon: '⚖️',
            title: 'الفقه الميسّر في ضوء الكتاب والسنة',
            author: 'نخبة من العلماء (إصدار مجمع الملك فهد)',
            desc: 'مرجع فقهي معاصر ميسّر في الطهارة والصلاة والزكاة والصيام والحج والمعاملات بالدليل الصحيح فقط.',
            chaptersCount: 14,
            file: 'data/books/fiqh-muyassar.js',
            ready: false,
            tags: ['فقه', 'عبادات', 'معاملات']
        },
        {
            id: 'sifat-salat',
            category: 'fiqh',
            icon: '🕌',
            title: 'صفة صلاة النبي ﷺ من التكبير إلى التسليم',
            author: 'ملخّص محقّق على السنة الصحيحة',
            desc: 'خطوات الصلاة كاملة من الاستقبال وتكبيرة الإحرام إلى التسليم والأذكار بالأدلة الصحيحة.',
            chaptersCount: 10,
            file: 'data/books/sifat-salat.js',
            ready: false,
            tags: ['صلاة', 'صفة']
        },

        // ========== التزكية والكبائر والأذكار ==========
        {
            id: 'hisn-muslim',
            category: 'tazkiyah',
            icon: '🤲',
            title: 'حصن المسلم من أذكار الكتاب والسنة',
            author: 'د. سعيد بن علي بن وهف القحطاني رحمه الله',
            desc: 'أصح الأذكار والأدعية اليومية كاملةً غير مبتورة، مخرّجةً من الصحيحين والسنن بضبط كامل للألفاظ.',
            chaptersCount: 24,
            file: 'data/books/hisn-muslim.js',
            ready: true,
            tags: ['أذكار', 'حصن المسلم', 'دعاء']
        },
        {
            id: 'kabair-dhahabi',
            category: 'tazkiyah',
            icon: '⚠️',
            title: 'الكبائر (النسخة المنقّاة المخرّجة)',
            author: 'الحافظ شمس الدين الذهبي رحمه الله',
            desc: 'البديل المحقّق لكتب الوعظ غير المصفّاة: التحذير من كبائر الذنوب بالآيات والأحاديث الصحيحة الثابتة فقط.',
            chaptersCount: 25,
            file: 'data/books/kabair-dhahabi.js',
            ready: false,
            tags: ['كبائر', 'الذهبي']
        },
        {
            id: 'wabil-sayyib',
            category: 'tazkiyah',
            icon: '💎',
            title: 'الوابل الصيب من الكلم الطيب',
            author: 'الإمام ابن قيم الجوزية رحمه الله',
            desc: 'في فضل الذكر وأثره في حياة القلب ودفع الشيطان، مع فوائد عظيمة في إصلاح النفوس.',
            chaptersCount: 10,
            file: 'data/books/wabil-sayyib.js',
            ready: false,
            tags: ['ذكر', 'ابن القيم']
        },
        {
            id: 'daa-dawaa',
            category: 'tazkiyah',
            icon: '💊',
            title: 'الداء والدواء (الجواب الكافي)',
            author: 'الإمام ابن قيم الجوزية رحمه الله',
            desc: 'علاج أمراض القلوب وآثار المعاصي والتوبة واليقين وأعمال القلوب من القرآن والسنة.',
            chaptersCount: 12,
            file: 'data/books/daa-dawaa.js',
            ready: false,
            tags: ['توبة', 'قلوب', 'ابن القيم']
        },

        // ========== السيرة والشمائل ==========
        {
            id: 'fusul-seerah',
            category: 'seerah',
            icon: '🌙',
            title: 'الفصول في سيرة الرسول ﷺ',
            author: 'الحافظ ابن كثير الدمشقي رحمه الله',
            desc: 'سيرة نبوية متينة ومختصرة محرّرة بقلم إمام المفسرين والمؤرخين الحافظ ابن كثير.',
            chaptersCount: 15,
            file: 'data/books/fusul-seerah.js',
            ready: false,
            tags: ['سيرة', 'ابن كثير']
        }
    ]
};
