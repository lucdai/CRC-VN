        // Hàm tạo chuỗi ngẫu nhiên 21 ký tự đa ngôn ngữ
        function generateRandomFilename() {
            const chars = 
                '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' + // Latin/Digits
                'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя' + // Cyrillic (Nga)
                'अआइईउऊऋएऐओऔकखगघङचछजझञटठडढणतथदधनपफबभमयरलवशषसह' + // Devanagari (Phạn Ngữ)
                'IVXLCDM' + // Roman Numerals (La Mã)
                'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω' + // Greek (Hy Lạp)
                '가나다라마바사아자차카타파하' + // Hangul (Hàn Quốc)
                '你好世界人中大上下左右' + // Hanzi (Trung Quốc)
                'あいうえおかきくけこサシスセソ' + // Japanese (Hiragana/Katakana)
                'ÁÀẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴáàảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ' + // Vietnamese
                '+−×÷=≠≈≤≥√∑∫∂∞π€$£%^&*()_+-=[]{};\':"\\|,./<>?!@#'; // Mathematical/Special Symbols
            
            let result = '';
            for (let i = 0; i < 21; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }
    </script>
    <script>
        // --- State ---
        let mode = 'raw', currentTab = 'data';
        let datasets = [{ id: 1, name: "Mẫu A", dataStr: "45, 52, 60, 48, 55, 62, 49, 58, 65, 51" }];
        let manualRows = [{ id: 1, lower: 40, upper: 50, freqs: {} }, { id: 2, lower: 50, upper: 60, freqs: {} }, { id: 3, lower: 60, upper: 70, freqs: {} }];
        const colors = [
            { bg: 'rgba(59, 130, 246, 0.5)', border: '#2563eb' }, { bg: 'rgba(239, 68, 68, 0.5)', border: '#dc2626' },
            { bg: 'rgba(16, 185, 129, 0.5)', border: '#059669' }, { bg: 'rgba(245, 158, 11, 0.5)', border: '#d97706' },
            { bg: 'rgba(139, 92, 246, 0.5)', border: '#7c3aed' }
        ];
        
        // --- Tabs & Mode ---
        function switchTab(t) {
            currentTab = t;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(t==='data'?'tabDataBtn':'tabChartsBtn').classList.add('active');
            document.getElementById('tabDataContent').classList.toggle('hidden', t!=='data');
            document.getElementById('tabChartsContent').classList.toggle('hidden', t!=='charts');
            if(t==='charts') calculate();
        }
        function switchInputMode(m) {
            mode = m;
            document.getElementById('btnRaw').className = mode==='raw' ? "flex-1 py-2 text-sm font-medium rounded bg-indigo-50 text-indigo-700" : "flex-1 py-2 text-sm font-medium rounded text-slate-500 hover:bg-slate-50";
            document.getElementById('btnTable').className = mode==='table' ? "flex-1 py-2 text-sm font-medium rounded bg-indigo-50 text-indigo-700" : "flex-1 py-2 text-sm font-medium rounded text-slate-500 hover:bg-slate-50";
            document.getElementById('rawSection').classList.toggle('hidden', mode!=='raw');
            document.getElementById('tableSection').classList.toggle('hidden', mode!=='table');
            calculate();
        }

        // --- Dataset Ops ---
        function addDataset() {
            const newId = (datasets.length>0 ? Math.max(...datasets.map(d=>d.id)):0)+1;
            datasets.push({id:newId, name:`Mẫu ${String.fromCharCode(65+datasets.length)}`, dataStr:""});
            renderInputs(); calculate();
        }
        function removeLastDataset() { if(datasets.length<=1)return; datasets.pop(); renderInputs(); calculate(); }
        function updateRaw(id, val) { datasets.find(d=>d.id===id).dataStr=val; calculate(); }
        function updateName(id, val) { datasets.find(d=>d.id===id).name=val; renderInputs(); calculate(); }
        function renderInputs() {
            document.getElementById('datasetContainer').innerHTML = datasets.map(ds=>`
                <div class="bg-white border rounded p-2"><div class="flex justify-between mb-1">
                <input value="${ds.name}" onchange="updateName(${ds.id}, this.value)" class="text-xs font-bold w-20 border-b outline-none focus:border-indigo-500"></div>
                <textarea oninput="updateRaw(${ds.id}, this.value)" class="w-full h-12 text-[10px] font-mono border rounded p-1 resize-none">${ds.dataStr}</textarea></div>`).join('');
            const h = document.getElementById('manualHeaderRow');
            h.innerHTML = `<th class="p-2 w-12">Dưới</th><th class="p-2 w-12">Trên</th>` + datasets.map(d=>`<th class="p-2 text-center text-indigo-700">${d.name}</th>`).join('') + `<th class="w-6"></th>`;
            renderManualBody();
            updatePieSelect();
        }
        function updatePieSelect() {
            const sel = document.getElementById('pieDatasetSelect');
            sel.innerHTML = datasets.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
        }

        // --- Manual Table ---
        function renderManualBody() {
            document.getElementById('manualBody').innerHTML = manualRows.map(r=>`
                <tr class="border-b hover:bg-slate-50"><td class="p-1"><input type="number" value="${r.lower}" onchange="updRow(${r.id},'lower',this.value)" class="w-full p-1 border rounded text-center input-cell"></td>
                <td class="p-1"><input type="number" value="${r.upper}" onchange="updRow(${r.id},'upper',this.value)" class="w-full p-1 border rounded text-center input-cell"></td>
                ${datasets.map(ds=>`<td class="p-1"><input type="number" value="${r.freqs[ds.id]||0}" min="0" onchange="updRow(${r.id},'freq_${ds.id}',this.value)" class="w-full p-1 border rounded text-center font-bold text-indigo-600 input-cell"></td>`).join('')}
                <td class="p-1"><button onclick="delRow(${r.id})" class="text-red-300 hover:text-red-500">x</button></td></tr>`).join('');
        }
        function addManualRow() {
            const last = manualRows[manualRows.length-1];
            let l = last?last.upper:0, w = last?(last.upper-last.lower)||10:10;
            manualRows.push({id:Date.now(), lower:l, upper:l+w, freqs:{}}); renderManualBody(); calculate();
        }
        function delRow(id) { if(manualRows.length>1) { manualRows=manualRows.filter(r=>r.id!==id); renderManualBody(); calculate(); } }
        function updRow(id, f, val) {
            const r = manualRows.find(x=>x.id===id); if(!r)return;
            if(f.startsWith('freq')) r.freqs[parseInt(f.split('_')[1])] = parseInt(val)||0;
            else { 
                r[f]=parseFloat(val); 
                if(manualRows.indexOf(r)===0 && (f==='lower'||f==='upper')) {
                   const w = manualRows[0].upper - manualRows[0].lower;
                   if(w>0) { for(let i=1;i<manualRows.length;i++){ manualRows[i].lower=manualRows[i-1].upper; manualRows[i].upper=manualRows[i].lower+w;} renderManualBody(); } 
                }
            }
            calculate();
        }

        // --- Core Calc ---
        let lastGroups = [], lastResults = [];

        function calculate() {
            let groups = [], results = [];
            const resultsSection = document.getElementById('resultsSection');
            const emptyState = document.getElementById('emptyState');
            const chartsWrapper = document.getElementById('chartsWrapper');
            const emptyChartsState = document.getElementById('emptyChartsState');

            if(mode==='raw') {
                const pDS = datasets.map(d => ({...d, data: d.dataStr.split(/[\s,;]+/).map(x=>parseFloat(x)).filter(n=>!isNaN(n)).sort((a,b)=>a-b)})).filter(d=>d.data.length>0);
                if(pDS.length===0) { 
                    resultsSection.classList.add('hidden'); emptyState.classList.remove('hidden'); 
                    chartsWrapper.classList.add('hidden'); emptyChartsState.classList.remove('hidden');
                    return;
                }
                const all = pDS.flatMap(d=>d.data), min=Math.min(...all), max=Math.max(...all);
                const meth = document.getElementById('method').value, uStart=document.getElementById('startValue').value;
                let start=uStart!==""?parseFloat(uStart):min, k=5, h=10;
                
                if(meth==='auto'){ k=Math.ceil(1+3.322*Math.log10(all.length)); h=Math.ceil((max-start)/k)||1; }
                else if(meth==='manual_width'){ h=parseFloat(document.getElementById('manualH').value)||5; k=Math.ceil((max-start)/h); if(start+k*h<=max)k++;}
                else { k=parseInt(document.getElementById('manualK').value)||5; h=(max-start)/k; }

                for(let i=0;i<k;i++) groups.push({id:i+1, lower:start+i*h, upper:start+(i+1)*h, midpoint:start+i*h+h/2});
                results = pDS.map((ds,i)=> processStats(ds.name, groups, colors[i%colors.length], ds.data, null));
            } else {
                groups = manualRows.map((r,i)=>({id:i+1, lower:r.lower, upper:r.upper, midpoint:(r.lower+r.upper)/2}));
                results = datasets.map((ds,i)=> processStats(ds.name, groups, colors[i%colors.length], null, ds.id));
            }
            
            const hasData = results.some(r => r.s.N > 0);
            if(hasData) {
                resultsSection.classList.remove('hidden'); emptyState.classList.add('hidden');
                chartsWrapper.classList.remove('hidden'); emptyChartsState.classList.add('hidden');
                lastGroups = groups; lastResults = results;
                renderTables(groups, results);
                if(currentTab==='charts') updateAllCharts(groups, results);
            } else {
                resultsSection.classList.add('hidden'); emptyState.classList.remove('hidden');
                chartsWrapper.classList.add('hidden'); emptyChartsState.classList.remove('hidden');
            }
        }

        function processStats(name, groups, color, rawData, dsId) {
            let cf=0;
            const gStats = groups.map((g, idx) => {
                let freq = 0;
                if(rawData) freq = (idx===groups.length-1) ? rawData.filter(x=>x>=g.lower && x<=g.upper+0.0001).length : rawData.filter(x=>x>=g.lower && x<g.upper).length;
                else freq = manualRows[idx].freqs[dsId] || 0;
                cf += freq;
                return {...g, freq, cf};
            });
            const N = cf;
            if(N===0) return {name, color, gStats, rawData: rawData||[], s:{N:0}};
            
            const mean = gStats.reduce((s,g)=>s+g.freq*g.midpoint,0)/N;
            const variance = gStats.reduce((s,g)=>s+g.freq*Math.pow(g.midpoint-mean,2),0)/N;
            const sd = Math.sqrt(variance);
            const cv = mean!==0 ? (sd/Math.abs(mean))*100 : 0;
            
            let trueMean=null, absErr=null, relErr=null, outliers=[], range=0;
            if(rawData) {
                trueMean = rawData.reduce((a,b)=>a+b,0)/N; absErr = Math.abs(trueMean-mean); relErr = trueMean!==0 ? (absErr/Math.abs(trueMean))*100 : 0;
                range = rawData[rawData.length-1] - rawData[0];
            } else {
                const ag = gStats.filter(g=>g.freq>0);
                if(ag.length) range = ag[ag.length-1].upper - ag[0].lower;
            }

            const getQ = (t) => {
                const g = gStats.find(x=>x.cf>=t);
                if(!g) return {val:gStats[gStats.length-1].upper, grp:'>Max'};
                const prev = gStats[g.id-2]?gStats[g.id-2].cf:0;
                return {val: g.lower + ((t-prev)/g.freq)*(g.upper-g.lower), grp:`[${fmt(g.lower)};${fmt(g.upper)})`};
            };
            const q1 = getQ(N/4), q2=getQ(N/2), q3=getQ(3*N/4);
            const iqr = q3.val - q1.val;

            let maxF=-1, mG=null; gStats.forEach(g=>{if(g.freq>maxF){maxF=g.freq; mG=g;}});
            let mode = 0;
            if(mG) {
                const i=gStats.indexOf(mG), p=(i>0?gStats[i-1].freq:0), n=(i<gStats.length-1?gStats[i+1].freq:0);
                mode = mG.lower + ((mG.freq-p)/((mG.freq-p)+(mG.freq-n)))*(mG.upper-mG.lower);
            }

            if(rawData) {
                const lf=q1.val-1.5*iqr, uf=q3.val+1.5*iqr;
                outliers=rawData.filter(x=>x<lf||x>uf);
            }

            return { name, color, gStats, rawData: rawData || generateSimulatedData(gStats), s: {
                N, mean, trueMean, absErr, relErr, variance, sd, cv, range,
                q1:q1.val, q2:q2.val, q3:q3.val, iqr, mode, q1Loc:q1.grp, q2Loc:q2.grp, q3Loc:q3.grp,
                outliers, disp: cv<10?"Thấp":cv<30?"TB":"Cao"
            }};
        }

        function generateSimulatedData(gStats) {
            let data = [];
            gStats.forEach(g => {
                for(let i=0; i<g.freq; i++) {
                    const jitter = (Math.random() - 0.5) * (g.upper - g.lower) * 0.8;
                    data.push(g.midpoint + jitter);
                }
            });
            return data.sort((a,b)=>a-b);
        }

        function renderTables(groups, results) {
            const m = [
                {id:'N', l:'Tổng số (N)'}, {id:'trueMean', l:'Số đúng (x̄ gốc)', raw:1}, {id:'mean', l:'Số gần đúng (x̄ nhóm)'},
                {id:'absErr', l:'Sai số tuyệt đối', raw:1}, {id:'relErr', l:'Sai số tương đối (%)', raw:1},
                {id:'q2', l:'Trung vị (Me)'}, {id:'q1', l:'Q1'}, {id:'q3', l:'Q3'}, {id:'mode', l:'Mốt (Mo)'},
                {id:'range', l:'Khoảng biến thiên (R)'}, {id:'iqr', l:'IQR'}, {id:'variance', l:'Phương sai (s²)'},
                {id:'sd', l:'Độ lệch chuẩn (s)'}, {id:'cv', l:'CV (%)'}, {id:'disp', l:'Mức độ phân tán', txt:1},
                {id:'outliers', l:'Ngoại lai (sl)', raw:1, len:1},
                {id:'q1Loc', l:'Vị trí Q1', txt:1}, {id:'q2Loc', l:'Vị trí Me', txt:1}, {id:'q3Loc', l:'Vị trí Q3', txt:1}
            ];
            let h = `<thead><tr class="bg-indigo-50 border-b"><th class="px-4 py-2">Chỉ số</th>`+results.map(r=>`<th class="px-4 py-2 text-center" style="color:${r.color.border}">${r.name}</th>`).join('')+`</tr></thead><tbody>`;
            m.forEach(x => {
                h += `<tr class="border-b last:border-0 hover:bg-slate-50"><td class="px-4 py-2 font-medium text-slate-600">${x.l}</td>` + results.map(r=>{
                    let v = r.s[x.id];
                    if(x.raw && mode==='table') return `<td class="text-center text-slate-300 italic">N/A</td>`;
                    if(v===undefined) return `<td>-</td>`;
                    if(x.len) return `<td class="text-center font-bold text-red-600">${v.length}</td>`;
                    if(x.txt) return `<td class="text-center text-slate-700">${v}</td>`;
                    return `<td class="text-center font-bold text-slate-700">${fmt(v)}</td>`;
                }).join('') + `</tr>`;
            });
            document.getElementById('statsTable').innerHTML = h+`</tbody>`;

            let fh = `<thead><tr class="bg-indigo-50 border-b"><th class="px-4 py-2">Nhóm</th><th class="px-4 py-2 text-center">c_i</th>`+results.map(r=>`<th class="px-4 py-2 text-center" style="color:${r.color.border}">f (${r.name})</th>`).join('')+`</tr></thead><tbody>`;
            groups.forEach((g,i)=>{
                fh += `<tr class="border-b hover:bg-slate-50"><td class="px-4 py-2 text-slate-800">[${fmt(g.lower)}; ${fmt(g.upper)})</td><td class="px-4 py-2 text-center text-slate-500">${fmt(g.midpoint)}</td>`+results.map(r=>`<td class="px-4 py-2 text-center font-bold">${r.gStats[i].freq}</td>`).join('')+`</tr>`;
            });
            document.getElementById('freqTable').innerHTML = fh+`</tbody>`;
        }

        let charts = {};
        function updateAllCharts(groups, results) {
            const l = groups.map(g=>`[${fmt(g.lower)}; ${fmt(g.upper)})`);
            const ol = [fmt(groups[0].lower), ...groups.map(g=>fmt(g.upper))]; 
            const ds = (fn, type, fill) => results.map(r=>({
                label: r.name, data: fn(r), backgroundColor: r.color.bg, borderColor: r.color.border, 
                borderWidth: 1.5, tension: 0.3, fill: fill
            }));

            draw('chartHistogram', 'bar', l, ds(r=>r.gStats.map(g=>g.freq), 'bar', false), {scales:{x:{stacked:false},y:{beginAtZero:true}}});
            draw('chartPolygon', 'line', groups.map(g=>fmt(g.midpoint)), ds(r=>r.gStats.map(g=>g.freq), 'line', false), {elements:{line:{tension:0}}});
            draw('chartStacked', 'bar', l, ds(r=>r.gStats.map(g=>g.freq), 'bar', false), {scales:{x:{stacked:true},y:{stacked:true}}});
            draw('chartRelFreq', 'bar', l, ds(r=>r.gStats.map(g=>(g.freq/r.s.N)*100), 'bar', false), {scales:{y:{beginAtZero:true, title:{display:true,text:'%'}}}});
            draw('chartArea', 'line', l, ds(r=>r.gStats.map(g=>g.freq), 'line', true), {scales:{y:{stacked:true, beginAtZero:true}}, elements:{line:{tension:0.4}}});
            draw('chartOgive', 'line', ol, ds(r=>[0, ...r.gStats.map(g=>g.cf)], 'line', false), {elements:{line:{tension:0.2}}});
            updatePieChart();

            const boxData = results.map(r => ({ label: r.name, backgroundColor: r.color.bg, borderColor: r.color.border, borderWidth: 1, outlierColor: '#ef4444', padding: 10, itemRadius: 0, data: [r.rawData] }));
            draw('chartBox', 'boxplot', ['Phân bố'], boxData, {});

            const violinData = results.map(r => ({ label: r.name, backgroundColor: r.color.bg, borderColor: r.color.border, borderWidth: 1, data: [r.rawData] }));
            draw('chartViolin', 'violin', ['Mật độ'], violinData, {});

            const scatterData = results.map(r => ({ label: r.name, backgroundColor: r.color.border, data: r.rawData.map((val, idx) => ({ x: val, y: Math.random() * 0.5 + results.indexOf(r) })) }));
            draw('chartScatter', 'scatter', null, scatterData, { scales: { x: { type: 'linear', position: 'bottom', title: {display:true, text:'Giá trị'} }, y: { display: false } } });
        }

        function updatePieChart() {
            const dsId = parseInt(document.getElementById('pieDatasetSelect').value) || (datasets[0]?datasets[0].id:0);
            const dataset = datasets.find(d => d.id === dsId);
            if(!dataset || !lastGroups.length) return;
            let gStats = [];
            if(mode==='raw') {
                const data = dataset.dataStr.split(/[\s,;]+/).map(x=>parseFloat(x)).filter(n=>!isNaN(n));
                gStats = lastGroups.map(g => ({...g, freq: data.filter(x=>x>=g.lower && x<g.upper).length}));
            } else {
                gStats = lastGroups.map((g,i) => ({...g, freq: manualRows[i].freqs[dsId]||0}));
            }
            const data = { labels: lastGroups.map(g => `[${fmt(g.lower)}; ${fmt(g.upper)})`), datasets: [{ data: gStats.map(g => g.freq), backgroundColor: ['#60a5fa','#f87171','#34d399','#fbbf24','#a78bfa','#f472b6','#9ca3af'] }] };
            draw('chartPie', 'doughnut', data.labels, data.datasets, {});
        }

        function draw(id, type, l, d, opt) {
            const ctx = document.getElementById(id).getContext('2d');
            if(charts[id]) charts[id].destroy();
            charts[id] = new Chart(ctx, {type, data:{labels:l, datasets:d}, options:{responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'bottom'}}, ...opt}});
        }

        // --- Download Functions ---
        function downloadTableImage(tableId, baseName, format) {
            const element = document.getElementById(tableId);
            const randomId = generateRandomFilename();
            const fileName = `${randomId}.${format}`;

            html2canvas(element, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
                const link = document.createElement('a');
                link.href = canvas.toDataURL(`image/${format}`);
                link.download = fileName;
                link.click();
            });
        }

        function downloadChartImage(chartId, baseName, format) {
            const chart = charts[chartId];
            if (!chart) {
                alert('Biểu đồ chưa được tạo. Vui lòng nhập dữ liệu.');
                return;
            }
            
            const randomId = generateRandomFilename();
            const fileName = `${randomId}.${format}`;

            const canvas = chart.canvas;
            const link = document.createElement('a');
            link.href = chart.toBase64Image(`image/${format}`); // Sử dụng hàm của Chart.js để lấy base64 image
            link.download = fileName;
            link.click();
        }

        function fmt(n) { const d=parseInt(document.getElementById('decimalPlaces').value)||2; return (n===undefined||n===null)?"-":new Intl.NumberFormat('vi-VN',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n); }
        function toggleInputs() { const m=document.getElementById('method').value; document.getElementById('inputH').classList.toggle('hidden', m!=='manual_width'); document.getElementById('inputK').classList.toggle('hidden', m!=='manual_count'); }
        function copyTable() { 
            const el = document.getElementById('freqTable'); let range, sel;
            if (document.createRange && window.getSelection) { range = document.createRange(); sel = window.getSelection(); sel.removeAllRanges(); try { range.selectNodeContents(el); sel.addRange(range); } catch (e) { range.selectNode(el); sel.addRange(range); } document.execCommand("copy"); sel.removeAllRanges(); alert("Đã sao chép!"); }
        }

        // --- Sharing Feature ---
        function shareLink() {
            const state = {
                m: mode,
                ds: datasets.map(d => ({ n: d.name, s: d.dataStr })),
                mr: manualRows.map(r => ({ l: r.lower, u: r.upper, f: r.freqs })),
                dp: document.getElementById('decimalPlaces').value,
                meth: document.getElementById('method').value,
                h: document.getElementById('manualH').value,
                k: document.getElementById('manualK').value,
                sv: document.getElementById('startValue').value
            };
            const json = JSON.stringify(state);
            const base64 = btoa(unescape(encodeURIComponent(json)));
            const url = new URL(window.location.href);
            url.searchParams.set('share', base64);
            
            navigator.clipboard.writeText(url.toString()).then(() => {
                alert("Link chia sẻ đã được sao chép vào bộ nhớ tạm!");
            }).catch(err => {
                console.error('Could not copy text: ', err);
                prompt("Sao chép link chia sẻ tại đây:", url.toString());
            });
        }

        function loadSharedData() {
            const params = new URLSearchParams(window.location.search);
            const sharedData = params.get('share');
            if (!sharedData) return;

            try {
                const json = decodeURIComponent(escape(atob(sharedData)));
                const state = JSON.parse(json);
                
                if (state.m) mode = state.m;
                if (state.ds) datasets = state.ds.map((d, i) => ({ id: i + 1, name: d.n, dataStr: d.s }));
                if (state.mr) manualRows = state.mr.map((r, i) => ({ id: Date.now() + i, lower: r.l, upper: r.u, freqs: r.f }));
                
                if (state.dp) document.getElementById('decimalPlaces').value = state.dp;
                if (state.meth) document.getElementById('method').value = state.meth;
                if (state.h) document.getElementById('manualH').value = state.h;
                if (state.k) document.getElementById('manualK').value = state.k;
                if (state.sv) document.getElementById('startValue').value = state.sv;

                toggleInputs();
                if (mode === 'table') {
                    document.getElementById('btnRaw').className = "flex-1 py-2 text-sm font-medium rounded text-slate-500 hover:bg-slate-50";
                    document.getElementById('btnTable').className = "flex-1 py-2 text-sm font-medium rounded bg-indigo-50 text-indigo-700";
                    document.getElementById('rawSection').classList.add('hidden');
                    document.getElementById('tableSection').classList.remove('hidden');
                }
            } catch (e) {
                console.error("Error loading shared data:", e);
            }
        }

        // --- Home Navigation ---
        function goHome() {
            // Chuyển về tab "Dữ liệu & Thống kê"
            switchTab('data');
            // Cuộn lên đầu trang
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        window.onload = () => { 
            loadSharedData();
            renderInputs(); 
            calculate(); 
        };
