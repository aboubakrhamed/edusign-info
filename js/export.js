// 4. ملف export.js (الطباعة وتصدير الـ PDF)

// دالة الطباعة (Print)
function executePrint() {
    const filteredData = getFilteredData(); if (filteredData.length === 0) return;
    const lang = APP_STATE.lang; const t = TRANSLATIONS[lang]; const dir = t.dir;
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);

    const rowsHtml = filteredData.map(p => {
        const isClosed = p.status.en.toUpperCase().includes('CLOSED') || p.status.ar.includes('مغلق');
        const statusColor = isClosed ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200';
        const logoUrl = getUniversityLogo(p.university.en);
        const logoHtml = logoUrl ? `<img src="${logoUrl}" class="w-[60px] h-[60px] object-contain p-1 rounded-full border border-slate-200 bg-white shrink-0 shadow-sm">` : `<div class="w-[60px] h-[60px] rounded-full border border-slate-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-sm"><i data-lucide="building-2" class="text-slate-400"></i></div>`;

        let priceHtml = `<div class="flex items-start gap-1"><span class="font-bold text-slate-700 whitespace-nowrap">${t.lblPrice}</span><div class="flex flex-col items-start gap-0.5"><div class="flex items-center gap-1">${(p.originalPrice && p.originalPrice !== p.price && !p.originalPrice.includes('+') && p.originalPrice !== "0") ? `<span class="line-through text-slate-400 text-xs">$${p.originalPrice}</span>` : ''}<span class="text-red-600 font-bold text-[15px] leading-none">$${p.price}</span></div>${p.trainingPrice ? `<div class="flex items-center gap-1 mt-0.5"><span class="text-amber-600 font-bold leading-none">+ €${p.trainingPrice}</span><span class="text-[11px] text-amber-600/80 leading-none">(Flight)</span></div>` : ''}</div></div>`;
        if (p.cashPrice && p.cashPrice !== "0" && p.cashPrice !== "" && p.cashPrice.trim() !== p.price.trim()) {
            priceHtml += `<div class="mt-1.5 mb-0.5"><span class="font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200 inline-flex items-center gap-1 text-[11px]"><i data-lucide="banknote" width="12"></i> ${t.lblCash} $${p.cashPrice}</span></div>`;
        }

        // التعديل هنا: المدينة الأول وبعدين الدولة
        return `<div class="grid grid-cols-12 gap-4 py-5 px-5 border-b border-slate-200" style="page-break-inside: avoid;"><div class="col-span-3 flex items-center gap-3">${logoHtml}<span class="text-fjNavy font-extrabold text-[15px] uppercase leading-tight">${p.university[lang]}</span></div><div class="col-span-4 flex flex-col justify-center"><h3 class="font-bold text-slate-800 text-[15px] leading-snug mb-1">${p.name[lang]}</h3><p class="text-slate-500 text-[13px] mb-2">${p.language[lang]}</p><div><span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${statusColor}">${p.status[lang]}</span></div></div><div class="col-span-3 flex flex-col justify-center space-y-2"><div class="text-[13px]"><span class="font-bold text-slate-700">${t.lblFaculty}</span> <span class="text-slate-600 block inline">${p.faculty[lang]}</span></div><div class="text-[13px]"><span class="font-bold text-slate-700">${t.lblDegree}</span> <span class="text-slate-600">${p.degree[lang]}</span></div><div class="text-[13px] flex flex-col items-start mt-1">${priceHtml}</div></div><div class="col-span-2 flex flex-col justify-center"><div class="font-bold text-slate-800 text-sm mb-1">${p.city[lang]}, ${p.country[lang]}</div><div class="text-slate-600 text-xs mb-1">${p.campus[lang]}</div></div></div>`;
    }).join('');

    const printContent = `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="UTF-8"><base href="${baseUrl}"><title>${t.appTitle} - Print View</title><script src="https://cdn.tailwindcss.com"></script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"><script src="https://unpkg.com/lucide@latest"></script><script>tailwind.config = {theme: {extend: {colors: { fjGold: '#C5A059', fjNavy: '#0B1120' },fontFamily: { sans: ['Inter', 'Cairo', 'sans-serif'] }}}}</script><style>body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #fff; } @media print { @page { margin: 15mm; } .no-print { display: none !important; } }</style></head><body class="font-sans text-slate-800 p-8"><div class="bg-fjNavy p-6 rounded-xl mb-6 flex items-center justify-between"><div class="flex items-center gap-3"><div class="border border-slate-200 rounded-xl overflow-hidden shadow-sm"><div class="grid grid-cols-12 bg-slate-100 border-b border-slate-200 py-3 px-5 text-xs font-bold text-slate-600 uppercase tracking-wider"><div class="col-span-3">${t.colUniversity}</div><div class="col-span-4">${t.colProgram}</div><div class="col-span-3">${t.colInfo}</div><div class="col-span-2">${t.colAddress}</div></div><div class="divide-y divide-slate-100 bg-white">${rowsHtml}</div></div><script>setTimeout(() => { lucide.createIcons(); setTimeout(() => { window.print(); }, 800); }, 500);</script></body></html>`;
    const printWindow = window.open('', '_blank'); printWindow.document.open(); printWindow.document.write(printContent); printWindow.document.close();
}

// --- دالة تحميل الـ PDF باستخدام jspdf-autotable ---
async function downloadPDF() {
    const spinner = document.getElementById('loading-spinner');
    if(spinner) spinner.classList.remove('hidden');

    try {
        if (typeof window.jspdf === 'undefined') {
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
        }
        window.jsPDF = window.jspdf.jsPDF;
        
        if (typeof window.jsPDF.API.autoTable === 'undefined') {
            await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
        }

        const doc = new window.jsPDF({ orientation: 'landscape' }); 
        const filteredData = getFilteredData();
        const lang = APP_STATE.lang;
        
        const mainColor = [38, 42, 92];
        const secColor = [209, 54, 52];

        // 1. سحب لوجوهات الجامعات
        const uniLogoMap = new Map();
        const uniqueUniNames = [...new Set(filteredData.map(p => p?.university?.en).filter(Boolean))];
        await Promise.all(uniqueUniNames.map(async (uniName) => {
            const url = getUniversityLogo(uniName);
            if (url) {
                const base64 = await getBase64FromUrl(url);
                if (base64) uniLogoMap.set(uniName, base64);
            }
        }));

        const headers = [
            ['', 'Program', 'University', 'Faculty', 'Degree', 'Language', 'Price', 'Location']
        ];

        const body = filteredData.map(p => {
            let priceStr = p.trainingPrice ? `$${p.price} + €${p.trainingPrice}` : `$${p.price}`;
            if (p.cashPrice && p.cashPrice !== "0" && p.cashPrice !== "" && p.cashPrice.trim() !== p.price.trim()) {
                priceStr += `\nCash:\xA0$${p.cashPrice}`;
            }
            return [
                '', 
                p?.name?.[lang] || '', 
                p?.university?.[lang] || '',
                p?.faculty?.[lang] || '',
                p?.degree?.[lang] || '',
                p?.language?.[lang] || '',
                priceStr || '',
                // التعديل هنا: المدينة الأول وبعدين الدولة
                `${p?.city?.[lang] || ''}, ${p?.country?.[lang] || ''}`
            ];
        });

        doc.autoTable({
            head: headers,
            body: body,
            startY: 45,
            margin: { top: 15, bottom: 20 }, // التوب قليل عشان باقي الصفحات تبدأ من فوق
            rowPageBreak: 'avoid',
            styles: { fontSize: 8, valign: 'middle', font: 'helvetica' },
            headStyles: { fillColor: mainColor, textColor: secColor, fontStyle: 'bold', halign: 'left' },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' }, 
                6: { cellWidth: 'wrap' } 
            },
            didDrawPage: (data) => {
                // البار الكحلي يظهر في الصفحة الأولى بس
                if (data.pageNumber === 1) {
                    doc.setFillColor(...mainColor);
                    doc.rect(0, 0, 297, 40, 'F'); 
                    
                    let textStartX = 14;

                    doc.setTextColor(...secColor);
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(24);
                    doc.text("Edusign", textStartX, 23);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.text("", textStartX, 30);
                }
            },
            didDrawCell: (data) => {
                if (data.section === 'body' && data.column.index === 0) {
                    const rowData = filteredData[data.row.index];
                    const uniName = rowData?.university?.en;
                    if (!uniName) return;

                    const logoData = uniLogoMap.get(uniName);
                    if (logoData) {
                        const padding = 2;
                        const dim = data.cell.height - (padding * 2);
                        if (dim > 0) {
                            const x = data.cell.x + (data.cell.width / 2) - (dim / 2);
                            const y = data.cell.y + padding;
                            doc.addImage(logoData, 'PNG', x, y, dim, dim);
                        }
                    }
                }
            }
        });

        doc.save("Edusign_Programs.pdf");

    } catch (e) {
        console.error("PDF Generation Error", e);
        alert(`Error generating PDF:\n${e.message || e}`);
    } finally {
        if(spinner) spinner.classList.add('hidden');
    }
}

// دالة سحب الصور + تلوين أيقونة الـ SVG
function getBase64FromUrl(url, colorize = null) {
    return new Promise((resolve) => {
        if (!url || url.trim() === "") return resolve(null);
        const img = new Image();
        img.crossOrigin = "Anonymous"; // عشان يسحب من اللينكات الخارجية بدون مشاكل CORS
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = img.width || 100;
                canvas.height = img.height || 100;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // لو بعتنا لون (زي الدهبي للقبعة)، بيلون الصورة كلها بيه
                if (colorize) {
                    ctx.globalCompositeOperation = "source-in";
                    ctx.fillStyle = colorize;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                
                resolve(canvas.toDataURL("image/png"));
            } catch (e) {
                resolve(null); 
            }
        };
        img.onerror = () => resolve(null);
        img.src = url;
    });
}

function loadScript(url) {
    return new Promise((resolve, reject) => {
        let script = document.querySelector(`script[src="${url}"]`);
        if (script) {
            if (script.getAttribute('data-loaded') === 'true') return resolve();
            script.addEventListener('load', resolve);
            script.addEventListener('error', reject);
            return;
        }
        script = document.createElement('script');
        script.src = url;
        const timeout = setTimeout(() => reject(new Error("Script load timeout")), 10000);
        script.onload = () => {
            clearTimeout(timeout);
            script.setAttribute('data-loaded', 'true');
            resolve();
        };
        script.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed to load script"));
        };
        document.head.appendChild(script);
    });
}