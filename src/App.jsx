import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// CONFIGURAÇÃO DA API E CORES (MONDRIAN)
// ==========================================
const getApiUrl = () => {
  try {
    return import.meta.env.VITE_APPS_SCRIPT_URL || '';
  } catch (e) {
    return '';
  }
};
const API_URL = getApiUrl(); 

const COLORS = {
  crimson: '#C1272D',
  crimsonDark: '#8B1C20',
  mustard: '#EAA221',
  mustardDark: '#B57C14',
  teal: '#007D8A',
  tealDark: '#00555E',
  black: '#111111',
  white: '#Fdfcf0', 
};

const CHART_PALETTE = [COLORS.crimson, COLORS.mustard, COLORS.teal, COLORS.crimsonDark, COLORS.mustardDark, COLORS.tealDark];

const MOCK_DATA = [
  { id: 2, 'Título': 'Sessão Plenária ALESC', 'Início': new Date().toISOString(), 'Fim': new Date(Date.now() + 7200000).toISOString(), 'Descrição': 'Votação ambiental.', 'Duração': 120, 'Local': 'ALESC', 'Classe de Atividade': 'Sessão Legislativa', 'Região': 'Centro', 'Município': 'Florianópolis', 'Articulador': 'João Silva', 'STATUS': 'Confirmado' },
  { id: 3, 'Título': 'Reunião Associação', 'Início': new Date(Date.now() + 86400000).toISOString(), 'Fim': new Date(Date.now() + 93600000).toISOString(), 'Descrição': 'Saneamento.', 'Duração': 120, 'Local': 'Campeche', 'Classe de Atividade': 'Comunidade', 'Região': 'Sul da Ilha', 'Município': 'Florianópolis', 'Articulador': 'Maria Costa', 'STATUS': 'Pendente' },
  { id: 4, 'Título': 'Visita Feira', 'Início': new Date(Date.now() - 172800000).toISOString(), 'Fim': new Date(Date.now() - 165600000).toISOString(), 'Descrição': 'Apoio local.', 'Duração': 120, 'Local': 'Chapecó', 'Classe de Atividade': 'Visita Técnica', 'Região': 'Oeste', 'Município': 'Chapecó', 'Articulador': 'Pedro Alves', 'STATUS': 'Realizado' },
  { id: 5, 'Título': 'Encontro Lages', 'Início': new Date().toISOString(), 'Fim': new Date(Date.now() + 7200000).toISOString(), 'Descrição': 'Frio.', 'Duração': 120, 'Local': 'Centro', 'Classe de Atividade': 'Reunião', 'Região': 'Serra', 'Município': 'Lages', 'Articulador': 'Marquito', 'STATUS': 'Confirmado' },
];

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
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
    
    // Varredura para encontrar colunas idependente de erros de digitação na primeira linha
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

    // Limpa os erros de fórmula gerados pelo Google Sheets
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
    <div className="bg-[#Fdfcf0] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex-1 min-w-[300px] flex flex-col h-full">
      <h3 className="text-sm font-black text-[#111111] mb-5 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2">{title}</h3>
      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
        {data.length === 0 && <div className="text-xs font-black text-gray-400 uppercase text-center py-4">Sem dados válidos</div>}
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-[10px] font-black text-[#111111] w-32 uppercase truncate" title={item.name}>{item.name}</span>
            <div className="flex-1 h-6 bg-white border-[2px] border-[#111111] overflow-hidden relative">
              <div 
                className="h-full border-r-[2px] border-[#111111] transition-all duration-500" 
                style={{ width: `${(item.value / maxVal) * 100}%`, backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}
              ></div>
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

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  return (
    <div className="bg-[#Fdfcf0] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex-1 min-w-[300px] flex flex-col items-center h-full">
      <h3 className="text-sm font-black text-[#111111] mb-5 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2 w-full">{title}</h3>
      
      {data.length === 0 ? (
         <div className="flex-1 flex items-center justify-center text-xs font-black text-gray-400 uppercase py-10">Sem dados válidos</div>
      ) : (
        <>
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full drop-shadow-[4px_4px_0px_#111111]">
              <circle cx="0" cy="0" r="1.05" fill="#111111" />
              {data.map((slice, i) => {
                if (slice.value === 0) return null;
                const percent = slice.value / total;
                if (percent === 1) {
                  return <circle key={i} cx="0" cy="0" r="1" fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="#111111" strokeWidth="0.03" />
                }
                const startX = getCoordinatesForPercent(cumulativePercent)[0];
                const startY = getCoordinatesForPercent(cumulativePercent)[1];
                cumulativePercent += percent;
                const endX = getCoordinatesForPercent(cumulativePercent)[0];
                const endY = getCoordinatesForPercent(cumulativePercent)[1];
                const largeArcFlag = percent > 0.5 ? 1 : 0;
                const pathData = [
                  `M ${startX} ${startY}`,
                  `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                  `L 0 0`,
                ].join(' ');

                return (
                  <path 
                    key={i} 
                    d={pathData} 
                    fill={CHART_PALETTE[i % CHART_PALETTE.length]} 
                    stroke="#111111" 
                    strokeWidth="0.03"
                  />
                );
              })}
            </svg>
          </div>
          <div className="mt-8 w-full flex flex-wrap gap-2 justify-center overflow-y-auto max-h-[150px] custom-scrollbar">
            {data.map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] font-black text-[#111111] bg-white border-[2px] border-[#111111] px-2 py-1 shadow-[2px_2px_0px_0px_#111111] uppercase">
                <span className="w-3 h-3 border-[2px] border-[#111111] block" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}></span>
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
// MAPA NATIVO GEOGRÁFICO (SVG PURO COORDENADAS)
// ==========================================
const NativeGeoMap = ({ data, title, isFloripa }) => {
  
  // Dicionário de Coordenadas X,Y relativas à ViewBox 0 0 100 100
  // Santa Catarina (Baseado em Municípios e Macrorregiões)
  const scMapCoords = {
    'florianopolis': { x: 78, y: 55 }, 'sao jose': { x: 75, y: 55 }, 'palhoca': { x: 75, y: 58 },
    'joinville': { x: 72, y: 22 }, 'blumenau': { x: 68, y: 40 }, 'itajai': { x: 75, y: 38 },
    'chapeco': { x: 18, y: 48 }, 'lages': { x: 50, y: 62 }, 'criciuma': { x: 68, y: 82 },
    'tubarao': { x: 70, y: 76 }, 'balneario camboriu': { x: 76, y: 42 }, 'joacaba': { x: 35, y: 48 },
    'concordia': { x: 28, y: 55 }, 'xanxere': { x: 22, y: 46 }, 'rio do sul': { x: 55, y: 48 },
    'cacador': { x: 45, y: 35 }, 'canoinhas': { x: 55, y: 20 }, 'mafra': { x: 62, y: 20 },
    'sao francisco do sul': { x: 78, y: 25 }, 'laguna': { x: 72, y: 72 }, 'imbituba': { x: 74, y: 68 },
    'garopaba': { x: 75, y: 64 }, 'jaragua do sul': { x: 68, y: 28 }, 'brusque': { x: 70, y: 45 },
    'sao miguel do oeste': { x: 8, y: 40 }, 'ararangua': { x: 65, y: 88 }, 'biguacu': { x: 74, y: 51 },
    'curitibanos': { x: 48, y: 46 }, 'videira': { x: 40, y: 40 }, 'gaspar': { x: 70, y: 40 },
    // Fallbacks para Macro-regiões SC
    'oeste': { x: 20, y: 48 }, 'meio-oeste': { x: 38, y: 45 }, 'planalto': { x: 50, y: 55 },
    'norte': { x: 68, y: 25 }, 'vale': { x: 68, y: 42 }, 'grande florianopolis': { x: 75, y: 55 },
    'serra': { x: 55, y: 65 }, 'sul': { x: 68, y: 80 }
  };

  // Florianópolis (Baseado em Regiões do Município)
  const floripaMapCoords = {
    'norte da ilha': { x: 65, y: 25 }, 'centro': { x: 55, y: 55 },
    'continente': { x: 30, y: 55 }, 'leste da ilha': { x: 75, y: 50 },
    'sul da ilha': { x: 60, y: 80 }
  };

  const currentMapCoords = isFloripa ? floripaMapCoords : scMapCoords;
  const maxDensity = Math.max(...data.map(d => d.value), 1);

  // Formas Poligonais Desenhadas Manualmente (Mondrian Style)
  const scPolygon = "M 5,45 C 15,35 30,35 45,25 C 50,20 65,15 75,20 C 85,25 90,45 85,60 C 80,75 70,85 60,95 C 45,95 30,85 15,65 C 10,55 5,50 5,45 Z";
  const floripaContinentPolygon = "M 20,40 C 35,35 45,45 40,65 C 30,70 15,65 20,40 Z";
  const floripaIslandPolygon = "M 50,15 C 70,25 80,45 75,70 C 70,95 55,90 45,65 C 40,40 45,20 50,15 Z";

  return (
    <div className="bg-[#Fdfcf0] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex-1 min-w-[300px]">
      <h3 className="text-sm font-black text-[#111111] mb-2 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2">{title}</h3>
      <p className="text-[10px] font-black text-gray-400 mb-4 uppercase">Intensidade Geográfica</p>
      
      <div className="w-full h-64 bg-white border-[3px] border-[#111111] relative overflow-hidden flex items-center justify-center">
        
        {/* Fundo do Mapa Geográfico SVG */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full p-2 drop-shadow-[6px_6px_0px_#111111]">
          {isFloripa ? (
            <>
              <path d={floripaContinentPolygon} fill="#007D8A" stroke="#111111" strokeWidth="1.5" strokeLinejoin="round" opacity="0.3" />
              <path d={floripaIslandPolygon} fill="#007D8A" stroke="#111111" strokeWidth="1.5" strokeLinejoin="round" opacity="0.3" />
            </>
          ) : (
             <path d={scPolygon} fill="#EAA221" stroke="#111111" strokeWidth="1.5" strokeLinejoin="round" opacity="0.4" />
          )}
        </svg>

        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10">
            <span className="text-[10px] font-black uppercase text-[#111111] bg-white px-3 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]">Sem agendas na região</span>
          </div>
        )}

        {/* Bolhas de Calor Renderizadas via Coordenadas */}
        {data.map((item, i) => {
          const normName = normalizerFilter(item.name);
          // Busca a coordenada exata baseada na String limpa
          const coord = currentMapCoords[normName];
          if (!coord) return null;

          const intensity = item.value / maxDensity;
          const size = 15 + (intensity * 40); // Bolhas de 15px a 55px

          return (
            <div 
              key={i} 
              className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group z-10"
              style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
            >
              <div 
                className="rounded-full bg-[#C1272D] border-[3px] border-[#111111] shadow-[3px_3px_0px_0px_#111111] transition-all duration-300 hover:scale-125 flex items-center justify-center cursor-help relative"
                style={{ width: `${size}px`, height: `${size}px`, opacity: 0.85 + (intensity * 0.15) }}
              >
                <span className="text-white font-black text-[10px]">{item.value}</span>
              </div>
              <span className="absolute top-full mt-1 text-[8px] font-black uppercase text-[#111111] bg-white border-[2px] border-[#111111] px-1.5 py-0.5 whitespace-nowrap shadow-[2px_2px_0px_0px_#111111] z-20 hidden group-hover:block pointer-events-none">
                {item.name}
              </span>
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
  
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards');
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!API_URL) {
          setEvents(normalizeData(MOCK_DATA));
        } else {
          const response = await fetch(API_URL, { redirect: "follow" });
          const text = await response.text();
          try {
            const data = JSON.parse(text);
            setEvents(normalizeData(data));
          } catch (e) {
            setEvents(normalizeData(MOCK_DATA));
          }
        }
      } catch (error) {
        setEvents(normalizeData(MOCK_DATA));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const updatedEvents = events.map(ev => ev.id === id ? { ...ev, 'STATUS': newStatus } : ev);
    setEvents(updatedEvents);
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent({ ...selectedEvent, 'STATUS': newStatus });
    }

    if (API_URL) {
      try {
        await fetch(API_URL, {
          method: 'POST',
          body: JSON.stringify({ id, status: newStatus }),
          redirect: "follow"
        });
      } catch (error) {}
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      if (timeFilter === 'future' && !isFuture(ev['Início'])) return false;
      if (timeFilter === 'past' && !isPast(ev['Início'])) return false;
      
      if (search) {
        const term = search.toLowerCase();
        return (
          (ev['Título'] && ev['Título'].toLowerCase().includes(term)) ||
          (ev['Local'] && ev['Local'].toLowerCase().includes(term)) ||
          (ev['Município'] && ev['Município'].toLowerCase().includes(term)) ||
          (ev['Articulador'] && ev['Articulador'].toLowerCase().includes(term))
        );
      }
      return true;
    }).sort((a, b) => new Date(a['Início']) - new Date(b['Início']));
  }, [events, search, timeFilter]);

  const dashboardStats = useMemo(() => {
    const agg = (key) => {
      const counts = {};
      events.forEach(ev => {
        let val = ev[key];
        if (!val || val.toString().trim() === '') val = 'Não definido';
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    // Filtros estritos: Remove 'Outros Eventos' e 'Não definido'
    const classes = agg('Classe de Atividade').filter(c => 
      normalizerFilter(c.name) !== 'outros eventos' && normalizerFilter(c.name) !== 'nao definido'
    );

    const articuladores = agg('Articulador').filter(a => 
      normalizerFilter(a.name) !== 'nao definido'
    );

    const regioes = agg('Região').filter(r => 
      normalizerFilter(r.name) !== 'nao definido'
    );

    // Lógica do Mapa de Santa Catarina (Baseado APENAS na Coluna I - Município)
    const scHeatmapMap = {};
    events.forEach(ev => {
      let muni = ev['Município'];
      if (!muni || muni.toString().trim() === '') {
        muni = ev['Região']; // Fallback pra Macro-Região se Município estiver em branco
      }
      if (muni && normalizerFilter(muni) !== 'nao definido') {
        scHeatmapMap[muni] = (scHeatmapMap[muni] || 0) + 1;
      }
    });
    const scHeatmap = Object.entries(scHeatmapMap).map(([name, value]) => ({ name, value }));

    // Lógica do Mapa de Florianópolis (Baseado APENAS na Coluna H - Região, filtrado onde Município é Floripa)
    const floripaHeatmapMap = {};
    events.forEach(ev => {
      const muni = normalizerFilter(ev['Município'] || '');
      if (muni === 'florianopolis' || muni === 'floripa') {
        const reg = ev['Região'];
        if (reg && normalizerFilter(reg) !== 'nao definido') {
          floripaHeatmapMap[reg] = (floripaHeatmapMap[reg] || 0) + 1;
        }
      }
    });
    const floripaHeatmap = Object.entries(floripaHeatmapMap).map(([name, value]) => ({ name, value }));

    return { classes, regioes, articuladores, scHeatmap, floripaHeatmap };
  }, [events]);

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-[4px] border-[#111111] bg-white p-5 shadow-[8px_8px_0px_0px_#111111]">
        <h2 className="text-2xl font-black text-[#111111] tracking-tighter uppercase">Visão Geral</h2>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <span className="text-sm font-black px-4 py-2 bg-[#111111] text-white border-[3px] border-[#111111]">
            TOTAL: {events.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <SimpleBarChart data={dashboardStats.classes} title="Classes de Atividade" />
        <SimplePieChart data={dashboardStats.regioes} title="Regiões" />
        <SimplePieChart data={dashboardStats.articuladores} title="Articuladores" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <NativeGeoMap data={dashboardStats.scHeatmap} title="Calor - Santa Catarina" isFloripa={false} />
        <NativeGeoMap data={dashboardStats.floripaHeatmap} title="Calor - Florianópolis" isFloripa={true} />
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-5 border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111]">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="BUSCAR AGENDA..." 
            className="w-full pl-4 pr-4 py-3 bg-[#Fdfcf0] border-[3px] border-[#111111] focus:outline-none focus:ring-0 focus:border-[#C1272D] font-black text-[10px] sm:text-sm uppercase transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          <select 
            className="bg-[#Fdfcf0] border-[3px] border-[#111111] font-black text-[10px] sm:text-sm uppercase px-4 py-3 focus:outline-none cursor-pointer"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">Todas as Agendas</option>
            <option value="future">Agendas Futuras</option>
            <option value="past">Agendas Realizadas</option>
          </select>

          <div className="flex bg-[#111111] p-1 border-[3px] border-[#111111]">
            <button onClick={() => setViewMode('cards')} className={`px-4 py-2 text-[10px] sm:text-sm font-black uppercase transition-colors ${viewMode === 'cards' ? 'bg-white text-[#111111]' : 'text-white hover:bg-gray-800'}`}>Cards</button>
            <button onClick={() => setViewMode('table')} className={`px-4 py-2 text-[10px] sm:text-sm font-black uppercase transition-colors ${viewMode === 'table' ? 'bg-white text-[#111111]' : 'text-white hover:bg-gray-800'}`}>Lista</button>
          </div>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 font-black text-2xl text-gray-400 bg-white border-[4px] border-[#111111] border-dashed">
          NENHUM RESULTADO
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev, i) => {
                const future = isFuture(ev['Início']);
                const statusColor = ev['STATUS'] === 'Confirmado' ? COLORS.teal : ev['STATUS'] === 'Realizado' ? COLORS.crimson : COLORS.mustard;

                return (
                  <div key={i} onClick={() => setSelectedEvent(ev)} className="bg-white p-6 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] hover:shadow-[10px_10px_0px_0px_#111111] hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full group relative">
                    <div className="absolute top-0 right-0 w-10 h-10 border-l-[4px] border-b-[4px] border-[#111111]" style={{ backgroundColor: future ? COLORS.teal : '#d1d5db' }}></div>
                    
                    <div className="flex justify-between items-start mb-4 pr-12">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#111111] px-2 py-1 border-[2px] border-[#111111]">
                        {ev['Classe de Atividade'] || 'SEM CLASSE'}
                      </span>
                    </div>
                    
                    <h3 className="font-black text-xl text-[#111111] leading-tight mb-6 uppercase line-clamp-3">{ev['Título']}</h3>
                    
                    <div className="mt-auto space-y-3 border-t-[4px] border-[#111111] pt-4">
                      <div className="flex justify-between items-center">
                         <div className="text-[10px] sm:text-xs font-black text-gray-600 uppercase flex items-center gap-2">
                           <span className="w-2 h-2 bg-[#111111] rounded-full inline-block"></span>
                           {formatDate(ev['Início'])}
                         </div>
                      </div>
                      <div className="text-[10px] sm:text-xs font-black text-gray-800 uppercase flex items-center gap-2 truncate">
                         <span className="w-2 h-2 bg-[#C1272D] inline-block"></span>
                         {ev['Município']} {ev['Região'] ? `- ${ev['Região']}` : ''}
                      </div>
                    </div>

                    <div className="absolute bottom-4 right-4 border-[3px] border-[#111111] px-2 py-1 bg-white text-[10px] font-black uppercase" style={{ color: statusColor, borderColor: statusColor }}>
                      {ev['STATUS'] || 'Pendente'}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-white uppercase bg-[#111111]">
                    <tr>
                      <th className="px-5 py-4 font-black border-b-[3px] border-white">Título</th>
                      <th className="px-5 py-4 font-black border-b-[3px] border-white">Data</th>
                      <th className="px-5 py-4 font-black border-b-[3px] border-white">Município/Região</th>
                      <th className="px-5 py-4 font-black border-b-[3px] border-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((ev, i) => (
                      <tr key={i} onClick={() => setSelectedEvent(ev)} className="bg-white border-b-[3px] border-[#111111] hover:bg-[#Fdfcf0] cursor-pointer transition-colors">
                        <td className="px-5 py-4 font-black text-[#111111] uppercase max-w-[250px] truncate">{ev['Título']}</td>
                        <td className="px-5 py-4 font-bold text-gray-700 whitespace-nowrap">{formatDate(ev['Início'])}</td>
                        <td className="px-5 py-4 font-bold text-[#C1272D] truncate max-w-[200px]">{ev['Município']} {ev['Região'] ? `/ ${ev['Região']}` : ''}</td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-black px-2 py-1 border-[2px] border-[#111111] uppercase shadow-[2px_2px_0px_0px_#111111]" style={{ backgroundColor: ev['STATUS'] === 'Confirmado' ? COLORS.teal : COLORS.mustard, color: ev['STATUS'] === 'Confirmado' ? 'white' : '#111111' }}>
                            {ev['STATUS'] || 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const renderDetails = () => {
    if (!selectedEvent) return null;
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
        <div className="bg-[#Fdfcf0] w-full max-w-lg h-full border-l-[6px] border-[#111111] flex flex-col transform transition-transform translate-x-0 overflow-y-auto shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.3)]">
          
          <div className="p-6 bg-white border-b-[4px] border-[#111111] sticky top-0 z-10 flex justify-between items-start">
            <div className="pr-4">
              <div className="inline-block bg-[#111111] text-white text-[10px] font-black uppercase px-2 py-1 border-[2px] border-[#111111] mb-3">
                {selectedEvent['Classe de Atividade']}
              </div>
              <h2 className="text-2xl font-black text-[#111111] leading-none uppercase">{selectedEvent['Título']}</h2>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="p-2 bg-[#C1272D] text-white border-[3px] border-[#111111] hover:bg-[#8B1C20] hover:-translate-y-0.5 transition-transform shadow-[3px_3px_0px_0px_#111111] flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="p-6 space-y-6 flex-1">
            
            <div className="bg-white p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111]">
              <label className="block text-[12px] font-black text-[#111111] uppercase mb-3 border-b-[3px] border-[#111111] pb-2">Gerenciar Status</label>
              <select 
                className="w-full bg-[#Fdfcf0] border-[3px] border-[#111111] font-black text-[#111111] text-sm uppercase focus:outline-none p-3 cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
                value={selectedEvent['STATUS'] || 'Pendente'}
                onChange={(e) => handleUpdateStatus(selectedEvent.id, e.target.value)}
              >
                <option value="Pendente">Pendente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Realizado">Realizado</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 border-[4px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                <label className="text-[10px] uppercase font-black text-[#C1272D] tracking-widest block mb-1">Início</label>
                <p className="text-sm font-bold text-[#111111]">{formatDate(selectedEvent['Início'])}</p>
              </div>
              <div className="bg-white p-4 border-[4px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                <label className="text-[10px] uppercase font-black text-[#C1272D] tracking-widest block mb-1">Fim</label>
                <p className="text-sm font-bold text-[#111111]">{formatDate(selectedEvent['Fim'])}</p>
              </div>
            </div>

            <div className="bg-white p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] space-y-5">
              <div>
                <label className="text-[10px] uppercase font-black text-[#007D8A] tracking-widest block border-b-[3px] border-[#111111] pb-1 mb-2">Município / Local</label>
                <p className="text-sm font-bold text-[#111111] uppercase">{selectedEvent['Município'] || 'NÃO DEFINIDO'} <span className="text-gray-400 font-medium">| {selectedEvent['Local'] || 'S/ LOCAL'}</span></p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-[#007D8A] tracking-widest block border-b-[3px] border-[#111111] pb-1 mb-2">Região</label>
                  <p className="text-sm font-bold text-[#111111] uppercase">{selectedEvent['Região']}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-[#007D8A] tracking-widest block border-b-[3px] border-[#111111] pb-1 mb-2">Articulador</label>
                  <p className="text-sm font-bold text-[#111111] uppercase">{selectedEvent['Articulador']}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111]">
              <label className="text-[10px] uppercase font-black text-[#EAA221] tracking-widest block border-b-[3px] border-[#111111] pb-1 mb-3">Descrição / Notas</label>
              <div className="text-sm font-medium text-[#111111] whitespace-pre-wrap min-h-[80px]">
                {selectedEvent['Descrição'] || 'SEM DESCRIÇÃO FORNECIDA.'}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#Fdfcf0] font-sans text-[#111111] flex flex-col md:flex-row selection:bg-[#EAA221] selection:text-[#111111]">
      
      <nav className="bg-[#111111] text-white w-full md:w-72 flex-shrink-0 flex flex-col z-20 border-r-[6px] border-[#111111]">
        <div className="p-8 border-b-[4px] border-white bg-[#C1272D]">
          <h1 className="text-4xl font-black tracking-tighter text-white border-b-[4px] border-white pb-2 inline-block">TABULUM</h1>
          <p className="text-[10px] text-white font-black uppercase tracking-widest mt-2 bg-[#111111] px-2 py-1 inline-block border-[2px] border-white">GesTaAg • Marquito</p>
        </div>
        
        <div className="flex flex-row md:flex-col p-4 gap-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-3 px-5 py-4 border-[3px] border-white text-sm font-black uppercase transition-all whitespace-nowrap shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 ${activeTab === 'list' ? 'bg-[#EAA221] text-[#111111] border-[#111111] shadow-[4px_4px_0px_0px_#EAA221]' : 'bg-[#111111] text-white hover:bg-white hover:text-[#111111]'}`}
          >
            <span className="w-3 h-3 bg-white border-[2px] border-[#111111] block" style={{backgroundColor: activeTab==='list' ? '#111111' : 'white'}}></span>
            Agendas
          </button>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-5 py-4 border-[3px] border-white text-sm font-black uppercase transition-all whitespace-nowrap shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 ${activeTab === 'dashboard' ? 'bg-[#007D8A] text-white border-[#111111] shadow-[4px_4px_0px_0px_#007D8A]' : 'bg-[#111111] text-white hover:bg-white hover:text-[#111111]'}`}
          >
            <span className="w-3 h-3 bg-white border-[2px] border-[#111111] block" style={{backgroundColor: activeTab==='dashboard' ? '#111111' : 'white'}}></span>
            Dashboard
          </button>
        </div>

        <div className="mt-auto hidden md:block p-6">
          <div className="bg-white border-[4px] border-[#111111] p-4 shadow-[4px_4px_0px_0px_#111111]">
            <p className="text-[10px] font-black uppercase text-[#111111] leading-tight">Status da Sincronização</p>
            <div className="flex items-center gap-2 mt-3 border-t-[3px] border-[#111111] pt-2">
              <span className={`w-4 h-4 border-[3px] border-[#111111] ${API_URL ? 'bg-[#007D8A]' : 'bg-[#EAA221]'}`}></span>
              <span className="text-[10px] text-[#111111] font-black uppercase">{API_URL ? 'Online (Sheets)' : 'Demonstração'}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full relative bg-[#Fdfcf0]">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#Fdfcf0] z-10">
            <div className="w-16 h-16 border-[6px] border-[#111111] border-t-[#C1272D] animate-spin mb-4"></div>
            <p className="text-sm font-black uppercase tracking-widest text-[#111111]">Conectando...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'list' && renderList()}
            {activeTab === 'dashboard' && renderDashboard()}
          </div>
        )}
      </main>

      {renderDetails()}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        * { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #Fdfcf0; border-left: 2px solid #111111; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #111111; }
      `}} />
    </div>
  );
}
