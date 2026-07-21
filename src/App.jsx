import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// CONFIGURAÇÃO DA API E CORES (MONDRIAN)
// ==========================================
const getApiUrl = () => {
  try { return import.meta.env.VITE_APPS_SCRIPT_URL || ''; } 
  catch (e) { return ''; }
};
const API_URL = getApiUrl(); 

const COLORS = {
  crimson: '#C1272D', crimsonDark: '#8B1C20',
  mustard: '#EAA221', mustardDark: '#B57C14',
  teal: '#007D8A', tealDark: '#00555E',
  black: '#111111', white: '#Fdfcf0', 
};
const CHART_PALETTE = [COLORS.crimson, COLORS.mustard, COLORS.teal, COLORS.crimsonDark, COLORS.mustardDark, COLORS.tealDark];

const MOCK_DATA = [
  { id: 2, 'Título': 'Sessão Plenária ALESC', 'Início': new Date().toISOString(), 'Fim': new Date(Date.now() + 7200000).toISOString(), 'Descrição': 'Votação ambiental.', 'Duração': 120, 'Local': 'Plenário Osni Régis', 'Classe de Atividade': 'Sessão Legislativa', 'Região': 'Centro', 'Município': 'Florianópolis', 'Articulador': 'João Silva', 'STATUS': 'Confirmado' },
  { id: 3, 'Título': 'Reunião Associação', 'Início': new Date(Date.now() + 86400000).toISOString(), 'Fim': new Date(Date.now() + 93600000).toISOString(), 'Descrição': 'Saneamento.', 'Duração': 120, 'Local': 'Sede do Campeche', 'Classe de Atividade': 'Comunidade', 'Região': 'Sul da Ilha', 'Município': 'Florianópolis', 'Articulador': 'Maria Costa', 'STATUS': 'Pendente' },
  { id: 4, 'Título': 'Visita Feira', 'Início': new Date(Date.now() - 172800000).toISOString(), 'Fim': new Date(Date.now() - 165600000).toISOString(), 'Descrição': 'Apoio local.', 'Duração': 120, 'Local': 'Praça Central', 'Classe de Atividade': 'Visita Técnica', 'Região': 'Oeste', 'Município': 'Chapecó', 'Articulador': 'Pedro Alves', 'STATUS': 'Realizado' },
  { id: 5, 'Título': 'Encontro Lages', 'Início': new Date(Date.now() + 3600000).toISOString(), 'Fim': new Date(Date.now() + 7200000).toISOString(), 'Descrição': 'Frio.', 'Duração': 120, 'Local': 'Sindicato', 'Classe de Atividade': 'Reunião', 'Região': 'Serra', 'Município': 'Lages', 'Articulador': 'Marquito', 'STATUS': 'Confirmado' },
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

const normalizeData = (data) => {
  return data.map(item => {
    const newItem = { id: item.id };
    const keys = Object.keys(item);
    keys.forEach(k => { newItem[k] = item[k]; });
    
    // Mapeamento inteligente por nome do cabeçalho (ignora a ordem das colunas)
    keys.forEach(k => {
      if (k === 'id') return;
      const normK = normalizerFilter(k);
      if (normK.includes('titulo')) newItem['Título'] = item[k];
      if (normK.includes('inicio')) newItem['Início'] = item[k];
      if (normK.includes('fim')) newItem['Fim'] = item[k];
      if (normK.includes('descri')) newItem['Descrição'] = item[k];
      if (normK.includes('duracao')) newItem['Duração'] = item[k];
      if (normK.includes('local')) newItem['Local'] = item[k];
      if (normK === 'classe' || normK.includes('atividade')) newItem['Classe de Atividade'] = item[k];
      if (normK === 'regiao') newItem['Região'] = item[k];
      if (normK === 'municipio') newItem['Município'] = item[k];
      if (normK.includes('articulador') || normK.includes('responsavel')) newItem['Articulador'] = item[k];
      if (normK === 'status') newItem['STATUS'] = item[k];
    });

    Object.keys(newItem).forEach(k => {
      if (typeof newItem[k] === 'string' && (newItem[k].includes('#REF!') || newItem[k].includes('#N/A'))) {
        newItem[k] = '';
      }
    });
    return newItem;
  });
};

// ==========================================
// COMPONENTES GRÁFICOS NATIVOS
// ==========================================
const SimpleBarChart = ({ data, title }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-[#Fdfcf0] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col h-full">
      <h3 className="text-[12px] font-black text-[#111111] mb-5 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2">{title}</h3>
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
        {data.length === 0 && <div className="text-[10px] font-black text-gray-400 uppercase text-center py-4">Sem dados válidos</div>}
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] font-black text-[#111111] w-32 uppercase truncate" title={item.name}>{item.name}</span>
            <div className="flex-1 h-5 bg-white border-[2px] border-[#111111] overflow-hidden relative">
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
    <div className="bg-[#Fdfcf0] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col items-center h-full">
      <h3 className="text-[12px] font-black text-[#111111] mb-5 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2 w-full">{title}</h3>
      {data.length === 0 ? (
         <div className="flex-1 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase py-10">Sem dados válidos</div>
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
          <div className="mt-6 w-full flex flex-wrap gap-2 justify-center overflow-y-auto max-h-[100px] custom-scrollbar">
            {data.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[9px] font-black text-[#111111] bg-white border-[2px] border-[#111111] px-1.5 py-0.5 shadow-[2px_2px_0px_0px_#111111] uppercase">
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

// ==========================================
// MAPA NATIVO GEOGRÁFICO (SVG)
// ==========================================
const NativeGeoMap = ({ data, title, isFloripa }) => {
  const scMapCoords = {
    'florianopolis': { x: 78, y: 55 }, 'sao jose': { x: 75, y: 55 }, 'palhoca': { x: 75, y: 58 },
    'joinville': { x: 72, y: 22 }, 'blumenau': { x: 68, y: 40 }, 'itajai': { x: 75, y: 38 },
    'chapeco': { x: 18, y: 48 }, 'lages': { x: 50, y: 62 }, 'criciuma': { x: 68, y: 82 },
    'tubarao': { x: 70, y: 76 }, 'balneario camboriu': { x: 76, y: 42 }, 'joacaba': { x: 35, y: 48 },
    'oeste': { x: 20, y: 48 }, 'meio-oeste': { x: 38, y: 45 }, 'planalto': { x: 50, y: 55 },
    'norte': { x: 68, y: 25 }, 'vale': { x: 68, y: 42 }, 'grande florianopolis': { x: 75, y: 55 },
    'serra': { x: 55, y: 65 }, 'sul': { x: 68, y: 80 }
  };
  const floripaMapCoords = {
    'norte da ilha': { x: 65, y: 25 }, 'centro': { x: 55, y: 55 },
    'continente': { x: 30, y: 55 }, 'leste da ilha': { x: 75, y: 50 }, 'sul da ilha': { x: 60, y: 80 }
  };

  const currentMapCoords = isFloripa ? floripaMapCoords : scMapCoords;
  const maxDensity = Math.max(...data.map(d => d.value), 1);
  const scPolygon = "M 5,45 C 15,35 30,35 45,25 C 50,20 65,15 75,20 C 85,25 90,45 85,60 C 80,75 70,85 60,95 C 45,95 30,85 15,65 C 10,55 5,50 5,45 Z";
  const floripaPolygon = "M 20,40 C 35,35 45,45 40,65 C 30,70 15,65 20,40 Z M 50,15 C 70,25 80,45 75,70 C 70,95 55,90 45,65 C 40,40 45,20 50,15 Z";

  return (
    <div className="bg-[#Fdfcf0] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col h-full">
      <h3 className="text-[12px] font-black text-[#111111] mb-2 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2">{title}</h3>
      <div className="w-full h-48 bg-white border-[3px] border-[#111111] relative overflow-hidden flex items-center justify-center mt-auto">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-2">
          <path d={isFloripa ? floripaPolygon : scPolygon} fill={isFloripa ? "#007D8A" : "#EAA221"} stroke="#111111" strokeWidth="1.5" opacity="0.3" />
        </svg>
        {data.length === 0 && <span className="text-[10px] font-black uppercase text-[#111111] bg-white px-3 py-1 border-[2px] border-[#111111] z-10">Sem agendas aqui</span>}
        {data.map((item, i) => {
          const coord = currentMapCoords[normalizerFilter(item.name)];
          if (!coord) return null;
          const size = 15 + ((item.value / maxDensity) * 35);
          return (
            <div key={i} className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10" style={{ left: `${coord.x}%`, top: `${coord.y}%` }}>
              <div className="rounded-full bg-[#C1272D] border-[3px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] flex items-center justify-center cursor-help transition-transform hover:scale-125" style={{ width: size, height: size }}>
                <span className="text-white font-black text-[9px]">{item.value}</span>
              </div>
              <span className="absolute top-full mt-1 text-[8px] font-black uppercase text-[#111111] bg-white border-[2px] border-[#111111] px-1.5 py-0.5 whitespace-nowrap shadow-[2px_2px_0px_0px_#111111] z-20 hidden group-hover:block">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// APLICATIVO PRINCIPAL
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('list'); 
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FILTROS GLOBAIS (Afetam Lista e Dashboard)
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [municipioFilter, setMunicipioFilter] = useState('all');
  const [regiaoFilter, setRegiaoFilter] = useState('all');
  const [articuladorFilter, setArticuladorFilter] = useState('all');
  const [classeFilter, setClasseFilter] = useState('all');
  
  const [viewMode, setViewMode] = useState('cards');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!API_URL) {
          setEvents(normalizeData(MOCK_DATA));
        } else {
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

  // Extração de opções únicas para os Selects (ignorando vazios)
  const filterOptions = useMemo(() => {
    const getUnique = (key) => [...new Set(events.map(e => e[key]).filter(v => v && v.toString().trim() !== ''))].sort();
    return {
      municipios: getUnique('Município'),
      regioes: getUnique('Região'),
      articuladores: getUnique('Articulador'),
      classes: getUnique('Classe de Atividade')
    };
  }, [events]);

  // Aplicação dos filtros universais
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      if (timeFilter === 'future' && !isFuture(ev['Início'])) return false;
      if (timeFilter === 'past' && !isPast(ev['Início'])) return false;
      if (municipioFilter !== 'all' && ev['Município'] !== municipioFilter) return false;
      if (regiaoFilter !== 'all' && ev['Região'] !== regiaoFilter) return false;
      if (articuladorFilter !== 'all' && ev['Articulador'] !== articuladorFilter) return false;
      if (classeFilter !== 'all' && ev['Classe de Atividade'] !== classeFilter) return false;
      
      if (search) {
        const term = normalizerFilter(search);
        return normalizerFilter(ev['Título']).includes(term) || normalizerFilter(ev['Local']).includes(term);
      }
      return true;
    }).sort((a, b) => new Date(a['Início']) - new Date(b['Início']));
  }, [events, search, timeFilter, municipioFilter, regiaoFilter, articuladorFilter, classeFilter]);

  const dashboardStats = useMemo(() => {
    // A função de agregação agora ignora estritamente 'Outros Eventos' e 'Não definido'
    const agg = (key) => {
      const counts = {};
      filteredEvents.forEach(ev => {
        let val = ev[key];
        if (!val || val.toString().trim() === '') return; // Ignora vazios
        const norm = normalizerFilter(val);
        if (norm === 'outros eventos' || norm === 'nao definido') return; // Bloqueio estrito
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    // Gráfico Temporal (Passado x Futuro)
    let pastCount = 0; let futureCount = 0;
    filteredEvents.forEach(ev => isPast(ev['Início']) ? pastCount++ : futureCount++);
    const temporalStats = [
      { name: 'Realizadas', value: pastCount },
      { name: 'Futuras', value: futureCount }
    ].filter(s => s.value > 0);

    // Heatmap SC lê a Coluna I (Município)
    const scHeatmap = agg('Município');
    
    // Heatmap Floripa lê a Coluna H (Região) apenas onde Município for Floripa
    const floripaHeatmapMap = {};
    filteredEvents.forEach(ev => {
      if (normalizerFilter(ev['Município']).includes('florianopolis') || normalizerFilter(ev['Município']).includes('floripa')) {
        const reg = ev['Região'];
        if (reg && normalizerFilter(reg) !== 'nao definido') {
          floripaHeatmapMap[reg] = (floripaHeatmapMap[reg] || 0) + 1;
        }
      }
    });
    const floripaHeatmap = Object.entries(floripaHeatmapMap).map(([name, value]) => ({ name, value }));

    return { 
      classes: agg('Classe de Atividade'), 
      articuladores: agg('Articulador'), 
      locais: agg('Local'),
      temporalStats,
      scHeatmap, 
      floripaHeatmap 
    };
  }, [filteredEvents]);

  const renderGlobalFilters = () => (
    <div className="bg-[#Fdfcf0] border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] p-4 mb-8 flex flex-col gap-4 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <input 
          type="text" placeholder="BUSCAR POR TÍTULO OU LOCAL..." 
          className="flex-1 px-4 py-2 bg-white border-[3px] border-[#111111] focus:outline-none focus:border-[#C1272D] font-black text-[10px] uppercase shadow-[4px_4px_0px_0px_#111111]"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex gap-2 bg-[#111111] p-1 border-[3px] border-[#111111] self-start md:self-auto">
          <button onClick={() => setTimeFilter('all')} className={`px-3 py-1.5 text-[9px] font-black uppercase ${timeFilter === 'all' ? 'bg-white text-[#111111]' : 'text-white hover:bg-gray-800'}`}>Tudo</button>
          <button onClick={() => setTimeFilter('future')} className={`px-3 py-1.5 text-[9px] font-black uppercase ${timeFilter === 'future' ? 'bg-white text-[#111111]' : 'text-white hover:bg-gray-800'}`}>Futuras</button>
          <button onClick={() => setTimeFilter('past')} className={`px-3 py-1.5 text-[9px] font-black uppercase ${timeFilter === 'past' ? 'bg-white text-[#111111]' : 'text-white hover:bg-gray-800'}`}>Realizadas</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <select value={municipioFilter} onChange={(e) => setMunicipioFilter(e.target.value)} className="bg-white border-[3px] border-[#111111] font-black text-[9px] uppercase px-2 py-2 focus:outline-none shadow-[4px_4px_0px_0px_#111111]">
          <option value="all">TODOS MUNICÍPIOS (Col I)</option>
          {filterOptions.municipios.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={regiaoFilter} onChange={(e) => setRegiaoFilter(e.target.value)} className="bg-white border-[3px] border-[#111111] font-black text-[9px] uppercase px-2 py-2 focus:outline-none shadow-[4px_4px_0px_0px_#111111]">
          <option value="all">TODAS AS REGIÕES</option>
          {filterOptions.regioes.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={articuladorFilter} onChange={(e) => setArticuladorFilter(e.target.value)} className="bg-white border-[3px] border-[#111111] font-black text-[9px] uppercase px-2 py-2 focus:outline-none shadow-[4px_4px_0px_0px_#111111]">
          <option value="all">TODOS ARTICULADORES (Col H)</option>
          {filterOptions.articuladores.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <select value={classeFilter} onChange={(e) => setClasseFilter(e.target.value)} className="bg-white border-[3px] border-[#111111] font-black text-[9px] uppercase px-2 py-2 focus:outline-none shadow-[4px_4px_0px_0px_#111111]">
          <option value="all">TODAS CLASSES</option>
          {filterOptions.classes.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center border-[4px] border-[#111111] bg-white p-4 shadow-[6px_6px_0px_0px_#111111]">
        <h2 className="text-xl font-black text-[#111111] tracking-tighter uppercase">Visão Geral (Filtrada)</h2>
        <span className="text-[12px] font-black px-4 py-2 bg-[#111111] text-white border-[3px] border-[#111111] mt-2 md:mt-0">
          AGENDA TOTAL NA TELA: {filteredEvents.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2"><SimpleBarChart data={dashboardStats.classes} title="Classes de Atividade" /></div>
        <div className="lg:col-span-1"><SimplePieChart data={dashboardStats.articuladores} title="Articuladores" /></div>
        <div className="lg:col-span-1"><SimplePieChart data={dashboardStats.temporalStats} title="Tempo: Futuras vs Passadas" /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <SimplePieChart data={dashboardStats.locais.slice(0,10)} title="Top 10 Locais Físicos (Col F)" />
        <NativeGeoMap data={dashboardStats.scHeatmap} title="Geografia - Santa Catarina" isFloripa={false} />
        <NativeGeoMap data={dashboardStats.floripaHeatmap} title="Geografia - Florianópolis" isFloripa={true} />
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-end">
        <div className="flex bg-[#111111] p-1 border-[3px] border-[#111111]">
          <button onClick={() => setViewMode('cards')} className={`px-4 py-1.5 text-[10px] font-black uppercase transition-colors ${viewMode === 'cards' ? 'bg-white text-[#111111]' : 'text-white hover:bg-gray-800'}`}>Cards</button>
          <button onClick={() => setViewMode('table')} className={`px-4 py-1.5 text-[10px] font-black uppercase transition-colors ${viewMode === 'table' ? 'bg-white text-[#111111]' : 'text-white hover:bg-gray-800'}`}>Lista</button>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 font-black text-xl text-gray-400 bg-white border-[4px] border-[#111111] border-dashed">NENHUM RESULTADO NESTES FILTROS</div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev, i) => (
                <div key={i} onClick={() => setSelectedEvent(ev)} className="bg-white p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] hover:shadow-[10px_10px_0px_0px_#111111] hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full relative">
                  <div className="absolute top-0 right-0 w-8 h-8 border-l-[4px] border-b-[4px] border-[#111111]" style={{ backgroundColor: isFuture(ev['Início']) ? COLORS.teal : '#d1d5db' }}></div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-white bg-[#111111] px-2 py-1 border-[2px] border-[#111111] self-start mb-3">{ev['Classe de Atividade'] || 'S/ CLASSE'}</span>
                  <h3 className="font-black text-lg text-[#111111] leading-tight mb-4 uppercase line-clamp-3">{ev['Título']}</h3>
                  
                  <div className="mt-auto space-y-2 border-t-[3px] border-[#111111] pt-3">
                    <p className="text-[10px] font-black text-gray-600 uppercase">📅 {formatDate(ev['Início'])}</p>
                    <p className="text-[10px] font-black text-[#C1272D] uppercase truncate">📍 {ev['Município']} {ev['Região'] ? `- ${ev['Região']}` : ''}</p>
                    <p className="text-[10px] font-black text-[#EAA221] uppercase truncate">👤 {ev['Articulador']}</p>
                  </div>
                  <div className="absolute bottom-3 right-3 border-[2px] border-[#111111] px-1.5 py-0.5 text-[9px] font-black uppercase bg-white">{ev['STATUS'] || 'Pendente'}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-white uppercase bg-[#111111]">
                  <tr>
                    <th className="px-4 py-3 font-black border-b-[3px] border-white">Título</th>
                    <th className="px-4 py-3 font-black border-b-[3px] border-white">Data</th>
                    <th className="px-4 py-3 font-black border-b-[3px] border-white">Mun./Região</th>
                    <th className="px-4 py-3 font-black border-b-[3px] border-white">Articulador</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((ev, i) => (
                    <tr key={i} onClick={() => setSelectedEvent(ev)} className="border-b-[3px] border-[#111111] hover:bg-[#Fdfcf0] cursor-pointer">
                      <td className="px-4 py-3 text-[11px] font-black uppercase max-w-[200px] truncate">{ev['Título']}</td>
                      <td className="px-4 py-3 text-[10px] font-bold">{formatDate(ev['Início'])}</td>
                      <td className="px-4 py-3 text-[10px] font-bold text-[#C1272D] truncate max-w-[150px]">{ev['Município']}/{ev['Região']}</td>
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
      <nav className="bg-[#111111] text-white w-full md:w-64 flex-shrink-0 flex flex-col z-20 border-r-[6px] border-[#111111]">
        <div className="p-6 border-b-[4px] border-white bg-[#C1272D]">
          <h1 className="text-3xl font-black tracking-tighter text-white border-b-[4px] border-white pb-2 inline-block">TABULUM</h1>
          <p className="text-[9px] text-white font-black uppercase tracking-widest mt-2 bg-[#111111] px-2 py-1 inline-block border-[2px] border-white">GesTaAg • Marquito</p>
        </div>
        
        <div className="flex flex-row md:flex-col p-4 gap-4 overflow-x-auto">
          <button onClick={() => setActiveTab('list')} className={`flex items-center gap-3 px-4 py-3 border-[3px] border-white text-[11px] font-black uppercase transition-all shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 ${activeTab === 'list' ? 'bg-[#EAA221] text-[#111111] border-[#111111] shadow-[4px_4px_0px_0px_#EAA221]' : 'bg-[#111111] hover:bg-white hover:text-[#111111]'}`}>
            <span className="w-2.5 h-2.5 bg-white border-[2px] border-[#111111] block" style={{backgroundColor: activeTab==='list' ? '#111111' : 'white'}}></span>AGENDAS
          </button>
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 border-[3px] border-white text-[11px] font-black uppercase transition-all shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 ${activeTab === 'dashboard' ? 'bg-[#007D8A] text-white border-[#111111] shadow-[4px_4px_0px_0px_#007D8A]' : 'bg-[#111111] hover:bg-white hover:text-[#111111]'}`}>
            <span className="w-2.5 h-2.5 bg-white border-[2px] border-[#111111] block" style={{backgroundColor: activeTab==='dashboard' ? '#111111' : 'white'}}></span>DASHBOARD
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#Fdfcf0] z-10 font-black uppercase tracking-widest">Carregando Dados...</div>
        ) : (
          <div className="max-w-7xl mx-auto h-full">
            {renderGlobalFilters()}
            {activeTab === 'list' && renderList()}
            {activeTab === 'dashboard' && renderDashboard()}
          </div>
        )}
      </main>

      {/* Modal de Detalhes do Evento */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
          <div className="bg-[#Fdfcf0] w-full max-w-lg h-full border-l-[6px] border-[#111111] flex flex-col overflow-y-auto shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.3)]">
            <div className="p-6 bg-white border-b-[4px] border-[#111111] sticky top-0 z-10 flex justify-between items-start">
              <div>
                <span className="bg-[#111111] text-white text-[9px] font-black uppercase px-2 py-1 border-[2px] border-[#111111]">{selectedEvent['Classe de Atividade']}</span>
                <h2 className="text-xl font-black text-[#111111] leading-tight uppercase mt-3">{selectedEvent['Título']}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="p-2 bg-[#C1272D] text-white border-[3px] border-[#111111] hover:bg-[#8B1C20] shadow-[3px_3px_0px_0px_#111111]">X</button>
            </div>
            
            <div className="p-6 space-y-6">
              <select value={selectedEvent['STATUS'] || 'Pendente'} onChange={(e) => handleUpdateStatus(selectedEvent.id, e.target.value)} className="w-full bg-[#Fdfcf0] border-[4px] border-[#111111] font-black text-sm uppercase p-3 shadow-[4px_4px_0px_0px_#111111] outline-none">
                <option value="Pendente">Pendente</option><option value="Confirmado">Confirmado</option><option value="Realizado">Realizado</option>
              </select>

              <div className="bg-white p-5 border-[4px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] space-y-4">
                <div><label className="text-[9px] uppercase font-black text-[#007D8A] block">Município / Região</label>
                <p className="text-sm font-bold uppercase">{selectedEvent['Município']} / {selectedEvent['Região']}</p></div>
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
      `}} />
    </div>
  );
}
