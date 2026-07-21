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
  white: '#Fdfcf0', // Off-white para fundo (estilo tela de pintura)
};

const CHART_PALETTE = [COLORS.crimson, COLORS.mustard, COLORS.teal, COLORS.crimsonDark, COLORS.mustardDark, COLORS.tealDark];

const MOCK_DATA = [
  { id: 2, 'Título': 'Sessão Plenária ALESC', 'Início': new Date().toISOString(), 'Fim': new Date(Date.now() + 7200000).toISOString(), 'Descrição': 'Votação de projetos de lei ambientais.', 'Duração': 120, 'Local': 'ALESC - Florianópolis', 'Classe de Atividade': 'Sessão Legislativa', 'Região': 'Grande Florianópolis', 'Articulador': 'João Silva', 'STATUS': 'Confirmado' },
  { id: 3, 'Título': 'Reunião Associação Moradores', 'Início': new Date(Date.now() + 86400000).toISOString(), 'Fim': new Date(Date.now() + 93600000).toISOString(), 'Descrição': 'Debate sobre saneamento básico.', 'Duração': 120, 'Local': 'Campeche - Florianópolis', 'Classe de Atividade': 'Comunidade', 'Região': 'Florianópolis (Sul)', 'Articulador': 'Maria Costa', 'STATUS': 'Pendente' },
  { id: 4, 'Título': 'Visita Feira Orgânica', 'Início': new Date(Date.now() - 172800000).toISOString(), 'Fim': new Date(Date.now() - 165600000).toISOString(), 'Descrição': 'Apoio aos produtores locais.', 'Duração': 120, 'Local': 'Chapecó', 'Classe de Atividade': 'Visita Técnica', 'Região': 'Oeste', 'Articulador': 'Pedro Alves', 'STATUS': 'Realizado' },
];

// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const isFuture = (dateString) => new Date(dateString) >= new Date();
const isPast = (dateString) => new Date(dateString) < new Date();

// ==========================================
// COMPONENTES GRÁFICOS NATIVOS (MONDRIAN)
// ==========================================
const SimpleBarChart = ({ data, title }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-[#Fdfcf0] p-5 border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex-1 min-w-[300px]">
      <h3 className="text-sm font-bold text-[#111111] mb-5 uppercase tracking-wider border-b-[3px] border-[#111111] pb-2">{title}</h3>
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#111111] w-28 truncate" title={item.name}>{item.name}</span>
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
    <div className="bg-[#Fdfcf0] p-5 border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex-1 min-w-[300px] flex flex-col items-center">
      <h3 className="text-sm font-bold text-[#111111] mb-5 uppercase tracking-wider border-b-[3px] border-[#111111] pb-2 w-full">{title}</h3>
      <div className="relative w-40 h-40">
        <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full drop-shadow-[4px_4px_0px_#111111]">
          {/* Círculo de fundo para a borda grossa */}
          <circle cx="0" cy="0" r="1.05" fill="#111111" />
          {data.map((slice, i) => {
            if (slice.value === 0) return null;
            const percent = slice.value / total;
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
                strokeWidth="0.02"
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-6 w-full flex flex-wrap gap-2 justify-center">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-bold text-[#111111] bg-white border-[2px] border-[#111111] px-2 py-1 shadow-[2px_2px_0px_0px_#111111]">
            <span className="w-3 h-3 border-[1px] border-[#111111]" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}></span>
            {item.name} ({(item.value / total * 100).toFixed(0)}%)
          </div>
        ))}
      </div>
    </div>
  );
};

const HeatmapGrid = ({ data, title, isFloripa }) => {
  const maxDensity = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="bg-[#Fdfcf0] p-5 border-[3px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex-1 min-w-[300px]">
      <h3 className="text-sm font-bold text-[#111111] mb-2 uppercase tracking-wider border-b-[3px] border-[#111111] pb-2">{title}</h3>
      <p className="text-xs font-bold text-gray-500 mb-4">Intensidade de agenda por localidade</p>
      
      <div className={`grid ${isFloripa ? 'grid-cols-2' : 'grid-cols-3'} gap-3 h-48`}>
        {data.map((item, i) => {
          const intensity = item.value / maxDensity;
          // Gradações baseadas na paleta solicitada
          let bgColor = '#Fdfcf0';
          let textColor = '#111111';
          
          if (intensity > 0.7) { bgColor = COLORS.crimson; textColor = '#FFFFFF'; }
          else if (intensity > 0.4) { bgColor = COLORS.mustard; textColor = '#111111'; }
          else if (intensity > 0) { bgColor = COLORS.teal; textColor = '#FFFFFF'; }
          
          return (
            <div key={i} 
                 className="border-[3px] border-[#111111] flex items-center justify-center relative group transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#111111]"
                 style={{ backgroundColor: bgColor }}>
              <span className={`text-xs font-black uppercase tracking-tight text-center px-2`} style={{ color: textColor }}>
                {item.name.substring(0, 10)}{item.name.length > 10 ? '...' : ''}
              </span>
              <div className="absolute hidden group-hover:block bg-[#111111] text-white font-bold text-xs p-2 -top-10 border-[2px] border-white whitespace-nowrap z-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                {item.name}: {item.value} agendas
              </div>
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
          console.warn("URL da API não encontrada. Modo demonstração ativado.");
          setEvents(MOCK_DATA);
        } else {
          // IMPORTANTE: redirect: "follow" é obrigatório para o Google Apps Script
          const response = await fetch(API_URL, { redirect: "follow" });
          const text = await response.text(); // Lemos como texto primeiro para evitar erro de parse silencioso
          
          try {
            const data = JSON.parse(text);
            setEvents(data);
          } catch (e) {
            console.error("A API não retornou um JSON válido. Resposta recebida:", text.substring(0, 200));
            setEvents(MOCK_DATA);
          }
        }
      } catch (error) {
        console.error("Erro na conexão com a API:", error);
        setEvents(MOCK_DATA);
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
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
      }
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
          (ev['Descrição'] && ev['Descrição'].toLowerCase().includes(term)) ||
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
        const val = ev[key] || 'Não definido';
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const todasRegioes = agg('Região');
    const scRegioes = todasRegioes.filter(r => !r.name.toLowerCase().includes('florianópolis (') && r.name !== 'Não definido');
    const floripaRegioes = todasRegioes.filter(r => r.name.toLowerCase().includes('florianópolis ('));

    return {
      classes: agg('Classe de Atividade'),
      regioes: todasRegioes,
      articuladores: agg('Articulador'),
      scHeatmap: scRegioes.length > 0 ? scRegioes : [{name: 'Oeste', value: 1}, {name: 'Norte', value: 2}, {name: 'Sul', value: 1}],
      floripaHeatmap: floripaRegioes.length > 0 ? floripaRegioes : [{name: 'Norte da Ilha', value: 2}, {name: 'Centro', value: 4}]
    };
  }, [events]);

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-[4px] border-[#111111] bg-white p-5 shadow-[8px_8px_0px_0px_#111111]">
        <h2 className="text-2xl font-black text-[#111111] tracking-tighter uppercase">Visão Geral</h2>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
          <span className="text-sm font-bold px-4 py-2 bg-[#111111] text-white border-[2px] border-[#111111]">
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
        <HeatmapGrid data={dashboardStats.scHeatmap} title="Calor - Santa Catarina" isFloripa={false} />
        <HeatmapGrid data={dashboardStats.floripaHeatmap} title="Calor - Florianópolis" isFloripa={true} />
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Controles Mondrian */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-5 border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111]">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="BUSCAR AGENDA..." 
            className="w-full pl-4 pr-4 py-3 bg-[#Fdfcf0] border-[3px] border-[#111111] focus:outline-none focus:ring-0 focus:border-[#C1272D] font-bold text-sm uppercase transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <select 
            className="bg-[#Fdfcf0] border-[3px] border-[#111111] font-bold text-sm uppercase px-4 py-3 focus:outline-none cursor-pointer"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">Todas as Agendas</option>
            <option value="future">Agendas Futuras</option>
            <option value="past">Agendas Realizadas</option>
          </select>

          <div className="flex bg-[#111111] p-1 border-[3px] border-[#111111]">
            <button onClick={() => setViewMode('cards')} className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${viewMode === 'cards' ? 'bg-white text-[#111111]' : 'text-white hover:bg-gray-800'}`}>Cards</button>
            <button onClick={() => setViewMode('table')} className={`px-4 py-2 text-sm font-bold uppercase transition-colors ${viewMode === 'table' ? 'bg-white text-[#111111]' : 'text-white hover:bg-gray-800'}`}>Lista</button>
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
                  <div key={i} onClick={() => setSelectedEvent(ev)} className="bg-white p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] hover:shadow-[10px_10px_0px_0px_#111111] hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full group relative">
                    <div className="absolute top-0 right-0 w-8 h-8 border-l-[4px] border-b-[4px] border-[#111111]" style={{ backgroundColor: future ? COLORS.teal : '#d1d5db' }}></div>
                    
                    <div className="flex justify-between items-start mb-4 pr-10">
                      <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#111111] px-2 py-1 border-[2px] border-[#111111]">
                        {ev['Classe de Atividade'] || 'SEM CLASSE'}
                      </span>
                    </div>
                    
                    <h3 className="font-black text-xl text-[#111111] leading-tight mb-4 uppercase line-clamp-3">{ev['Título']}</h3>
                    
                    <div className="mt-auto space-y-2 border-t-[3px] border-[#111111] pt-4">
                      <div className="flex justify-between items-center">
                         <div className="text-xs font-bold text-gray-600 uppercase flex items-center gap-2">
                           <span className="w-2 h-2 bg-[#111111] rounded-full inline-block"></span>
                           {formatDate(ev['Início'])}
                         </div>
                      </div>
                      <div className="text-xs font-bold text-gray-800 uppercase flex items-center gap-2 truncate">
                         <span className="w-2 h-2 bg-gray-400 inline-block"></span>
                         {ev['Local'] || ev['Região']}
                      </div>
                    </div>

                    {/* Tag de Status Geométrico */}
                    <div className="absolute bottom-4 right-4 border-[2px] border-[#111111] px-2 py-1 bg-white text-[10px] font-black uppercase" style={{ color: statusColor, borderColor: statusColor }}>
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
                      <th className="px-5 py-4 font-black border-b-[3px] border-white">Local</th>
                      <th className="px-5 py-4 font-black border-b-[3px] border-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((ev, i) => (
                      <tr key={i} onClick={() => setSelectedEvent(ev)} className="bg-white border-b-[2px] border-[#111111] hover:bg-[#Fdfcf0] cursor-pointer transition-colors">
                        <td className="px-5 py-4 font-black text-[#111111] uppercase max-w-[250px] truncate">{ev['Título']}</td>
                        <td className="px-5 py-4 font-bold text-gray-700 whitespace-nowrap">{formatDate(ev['Início'])}</td>
                        <td className="px-5 py-4 font-bold text-gray-700 truncate max-w-[200px]">{ev['Local'] || ev['Região']}</td>
                        <td className="px-5 py-4">
                          <span className="text-[10px] font-black px-2 py-1 border-[2px] border-[#111111] uppercase" style={{ backgroundColor: ev['STATUS'] === 'Confirmado' ? COLORS.teal : COLORS.mustard, color: ev['STATUS'] === 'Confirmado' ? 'white' : '#111111' }}>
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
    const isPastEvent = isPast(selectedEvent['Início']);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
        <div className="bg-[#Fdfcf0] w-full max-w-lg h-full border-l-[6px] border-[#111111] flex flex-col transform transition-transform translate-x-0 overflow-y-auto shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.2)]">
          
          <div className="p-6 bg-white border-b-[4px] border-[#111111] sticky top-0 z-10 flex justify-between items-start">
            <div className="pr-4">
              <div className="inline-block bg-[#111111] text-white text-[10px] font-black uppercase px-2 py-1 border-[2px] border-[#111111] mb-3">
                {selectedEvent['Classe de Atividade']}
              </div>
              <h2 className="text-2xl font-black text-[#111111] leading-none uppercase">{selectedEvent['Título']}</h2>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="p-2 bg-[#C1272D] text-white border-[3px] border-[#111111] hover:bg-[#8B1C20] hover:-translate-y-0.5 transition-transform shadow-[3px_3px_0px_0px_#111111]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          <div className="p-6 space-y-6 flex-1">
            
            <div className="bg-white p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111]">
              <label className="block text-sm font-black text-[#111111] uppercase mb-3 border-b-[2px] border-[#111111] pb-1">Gerenciar Status</label>
              <select 
                className="w-full bg-[#Fdfcf0] border-[3px] border-[#111111] font-bold text-[#111111] text-sm uppercase focus:outline-none p-3 cursor-pointer"
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
              <div className="bg-white p-4 border-[3px] border-[#111111]">
                <label className="text-[10px] uppercase font-black text-[#C1272D] tracking-wider block mb-1">Início</label>
                <p className="text-sm font-bold text-[#111111]">{formatDate(selectedEvent['Início'])}</p>
              </div>
              <div className="bg-white p-4 border-[3px] border-[#111111]">
                <label className="text-[10px] uppercase font-black text-[#C1272D] tracking-wider block mb-1">Fim</label>
                <p className="text-sm font-bold text-[#111111]">{formatDate(selectedEvent['Fim'])}</p>
              </div>
            </div>

            <div className="bg-white p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] space-y-5">
              <div>
                <label className="text-[10px] uppercase font-black text-[#007D8A] tracking-wider block border-b-[2px] border-[#111111] pb-1 mb-2">Local</label>
                <p className="text-sm font-bold text-[#111111] uppercase">{selectedEvent['Local'] || 'NÃO ESPECIFICADO'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-black text-[#007D8A] tracking-wider block border-b-[2px] border-[#111111] pb-1 mb-2">Região</label>
                  <p className="text-sm font-bold text-[#111111] uppercase">{selectedEvent['Região']}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black text-[#007D8A] tracking-wider block border-b-[2px] border-[#111111] pb-1 mb-2">Articulador</label>
                  <p className="text-sm font-bold text-[#111111] uppercase">{selectedEvent['Articulador']}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111]">
              <label className="text-[10px] uppercase font-black text-[#EAA221] tracking-wider block border-b-[2px] border-[#111111] pb-1 mb-3">Descrição / Notas</label>
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
      
      {/* Sidebar Mondrian */}
      <nav className="bg-[#111111] text-white w-full md:w-72 flex-shrink-0 flex flex-col z-20 border-r-[6px] border-[#111111]">
        <div className="p-8 border-b-[4px] border-white bg-[#C1272D]">
          <h1 className="text-4xl font-black tracking-tighter text-white border-b-[4px] border-white pb-2 inline-block">TABULUM</h1>
          <p className="text-xs text-white font-black uppercase tracking-widest mt-2 bg-[#111111] px-2 py-1 inline-block">GesTaAg • Marquito</p>
        </div>
        
        <div className="flex flex-row md:flex-col p-4 gap-4 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-3 px-5 py-4 border-[3px] border-white text-sm font-black uppercase transition-all whitespace-nowrap shadow-[4px_4px_0px_0px_#ffffff] hover:-translate-y-1 ${activeTab === 'list' ? 'bg-[#EAA221] text-[#111111] border-[#111111]' : 'bg-[#111111] text-white hover:bg-white hover:text-[#111111]'}`}
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
            <div className="flex items-center gap-2 mt-3 border-t-[2px] border-[#111111] pt-2">
              <span className={`w-4 h-4 border-[2px] border-[#111111] ${API_URL ? 'bg-[#007D8A]' : 'bg-[#EAA221]'}`}></span>
              <span className="text-xs text-[#111111] font-black uppercase">{API_URL ? 'Online (Vercel)' : 'Demonstração'}</span>
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
        /* Font geometry tuning to match Mondrian feel without external fonts */
        * { font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
      `}} />
    </div>
  );
}
