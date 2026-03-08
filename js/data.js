// 2. ملف data.js (الـ State ومعالجة البيانات)

let APP_STATE = {
    lang: 'en',
    data: [],
    filters: {
        country: new Set(), city: new Set(), university: new Set(), degree: new Set(),
        faculty: new Set(), department: new Set(), language: new Set(), type: new Set(),
        status: new Set(), minPrice: '', maxPrice: ''
    },
    sortBy: '', searchTerm: '', currentPage: 1, itemsPerPage: 10, openDropdown: null, highlightedIndex: -1 
};

async function fetchData() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('hidden');
    
    const isValidData = (text) => text && text.length > 50 && (text.includes(',') || text.includes('University'));

    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        if (response.ok) {
            const text = await response.text();
            if (isValidData(text)) { processData(text); return; }
        }
        throw new Error("Direct fetch failed");
    } catch (error) {
        console.warn("Direct fetch blocked, trying Proxies...");
        try {
            const proxyUrl1 = `https://api.allorigins.win/raw?url=${encodeURIComponent(GOOGLE_SHEET_URL)}`;
            const response1 = await fetch(proxyUrl1);
            if (response1.ok) {
                const text = await response1.text();
                if (isValidData(text)) { processData(text); return; }
            }
        } catch (err) {
            console.error("All data fetch attempts failed.");
        }
    } finally {
        if (spinner) spinner.classList.add('hidden');
    }
}

function processData(text) {
    APP_STATE.data = parseCSV(text);
    applyLanguage(); 
    setupFilters();
    renderPrograms();
}

function parseCSV(text) {
    const lines = text.split('\n');
    if (lines.length < 2) return [];

    const splitLine = (row) => {
        const result = [];
        let current = ''; let inQuote = false;
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') { inQuote = !inQuote; continue; }
            if (char === ',' && !inQuote) { result.push(current.trim()); current = ''; } 
            else { current += char; }
        }
        result.push(current.trim()); return result;
    };

    const headerLine = lines[0].toLowerCase().replace(/\r/g, '');
    const headers = splitLine(headerLine);
    const getIdx = (name) => headers.findIndex(h => h.includes(name.toLowerCase()));
    const getExactIdx = (name) => headers.findIndex(h => h === name.toLowerCase());

    const idx = {
        nameEn: getIdx('department-en'), nameAr: getIdx('department-ar'), 
        uniEn: getIdx('university-en'), uniAr: getIdx('university-ar'),
        facEn: getIdx('faculty-en'), facAr: getIdx('faculty-ar'), 
        degEn: getIdx('degree-en'), degAr: getIdx('degree-ar'),
        langEn: getIdx('language-en'), langAr: getIdx('language-ar'), 
        statEn: getIdx('program status-en'), statAr: getIdx('program status-ar'),
        typeEn: getIdx('course type-en'), typeAr: getIdx('course type-ar'), 
        countryEn: getIdx('country-en'), countryAr: getIdx('country-ar'),
        cityEn: getIdx('city-en'), cityAr: getIdx('city-ar'), 
        campusEn: getIdx('campus-en'), campusAr: getIdx('campus-ar'),
        address: getIdx('campus address'), price: getExactIdx('price'), 
        discountPrice: getIdx('discountprice'), cashPrice: getIdx('cashprice'), years: getIdx('years')
    };

    return lines.slice(1).map((line, index) => {
        const cols = splitLine(line); 
        if (cols.length < 5) return null;

        // دالة تنظيف المسافات
        const getRawVal = (i) => (i > -1 && cols[i]) ? cols[i].replace(/\r/g, '').replace(/\s+/g, ' ').trim() : '';
        
        // دالة توحيد حالة الأحرف للإنجليزي مع الحفاظ على ما بين القوسين كابيتال
        const getCleanVal = (i, keepParensUpper = false) => {
            const str = getRawVal(i);
            if (!str) return '';
            
            // تطبيق الـ Title Case الأساسي
            let cleanStr = str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            
            // لو مفعل خاصية الأقواس، بنحول أي نص داخل (...) لـ Upper Case بالكامل
            if (keepParensUpper) {
                cleanStr = cleanStr.replace(/\(([^)]+)\)/g, (match) => match.toUpperCase());
            }
            
            return cleanStr;
        };

        const rawOriginal = getRawVal(idx.price) || "0";
        const rawDiscount = getRawVal(idx.discountPrice);
        const rawCash = getRawVal(idx.cashPrice);

        let effectivePriceStr = (rawDiscount && rawDiscount !== "0") ? rawDiscount : rawOriginal;
        let tuitionPrice = effectivePriceStr; let trainingPrice = null;

        if (effectivePriceStr.includes('+')) {
            const parts = effectivePriceStr.split('+');
            tuitionPrice = parts[0].trim(); trainingPrice = parts[1].trim();
        }

        return {
            id: index, 
            name: { en: getCleanVal(idx.nameEn, true) || "Unnamed", ar: getRawVal(idx.nameAr) || getCleanVal(idx.nameEn, true) },
            // تم تفعيل الحفاظ على الأقواس هنا أيضاً للجامعات
            university: { en: getCleanVal(idx.uniEn, true), ar: getRawVal(idx.uniAr) || getCleanVal(idx.uniEn, true) }, 
            faculty: { en: getCleanVal(idx.facEn), ar: getRawVal(idx.facAr) || getCleanVal(idx.facEn) },
            degree: { en: getCleanVal(idx.degEn), ar: getRawVal(idx.degAr) || getCleanVal(idx.degEn) }, 
            language: { en: getCleanVal(idx.langEn), ar: getRawVal(idx.langAr) || getCleanVal(idx.langEn) },
            type: { en: getCleanVal(idx.typeEn), ar: getRawVal(idx.typeAr) || getCleanVal(idx.typeEn) }, 
            status: { en: getCleanVal(idx.statEn), ar: getRawVal(idx.statAr) || "متاح" },
            country: { en: getCleanVal(idx.countryEn), ar: getRawVal(idx.countryAr) || getCleanVal(idx.countryEn) }, 
            city: { en: getCleanVal(idx.cityEn), ar: getRawVal(idx.cityAr) || getCleanVal(idx.cityEn) },
            campus: { en: getCleanVal(idx.campusEn), ar: getRawVal(idx.campusAr) || getCleanVal(idx.campusEn) }, 
            address: getRawVal(idx.address),
            price: tuitionPrice, trainingPrice: trainingPrice, originalPrice: rawOriginal, cashPrice: rawCash, years: getRawVal(idx.years)
        };
    }).filter(Boolean);
}

function getFilteredData(excludeKey = null) {
    const lang = APP_STATE.lang;
    let filtered = APP_STATE.data.filter(p => {
        const name = (p.name[lang] || '').toLowerCase(); 
        const uni = (p.university[lang] || '').toLowerCase(); 
        const term = APP_STATE.searchTerm;
        const matchesSearch = name.includes(term) || uni.includes(term);
        
        const price = parseFloat(p.price); 
        const minP = APP_STATE.filters.minPrice ? parseFloat(APP_STATE.filters.minPrice) : 0; 
        const maxP = APP_STATE.filters.maxPrice ? parseFloat(APP_STATE.filters.maxPrice) : Infinity;
        const matchesPrice = (!isNaN(price) ? (price >= minP && price <= maxP) : true);

        const matchesFilters = Object.keys(APP_STATE.filters).every(key => {
            if (key === 'minPrice' || key === 'maxPrice' || key === excludeKey) return true;
            const set = APP_STATE.filters[key]; 
            if (set.size === 0) return true;
            let dataVal; 
            if (key === 'department') dataVal = p.name[lang]; 
            else if(p[key] && p[key][lang]) dataVal = p[key][lang]; 
            else return true;
            return set.has(dataVal);
        });
        return matchesSearch && matchesPrice && matchesFilters;
    });

    if (!excludeKey) {
        if (APP_STATE.sortBy === 'priceAsc') filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        else if (APP_STATE.sortBy === 'priceDesc') filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    return filtered;
}