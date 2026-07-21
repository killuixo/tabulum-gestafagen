import React, { useState, useEffect, useMemo, useRef } from 'react';

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

const FLORIPA_POLYGONS = {
  'Norte da Ilha': [[-27.39, -48.41], [-27.41, -48.37], [-27.44, -48.38], [-27.48, -48.40], [-27.49, -48.45], [-27.48, -48.50], [-27.45, -48.53], [-27.42, -48.50]],
  'Leste da Ilha': [[-27.48, -48.40], [-27.53, -48.42], [-27.57, -48.43], [-27.62, -48.48], [-27.60, -48.50], [-27.55, -48.47], [-27.49, -48.45]],
  'Centro': [[-27.49, -48.45], [-27.55, -48.47], [-27.60, -48.50], [-27.62, -48.53], [-27.60, -48.56], [-27.55, -48.55], [-27.51, -48.52], [-27.48, -48.50]],
  'Sul da Ilha': [[-27.62, -48.48], [-27.68, -48.49], [-27.74, -48.51], [-27.78, -48.55], [-27.72, -48.57], [-27.65, -48.56], [-27.62, -48.53], [-27.60, -48.50]],
  'Continente': [[-27.57, -48.57], [-27.59, -48.56], [-27.61, -48.57], [-27.62, -48.59], [-27.60, -48.61], [-27.57, -48.60]]
};

const MOCK_DATA = [
  { id: 2, 'Título': 'Sessão Plenária ALESC', 'Início': new Date(Date.now() + 7200000).toISOString(), 'Fim': new Date(Date.now() + 14400000).toISOString(), 'Descrição': 'Votação ambiental.', 'Duração': 120, 'Local': 'ALESC - Florianópolis', 'Classe de Atividade': 'Sessão Legislativa', 'Município': 'Florianópolis', 'Articulador': 'João Silva', 'STATUS': 'Confirmado' },
  { id: 3, 'Título': 'Reunião Associação', 'Início': new Date(Date.now() + 86400000).toISOString(), 'Fim': new Date(Date.now() + 93600000).toISOString(), 'Descrição': 'Saneamento.', 'Duração': 120, 'Local': 'Campeche, Florianópolis', 'Classe de Atividade': 'Comunidade', 'Município': 'Florianópolis', 'Articulador': 'Maria Costa', 'STATUS': 'Pendente' },
  { id: 4, 'Título': 'Aniversário Filho', 'Início': new Date(Date.now() + 172800000).toISOString(), 'Fim': new Date(Date.now() + 182800000).toISOString(), 'Descrição': 'Privado.', 'Duração': 120, 'Local': 'Casa', 'Classe de Atividade': 'Pessoal (Família)', 'Município': 'Florianópolis', 'Articulador': 'Marquito', 'STATUS': 'Confirmado' },
];

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
};

const isFuture = (dateString) => new Date(dateString) >= new Date();
const isPast = (dateString) => new Date(dateString) < new Date();
const normalizerFilter = (str) => {
  if (!str) return '';
  return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const toProperCase = (str) => {
  if (!str || typeof str !== 'string') return str;
  return str.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const FLORIPA_GEO = [
  { k: 'centro', b: 'Centro', d: 'Sede', r: 'Centro' },
  { k: 'alesc', b: 'Centro', d: 'Sede', r: 'Centro' },
  { k: 'osni regis', b: 'Centro', d: 'Sede', r: 'Centro' },
  { k: 'alfandega', b: 'Centro', d: 'Sede', r: 'Centro' },
  { k: 'ufsc', b: 'Trindade', d: 'Sede', r: 'Centro' },
  { k: 'udesc', b: 'Itacorubi', d: 'Sede', r: 'Centro' },
  { k: 'agronomica', b: 'Agronômica', d: 'Sede', r: 'Centro' },
  { k: 'trindade', b: 'Trindade', d: 'Sede', r: 'Centro' },
  { k: 'carvoeira', b: 'Carvoeira', d: 'Sede', r: 'Centro' },
  { k: 'saco dos limoes', b: 'Saco dos Limões', d: 'Sede', r: 'Centro' },
  { k: 'pantanal', b: 'Pantanal', d: 'Sede', r: 'Centro' },
  { k: 'itacorubi', b: 'Itacorubi', d: 'Sede', r: 'Centro' },
  { k: 'santa monica', b: 'Santa Mônica', d: 'Sede', r: 'Centro' },
  { k: 'corrego grande', b: 'Córrego Grande', d: 'Sede', r: 'Centro' },
  { k: 'joao paulo', b: 'João Paulo', d: 'Sede', r: 'Centro' },
  { k: 'saco grande', b: 'Saco Grande', d: 'Sede', r: 'Centro' },
  { k: 'monte verde', b: 'Monte Verde', d: 'Sede', r: 'Centro' },
  { k: 'costeira', b: 'Costeira do Pirajubaé', d: 'Sede', r: 'Centro' },
  { k: 'jose mendes', b: 'José Mendes', d: 'Sede', r: 'Centro' },
  { k: 'estreito', b: 'Estreito', d: 'Continente', r: 'Continente' },
  { k: 'coqueiros', b: 'Coqueiros', d: 'Continente', r: 'Continente' },
  { k: 'capoeiras', b: 'Capoeiras', d: 'Continente', r: 'Continente' },
  { k: 'abraao', b: 'Abraão', d: 'Continente', r: 'Continente' },
  { k: 'bom abrigo', b: 'Bom Abrigo', d: 'Continente', r: 'Continente' },
  { k: 'itaguacu', b: 'Itaguaçu', d: 'Continente', r: 'Continente' },
  { k: 'jardim atlantico', b: 'Jardim Atlântico', d: 'Continente', r: 'Continente' },
  { k: 'monte cristo', b: 'Monte Cristo', d: 'Continente', r: 'Continente' },
  { k: 'balneario', b: 'Balneário', d: 'Continente', r: 'Continente' },
  { k: 'lagoa da conceicao', b: 'Lagoa da Conceição', d: 'Lagoa da Conceição', r: 'Leste da Ilha' },
  { k: 'barra da lagoa', b: 'Barra da Lagoa', d: 'Barra da Lagoa', r: 'Leste da Ilha' },
  { k: 'rio vermelho', b: 'Rio Vermelho', d: 'São João do Rio Vermelho', r: 'Leste da Ilha' },
  { k: 'costa da lagoa', b: 'Costa da Lagoa', d: 'Lagoa da Conceição', r: 'Leste da Ilha' },
  { k: 'mocambique', b: 'Moçambique', d: 'São João do Rio Vermelho', r: 'Leste da Ilha' },
  { k: 'canasvieiras', b: 'Canasvieiras', d: 'Canasvieiras', r: 'Norte da Ilha' },
  { k: 'ingleses', b: 'Ingleses', d: 'Ingleses do Rio Vermelho', r: 'Norte da Ilha' },
  { k: 'jurere', b: 'Jurerê', d: 'Jurerê', r: 'Norte da Ilha' },
  { k: 'santo antonio', b: 'Santo Antônio de Lisboa', d: 'Santo Antônio de Lisboa', r: 'Norte da Ilha' },
  { k: 'sambaqui', b: 'Sambaqui', d: 'Santo Antônio de Lisboa', r: 'Norte da Ilha' },
  { k: 'cacupe', b: 'Cacupé', d: 'Santo Antônio de Lisboa', r: 'Norte da Ilha' },
  { k: 'ratones', b: 'Ratones', d: 'Ratones', r: 'Norte da Ilha' },
  { k: 'vargem pequena', b: 'Vargem Pequena', d: 'Canasvieiras', r: 'Norte da Ilha' },
  { k: 'vargem grande', b: 'Vargem Grande', d: 'Canasvieiras', r: 'Norte da Ilha' },
  { k: 'vargem', b: 'Vargem', d: 'Canasvieiras', r: 'Norte da Ilha' },
  { k: 'ponta das canas', b: 'Ponta das Canas', d: 'Cachoeira do Bom Jesus', r: 'Norte da Ilha' },
  { k: 'cachoeira', b: 'Cachoeira do Bom Jesus', d: 'Cachoeira do Bom Jesus', r: 'Norte da Ilha' },
  { k: 'praia brava', b: 'Praia Brava', d: 'Cachoeira do Bom Jesus', r: 'Norte da Ilha' },
  { k: 'daniela', b: 'Daniela', d: 'Jurerê', r: 'Norte da Ilha' },
  { k: 'campeche', b: 'Campeche', d: 'Campeche', r: 'Sul da Ilha' },
  { k: 'ribeirao', b: 'Ribeirão da Ilha', d: 'Ribeirão da Ilha', r: 'Sul da Ilha' },
  { k: 'tapera', b: 'Tapera', d: 'Ribeirão da Ilha', r: 'Sul da Ilha' },
  { k: 'armacao', b: 'Armação', d: 'Pântano do Sul', r: 'Sul da Ilha' },
  { k: 'pantano', b: 'Pântano do Sul', d: 'Pântano do Sul', r: 'Sul da Ilha' },
  { k: 'morro das pedras', b: 'Morro das Pedras', d: 'Campeche', r: 'Sul da Ilha' },
  { k: 'carianos', b: 'Carianos', d: 'Sede', r: 'Sul da Ilha' },
  { k: 'caieira', b: 'Caieira', d: 'Ribeirão da Ilha', r: 'Sul da Ilha' },
  { k: 'solidao', b: 'Solidão', d: 'Pântano do Sul', r: 'Sul da Ilha' },
  { k: 'naufragados', b: 'Naufragados', d: 'Ribeirão da Ilha', r: 'Sul da Ilha' }
];

const enrichFloripaLocation = (evento) => {
  const textToSearch = [evento['Local'] || '', evento['Título'] || '', evento['Descrição'] || ''].join(' ').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (let geo of FLORIPA_GEO) {
    if (textToSearch.includes(geo.k)) {
      return { bairro: geo.b, distrito: geo.d, regiao: geo.r };
    }
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
      if (normK === 'classe' || normK.includes('atividade')) newItem['Classe de Atividade'] = toProperCase(item[k]);
      if (normK === 'municipio') newItem['Município'] = toProperCase(item[k]);
      if (normK === 'regiao') newItem['Região'] = item[k];
      if (normK.includes('articulador') || normK.includes('responsavel')) newItem['Articulador'] = toProperCase(item[k]);
      if (normK === 'status') newItem['STATUS'] = item[k];
    });

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
      {data.length === 0 ? (
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
            {data.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[9px] font-black text-[#111111] bg-[#Fdfcf0] border-[2px] border-[#111111] px-1.5 py-0.5 shadow-[2px_2px_0px_0px_#111111] uppercase">
                <span className="w-2.5 h-2.5 border-[2px] border-[#111111] block" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}></span>
                {item.name} ({(item.value / total * 100).toFixed(0)}%)
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const ChoroplethMap = ({ data, title, isFloripa }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);

  const getMapColor = (value, maxVal) => {
    if (!value || value === 0) return 'transparent';
    const intensity = value / maxVal;
    if (intensity > 0.6) return COLORS.crimson;
    if (intensity > 0.3) return COLORS.mustard;
    return COLORS.teal;
  };

  useEffect(() => {
    let isMounted = true;
    let loadingTimer;

    const initMap = async () => {
      if (!mapRef.current || !window.L || !isMounted) return;
      if (!mapInstanceRef.current) {
        const mapCenter = isFloripa ? [-27.55, -48.50] : [-27.2730, -50.4906];
        const mapZoom = isFloripa ? 10 : 6;
        mapInstanceRef.current = window.L.map(mapRef.current, { scrollWheelZoom: false }).setView(mapCenter, mapZoom);
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap' }).addTo(mapInstanceRef.current);
      }
      const map = mapInstanceRef.current;
      const maxVal = Math.max(...data.map(d => d.value), 1);

      if (geoJsonLayerRef.current) map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = window.L.layerGroup().addTo(map);

      if (!isFloripa) {
        try {
          const res = await fetch('https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-42-mun.json');
          const geoData = await res.json();
          if (!isMounted) return;
          const geoLayer = window.L.geoJSON(geoData, {
            style: (feature) => {
              const munName = normalizerFilter(feature.properties.name);
              const found = data.find(d => normalizerFilter(d.name) === munName);
              const val = found ? found.value : 0;
              return { fillColor: getMapColor(val, maxVal), weight: val > 0 ? 2 : 1, opacity: 1, color: val > 0 ? COLORS.black : '#cccccc', fillOpacity: val > 0 ? 0.9 : 0.1 };
            },
            onEachFeature: (feature, layer) => {
              const munName = normalizerFilter(feature.properties.name);
              const found = data.find(d => normalizerFilter(d.name) === munName);
              if (found) {
                layer.bindTooltip(`
                  <div style="font-family: inherit; font-weight: 900; text-transform: uppercase; font-size: 10px; color: #111111;">
                    ${feature.properties.name}: <span style="color: #C1272D; font-size: 12px;">${found.value}</span> Agendas
                  </div>
                `, { direction: 'top', className: 'custom-leaflet-tooltip' });
              }
            }
          });
          geoJsonLayerRef.current.addLayer(geoLayer);
        } catch (e) { console.error("Erro ao carregar GeoJSON", e); }
      } else {
        data.forEach(item => {
          const polygonCoords = FLORIPA_POLYGONS[item.name];
          if (polygonCoords) {
            const polygon = window.L.polygon(polygonCoords, { fillColor: getMapColor(item.value, maxVal), weight: 3, color: COLORS.black, fillOpacity: 0.9 });
            polygon.bindTooltip(`
              <div style="font-family: inherit; font-weight: 900; text-transform: uppercase; font-size: 10px; color: #111111;">
                ${item.name}: <span style="color: #C1272D; font-size: 12px;">${item.value}</span> Agendas
              </div>
            `, { direction: 'center', className: 'custom-leaflet-tooltip' });
            geoJsonLayerRef.current.addLayer(polygon);
          }
        });
      }
    };

    if (!window.L) {
      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link');
        css.id = 'leaflet-css';
        css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      if (!document.getElementById('leaflet-script')) {
        const script = document.createElement('script');
        script.id = 'leaflet-script';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(script);
      }
      
      const checkAndInit = () => {
        if (window.L) {
           if (isMounted) initMap();
        } else {
           loadingTimer = setTimeout(checkAndInit, 100);
        }
      };
      checkAndInit();
    } else {
      initMap();
    }

    return () => { 
      isMounted = false; 
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [data, isFloripa]);

  return (
    <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col h-full relative">
      <h3 className="text-[12px] font-black text-[#111111] mb-2 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2">{title}</h3>
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#007D8A] border-2 border-[#111111]"></span><span className="text-[8px] font-black uppercase text-[#111111]">Baixa</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#EAA221] border-2 border-[#111111]"></span><span className="text-[8px] font-black uppercase text-[#111111]">Média</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-[#C1272D] border-2 border-[#111111]"></span><span className="text-[8px] font-black uppercase text-[#111111]">Alta</span></div>
      </div>
      <div className="w-full h-96 border-[3px] border-[#111111] relative z-0 bg-[#Fdfcf0]">
        {data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-[#111111] opacity-50 uppercase z-10 bg-[#Fdfcf0]">Sem agendas na região</div>
        ) : (
          <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 0 }}></div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('list');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [locationScope, setLocationScope] = useState('all'); 
  const [showPessoal, setShowPessoal] = useState(false); 
  
  const [selectedMunicipios, setSelectedMunicipios] = useState([]);
  const [selectedArticuladores, setSelectedArticuladores] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  
  const [viewMode, setViewMode] = useState('cards');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'Início', direction: 'desc' });

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
      if (timeFilter === 'future' && !isFuture(ev['Início'])) return false;
      if (timeFilter === 'past' && !isPast(ev['Início'])) return false;
      
      const isPessoal = ev['Classe de Atividade'] && normalizerFilter(ev['Classe de Atividade']).includes('pessoal');
      if (!showPessoal && isPessoal) return false;

      if (selectedMunicipios.length > 0 && !selectedMunicipios.includes(ev['Município'])) return false;
      if (selectedArticuladores.length > 0 && !selectedArticuladores.includes(ev['Articulador'])) return false;
      if (selectedClasses.length > 0 && !selectedClasses.includes(ev['Classe de Atividade'])) return false;
      
      const isFloripa = normalizerFilter(ev['Município']).includes('florianopolis') || normalizerFilter(ev['Município']).includes('floripa');
      if (locationScope === 'capital' && !isFloripa) return false;
      if (locationScope === 'interior' && isFloripa) return false;

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
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = aVal.toString().toLowerCase();
        bVal = bVal.toString().toLowerCase();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [events, search, timeFilter, selectedMunicipios, selectedArticuladores, selectedClasses, locationScope, sortConfig, showPessoal]);

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

    let pastCount = 0; let futureCount = 0;
    filteredEvents.forEach(ev => isPast(ev['Início']) ? pastCount++ : futureCount++);
    const temporalStats = [
      { name: 'Realizadas (Passado)', value: pastCount },
      { name: 'Futuras (Acontecerão)', value: futureCount }
    ].filter(s => s.value > 0);

    const scHeatmap = agg('Município');
    const floripaHeatmapMap = {};
    
    filteredEvents.forEach(ev => {
      if (normalizerFilter(ev['Município']).includes('florianopolis') || normalizerFilter(ev['Município']).includes('floripa')) {
        const reg = ev['Região Floripa'] || 'Centro';
        floripaHeatmapMap[reg] = (floripaHeatmapMap[reg] || 0) + 1;
      }
    });
    const floripaHeatmap = Object.entries(floripaHeatmapMap).map(([name, value]) => ({ name, value }));

    return { classes: agg('Classe de Atividade'), articuladores: agg('Articulador'), temporalStats, scHeatmap, floripaHeatmap };
  }, [filteredEvents]);

  const renderGlobalFilters = () => (
    <div className="bg-[#ffffff] border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] p-4 mb-8 flex flex-col gap-4 relative z-10 w-full">
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <button onClick={() => setLocationScope('all')} className={`flex-1 py-3 px-4 text-[11px] font-black uppercase border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] transition-transform hover:-translate-y-1 ${locationScope === 'all' ? 'bg-[#111111] text-[#Fdfcf0]' : 'bg-[#Fdfcf0] text-[#111111]'}`}>GERAL (SC + CAPITAL)</button>
        <button onClick={() => setLocationScope('capital')} className={`flex-1 py-3 px-4 text-[11px] font-black uppercase border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] transition-transform hover:-translate-y-1 ${locationScope === 'capital' ? 'bg-[#007D8A] text-[#Fdfcf0]' : 'bg-[#Fdfcf0] text-[#111111]'}`}>SOMENTE CAPITAL</button>
        <button onClick={() => setLocationScope('interior')} className={`flex-1 py-3 px-4 text-[11px] font-black uppercase border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] transition-transform hover:-translate-y-1 ${locationScope === 'interior' ? 'bg-[#C1272D] text-[#Fdfcf0]' : 'bg-[#Fdfcf0] text-[#111111]'}`}>SOMENTE INTERIOR</button>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 justify-between">
        <input 
          type="text" placeholder="BUSCAR POR TÍTULO OU LOCAL..." 
          className="flex-1 px-4 py-2 bg-[#Fdfcf0] border-[3px] border-[#111111] focus:outline-none focus:border-[#C1272D] font-black text-[10px] uppercase shadow-[4px_4px_0px_0px_#111111] text-[#111111] placeholder-[#111111]"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 bg-[#111111] p-1 border-[3px] border-[#111111] flex-wrap">
          <button onClick={() => setTimeFilter('all')} className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 ${timeFilter === 'all' ? 'bg-[#Fdfcf0] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`}>Tudo</button>
          <button onClick={() => setTimeFilter('future')} className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 ${timeFilter === 'future' ? 'bg-[#Fdfcf0] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`}>Futuras</button>
          <button onClick={() => setTimeFilter('past')} className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 ${timeFilter === 'past' ? 'bg-[#Fdfcf0] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`}>Realizadas</button>
          
          <div className="w-px h-auto bg-[#333333] mx-1"></div>
          
          <button onClick={() => setShowPessoal(!showPessoal)} className={`px-3 py-1.5 text-[9px] font-black uppercase border-2 flex items-center gap-2 ${showPessoal ? 'bg-[#EAA221] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`} title="Alternar visibilidade de agendas pessoais">
             <div className={`w-2.5 h-2.5 border-[2px] border-[#111111] flex-shrink-0 ${showPessoal ? 'bg-[#111111]' : 'bg-[#Fdfcf0]'}`}></div>
             PESSOAL
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 w-full">
        <MultiSelect options={filterOptions.municipios} selected={selectedMunicipios} onChange={setSelectedMunicipios} placeholder="TODOS MUNICÍPIOS" />
        <MultiSelect options={filterOptions.articuladores} selected={selectedArticuladores} onChange={setSelectedArticuladores} placeholder="TODOS ARTICULADORES" />
        <MultiSelect options={filterOptions.classes} selected={selectedClasses} onChange={setSelectedClasses} placeholder="TODAS CLASSES" />
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center border-[4px] border-[#111111] bg-[#ffffff] p-4 shadow-[6px_6px_0px_0px_#111111]">
        <h2 className="text-xl font-black text-[#111111] tracking-tighter uppercase">Visão Geral (Filtrada)</h2>
        <span className="text-[12px] font-black px-4 py-2 bg-[#111111] text-[#Fdfcf0] border-[3px] border-[#111111] mt-2 md:mt-0">
          TOTAL EXIBIDO: {filteredEvents.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1"><SimpleBarChart data={dashboardStats.classes} title="Classes de Atividade" /></div>
        <div className="lg:col-span-1"><SimplePieChart data={dashboardStats.articuladores} title="Articuladores" /></div>
        <div className="lg:col-span-1"><SimplePieChart data={dashboardStats.temporalStats} title="Evolução Temporal" /></div>
      </div>
      <div className="grid grid-cols-1 gap-8 mt-8">
        <ChoroplethMap data={dashboardStats.scHeatmap} title="Calor Geográfico - Santa Catarina" isFloripa={false} />
        <ChoroplethMap data={dashboardStats.floripaHeatmap} title="Calor Geográfico - Florianópolis" isFloripa={true} />
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-6 pb-10 relative z-0">
      <div className="flex justify-end">
        <div className="flex bg-[#111111] p-1 border-[3px] border-[#111111]">
          <button onClick={() => setViewMode('cards')} className={`px-4 py-1.5 text-[10px] font-black uppercase transition-colors border-2 ${viewMode === 'cards' ? 'bg-[#Fdfcf0] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`}>Cards</button>
          <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 text-[10px] font-black uppercase transition-colors border-2 ${viewMode === 'table' ? 'bg-[#Fdfcf0] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent hover:bg-[#333333]'}`}>Lista</button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 font-black text-xl text-[#111111] opacity-50 bg-[#ffffff] border-[4px] border-[#111111] border-dashed">NENHUM RESULTADO</div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((ev, i) => (
                <div key={i} onClick={() => setSelectedEvent(ev)} className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] hover:shadow-[10px_10px_0px_0px_#111111] hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full relative">
                  <div className="absolute top-0 right-0 w-8 h-8 border-l-[4px] border-b-[4px] border-[#111111]" style={{ backgroundColor: isFuture(ev['Início']) ? COLORS.teal : '#cccccc' }}></div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#Fdfcf0] bg-[#111111] px-2 py-1 border-[2px] border-[#111111] self-start mb-3">{ev['Classe de Atividade'] || 'S/ CLASSE'}</span>
                  <h3 className="font-black text-lg text-[#111111] leading-tight mb-4 uppercase line-clamp-3">{ev['Título']}</h3>
                  <div className="mt-auto space-y-2 border-t-[3px] border-[#111111] pt-3">
                    <p className="text-[10px] font-black text-[#111111] uppercase flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#007D8A] border-2 border-[#111111] block flex-shrink-0"></span> {formatDate(ev['Início'])}</p>
                    <p className="text-[10px] font-black text-[#C1272D] uppercase truncate flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#C1272D] border-2 border-[#111111] block flex-shrink-0"></span> {ev['Município']}</p>
                    <p className="text-[10px] font-black text-[#EAA221] uppercase truncate flex items-center gap-2"><span className="w-2.5 h-2.5 bg-[#EAA221] border-2 border-[#111111] block flex-shrink-0"></span> {ev['Articulador']}</p>
                  </div>
                  <div className="absolute bottom-3 right-3 border-[3px] border-[#111111] px-2 py-1 text-[9px] font-black uppercase bg-[#ffffff]">{ev['STATUS'] || 'Pendente'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#ffffff] border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-[#Fdfcf0] uppercase bg-[#111111]">
                  <tr>
                    <th onClick={() => requestSort('Título')} className="px-4 py-3 font-black border-b-[3px] border-[#Fdfcf0] cursor-pointer hover:bg-[#333333] transition-colors select-none">Título{getSortIndicator('Título')}</th>
                    <th onClick={() => requestSort('Início')} className="px-4 py-3 font-black border-b-[3px] border-[#Fdfcf0] cursor-pointer hover:bg-[#333333] transition-colors select-none">Data{getSortIndicator('Início')}</th>
                    {locationScope === 'capital' ? (
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
                  {filteredEvents.map((ev, i) => (
                    <tr key={i} onClick={() => setSelectedEvent(ev)} className="border-b-[3px] border-[#111111] hover:bg-[#Fdfcf0] cursor-pointer">
                      <td className="px-4 py-3 text-[11px] font-black uppercase max-w-[200px] truncate text-[#111111]" title={ev['Título']}>{ev['Título']}</td>
                      <td className="px-4 py-3 text-[10px] font-bold text-[#111111]">{formatDate(ev['Início'])}</td>
                      {locationScope === 'capital' ? (
                        <>
                          <td className="px-4 py-3 text-[10px] font-bold text-[#C1272D] truncate max-w-[120px]">{ev['Bairro']}</td>
                          <td className="px-4 py-3 text-[10px] font-bold text-[#007D8A] truncate max-w-[120px]">{ev['Distrito']}</td>
                          <td className="px-4 py-3 text-[10px] font-bold text-[#111111] truncate max-w-[120px]">{ev['Região Floripa']}</td>
                        </>
                      ) : (
                        <td className="px-4 py-3 text-[10px] font-bold text-[#C1272D] truncate max-w-[150px]">{ev['Município']}</td>
                      )}
                      <td className="px-4 py-3 text-[10px] font-bold text-[#EAA221]">{ev['Articulador']}</td>
                    </tr>
                  ))}
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
        <div className="p-6 border-b-[4px] border-[#Fdfcf0] bg-[#C1272D]">
          <h1 className="text-3xl font-black tracking-tighter text-[#Fdfcf0] border-b-[4px] border-[#Fdfcf0] pb-2 inline-block">TABULUM</h1>
          <p className="text-[9px] text-[#Fdfcf0] font-black uppercase tracking-widest mt-2 bg-[#111111] px-2 py-1 inline-block border-[2px] border-[#Fdfcf0]">GesTaAg • Marquito</p>
        </div>
        <div className="flex flex-row md:flex-col p-4 gap-4 overflow-x-auto">
          <button onClick={() => setActiveTab('list')} className={`flex items-center gap-3 px-4 py-3 border-[3px] border-[#Fdfcf0] text-[11px] font-black uppercase transition-all shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 ${activeTab === 'list' ? 'bg-[#EAA221] text-[#111111] border-[#111111] shadow-[4px_4px_0px_0px_#EAA221]' : 'bg-[#111111] hover:bg-[#Fdfcf0] hover:text-[#111111]'}`}><span className="w-2.5 h-2.5 bg-[#Fdfcf0] border-[2px] border-[#111111] block" style={{backgroundColor: activeTab==='list' ? '#111111' : '#Fdfcf0'}}></span>AGENDAS</button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 border-[3px] border-[#Fdfcf0] text-[11px] font-black uppercase transition-all shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 ${activeTab === 'dashboard' ? 'bg-[#007D8A] text-[#Fdfcf0] border-[#111111] shadow-[4px_4px_0px_0px_#007D8A]' : 'bg-[#111111] hover:bg-[#Fdfcf0] hover:text-[#111111]'}`}><span className="w-2.5 h-2.5 bg-[#Fdfcf0] border-[2px] border-[#111111] block" style={{backgroundColor: activeTab==='dashboard' ? '#111111' : '#Fdfcf0'}}></span>DASHBOARD</button>
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
            <div className="w-16 h-16 bg-[#EAA221] border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] animate-spin"></div>
            <div className="font-black uppercase tracking-widest text-[#111111] text-lg bg-[#ffffff] px-4 py-2 border-[4px] border-[#111111]">Carregando Dados...</div>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto h-full animate-fade-in">
            {renderGlobalFilters()}
            {activeTab === 'list' && renderList()}
            {activeTab === 'dashboard' && renderDashboard()}
          </div>
        )}
      </main>

      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex justify-end animate-fade-in">
          <div className="bg-[#Fdfcf0] w-full max-w-lg h-full border-l-[6px] border-[#111111] flex flex-col overflow-y-auto shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.3)]">
            <div className="p-6 bg-[#ffffff] border-b-[4px] border-[#111111] sticky top-0 z-10 flex justify-between items-start">
              <div>
                <span className="bg-[#111111] text-[#Fdfcf0] text-[9px] font-black uppercase px-2 py-1 border-[2px] border-[#111111]">{selectedEvent['Classe de Atividade']}</span>
                <h2 className="text-xl font-black text-[#111111] leading-tight uppercase mt-3">{selectedEvent['Título']}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 bg-[#C1272D] text-[#Fdfcf0] border-[3px] border-[#111111] hover:bg-[#8B1C20] shadow-[3px_3px_0px_0px_#111111]">X</button>
            </div>
            <div className="p-6 space-y-6">
              <select value={selectedEvent['STATUS'] || 'Pendente'} onChange={(e) => handleUpdateStatus(selectedEvent.id, e.target.value)} className="w-full bg-[#Fdfcf0] border-[4px] border-[#111111] font-black text-[#111111] text-sm uppercase p-3 shadow-[4px_4px_0px_0px_#111111] outline-none">
                <option value="Pendente">Pendente</option><option value="Confirmado">Confirmado</option><option value="Realizado">Realizado</option>
              </select>
              <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] space-y-4 text-[#111111]">
                <div><label className="text-[9px] uppercase font-black text-[#007D8A] block">Município / Região (Floripa)</label>
                <p className="text-sm font-bold uppercase">{selectedEvent['Município']} {normalizerFilter(selectedEvent['Município']).includes('florianopolis') ? `/ ${getFloripaRegion(selectedEvent)}` : ''}</p></div>
                <div><label className="text-[9px] uppercase font-black text-[#EAA221] block">Articulador</label>
                <p className="text-sm font-bold uppercase">{selectedEvent['Articulador']}</p></div>
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
