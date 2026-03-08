// 5. ملف main.js (تهيئة النظام والأحداث)
(function setFavicon() {
    document.querySelectorAll("link[rel*='icon']").forEach(el => el.remove());
    let favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.type = 'image/png';
    favicon.href = './assets/logo.png?v=' + new Date().getTime();
    document.head.appendChild(favicon);
})();

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    fetchData();
    
    document.getElementById('search-input').addEventListener('input', (e) => {
        APP_STATE.searchTerm = e.target.value.toLowerCase();
        APP_STATE.currentPage = 1;
        updateAllDropdowns(); 
        renderPrograms();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.custom-multiselect') && APP_STATE.openDropdown) {
            closeDropdown(APP_STATE.openDropdown);
        }
    });

    const downloadBtn = document.querySelector('[data-action="download"]');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPDF);
        
        const printBtn = document.createElement('button');
        printBtn.className = 'flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-fjNavy hover:text-fjGold hover:border-fjNavy transition-all shadow-sm';
        printBtn.innerHTML = `<i data-lucide="printer" width="16"></i> <span data-i18n="print">${TRANSLATIONS[APP_STATE.lang].print}</span>`;
        printBtn.onclick = executePrint;
        downloadBtn.parentNode.insertBefore(printBtn, downloadBtn);
        lucide.createIcons({root: printBtn}); 
    }
});
