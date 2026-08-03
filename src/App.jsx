import React, { useState, useEffect, useMemo, useRef } from 'react';

// ==========================================
// CONFIGURAÇÃO DA API E CORES (MONDRIAN ESTRITO)
// ==========================================
const getApiUrl = () => {
  try { return import.meta.env.VITE_APPS_SCRIPT_URL || ''; } 
  catch (e) { return ''; }
};
const API_URL = getApiUrl(); 

const COLORS = {
  crimson: '#C1272D', 
  mustard: '#EAA221', 
  teal: '#007D8A', 
  black: '#111111', 
  white: '#Fdfcf0', 
  pureWhite: '#ffffff'
};
const CHART_PALETTE = [COLORS.crimson, COLORS.mustard, COLORS.teal];

// ==========================================
// DICIONÁRIOS CARTOGRÁFICOS BÁSICOS
// ==========================================
const GEO_COORDS = {
  // Floripa - Bairros Principais (Fallback para precisão interna)
  'centro': [-27.595, -48.548], 'trindade': [-27.583, -48.523], 'itacorubi': [-27.575, -48.508],
  'agronomica': [-27.576, -48.536], 'campeche': [-27.681, -48.497], 'lagoa da conceicao': [-27.603, -48.461],
  'ingleses': [-27.436, -48.397], 'canasvieiras': [-27.428, -48.461], 'jurere': [-27.438, -48.493],
  'rio vermelho': [-27.493, -48.406], 'santo antonio de lisboa': [-27.502, -48.514], 'sambaqui': [-27.485, -48.528],
  'ribeirao da ilha': [-27.721, -48.536], 'pantano do sul': [-27.781, -48.509], 'saco dos limoes': [-27.608, -48.532],
  'saco grande': [-27.545, -48.498], 'coqueiros': [-27.602, -48.579], 'estreito': [-27.585, -48.577],
  'cacupe': [-27.531, -48.523], 'monte verde': [-27.551, -48.498], 'joao paulo': [-27.561, -48.512],
  'capoeiras': [-27.595, -48.598]
};

const MOCK_DATA = [
  { id: 2, 'Título': 'Sessão Plenária ALESC', 'Início': new Date(Date.now() + 86400000).toISOString(), 'Fim': new Date(Date.now() + 93600000).toISOString(), 'Descrição': 'Votação ambiental.', 'Duração': 120, 'Local': 'ALESC - Florianópolis', 'Classe de Atividade': 'Plenária', 'Município': 'Florianópolis', 'Articulador': 'João Silva', 'STATUS': 'Confirmado', 'Prioridade': 'Alta' },
  { id: 3, 'Título': 'Reunião Associação', 'Início': new Date(Date.now() + 172800000).toISOString(), 'Fim': new Date(Date.now() + 182800000).toISOString(), 'Descrição': 'Saneamento.', 'Duração': 120, 'Local': 'Campeche, Florianópolis', 'Classe de Atividade': 'Reunião', 'Município': 'Criciúma', 'Articulador': 'Maria Costa', 'STATUS': 'Pendente', 'Prioridade': 'Média' }
];

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return 'Data Inválida';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
};

const isFuture = (dateString) => !isNaN(new Date(dateString)) && new Date(dateString) >= new Date();
const isPast = (dateString) => !isNaN(new Date(dateString)) && new Date(dateString) < new Date();
const normalizerFilter = (str) => {
  if (!str) return '';
  return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const toProperCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const FLORIPA_GEO = [
  { k: 'centro', b: 'Centro', d: 'Sede', r: 'Centro' }, { k: 'alesc', b: 'Centro', d: 'Sede', r: 'Centro' },
  { k: 'ufsc', b: 'Trindade', d: 'Sede', r: 'Centro' }, { k: 'udesc', b: 'Itacorubi', d: 'Sede', r: 'Centro' },
  { k: 'agronomica', b: 'Agronômica', d: 'Sede', r: 'Centro' }, { k: 'trindade', b: 'Trindade', d: 'Sede', r: 'Centro' },
  { k: 'lagoa da conceicao', b: 'Lagoa da Conceição', d: 'Lagoa da Conceição', r: 'Leste da Ilha' },
  { k: 'canasvieiras', b: 'Canasvieiras', d: 'Canasvieiras', r: 'Norte da Ilha' },
  { k: 'ingleses', b: 'Ingleses', d: 'Ingleses do Rio Vermelho', r: 'Norte da Ilha' },
  { k: 'campeche', b: 'Campeche', d: 'Campeche', r: 'Sul da Ilha' },
  { k: 'ribeirao', b: 'Ribeirão da Ilha', d: 'Ribeirão da Ilha', r: 'Sul da Ilha' }
];

const enrichFloripaLocation = (evento) => {
  const textToSearch = [evento['Local'] || '', evento['Título'] || '', evento['Descrição'] || ''].join(' ').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (let geo of FLORIPA_GEO) {
    if (textToSearch.includes(geo.k)) return { bairro: geo.b, distrito: geo.d, regiao: geo.r };
  }
  if (textToSearch.match(/(online|virtual|on line)/)) return { bairro: 'Digital/Online', distrito: '-', regiao: 'Centro' };
  return { bairro: 'Não Identificado', distrito: 'Não Identificado', regiao: 'Centro' };
};

const normalizeData = (data) => {
  return data.map(item => {
    const newItem = { id: item.id };
    const keys = Object.keys(item);
    keys.forEach(k => { newItem[k] = item[k]; });
    
    keys.forEach(k => {
      if (k === 'id') return;
      const normK = normalizerFilter(k);
      
      if (normK.includes('titulo')) newItem['Título'] = item[k];
      if (normK.includes('inicio')) newItem['Início'] = item[k];
      if (normK.includes('fim')) newItem['Fim'] = item[k];
      if (normK.includes('descri')) newItem['Descrição'] = item[k];
      if (normK.includes('duracao')) newItem['Duração'] = item[k];
      if (normK.includes('local')) newItem['Local'] = item[k];
      
      if (normK === 'classe de atividade' || normK === 'classe') {
        let v = item[k];
        if (typeof v === 'string') {
            let properV = toProperCase(v);
            if (normalizerFilter(v).includes('plenaria')) properV = properV.replace(/Plenaria/ig, 'Plenária');
            newItem['Classe de Atividade'] = properV;
        } else {
            newItem['Classe de Atividade'] = v;
        }
      }
      
      if (normK === 'municipio') newItem['Município'] = toProperCase(item[k]);
      if (normK === 'regiao') newItem['Região'] = item[k];
      
      // TRAVA DE SEGURANÇA: Só aceita Articulador se ainda estiver vazio, evitando que colunas duplicadas vazias apaguem dados.
      if (normK.includes('articulador') || normK.includes('responsavel')) {
         if (!newItem['Articulador'] || (newItem['Articulador'].toString().trim() === '' && item[k])) {
             newItem['Articulador'] = toProperCase(item[k]);
         }
      }
      
      if (normK === 'status') newItem['STATUS'] = item[k];
      if (normK === 'prioridade' || normK === 'importancia') newItem['Prioridade'] = item[k];
    });

    // Correção super absoluta para "Plenária" (Força se 'plenaria' estiver no Título)
    if (newItem['Título'] && normalizerFilter(newItem['Título']).includes('plenaria')) {
        newItem['Classe de Atividade'] = 'Plenária';
    }

    Object.keys(newItem).forEach(k => {
      if (typeof newItem[k] === 'string' && (newItem[k].includes('#REF!') || newItem[k].includes('#N/A'))) newItem[k] = '';
    });
    
    const isFloripa = normalizerFilter(newItem['Município']).includes('florianopolis') || normalizerFilter(newItem['Município']).includes('floripa');
    if (isFloripa) {
      const floripaGeo = enrichFloripaLocation(newItem);
      newItem['Bairro'] = floripaGeo.bairro;
      newItem['Distrito'] = floripaGeo.distrito;
      newItem['Região Floripa'] = floripaGeo.regiao;
    } else {
      newItem['Bairro'] = '-';
      newItem['Distrito'] = '-';
      newItem['Região Floripa'] = '-';
    }

    return newItem;
  });
};

// ==========================================
// COMPONENTES MULTI-SELECT MONDRIAN
// ==========================================
const MultiSelect = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(o => o !== opt));
    else onChange([...selected, opt]);
  };

  const handleSelectAll = () => {
    if (selected.length === options.length || selected.length > 0) onChange([]);
    else onChange([...options]);
  };

  return (
    <div className="relative flex-1 min-w-[200px]" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#Fdfcf0] text-[#111111] border-[3px] border-[#111111] font-black text-[9px] uppercase px-3 py-3 text-left shadow-[4px_4px_0px_0px_#111111] flex justify-between items-center transition-transform hover:-translate-y-0.5"
      >
        <span className="truncate">{selected.length === 0 ? placeholder : `${selected.length} SELECIONADOS`}</span>
        <span className="text-[14px] leading-none">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 top-full mt-2 left-0 w-full bg-[#ffffff] border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] max-h-60 overflow-y-auto custom-scrollbar flex flex-col">
          <div 
            className="px-3 py-2 border-b-[3px] border-[#111111] cursor-pointer hover:bg-[#EAA221] font-black text-[9px] uppercase transition-colors"
            onClick={handleSelectAll}
          >
            {selected.length > 0 ? 'LIMPAR SELEÇÃO' : 'SELECIONAR TODOS'}
          </div>
          {options.map((opt, i) => (
            <div 
              key={i} 
              onClick={() => toggleOption(opt)}
              className="flex items-center px-3 py-2 border-b-[2px] border-[#111111] cursor-pointer hover:bg-[#Fdfcf0] transition-colors"
            >
              <div className={`w-3 h-3 border-[2px] border-[#111111] mr-2 flex-shrink-0 transition-colors ${selected.includes(opt) ? 'bg-[#C1272D]' : 'bg-[#Fdfcf0]'}`}></div>
              <span className="font-black text-[9px] uppercase text-[#111111] truncate">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTES GRÁFICOS
// ==========================================
const SimpleBarChart = ({ data, title }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col h-full min-h-[300px]">
      <h3 className="text-[12px] font-black text-[#111111] mb-5 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2">{title}</h3>
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
        {data.length === 0 && <div className="text-[10px] font-black text-[#111111] opacity-50 uppercase text-center py-4">Sem dados válidos</div>}
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3 group">
            <span className="text-[10px] font-black text-[#111111] w-32 uppercase truncate" title={item.name}>{item.name}</span>
            <div className="flex-1 h-5 bg-[#Fdfcf0] border-[2px] border-[#111111] overflow-hidden relative">
              <div className="h-full border-r-[2px] border-[#111111] transition-all duration-500" style={{ width: `${(item.value / maxVal) * 100}%`, backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}></div>
            </div>
            <span className="text-xs font-black text-[#111111] w-8 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimplePieChart = ({ data, title }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];

  return (
    <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col items-center h-full min-h-[300px]">
      <h3 className="text-[12px] font-black text-[#111111] mb-5 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2 w-full">{title}</h3>
      {/* TRAVA CONTRA DIVISÃO POR ZERO (Bugfix que travava a tela) */}
      {(data.length === 0 || total === 0) ? (
         <div className="flex-1 flex items-center justify-center text-[10px] font-black text-[#111111] opacity-50 uppercase py-10">Sem dados válidos</div>
      ) : (
        <>
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full drop-shadow-[4px_4px_0px_#111111]">
              <circle cx="0" cy="0" r="1.05" fill="#111111" />
              {data.map((slice, i) => {
                if (slice.value === 0) return null;
                const percent = slice.value / total;
                if (percent === 1) return <circle key={i} cx="0" cy="0" r="1" fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="#111111" strokeWidth="0.03" />
                const startX = getCoordinatesForPercent(cumulativePercent)[0];
                const startY = getCoordinatesForPercent(cumulativePercent)[1];
                cumulativePercent += percent;
                const endX = getCoordinatesForPercent(cumulativePercent)[0];
                const endY = getCoordinatesForPercent(cumulativePercent)[1];
                const largeArcFlag = percent > 0.5 ? 1 : 0;
                const pathData = [`M ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, `L 0 0`].join(' ');
                return <path key={i} d={pathData} fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="#111111" strokeWidth="0.04" />;
              })}
            </svg>
          </div>
          <div className="mt-6 w-full flex flex-wrap gap-2 justify-center overflow-y-auto max-h-[120px] custom-scrollbar">
            {data.map((item, i) => {
              if(item.value === 0) return null;
              return (
              <div key={i} className="flex items-center gap-1.5 text-[9px] font-black text-[#111111] bg-[#Fdfcf0] border-[2px] border-[#111111] px-1.5 py-0.5 shadow-[2px_2px_0px_0px_#111111] uppercase">
                <span className="w-2.5 h-2.5 border-[2px] border-[#111111] block" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}></span>
                {item.name} ({(item.value / total * 100).toFixed(0)}%)
              </div>
            )})}
          </div>
        </>
      )}
    </div>
  );
};

const SimpleLineChart = ({ data, title }) => {
  if (!data || data.length === 0) {
     return (
       <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col items-center justify-center min-h-[350px]">
          <h3 className="text-[12px] font-black text-[#111111] mb-5 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2 w-full">{title}</h3>
          <span className="text-[10px] font-black text-[#111111] opacity-50 uppercase">Sem dados válidos no período</span>
       </div>
     )
  }

  const maxVal = Math.max(...data.map(d => d.value), 4);
  const width = 1000;
  const height = 350;
  const padding = 60;

  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding) / Math.max(data.length - 1, 1));
    const y = height - padding - ((d.value / maxVal) * (height - 2 * padding));
    return { x, y, value: d.value, name: d.name };
  });

  return (
    <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col w-full overflow-x-auto min-h-[350px]">
      <h3 className="text-[12px] font-black text-[#111111] mb-5 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2 min-w-[600px]">{title}</h3>
      <div className="flex-1 w-full min-w-[600px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full drop-shadow-[4px_4px_0px_#111111]">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
             <line key={i} x1={padding} y1={height - padding - (ratio * (height - 2 * padding))} x2={width - padding} y2={height - padding - (ratio * (height - 2 * padding))} stroke="#cccccc" strokeWidth="1" strokeDasharray="4 4" />
          ))}
          <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#111111" strokeWidth="6" strokeLinejoin="round" />
          <polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#C1272D" strokeWidth="4" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <rect x={p.x - 6} y={p.y - 6} width="12" height="12" fill="#Fdfcf0" stroke="#111111" strokeWidth="3" />
              {/* Stroke branco (fundo falso) para o texto flutuar acima da linha sem poluição visual */}
              <text x={p.x} y={p.y - 15} textAnchor="middle" fontSize="14" fontWeight="900" stroke="#Fdfcf0" strokeWidth="4" strokeLinejoin="round" fill="none">{p.value}</text>
              <text x={p.x} y={p.y - 15} textAnchor="middle" fontSize="14" fontWeight="900" fill="#111111">{p.value}</text>
              
              <text x={p.x} y={height - 25} textAnchor="middle" fontSize="11" fontWeight="900" stroke="#Fdfcf0" strokeWidth="4" strokeLinejoin="round" fill="none">{p.name}</text>
              <text x={p.x} y={height - 25} textAnchor="middle" fontSize="11" fontWeight="900" fill="#111111">{p.name}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

const GoogleStyleMarkerMap = ({ events, title, isFloripa, onMarkerClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let loadingTimer;

    const initMap = async () => {
      if (!mapRef.current || !window.L || !isMounted) return;
      
      // DOWNLOAD DINÂMICO DOS 295 MUNICÍPIOS (Sem hardcode)
      if (!isFloripa && !window.SC_GEO_CACHE) {
         try {
             const res = await fetch('https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-42-mun.json');
             const geoData = await res.json();
             if (!isMounted) return;
             window.SC_GEO_CACHE = {};
             
             // Extrai o centroide matemático de cada município
             geoData.features.forEach(f => {
                const name = normalizerFilter(f.properties.name);
                let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
                const coords = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates.flat(2) : f.geometry.coordinates.flat(1);
                coords.forEach(([lng, lat]) => {
                    if (lat < minLat) minLat = lat;
                    if (lat > maxLat) maxLat = lat;
                    if (lng < minLng) minLng = lng;
                    if (lng > maxLng) maxLng = lng;
                });
                window.SC_GEO_CACHE[name] = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
             });
         } catch(e) { console.warn("Falha ao carregar municípios, usando fallback interno"); }
      }

      if (!mapInstanceRef.current) {
        const mapCenter = isFloripa ? [-27.55, -48.50] : [-27.2730, -50.4906];
        const mapZoom = isFloripa ? 11 : 7;
        mapInstanceRef.current = window.L.map(mapRef.current, { scrollWheelZoom: false }).setView(mapCenter, mapZoom);
        
        window.L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', { 
          attribution: '&copy; Google Maps' 
        }).addTo(mapInstanceRef.current);
      }
      const map = mapInstanceRef.current;

      if (geoJsonLayerRef.current) map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = window.L.layerGroup().addTo(map);

      events.forEach(ev => {
         let loc = null;
         const searchString = normalizerFilter(`${ev['Local']} ${ev['Bairro']} ${ev['Município']}`);
         
         if (isFloripa) {
             const bairroMatch = Object.keys(GEO_COORDS).find(k => searchString.includes(k));
             if (bairroMatch) loc = GEO_COORDS[bairroMatch];
         }
         
         if (!loc && !isFloripa && window.SC_GEO_CACHE) {
            const munMatch = normalizerFilter(ev['Município']);
            if (window.SC_GEO_CACHE[munMatch]) loc = window.SC_GEO_CACHE[munMatch];
         }
         
         if (!loc) {
            const munMatch = normalizerFilter(ev['Município']);
            if (GEO_COORDS[munMatch]) loc = GEO_COORDS[munMatch];
         }

         if (loc) {
            const jitter = isFloripa ? 0.015 : 0.05;
            const finalCoords = [
              loc[0] + (Math.random() - 0.5) * jitter,
              loc[1] + (Math.random() - 0.5) * jitter
            ];

            const prioRaw = normalizerFilter(ev['Prioridade'] || '');
            let prioColor = '#007D8A'; 
            if (prioRaw.includes('alta') || prioRaw === '1') prioColor = '#C1272D';
            else if (prioRaw.includes('media') || prioRaw === '2') prioColor = '#EAA221';

            const iconHtml = `<div style="width: 14px; height: 14px; background-color: ${prioColor}; border: 3px solid #111111; box-shadow: 2px 2px 0px 0px #111111; transform: rotate(45deg);"></div>`;
            const customIcon = window.L.divIcon({
              className: 'custom-mondrian-marker',
              html: iconHtml,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
              popupAnchor: [0, -10],
              tooltipAnchor: [0, -15]
            });

            const marker = window.L.marker(finalCoords, { icon: customIcon });
            
            // Alterado de bindPopup (ao clicar) para bindTooltip (ao passar o mouse)
            marker.bindTooltip(`
              <div style="font-family: inherit; font-weight: 900; text-transform: uppercase; font-size: 10px; color: #111111; min-width: 150px; padding: 4px;">
                <div style="font-size: 8px; color: #ffffff; background: #111111; padding: 2px 4px; display: inline-block; margin-bottom: 6px; border: 1px solid #111111;">${ev['Classe de Atividade'] || 'SEM CLASSE'}</div>
                <div style="font-size: 11px; margin-bottom: 6px; line-height: 1.2;">${ev['Título']}</div>
                <div style="color: #C1272D; font-size: 9px; margin-bottom: 2px;">📍 ${ev['Local'] || ev['Município']}</div>
                <div style="color: #007D8A; font-size: 9px;">🕒 ${formatDate(ev['Início'])}</div>
              </div>
            `, { direction: 'top', className: 'custom-leaflet-tooltip' });
            
            // Adicionado evento de Clique que dispara a função vinda do App.jsx
            marker.on('click', () => {
              if (onMarkerClick) onMarkerClick(ev['Município']);
            });
            
            geoJsonLayerRef.current.addLayer(marker);
         }
      });
    };

    if (!window.L) {
      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link'); css.id = 'leaflet-css'; css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      if (!document.getElementById('leaflet-script')) {
        const script = document.createElement('script'); script.id = 'leaflet-script';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);
      }
      const checkAndInit = () => {
        if (window.L) { if (isMounted) initMap(); } 
        else { loadingTimer = setTimeout(checkAndInit, 100); }
      };
      checkAndInit();
    } else { initMap(); }

    return () => { 
      isMounted = false; 
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [events, isFloripa]);

  return (
    <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col h-full relative mt-8">
      <h3 className="text-[12px] font-black text-[#111111] mb-2 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2">{title}</h3>
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#007D8A] border-[2px] border-[#111111] transform rotate-45 block"></span><span className="text-[8px] font-black uppercase text-[#111111] ml-1">Normal/Baixa</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#EAA221] border-[2px] border-[#111111] transform rotate-45 block"></span><span className="text-[8px] font-black uppercase text-[#111111] ml-1">Média</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#C1272D] border-[2px] border-[#111111] transform rotate-45 block"></span><span className="text-[8px] font-black uppercase text-[#111111] ml-1">Alta</span></div>
      </div>
      {/* Aumento radical do quadro do Mapa de 400px para 600px */}
      <div className="w-full h-[600px] border-[3px] border-[#111111] relative z-0 bg-[#Fdfcf0]">
        <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 0 }}></div>
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL (APP)
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [showFuture, setShowFuture] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [showPessoal, setShowPessoal] = useState(false); 
  
  const [scopeCapital, setScopeCapital] = useState(true);
  const [scopeInterior, setScopeInterior] = useState(true);
  
  const [selectedMunicipios, setSelectedMunicipios] = useState([]);
  const [selectedArticuladores, setSelectedArticuladores] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  
  const [viewMode, setViewMode] = useState('cards');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [sortConfig, setSortConfig] = useState({ key: 'Início', direction: 'asc' });
  const [showOnlyImportant, setShowOnlyImportant] = useState(false);

  // Nova função acionada ao clicar em um marcador no Mapa do Dashboard
  const handleMapClick = (municipio) => {
    setSelectedMunicipios([municipio]);
    setScopeCapital(true);
    setScopeInterior(true);
    setActiveTab('list');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetApp = () => {
    setSearch('');
    setScopeCapital(true);
    setScopeInterior(true);
    setShowFuture(true);
    setShowPast(false);
    setShowPessoal(false);
    setShowOnlyImportant(false);
    setSelectedMunicipios([]);
    setSelectedArticuladores([]);
    setSelectedClasses([]);
    setActiveTab('list');
    setSelectedEvent(null);
    setSortConfig({ key: 'Início', direction: 'asc' });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!API_URL) setEvents(normalizeData(MOCK_DATA));
        else {
          const response = await fetch(API_URL, { redirect: "follow" });
          const data = JSON.parse(await response.text());
          setEvents(normalizeData(data));
        }
      } catch (error) { setEvents(normalizeData(MOCK_DATA)); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, 'STATUS': newStatus } : ev));
    if (selectedEvent && selectedEvent.id === id) setSelectedEvent({ ...selectedEvent, 'STATUS': newStatus });
    if (API_URL) fetch(API_URL, { method: 'POST', body: JSON.stringify({ id, status: newStatus }), redirect: "follow" }).catch(()=>{});
  };

  const handleUpdatePriority = async (id, newPriority) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, 'Prioridade': newPriority } : ev));
    if (selectedEvent && selectedEvent.id === id) setSelectedEvent({ ...selectedEvent, 'Prioridade': newPriority });
    if (API_URL) fetch(API_URL, { method: 'POST', body: JSON.stringify({ id, prioridade: newPriority }), redirect: "follow" }).catch(()=>{});
  };

  const filterOptions = useMemo(() => {
    const getUnique = (key) => [...new Set(events.map(e => e[key]).filter(v => v && v.toString().trim() !== ''))].sort();
    return {
      municipios: getUnique('Município'),
      articuladores: getUnique('Articulador'),
      classes: getUnique('Classe de Atividade')
    };
  }, [events]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
  };

  const filteredEvents = useMemo(() => {
    let result = events.filter(ev => {
      const isF = isFuture(ev['Início']);
      const isP = isPast(ev['Início']);
      
      if (!showFuture && isF) return false;
      if (!showPast && isP) return false;
      if (!showFuture && !showPast) return false;
      
      const isPessoal = ev['Classe de Atividade'] && normalizerFilter(ev['Classe de Atividade']).includes('pessoal');
      if (!showPessoal && isPessoal) return false;

      if (showOnlyImportant) {
        const imp = normalizerFilter(ev['Prioridade'] || ev['Importância'] || '');
        if (!imp.includes('alta') && !imp.includes('urgente') && !imp.includes('importante') && !imp.includes('maxima') && imp !== '1') return false;
      }

      if (selectedMunicipios.length > 0 && !selectedMunicipios.includes(ev['Município'])) return false;
      if (selectedArticuladores.length > 0 && !selectedArticuladores.includes(ev['Articulador'])) return false;
      if (selectedClasses.length > 0 && !selectedClasses.includes(ev['Classe de Atividade'])) return false;
      
      const isFloripa = normalizerFilter(ev['Município']).includes('florianopolis') || normalizerFilter(ev['Município']).includes('floripa');
      if (!scopeCapital && isFloripa) return false;
      if (!scopeInterior && !isFloripa) return false;
      if (!scopeCapital && !scopeInterior) return false;

      if (search) {
        const term = normalizerFilter(search);
        return normalizerFilter(ev['Título']).includes(term) || normalizerFilter(ev['Local']).includes(term);
      }
      return true;
    });

    result.sort((a, b) => {
      let aVal = a[sortConfig.key] || '';
      let bVal = b[sortConfig.key] || '';
      if (sortConfig.key === 'Início') {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [events, search, showFuture, showPast, selectedMunicipios, selectedArticuladores, selectedClasses, scopeCapital, scopeInterior, sortConfig, showPessoal, showOnlyImportant]);

  const dashboardStats = useMemo(() => {
    const agg = (key) => {
      const counts = {};
      filteredEvents.forEach(ev => {
        let val = ev[key];
        if (!val || val.toString().trim() === '') return;
        const norm = normalizerFilter(val);
        if (norm === 'outros eventos' || norm === 'nao definido') return;
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const temporalDataMap = {};
    filteredEvents.forEach(ev => {
      if (!ev['Início']) return;
      // Abordagem rígida e à prova de falhas com fuso-horários: recorta estritamente pelo texto
      const dataStr = ev['Início'].split('T')[0];
      if (!dataStr) return;
      
      const parts = dataStr.split('-');
      if (parts.length >= 2) {
         const key = `${parts[0]}-${parts[1]}`;
         temporalDataMap[key] = (temporalDataMap[key] || 0) + 1;
      }
    });
    
    const temporalLine = Object.entries(temporalDataMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, value]) => {
         const [y, m] = key.split('-');
         return { name: `${m}/${y}`, value };
      });

    return { 
       classes: agg('Classe de Atividade'), 
       articuladores: agg('Articulador'), 
       temporalLine
    };
  }, [filteredEvents]);

  const summaryStats = useMemo(() => {
    let total = filteredEvents.length;
    let capital = 0; let futuras = 0; let pendentes = 0;

    filteredEvents.forEach(ev => {
      const mun = normalizerFilter(ev['Município']);
      if (mun.includes('florianopolis') || mun.includes('floripa')) capital++;
      if (isFuture(ev['Início'])) futuras++;
      if (ev['STATUS'] === 'Pendente') pendentes++;
    });
    return { total, capital, interior: total - capital, futuras, pendentes };
  }, [filteredEvents]);

  const upcomingImportantCount = useMemo(() => {
    return events.filter(ev => {
        if (!isFuture(ev['Início'])) return false;
        const imp = normalizerFilter(ev['Prioridade'] || ev['Importância'] || '');
        return imp.includes('alta') || imp.includes('urgente') || imp.includes('importante') || imp.includes('maxima') || imp === '1';
    }).length;
  }, [events]);

  const renderGlobalFilters = () => {
    const isBothScopes = scopeCapital && scopeInterior;

    return (
      <div className="bg-[#ffffff] border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] p-4 mb-8 flex flex-col gap-4 relative z-10 w-full">
        <div className="flex flex-col xl:flex-row gap-4 mb-2 items-stretch">
           <div className="flex flex-col md:flex-row gap-4 flex-1">
              <button 
                onClick={() => setScopeCapital(!scopeCapital)} 
                className={`flex-1 py-3 px-4 text-[11px] font-black uppercase border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 ${scopeCapital ? 'bg-[#007D8A] text-[#Fdfcf0]' : 'bg-[#111111] text-[#Fdfcf0]'}`}
              >
                <div className={`w-3 h-3 flex items-center justify-center text-[10px] border-[2px] ${scopeCapital ? 'border-[#Fdfcf0] bg-[#Fdfcf0] text-[#007D8A]' : 'border-[#Fdfcf0] bg-transparent text-transparent'}`}>
                  {scopeCapital ? '✓' : ''}
                </div>
                FLORIANÓPOLIS
              </button>
              <button 
                onClick={() => setScopeInterior(!scopeInterior)} 
                className={`flex-1 py-3 px-4 text-[11px] font-black uppercase border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] transition-transform hover:-translate-y-1 flex items-center justify-center gap-2 ${scopeInterior ? 'bg-[#007D8A] text-[#Fdfcf0]' : 'bg-[#111111] text-[#Fdfcf0]'}`}
              >
                <div className={`w-3 h-3 flex items-center justify-center text-[10px] border-[2px] ${scopeInterior ? 'border-[#Fdfcf0] bg-[#Fdfcf0] text-[#007D8A]' : 'border-[#Fdfcf0] bg-transparent text-transparent'}`}>
                  {scopeInterior ? '✓' : ''}
                </div>
                SANTA CATARINA
              </button>
           </div>
           <div className="flex items-center justify-center bg-[#Fdfcf0] border-[3px] border-[#111111] border-dashed px-4 py-2 flex-shrink-0 min-w-[250px]">
             <span className="text-[10px] font-black uppercase text-[#C1272D] text-center">
               EXIBINDO: {isBothScopes ? 'GERAL (CAPITAL E ESTADO)' : scopeCapital ? 'SOMENTE FLORIANÓPOLIS' : scopeInterior ? 'SOMENTE SANTA CATARINA' : 'NENHUMA REGIÃO SELECIONADA'}
             </span>
           </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
          <input 
            type="text" placeholder="BUSCAR POR TÍTULO OU LOCAL..." 
            className="flex-1 w-full xl:max-w-md px-4 py-2 bg-[#Fdfcf0] border-[3px] border-[#111111] focus:outline-none focus:border-[#C1272D] font-black text-[10px] uppercase shadow-[4px_4px_0px_0px_#111111] text-[#111111] placeholder-[#111111]"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-4 flex-wrap w-full xl:w-auto justify-end">
            <div className="flex gap-2 bg-[#111111] p-1 border-[3px] border-[#111111] flex-wrap items-center">
              <button 
                onClick={() => setShowFuture(!showFuture)} 
                className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 flex items-center gap-2 ${showFuture ? 'bg-[#007D8A] text-[#Fdfcf0] border-[#Fdfcf0]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`}
              >
                 <div className={`w-2.5 h-2.5 flex items-center justify-center text-[8px] border-[2px] border-[#Fdfcf0] flex-shrink-0 ${showFuture ? 'bg-[#Fdfcf0] text-[#007D8A]' : 'bg-transparent text-transparent'}`}>
                    {showFuture ? '✓' : ''}
                 </div>
                 FUTUROS
              </button>
              
              <button 
                onClick={() => setShowPast(!showPast)} 
                className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 flex items-center gap-2 ${showPast ? 'bg-[#EAA221] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`}
              >
                 <div className={`w-2.5 h-2.5 flex items-center justify-center text-[8px] border-[2px] ${showPast ? 'border-[#111111] bg-[#111111] text-[#EAA221]' : 'border-[#Fdfcf0] bg-transparent text-transparent'} flex-shrink-0`}>
                    {showPast ? '✓' : ''}
                 </div>
                 PASSADOS
              </button>
              
              <div className="w-px h-auto bg-[#333333] mx-1"></div>
              
              <button onClick={() => setShowPessoal(!showPessoal)} className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 flex items-center gap-2 ${showPessoal ? 'bg-[#Fdfcf0] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`} title="Exibir agendas pessoais conjuntas">
                 <div className={`w-2.5 h-2.5 flex items-center justify-center text-[8px] border-[2px] ${showPessoal ? 'border-[#111111] bg-[#111111] text-[#111111]' : 'border-[#Fdfcf0] bg-transparent text-transparent'} flex-shrink-0`}>
                    {showPessoal ? '✓' : ''}
                 </div>
                 PESSOAL
              </button>
              
              <div className="w-px h-auto bg-[#333333] mx-1"></div>
              
              <button 
                onClick={() => setSortConfig(prev => ({ key: 'Início', direction: prev.key === 'Início' && prev.direction === 'asc' ? 'desc' : 'asc' }))} 
                className="px-3 py-1.5 text-[9px] font-black uppercase border-2 flex items-center gap-2 text-[#Fdfcf0] border-transparent hover:bg-[#333333] transition-colors" 
              >
                 ORDEM: {(sortConfig.key === 'Início' && sortConfig.direction === 'desc') ? 'DECRESCENTE ▼' : 'CRESCENTE ▲'}
              </button>
            </div>
            
            <div className="flex bg-[#111111] p-1 border-[3px] border-[#111111]">
              <button onClick={() => setViewMode('cards')} className={`px-4 py-1.5 text-[10px] font-black uppercase transition-colors border-2 ${viewMode === 'cards' ? 'bg-[#Fdfcf0] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`}>Cards</button>
              <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 text-[10px] font-black uppercase transition-colors border-2 ${viewMode === 'table' ? 'bg-[#Fdfcf0] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`}>Lista</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full">
          <MultiSelect options={filterOptions.municipios} selected={selectedMunicipios} onChange={setSelectedMunicipios} placeholder="TODOS MUNICÍPIOS" />
          <MultiSelect options={filterOptions.articuladores} selected={selectedArticuladores} onChange={setSelectedArticuladores} placeholder="TODOS ARTICULADORES" />
          <MultiSelect options={filterOptions.classes} selected={selectedClasses} onChange={setSelectedClasses} placeholder="TODAS CLASSES" />
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center border-[4px] border-[#111111] bg-[#ffffff] p-4 shadow-[6px_6px_0px_0px_#111111]">
        <h2 className="text-xl font-black text-[#111111] tracking-tighter uppercase">Visão Geral (Filtrada)</h2>
        <span className="text-[12px] font-black px-4 py-2 bg-[#111111] text-[#Fdfcf0] border-[3px] border-[#111111] mt-2 md:mt-0">
          TOTAL EXIBIDO: {filteredEvents.length}
        </span>
      </div>
      
      {/* 1. Bar: Classes, 2. Pie: Classes (Reposicionado), 3. Pie: Articuladores (Reposicionado) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1"><SimpleBarChart data={dashboardStats.classes} title="Classes de Atividade" /></div>
        <div className="lg:col-span-1"><SimplePieChart data={dashboardStats.classes} title="Classes (Proporção)" /></div>
        <div className="lg:col-span-1"><SimplePieChart data={dashboardStats.articuladores} title="Articuladores" /></div>
      </div>
      
      <div className="mt-8">
        <SimpleLineChart data={dashboardStats.temporalLine} title="Evolução Temporal das Agendas" />
      </div>

      <div className="grid grid-cols-1 gap-8 mt-8">
        {/* Passando o manipulador de clique para os componentes dos Mapas */}
        <GoogleStyleMarkerMap events={filteredEvents.filter(e => !normalizerFilter(e['Município']).includes('florianopolis') && !normalizerFilter(e['Município']).includes('floripa'))} title="Mapa de Agendas - Santa Catarina" isFloripa={false} onMarkerClick={handleMapClick} />
        <GoogleStyleMarkerMap events={filteredEvents.filter(e => normalizerFilter(e['Município']).includes('florianopolis') || normalizerFilter(e['Município']).includes('floripa'))} title="Mapa de Agendas - Florianópolis" isFloripa={true} onMarkerClick={handleMapClick} />
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-6 pb-10 relative z-0">
      <div className="flex justify-between items-center mb-2">
        {showOnlyImportant ? (
          <div className="bg-[#C1272D] border-[4px] border-[#111111] px-4 py-2 shadow-[4px_4px_0px_0px_#111111] flex items-center gap-4 text-[#Fdfcf0]">
            <span className="font-black uppercase text-[11px] tracking-widest flex items-center gap-2">
                <span className="w-3 h-3 bg-[#Fdfcf0] border-[2px] border-[#111111] block"></span>
                Filtro de Prioridade Ativo
            </span>
            <button onClick={() => setShowOnlyImportant(false)} className="bg-[#111111] text-[#Fdfcf0] px-3 py-1 font-black text-[9px] uppercase border-[2px] border-[#Fdfcf0] hover:bg-[#Fdfcf0] hover:text-[#111111] transition-colors">Limpar</button>
          </div>
        ) : <div />}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 font-black text-xl text-[#111111] opacity-50 bg-[#ffffff] border-[4px] border-[#111111] border-dashed">NENHUM RESULTADO</div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((ev, i) => {
                const prioRaw = normalizerFilter(ev['Prioridade'] || ev['Importância'] || '');
                let prioLevel = null; let prioColor = ''; 
                if (prioRaw.includes('alta') || prioRaw.includes('urgente') || prioRaw.includes('maxima') || prioRaw === '1') {
                    prioLevel = 'alta'; prioColor = COLORS.crimson; 
                } else if (prioRaw.includes('media') || prioRaw === '2') {
                    prioLevel = 'media'; prioColor = COLORS.mustard; 
                } else if (prioRaw.includes('baixa') || prioRaw === '3') {
                    prioLevel = 'baixa'; prioColor = COLORS.teal; 
                }

                return (
                <div key={i} onClick={() => setSelectedEvent(ev)} className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] hover:shadow-[10px_10px_0px_0px_#111111] hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full relative">
                  <div className="absolute top-0 right-0 w-8 h-8 border-l-[4px] border-b-[4px] border-[#111111]" style={{ backgroundColor: isFuture(ev['Início']) ? COLORS.teal : '#cccccc' }}></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-[#Fdfcf0] bg-[#111111] px-2 py-1 border-[2px] border-[#111111] self-start">{ev['Classe de Atividade'] || 'S/ CLASSE'}</span>
                  </div>

                  <h3 className="font-black text-lg text-[#111111] leading-tight mb-4 uppercase line-clamp-3">{ev['Título']}</h3>
                  
                  <div className="mt-auto space-y-2 border-t-[3px] border-[#111111] pt-3">
                    <p className="text-[10px] font-black text-[#111111] uppercase flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#007D8A] border-[2px] border-[#111111] block flex-shrink-0"></span> {formatDate(ev['Início'])}</p>
                    <p className="text-[10px] font-black text-[#C1272D] uppercase truncate flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#C1272D] border-[2px] border-[#111111] block flex-shrink-0"></span> {ev['Município']}</p>
                    
                    {ev['Articulador'] && ev['Articulador'].trim() !== '' && (
                       <p className="text-[10px] font-black text-[#EAA221] uppercase truncate flex items-center gap-2">
                         <span className="w-2.5 h-2.5 bg-[#EAA221] border-[2px] border-[#111111] block flex-shrink-0"></span> {ev['Articulador']}
                       </p>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-end mt-4 gap-2">
                    <select 
                        value={prioLevel === 'alta' ? 'Alta' : prioLevel === 'media' ? 'Média' : prioLevel === 'baixa' ? 'Baixa' : 'Nenhuma'} 
                        onChange={(e) => { e.stopPropagation(); handleUpdatePriority(ev.id, e.target.value); }} 
                        onClick={(e) => e.stopPropagation()}
                        className={`border-[3px] border-[#111111] px-1 py-1 text-[8px] font-black uppercase outline-none cursor-pointer flex-1 appearance-none text-center ${prioLevel === 'alta' ? 'bg-[#C1272D] text-[#Fdfcf0]' : prioLevel === 'media' ? 'bg-[#EAA221] text-[#111111]' : prioLevel === 'baixa' ? 'bg-[#007D8A] text-[#Fdfcf0]' : 'bg-[#ffffff] text-[#111111]'}`}
                    >
                        <option value="Nenhuma">S/ Prioridade</option>
                        <option value="Baixa">Baixa</option>
                        <option value="Média">Média</option>
                        <option value="Alta">Alta</option>
                    </select>
                    <select 
                        value={ev['STATUS'] || 'Pendente'} 
                        onChange={(e) => { e.stopPropagation(); handleUpdateStatus(ev.id, e.target.value); }} 
                        onClick={(e) => e.stopPropagation()}
                        className={`border-[3px] border-[#111111] px-1 py-1 text-[8px] font-black uppercase outline-none cursor-pointer flex-1 appearance-none text-center ${(ev['STATUS'] === 'Confirmado') ? 'bg-[#007D8A] text-[#Fdfcf0]' : (ev['STATUS'] === 'Realizado') ? 'bg-[#EAA221] text-[#111111]' : 'bg-[#ffffff] text-[#111111]'}`}
                    >
                        <option value="Pendente">Pendente</option>
                        <option value="Confirmado">Confirmado</option>
                        <option value="Realizado">Realizado</option>
                    </select>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="bg-[#ffffff] border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-[#Fdfcf0] uppercase bg-[#111111]">
                  <tr>
                    <th onClick={() => requestSort('Título')} className="px-4 py-3 font-black border-b-[3px] border-[#Fdfcf0] cursor-pointer hover:bg-[#333333] transition-colors select-none">Título{getSortIndicator('Título')}</th>
                    <th onClick={() => requestSort('Início')} className="px-4 py-3 font-black border-b-[3px] border-[#Fdfcf0] cursor-pointer hover:bg-[#333333] transition-colors select-none">Data{getSortIndicator('Início')}</th>
                    {(!scopeCapital || !scopeInterior) && scopeCapital ? (
                      <>
                        <th onClick={() => requestSort('Bairro')} className="px-4 py-3 font-black border-b-[3px] border-[#Fdfcf0] cursor-pointer hover:bg-[#333333] transition-colors select-none">Bairro{getSortIndicator('Bairro')}</th>
                        <th onClick={() => requestSort('Distrito')} className="px-4 py-3 font-black border-b-[3px] border-[#Fdfcf0] cursor-pointer hover:bg-[#333333] transition-colors select-none">Distrito{getSortIndicator('Distrito')}</th>
                        <th onClick={() => requestSort('Região Floripa')} className="px-4 py-3 font-black border-b-[3px] border-[#Fdfcf0] cursor-pointer hover:bg-[#333333] transition-colors select-none">Região{getSortIndicator('Região Floripa')}</th>
                      </>
                    ) : (
                      <th onClick={() => requestSort('Município')} className="px-4 py-3 font-black border-b-[3px] border-[#Fdfcf0] cursor-pointer hover:bg-[#333333] transition-colors select-none">Município{getSortIndicator('Município')}</th>
                    )}
                    <th onClick={() => requestSort('Articulador')} className="px-4 py-3 font-black border-b-[3px] border-[#Fdfcf0] cursor-pointer hover:bg-[#333333] transition-colors select-none">Articulador{getSortIndicator('Articulador')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((ev, i) => {
                    const prioRaw = normalizerFilter(ev['Prioridade'] || ev['Importância'] || '');
                    let prioColor = '';
                    if (prioRaw.includes('alta') || prioRaw.includes('urgente') || prioRaw.includes('maxima') || prioRaw === '1') prioColor = COLORS.crimson;
                    else if (prioRaw.includes('media') || prioRaw === '2') prioColor = COLORS.mustard;

                    return (
                    <tr key={i} onClick={() => setSelectedEvent(ev)} className="border-b-[3px] border-[#111111] hover:bg-[#Fdfcf0] cursor-pointer">
                      <td className="px-4 py-3 text-[11px] font-black uppercase max-w-[200px] truncate text-[#111111] flex items-center gap-2" title={ev['Título']}>
                        {prioColor && <div className="w-2 h-2 border-[2px] border-[#111111] flex-shrink-0" style={{ backgroundColor: prioColor }}></div>}
                        <span className="truncate">{ev['Título']}</span>
                      </td>
                      <td className="px-4 py-3 text-[10px] font-bold text-[#111111]">{formatDate(ev['Início'])}</td>
                      {(!scopeCapital || !scopeInterior) && scopeCapital ? (
                        <>
                          <td className="px-4 py-3 text-[10px] font-bold text-[#C1272D] truncate max-w-[120px]">{ev['Bairro']}</td>
                          <td className="px-4 py-3 text-[10px] font-bold text-[#007D8A] truncate max-w-[120px]">{ev['Distrito']}</td>
                          <td className="px-4 py-3 text-[10px] font-bold text-[#111111] truncate max-w-[120px]">{ev['Região Floripa']}</td>
                        </>
                      ) : (
                        <td className="px-4 py-3 text-[10px] font-bold text-[#C1272D] truncate max-w-[150px]">{ev['Município']}</td>
                      )}
                      <td className="px-4 py-3 text-[10px] font-bold text-[#EAA221]">{ev['Articulador'] || ''}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#Fdfcf0] font-sans text-[#111111] flex flex-col md:flex-row selection:bg-[#EAA221] selection:text-[#111111]">
      <nav className="bg-[#111111] text-[#Fdfcf0] w-full md:w-64 flex-shrink-0 flex flex-col z-50 border-r-[6px] border-[#111111]">
        <div className="p-6 bg-[#C1272D] flex flex-col cursor-pointer hover:bg-[#A31F25] transition-colors border-b-[4px] border-[#111111]" onClick={resetApp} title="Voltar ao início / Limpar filtros">
          
          <div className="flex items-center gap-3">
             <img src="https://raw.githubusercontent.com/killuixo/tabulum-gestafagen/refs/heads/main/icon-192.png" alt="Icon" className="w-10 h-10 flex-shrink-0 bg-transparent object-contain drop-shadow-[2px_2px_0px_rgba(17,17,17,1)]" />
             <div className="flex flex-col flex-1">
                <h1 className="text-3xl font-black tracking-tighter text-[#Fdfcf0] m-0 leading-none pb-1">TABULUM</h1>
                <p className="text-[9px] text-[#Fdfcf0] font-black uppercase tracking-widest bg-[#111111] px-2 py-1 border-[2px] border-[#Fdfcf0] w-full text-center m-0 leading-none mt-1">GESTÃO DE AGENDAS</p>
             </div>
          </div>
          
          <div className="w-full h-[4px] bg-[#Fdfcf0] mt-4 mb-1"></div>

          <div className="mt-5 bg-[#Fdfcf0] border-[3px] border-[#111111] p-3 text-[#111111] shadow-[4px_4px_0px_0px_#111111] flex flex-col gap-2 cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-end">
              <span className="text-[9px] font-black uppercase tracking-wider">Agendas Visíveis</span>
              <span className="text-xl font-black text-[#C1272D] leading-none">{summaryStats.total}</span>
            </div>
            
            <div className="mt-1">
              <div className="flex justify-between text-[8px] font-black uppercase mb-1">
                <span className="text-[#007D8A]">Capital: {summaryStats.capital}</span>
                <span className="text-[#EAA221]">Estado: {summaryStats.interior}</span>
              </div>
              <div className="h-2 w-full flex border-[2px] border-[#111111]">
                <div className="h-full bg-[#007D8A] transition-all duration-500" style={{ width: `${summaryStats.total === 0 ? 0 : (summaryStats.capital / summaryStats.total) * 100}%` }}></div>
                <div className="h-full bg-[#EAA221] transition-all duration-500" style={{ width: `${summaryStats.total === 0 ? 0 : (summaryStats.interior / summaryStats.total) * 100}%` }}></div>
              </div>
            </div>

            <div className="pt-2 mt-1 border-t-[2px] border-dashed border-[#111111] flex justify-between text-[8px] font-black uppercase">
              <span>Futuras: <span className="text-[#007D8A] ml-1">{summaryStats.futuras}</span></span>
              <span>Pendentes: <span className="text-[#C1272D] ml-1">{summaryStats.pendentes}</span></span>
            </div>
          </div>
        </div>
        <div className="flex flex-row md:flex-col p-4 gap-4 overflow-x-auto flex-shrink-0">
          <button onClick={() => setActiveTab('list')} className={`flex items-center gap-3 px-4 py-3 border-[3px] border-[#Fdfcf0] text-[11px] font-black uppercase transition-all shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 ${activeTab === 'list' ? 'bg-[#EAA221] text-[#111111] border-[#111111] shadow-[4px_4px_0px_0px_#EAA221]' : 'bg-[#111111] hover:bg-[#Fdfcf0] hover:text-[#111111]'}`}><span className="w-2.5 h-2.5 bg-[#Fdfcf0] border-[2px] border-[#111111] block" style={{backgroundColor: activeTab==='list' ? '#111111' : '#Fdfcf0'}}></span>AGENDAS</button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 border-[3px] border-[#Fdfcf0] text-[11px] font-black uppercase transition-all shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 ${activeTab === 'dashboard' ? 'bg-[#007D8A] text-[#Fdfcf0] border-[#111111] shadow-[4px_4px_0px_0px_#007D8A]' : 'bg-[#111111] hover:bg-[#Fdfcf0] hover:text-[#111111]'}`}><span className="w-2.5 h-2.5 bg-[#Fdfcf0] border-[2px] border-[#111111] block" style={{backgroundColor: activeTab==='dashboard' ? '#111111' : '#Fdfcf0'}}></span>DASHBOARD</button>
          
          <div className="mt-4 pt-4 md:border-t-[3px] md:border-dashed border-[#Fdfcf0]">
            <button 
              onClick={() => { setActiveTab('list'); setShowOnlyImportant(!showOnlyImportant); setShowFuture(true); setShowPast(false); }} 
              className={`w-full flex items-center justify-between px-4 py-3 border-[4px] border-[#111111] text-[11px] font-black uppercase transition-all shadow-[6px_6px_0px_0px_#111111] hover:-translate-y-1 ${showOnlyImportant ? 'bg-[#Fdfcf0] text-[#C1272D]' : 'bg-[#C1272D] text-[#Fdfcf0]'}`}
              title="Mostrar próximos eventos de alta prioridade"
            >
              <div className="flex items-center gap-3">
                 <span className={`w-3 h-3 border-[2px] border-[#111111] block ${showOnlyImportant ? 'bg-[#C1272D]' : 'bg-[#EAA221]'}`}></span>
                 PRIORIDADES
              </div>
              <span className={`px-2 py-0.5 border-[3px] border-[#111111] text-[12px] shadow-[2px_2px_0px_0px_#111111] ${showOnlyImportant ? 'bg-[#111111] text-[#Fdfcf0]' : 'bg-[#Fdfcf0] text-[#111111]'}`}>{upcomingImportantCount}</span>
            </button>
          </div>
        </div>
        <div className="mt-auto hidden md:block p-6">
          <div className="bg-[#Fdfcf0] border-[4px] border-[#111111] p-4 shadow-[4px_4px_0px_0px_#111111]">
            <p className="text-[9px] text-[#111111] font-black uppercase leading-relaxed mb-2 border-b-[2px] border-[#111111] pb-2">Conexão Sheets</p>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 border-[2px] border-[#111111] block ${API_URL ? 'bg-[#007D8A]' : 'bg-[#EAA221]'}`}></span>
              <span className="text-[9px] text-[#111111] font-black uppercase">{API_URL ? 'Online / Sincronizado' : 'Modo Demonstração'}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative z-0">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#Fdfcf0] z-10 gap-6">
            {/* NOVO SPINNER 3 CORES */}
            <div className="w-20 h-20 rounded-full border-[8px] border-t-[#C1272D] border-r-[#EAA221] border-b-[#007D8A] border-l-transparent animate-spin"></div>
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="font-black uppercase tracking-widest text-[#111111] text-lg bg-[#ffffff] px-4 py-2 border-[4px] border-[#111111]">Carregando Dados...</div>
              <p className="text-[10px] font-black uppercase text-[#111111] tracking-wider opacity-80">Isto pode levar alguns instantes, aguarde.</p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto h-full animate-fade-in">
            {renderGlobalFilters()}
            {activeTab === 'list' && renderList()}
            {activeTab === 'dashboard' && renderDashboard()}
          </div>
        )}
      </main>

      {/* CLIQUE FORA PARA FECHAR O MODAL - onClick na área escura */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex justify-end animate-fade-in" onClick={() => setSelectedEvent(null)}>
          <div className="bg-[#Fdfcf0] w-full max-w-lg h-full border-l-[6px] border-[#111111] flex flex-col overflow-y-auto shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.3)]" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 bg-[#ffffff] border-b-[4px] border-[#111111] sticky top-0 z-10 flex justify-between items-start">
              <div>
                <span className="bg-[#111111] text-[#Fdfcf0] text-[9px] font-black uppercase px-2 py-1 border-[2px] border-[#111111]">{selectedEvent['Classe de Atividade']}</span>
                <h2 className="text-xl font-black text-[#111111] leading-tight uppercase mt-3">{selectedEvent['Título']}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 bg-[#C1272D] text-[#Fdfcf0] border-[3px] border-[#111111] hover:bg-[#8B1C20] shadow-[3px_3px_0px_0px_#111111]">X</button>
            </div>
            <div className="p-6 space-y-6">
              
              <div className="flex flex-col md:flex-row gap-4">
                <select 
                  value={selectedEvent['STATUS'] || 'Pendente'} 
                  onChange={(e) => handleUpdateStatus(selectedEvent.id, e.target.value)} 
                  className={`flex-1 border-[4px] border-[#111111] font-black text-sm uppercase p-3 shadow-[4px_4px_0px_0px_#111111] outline-none cursor-pointer appearance-none text-center ${(selectedEvent['STATUS'] === 'Confirmado') ? 'bg-[#007D8A] text-[#Fdfcf0]' : (selectedEvent['STATUS'] === 'Realizado') ? 'bg-[#EAA221] text-[#111111]' : 'bg-[#Fdfcf0] text-[#111111]'}`}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Realizado">Realizado</option>
                </select>

                <select 
                  value={(selectedEvent['Prioridade'] === '1' ? 'Alta' : selectedEvent['Prioridade'] === '2' ? 'Média' : selectedEvent['Prioridade'] === '3' ? 'Baixa' : selectedEvent['Prioridade']) || 'Nenhuma'} 
                  onChange={(e) => handleUpdatePriority(selectedEvent.id, e.target.value)} 
                  className={`flex-1 border-[4px] border-[#111111] font-black text-sm uppercase p-3 shadow-[4px_4px_0px_0px_#111111] outline-none cursor-pointer appearance-none text-center ${
                    (selectedEvent['Prioridade'] === 'Alta' || selectedEvent['Prioridade'] === '1') ? 'bg-[#C1272D] text-[#Fdfcf0]' : 
                    (selectedEvent['Prioridade'] === 'Média' || selectedEvent['Prioridade'] === '2') ? 'bg-[#EAA221] text-[#111111]' : 
                    (selectedEvent['Prioridade'] === 'Baixa' || selectedEvent['Prioridade'] === '3') ? 'bg-[#007D8A] text-[#Fdfcf0]' : 'bg-[#Fdfcf0] text-[#111111]'}`}
                >
                  <option value="Nenhuma">S/ Prioridade</option>
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>

              <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] space-y-4 text-[#111111]">
                <div><label className="text-[9px] uppercase font-black text-[#007D8A] block">Município / Região (Floripa)</label>
                <p className="text-sm font-bold uppercase">{selectedEvent['Município']} {normalizerFilter(selectedEvent['Município']).includes('florianopolis') ? `/ ${selectedEvent['Região Floripa']}` : ''}</p></div>
                
                {selectedEvent['Articulador'] && selectedEvent['Articulador'].trim() !== '' && (
                  <div>
                    <label className="text-[9px] uppercase font-black text-[#EAA221] block">Articulador</label>
                    <p className="text-sm font-bold uppercase">{selectedEvent['Articulador']}</p>
                  </div>
                )}

                <div><label className="text-[9px] uppercase font-black text-[#C1272D] block">Local Físico</label>
                <p className="text-sm font-bold uppercase">{selectedEvent['Local']}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #Fdfcf0; border-left: 2px solid #111111; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #111111; }
        .leaflet-container { background: #Fdfcf0 !important; font-family: inherit !important; z-index: 0 !important;}
        .custom-leaflet-tooltip { border: 3px solid #111111 !important; border-radius: 0 !important; background: #ffffff !important; color: #111111 !important; box-shadow: 4px 4px 0px 0px #111111 !important; padding: 8px 12px !important; white-space: nowrap !important; }
        .custom-leaflet-tooltip::before { display: none !important; }
      `}} />
    </div>
  );
}
