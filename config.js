/* ============================================================
   الإعدادات المركزية لمنصة ملاك المعرفة
   - إدارة إيميلات استقبال الآراء والاقتراحات والإضافات اليدوية
   - نقاط الاتصال بالخدمات البرمجية
   ============================================================ */

window.MALAK_CONFIG = {
    siteName: 'ملاك المعرفة',
    siteUrl: 'https://qamarsyria.github.io/qamar-malak/',
    version: '2.0.0',

    // قائمة إيميلات الإدارة — يمكنك إضافة أي عدد من الإيميلات هنا لاحقًا
    // الإيميل الذي يحمل primary: true هو المستلم الافتراضي الرئيسي
    adminEmails: [
        {
            id: 'main-admin',
            label: 'الإدارة العامة والتطوير',
            email: 'emadhlaweh@gmail.com',
            primary: true
        }
        // لإضافة إيميل إدارة جديد لاحقًا، أزل علامات // من النموذج التالي وعدّل البيانات:
        // ,{
        //     id: 'review-admin',
        //     label: 'فريق المراجعة والإضافات العلمية',
        //     email: 'admin2@example.com',
        //     primary: false
        // }
    ],

    // إعدادات نموذج التواصل واستقبال الآراء والإضافات اليدوية
    contact: {
        // إذا أضفت لاحقًا رابط استقبال خاص (مثل نقطة POST على خادمك أو خدمة نماذج)، ضعه هنا؛
        // وإذا بقي فارغًا سيعمل النموذج مباشرة عبر البريد الإلكتروني + خيار نسخ الرسالة المنسّقة
        webhookEndpoint: '',
        categories: [
            { id: 'addition',   label: '📚 إضافة يدوية مقترحة (مسألة، كتاب، حديث، سيرة)' },
            { id: 'correction', label: '🛡️ تصحيح علمي أو توثيق مرجع' },
            { id: 'suggestion', label: '💡 اقتراح تطوير أو ميزة جديدة' },
            { id: 'technical',  label: '⚙️ الإبلاغ عن مشكلة تقنية' },
            { id: 'general',    label: '✉️ رسالة عامة لإدارة المنصة' }
        ]
    },

    // روابط واجهات البرمجة (APIs)
    apis: {
        masaelAsk: 'https://qamar-malak.wasmer.app/api/ask',
        quranCloud: 'https://api.alquran.cloud/v1',
        aladhan: 'https://api.aladhan.com/v1',
        everyAyah: 'https://everyayah.com/data'
    }
};
