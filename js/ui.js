// 3. ملف ui.js (تفاعل الواجهة والتحكم في القوائم المنسدلة)

function toggleLanguage() {
    APP_STATE.lang = APP_STATE.lang === 'en' ? 'ar' : 'en';
    applyLanguage(); 
    setupFilters(); 
    renderPrograms(); 
    const printSpan = document.querySelector('[data-i18n="print"]');
    if(printSpan) printSpan.innerText = TRANSLATIONS[APP_STATE.lang].print;
}

function applyLanguage() {
    const t = TRANSLATIONS[APP_STATE.lang];
    document.documentElement.setAttribute('dir', t.dir);
    document.documentElement.setAttribute('lang', APP_STATE.lang);
    document.body.style.fontFamily = `"${t.font}", sans-serif`;
    document.getElementById('lang-label').innerText = t.langBtn;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n'); if (t[key]) el.innerText = t[key];
    });
    document.getElementById('search-input').placeholder = t.searchPlaceholder;
}

function focusSearch(key) {
    const input = document.getElementById(`input-${key}`);
    if (input) { 
        input.focus(); 
        openDropdown(key); 
    }
}

function openDropdown(key) {
    const dropdown = document.getElementById(`dropdown-${key}`);
    const input = document.getElementById(`input-${key}`);
    
    // إغلاق أي قائمة أخرى مفتوحة قبل فتح الجديدة
    if (APP_STATE.openDropdown && APP_STATE.openDropdown !== key) {
        closeDropdown(APP_STATE.openDropdown);
    }

    if (dropdown && dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden'); 
        APP_STATE.openDropdown = key; 
        APP_STATE.highlightedIndex = -1; 
        filterDropdownOptions(key, input.value);
    }
}

function closeDropdown(key) {
    const dropdown = document.getElementById(`dropdown-${key}`);
    const input = document.getElementById(`input-${key}`);
    if (dropdown) dropdown.classList.add('hidden');
    // لا يتم تصفير الـ input هنا إلا عند الإغلاق الفعلي المتعمد
    APP_STATE.openDropdown = null; 
    APP_STATE.highlightedIndex = -1;
}

// إغلاق بـ Escape فقط
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && APP_STATE.openDropdown) {
        const input = document.getElementById(`input-${APP_STATE.openDropdown}`);
        if(input) input.value = ''; // تصفير عند الهروب فقط
        closeDropdown(APP_STATE.openDropdown);
    }
});

function handleDropdownKeydown(e, key) {
    const input = document.getElementById(`input-${key}`);
    
    if (e.key === 'Backspace' && input.value === '') {
        const filterSet = APP_STATE.filters[key];
        if (filterSet.size > 0) { 
            const lastItem = Array.from(filterSet).pop(); 
            removeTag(key, lastItem); 
        }
        return;
    }

    const container = document.getElementById(`options-${key}`);
    const items = Array.from(container.querySelectorAll('.dropdown-item:not(.hidden)'));
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') { 
        e.preventDefault(); 
        APP_STATE.highlightedIndex++; 
        if (APP_STATE.highlightedIndex >= items.length) APP_STATE.highlightedIndex = 0; 
        updateHighlight(items); 
    }
    else if (e.key === 'ArrowUp') { 
        e.preventDefault(); 
        APP_STATE.highlightedIndex--; 
        if (APP_STATE.highlightedIndex < 0) APP_STATE.highlightedIndex = items.length - 1; 
        updateHighlight(items); 
    }
    else if (e.key === 'Enter') { 
        e.preventDefault(); 
        if (APP_STATE.highlightedIndex > -1 && items[APP_STATE.highlightedIndex]) {
            items[APP_STATE.highlightedIndex].click(); 
        }
    }
}

function updateHighlight(items) {
    items.forEach((item, index) => {
        if (index === APP_STATE.highlightedIndex) { 
            item.classList.add('bg-fjNavy', 'text-fjGold'); 
            item.scrollIntoView({ block: 'nearest' }); 
        } else { 
            item.classList.remove('bg-fjNavy', 'text-fjGold'); 
        }
    });
}

function filterDropdownOptions(key, query, resetHighlight = true) {
    const container = document.getElementById(`options-${key}`);
    if (!container) return;

    const items = container.querySelectorAll('.dropdown-item');
    const lowerQuery = (query || '').toLowerCase(); 
    let hasVisible = false; 
    
    if (resetHighlight) APP_STATE.highlightedIndex = -1;

    items.forEach(item => {
        const value = item.dataset.value; 
        const text = item.textContent.toLowerCase(); 
        const isSelected = APP_STATE.filters[key].has(value);
        if (text.includes(lowerQuery) && !isSelected) { 
            item.classList.remove('hidden', 'bg-fjNavy', 'text-fjGold'); 
            hasVisible = true; 
        } else { 
            item.classList.add('hidden'); 
        }
    });

    let noOptMsg = container.querySelector('.no-options-msg');
    if (!hasVisible) {
        if(!noOptMsg) {
            noOptMsg = document.createElement('div'); 
            noOptMsg.className = 'no-options-msg p-2 text-sm text-slate-400 text-center';
            noOptMsg.innerText = TRANSLATIONS[APP_STATE.lang].noOptions; 
            container.appendChild(noOptMsg);
        }
    } else if (noOptMsg) { 
        noOptMsg.remove(); 
    }

    // إعادة رسم الـ Highlight لو كنا في وضع الاختيار المستمر
    const visibleItems = Array.from(container.querySelectorAll('.dropdown-item:not(.hidden)'));
    if (!resetHighlight && visibleItems.length > 0) {
        if (APP_STATE.highlightedIndex >= visibleItems.length) {
            APP_STATE.highlightedIndex = visibleItems.length - 1;
        }
        updateHighlight(visibleItems);
    }
}

function selectItem(key, value) {
    // 1. التقاط الحالة الحالية قبل أي تغيير
    const input = document.getElementById(`input-${key}`);
    const currentQuery = input ? input.value : '';
    const oldIndex = APP_STATE.highlightedIndex;

    // 2. تحديث الداتا
    APP_STATE.filters[key].add(value); 
    renderTags(key);
    updateAllDropdowns(); 
    APP_STATE.currentPage = 1; 
    renderPrograms();

    // 3. تثبيت الواجهة (Hack لمنع الإغلاق أو التصفير)
    setTimeout(() => {
        const inputRef = document.getElementById(`input-${key}`);
        const dropdown = document.getElementById(`dropdown-${key}`);
        
        if (inputRef && dropdown) {
            // نرجع النص اللي كان مكتوب بالظبط
            inputRef.value = currentQuery;
            inputRef.focus();
            
            // نجبر القائمة تفضل مفتوحة
            dropdown.classList.remove('hidden');
            APP_STATE.openDropdown = key;
            
            // نفلتر الداتا فوراً بناءً على النص المسترجع مع تثبيت مكان السهم
            APP_STATE.highlightedIndex = oldIndex;
            filterDropdownOptions(key, currentQuery, false);
        }
    }, 10); 
}

function removeTag(key, value) {
    APP_STATE.filters[key].delete(value); 
    renderTags(key); 
    updateAllDropdowns(); 
    APP_STATE.currentPage = 1; 
    renderPrograms();
    
    const input = document.getElementById(`input-${key}`);
    if(input) input.focus();
}

function renderTags(key) {
    const container = document.getElementById(`tags-${key}`); if (!container) return;
    container.innerHTML = '';
    APP_STATE.filters[key].forEach(val => {
        const tag = document.createElement('div');
        tag.className = 'flex items-center gap-1 bg-fjNavy text-fjGold border border-fjGold/30 px-2 py-0.5 rounded-md text-xs font-medium group transition-colors hover:bg-fjGold hover:text-fjNavy';
        tag.innerHTML = `<span>${val}</span><button onclick="event.stopPropagation(); removeTag('${key}', '${val.replace(/'/g, "\\'")}')" class="text-fjGold/70 hover:text-current outline-none"><i data-lucide="x" width="12"></i></button>`;
        container.appendChild(tag);
    });
    lucide.createIcons();
}

function updateAllDropdowns() {
    const filterKeys = ['country', 'city', 'university', 'degree', 'faculty', 'department', 'language', 'type', 'status'];
    filterKeys.forEach(key => {
        populateMultiSelect(key);
        const input = document.getElementById(`input-${key}`);
        // تحديث الخيارات للفلتر المفتوح بدون تصفير السهم وبدون مسح النص
        if (APP_STATE.openDropdown === key && input) {
            filterDropdownOptions(key, input.value, false);
        }
    });
}

function setupFilters() {
    const container = document.getElementById('filters-container'); 
    const t = TRANSLATIONS[APP_STATE.lang].filters; 
    const langT = TRANSLATIONS[APP_STATE.lang];
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            ${createMultiSelectHtml(t.country, 'country')} ${createMultiSelectHtml(t.city, 'city')}
            ${createMultiSelectHtml(t.university, 'university')} ${createMultiSelectHtml(t.degree, 'degree')} ${createMultiSelectHtml(t.faculty, 'faculty')}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
            ${createMultiSelectHtml(t.department, 'department')} ${createMultiSelectHtml(t.language, 'language')}
            ${createMultiSelectHtml(t.type, 'type')} ${createMultiSelectHtml(t.status, 'status')}
            <div class="flex flex-col space-y-1.5 w-full">
               <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">${t.price}</label>
               <div class="flex gap-2">
                 <input type="number" id="filter-minPrice" placeholder="Min" class="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-fjGold transition-all">
                 <input type="number" id="filter-maxPrice" placeholder="Max" class="w-1/2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-fjGold transition-all">
               </div>
            </div>
        </div>
        <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
             <div class="flex flex-col space-y-1.5 w-48">
                <select id="sort-select" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-fjGold cursor-pointer">
                    <option value="">${langT.sortBy}</option> <option value="priceAsc">${langT.sortLowHigh}</option> <option value="priceDesc">${langT.sortHighLow}</option>
                </select>
             </div>
             <button onclick="clearFilters()" class="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"><i data-lucide="x" width="16"></i> ${langT.clearFilters}</button>
        </div>
    `;

    updateAllDropdowns();
    ['minPrice', 'maxPrice'].forEach(key => {
        const el = document.getElementById(`filter-${key}`);
        if(el) { el.value = APP_STATE.filters[key]; el.addEventListener('input', (e) => { APP_STATE.filters[key] = e.target.value; APP_STATE.currentPage = 1; updateAllDropdowns(); renderPrograms(); }); }
    });
    const sortEl = document.getElementById('sort-select');
    if(sortEl) { sortEl.value = APP_STATE.sortBy; sortEl.addEventListener('change', (e) => { APP_STATE.sortBy = e.target.value; APP_STATE.currentPage = 1; renderPrograms(); }); }
}

function clearFilters() {
    Object.keys(APP_STATE.filters).forEach(key => { if(APP_STATE.filters[key] instanceof Set) APP_STATE.filters[key].clear(); else APP_STATE.filters[key] = ''; });
    APP_STATE.sortBy = ''; APP_STATE.currentPage = 1; setupFilters(); renderPrograms();
}

function createMultiSelectHtml(label, key) {
    const t = TRANSLATIONS[APP_STATE.lang];
    return `
        <div class="custom-multiselect relative w-full" id="group-${key}">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">${label}</label>
            <div class="w-full min-h-[42px] px-2 py-1.5 bg-white border border-slate-200 rounded-lg flex flex-wrap gap-1 items-center cursor-text focus-within:border-fjGold transition-colors" onclick="focusSearch('${key}')">
                <div id="tags-${key}" class="flex flex-wrap gap-1"></div>
                <input type="text" id="input-${key}" class="flex-1 min-w-[60px] outline-none text-sm bg-transparent h-7 text-slate-700 placeholder-slate-400" placeholder="${t.select}..." oninput="openDropdown('${key}'); filterDropdownOptions('${key}', this.value)" onfocus="openDropdown('${key}')" onkeydown="handleDropdownKeydown(event, '${key}')">
            </div>
            <div id="dropdown-${key}" class="hidden absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"><div id="options-${key}" class="p-1 space-y-0.5 custom-scrollbar"></div></div>
        </div>
    `;
}

function populateMultiSelect(key) {
    const lang = APP_STATE.lang; const container = document.getElementById(`options-${key}`); if (!container) return;
    const dataKey = key === 'department' ? 'name' : key; const relevantData = getFilteredData(key); 
    const uniqueValues = Array.from(new Set(relevantData.map(p => p[dataKey][lang]).filter(Boolean))).sort();
    container.innerHTML = '';
    uniqueValues.forEach(val => {
        if(APP_STATE.filters[key].has(val)) return;
        const div = document.createElement('div'); div.className = 'dropdown-item px-3 py-2 hover:bg-fjGold/10 rounded cursor-pointer text-sm text-slate-700 transition-colors truncate';
        div.dataset.value = val; div.textContent = val; div.onclick = () => selectItem(key, val); container.appendChild(div);
    });
    renderTags(key);
}

function renderPrograms() {
    const list = document.getElementById('programs-list'); const countLabel = document.getElementById('program-count');
    const lang = APP_STATE.lang; const t = TRANSLATIONS[lang]; list.innerHTML = '';
    const filtered = getFilteredData(); countLabel.innerText = `${filtered.length} ${t.programsCount}`;
    const totalItems = filtered.length; const totalPages = Math.ceil(totalItems / APP_STATE.itemsPerPage);
    if (APP_STATE.currentPage > totalPages) APP_STATE.currentPage = totalPages > 0 ? totalPages : 1;
    if (APP_STATE.currentPage < 1) APP_STATE.currentPage = 1;
    const startIdx = (APP_STATE.currentPage - 1) * APP_STATE.itemsPerPage; const endIdx = startIdx + APP_STATE.itemsPerPage;
    const paginatedItems = filtered.slice(startIdx, endIdx);

    if (totalItems === 0) list.innerHTML = `<div class="p-10 text-center text-slate-400">${lang === 'en' ? 'No programs found.' : 'لا توجد نتائج.'}</div>`;

    paginatedItems.forEach(p => {
        const isClosed = p.status.en.toUpperCase().includes('CLOSED') || p.status.ar.includes('مغلق');
        const statusColor = isClosed ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200';
        const logoUrl = getUniversityLogo(p.university.en);
        const logoHtml = logoUrl ? `<img src="${logoUrl}" alt="${p.university[lang]}" class="w-[60px] h-[60px] object-contain p-1 rounded-full border border-slate-200 bg-white shrink-0 shadow-sm">` : `<div class="w-[60px] h-[60px] rounded-full border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-sm"><i data-lucide="building-2" class="text-slate-400"></i></div>`;
        
        let priceHtml = `<div class="flex items-start gap-1"><span class="font-bold text-slate-700 whitespace-nowrap">${t.lblPrice}</span><div class="flex flex-col items-start gap-0.5"><div class="flex items-center gap-1">${(p.originalPrice && p.originalPrice !== p.price && !p.originalPrice.includes('+') && p.originalPrice !== "0") ? `<span class="line-through text-slate-400 text-xs">$${p.originalPrice}</span>` : ''}<span class="text-red-600 font-bold text-[15px] leading-none">$${p.price}</span></div>${p.trainingPrice ? `<div class="flex items-center gap-1 mt-0.5"><span class="text-amber-600 font-bold leading-none">+ €${p.trainingPrice}</span><span class="text-[11px] text-amber-600/80 leading-none">(Flight)</span></div>` : ''}</div></div>`;
        if (p.cashPrice && p.cashPrice !== "0" && p.cashPrice !== "" && p.cashPrice.trim() !== p.price.trim()) {
            priceHtml += `<div class="mt-1.5 mb-0.5"><span class="font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 inline-flex items-center gap-1 text-[11px]"><i data-lucide="banknote" width="12"></i> ${t.lblCash} $${p.cashPrice}</span></div>`;
        }

        const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`;
        const row = document.createElement('div');
        row.className = 'flex flex-col md:grid md:grid-cols-12 gap-0 md:gap-4 py-5 px-4 md:px-5 hover:bg-slate-50/80 transition-colors border-b border-slate-200 group';
        // التعديل هنا: المدينة الأول وبعدين الدولة
        row.innerHTML = `<div class="md:col-span-3 flex items-start md:items-center gap-3 order-1 md:order-2 border-b border-slate-100 md:border-none pb-4 md:pb-0 mb-4 md:mb-0">${logoHtml}<div class="flex flex-col"><span class="text-fjNavy font-extrabold text-[16px] md:text-[15px] uppercase mb-1 leading-tight">${p.university[lang]}</span><a href="#" class="text-fjGold text-[12px] hover:underline">${t.viewUni}</a></div></div><div class="grid grid-cols-2 gap-4 md:contents order-2 md:order-none"><div class="md:col-span-3 flex flex-col justify-center order-1"><h3 class="font-bold text-slate-800 text-[16px] md:text-[15px] leading-snug mb-1">${p.name[lang]}</h3><p class="text-slate-500 text-[13px] md:text-sm mb-2">${p.language[lang]}</p><div><span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${statusColor}">${p.status[lang]}</span></div></div><div class="md:col-span-3 flex flex-col justify-center space-y-2 order-2 md:order-3"><div class="text-[13px] md:text-sm"><span class="font-bold text-slate-700">${t.lblFaculty}</span> <span class="text-slate-600 block sm:inline">${p.faculty[lang]}</span></div><div class="text-[13px] md:text-sm"><span class="font-bold text-slate-700">${t.lblDegree}</span> <span class="text-slate-600">${p.degree[lang]}</span></div><div class="text-[13px] md:text-sm flex flex-col items-start mt-1">${priceHtml}</div></div></div><div class="md:col-span-3 flex flex-col justify-center order-3 md:order-4 border-t border-slate-100 md:border-none pt-4 md:pt-0 mt-4 md:mt-0"><div class="font-bold text-slate-800 text-sm mb-1">${p.city[lang]}, ${p.country[lang]}</div><div class="text-slate-600 text-xs mb-1">${p.campus[lang]}</div><a href="${mapLink}" target="_blank" class="text-slate-500 text-[11px] md:text-xs hover:text-fjNavy hover:underline whitespace-normal break-words leading-relaxed" title="View on Google Maps">${p.address}</a></div>`;
        list.appendChild(row);
    });

    renderPaginationFooter(totalItems, startIdx, Math.min(endIdx, totalItems)); lucide.createIcons();
}

function renderPaginationFooter(totalItems, start, end) {
    const t = TRANSLATIONS[APP_STATE.lang]; const totalPages = Math.ceil(totalItems / APP_STATE.itemsPerPage);
    let footer = document.getElementById('pagination-footer');
    if (!footer) { footer = document.createElement('div'); footer.id = 'pagination-footer'; footer.className = 'px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4'; document.getElementById('programs-list').parentElement.appendChild(footer); }
    if (totalItems === 0) { footer.innerHTML = ''; return; }
    const prevDisabled = APP_STATE.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200'; const nextDisabled = APP_STATE.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200';

    footer.innerHTML = `<div class="flex flex-col sm:flex-row items-center gap-4 w-full justify-between"><div class="flex items-center gap-2 text-sm text-slate-600"><span>${t.showing}</span> <span class="font-bold text-slate-900">${start + 1}</span><span>${t.to}</span> <span class="font-bold text-slate-900">${end}</span><span>${t.of}</span> <span class="font-bold text-slate-900">${totalItems}</span></div><div class="flex items-center gap-4"><div class="flex items-center gap-2"><span class="text-sm text-slate-600 hidden sm:inline">${t.jumpTo}</span><input type="number" id="jump-page-input" min="1" max="${totalPages}" class="border border-slate-300 rounded px-2 py-1 text-sm bg-white outline-none focus:border-fjGold w-16 text-center" placeholder="#"><button onclick="jumpToPage()" class="bg-fjNavy hover:bg-fjGold text-fjGold hover:text-fjNavy px-3 py-1 rounded text-sm transition-colors">${t.go}</button></div><div class="h-4 w-px bg-slate-300 hidden sm:block"></div><div class="flex items-center gap-2"><span class="text-sm text-slate-600 hidden sm:inline">${t.perPage}</span><select id="items-per-page" class="border border-slate-300 rounded px-2 py-1 text-sm bg-white outline-none focus:border-fjGold"><option value="10" ${APP_STATE.itemsPerPage == 10 ? 'selected' : ''}>10</option><option value="20" ${APP_STATE.itemsPerPage == 20 ? 'selected' : ''}>20</option><option value="50" ${APP_STATE.itemsPerPage == 50 ? 'selected' : ''}>50</option><option value="100" ${APP_STATE.itemsPerPage == 100 ? 'selected' : ''}>100</option></select></div><div class="flex gap-2"><button onclick="changePage(-1)" class="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 transition-colors ${prevDisabled}" ${APP_STATE.currentPage === 1 ? 'disabled' : ''}><i data-lucide="chevron-left" width="16"></i></button><div class="flex items-center justify-center px-3 py-1 bg-white border border-slate-300 rounded-lg text-sm font-medium">${APP_STATE.currentPage} / ${totalPages}</div><button onclick="changePage(1)" class="p-2 bg-white border border-slate-300 rounded-lg text-slate-600 transition-colors ${nextDisabled}" ${APP_STATE.currentPage === totalPages ? 'disabled' : ''}><i data-lucide="chevron-right" width="16"></i></button></div></div></div>`;

    document.getElementById('items-per-page').addEventListener('change', (e) => { APP_STATE.itemsPerPage = parseInt(e.target.value); APP_STATE.currentPage = 1; renderPrograms(); });
    const jumpInput = document.getElementById('jump-page-input'); if(jumpInput) { jumpInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') jumpToPage(); }); }
}

function changePage(delta) { APP_STATE.currentPage += delta; renderPrograms(); }
function jumpToPage() {
    const input = document.getElementById('jump-page-input'); const pageNum = parseInt(input.value); const filtered = getFilteredData(); const totalPages = Math.ceil(filtered.length / APP_STATE.itemsPerPage);
    if (pageNum >= 1 && pageNum <= totalPages) { APP_STATE.currentPage = pageNum; renderPrograms(); } else { alert(APP_STATE.lang === 'en' ? `Please enter a valid page number (1-${totalPages})` : `الرجاء إدخال رقم صفحة صحيح (1-${totalPages})`); }
}