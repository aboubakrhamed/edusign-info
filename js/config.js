// 1. ملف config.js (الإعدادات والثوابت)
const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS7cuy775NW1KnJxhNAOGKntPD7Ij59VBZvLPFTxm5ys19mRwSuvpX8AMzoPcYGiTqhVuKUlXEAnMF8/pub?gid=2139009053&single=true&output=csv";

const UNI_LOGOS = {
    "ALTINBAS": "assets/altinbas.png",
    "BAHCESEHIR": "assets/bau.png",
    "BILGI": "assets/bilgi.png",
    "ISTANBUL KENT": "assets/ist_kent.png",
    "AREL": "assets/arel.png",
    "ATLAS": "assets/atlas.png",
    "AYDIN": "assets/istanbul_aydin.png",
    "BAU": "assets/bau.png", 
    "BEYKENT": "assets/beykent.png",
    "BEYKOZ": "assets/beykoz.png",
    "BIRUNI": "assets/biruni.png",
    "FATIH SULTAN MEHMET": "assets/fatih_sultan_mehmet.png", 
    "FENERBAHCE": "assets/fenerbahce.png",
    "GEDIK": "assets/gedik.png",
    "GELISIM": "assets/gelisim.png",
    "HALIC": "assets/halic.png",
    "IBN HALDUN": "assets/ibn_haldun.png", 
    "ISIK": "assets/isik.png",
    "ISTINYE": "assets/istinye.png",
    "KADIR": "assets/kadir.png", 
    "KULTUR": "assets/kultur.png",
    "ISTANBUL MEDIPOL": "assets/ist_medipol.png", 
    "NISANTASI": "assets/nisantasi.png",
    "OKAN": "assets/okan.png",
    "OZYEGIN": "assets/ozyegin.png",
    "SABAHATTIN": "assets/sabahattin.png", 
    "TICARET": "assets/ticaret.png", 
    "TOPKAPI": "assets/topkapi.png",
    "USKUDAR": "assets/uskudar.png",
    "YEDITEPE": "assets/yeditepe.png",
    "YENI": "assets/yeni.png", 
    "ANKARA MEDIPOL": "assets/ankaramedipol.png",
    "ATILIM": "assets/atilim.png",
    "LOKMAN": "assets/lokman.png",
    "OSTIM": "assets/ostim.png",
    "TED": "assets/ted.png",
};

const TRANSLATIONS = {
    en: {
        dir: 'ltr', font: 'Inter', appTitle: 'Edusign', searchPlaceholder: 'Quick Search (University, Program, City...)',
        programsCount: 'Programs', download: 'Download PDF', print: 'Print', colProgram: 'Program', colUniversity: 'University',
        colInfo: 'Information', colAddress: 'Address', lblFaculty: 'Faculty:', lblDegree: 'Degree:', lblPrice: 'Price:', lblCash: 'Cash:', 
        lblYears: 'Years:', viewUni: 'View University', select: 'Select', selected: 'Selected', searchOptions: 'Search options...',
        clearFilters: 'Clear Filters', noOptions: 'No options found', sortBy: 'Sort By', sortLowHigh: 'Price: Low to High',
        sortHighLow: 'Price: High to Low', showing: 'Showing', to: 'to', of: 'of', perPage: 'Per Page', prev: 'Previous', next: 'Next',
        jumpTo: 'Go to page', go: 'Go', filters: { country: 'Country', city: 'City', university: 'University', degree: 'Degree', faculty: 'Faculty', department: 'Department', language: 'Language', type: 'Course Type', status: 'Status', price: 'Price Range' }, langBtn: 'العربية'
    },
    ar: {
        dir: 'rtl', font: 'Cairo', appTitle: 'Edusign', searchPlaceholder: 'بحث سريع (الجامعة، التخصص، المدينة...)',
        programsCount: 'برنامج', download: 'تحميل PDF', print: 'طباعة', colProgram: 'البرنامج', colUniversity: 'الجامعة',
        colInfo: 'تفاصيل', colAddress: 'العنوان', lblFaculty: 'الكلية:', lblDegree: 'الدرجة:', lblPrice: 'السعر:', lblCash: 'كاش:', 
        lblYears: 'سنوات:', viewUni: 'عرض الجامعة', select: 'اختر', selected: 'محدد', searchOptions: 'ابحث في القائمة...',
        clearFilters: 'إلغاء الفلاتر', noOptions: 'لا توجد خيارات', sortBy: 'ترتيب حسب', sortLowHigh: 'السعر: من الأقل للأعلى',
        sortHighLow: 'السعر: من الأعلى للأقل', showing: 'عرض', to: 'إلى', of: 'من أصل', perPage: 'في الصفحة', prev: 'السابق', next: 'التالي',
        jumpTo: 'اذهب لصفحة', go: 'اذهب', filters: { country: 'الدولة', city: 'المدينة', university: 'الجامعة', degree: 'الدرجة', faculty: 'الكلية', department: 'التخصص', language: 'اللغة', type: 'نوع الكورس', status: 'الحالة', price: 'نطاق السعر' }, langBtn: 'English'
    }
};

function getUniversityLogo(uniName) {
    if (!uniName || typeof UNI_LOGOS === 'undefined') return null;
    const upperName = uniName.toUpperCase();
    for (const [key, url] of Object.entries(UNI_LOGOS)) {
        if (upperName.includes(key)) return url;
    }
    return null; 
}