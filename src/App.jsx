import React, { useState, useEffect, useMemo } from 'react';

// Constantes e Mock Data
// Para usar no Vercel com Vite, substitua a string vazia por: import.meta.env.VITE_APPS_SCRIPT_URL
const API_URL = ''; 

const MOCK_DATA = [
  { id: 2, 'Título': 'Sessão Plenária ALESC', 'Início': new Date().toISOString(), 'Fim': new Date(Date.now() + 7200000).toISOString(), 'Descrição': 'Votação de projetos de lei ambientais.', 'Duração': 120, 'Local': 'ALESC - Florianópolis', 'Classe de Atividade': 'Sessão Legislativa', 'Região': 'Grande Florianópolis', 'Articulador': 'João Silva', 'STATUS': 'Confirmado' },
  { id: 3, 'Título': 'Reunião Associação Moradores', 'Início': new Date(Date.now() + 86400000).toISOString(), 'Fim': new Date(Date.now() + 93600000).toISOString(), 'Descrição': 'Debate sobre saneamento básico.', 'Duração': 120, 'Local': 'Campeche - Florianópolis', 'Classe de Atividade': 'Comunidade', 'Região': 'Florianópolis (Sul)', 'Articulador': 'Maria Costa', 'STATUS': 'Pendente' },
  { id: 4, 'Título': 'Visita Feira Orgânica', 'Início': new Date(Date.now() - 172800000).toISOString(), 'Fim': new Date(Date.now() - 165600000).toISOString(), 'Descrição': 'Apoio aos produtores locais.', 'Duração': 120, 'Local': 'Chapecó', 'Classe de Atividade': 'Visita Técnica', 'Região': 'Oeste', 'Articulador': 'Pedro Alves', 'STATUS': 'Realizado' },
  { id: 5, 'Título': 'Audiência Pública Meio Ambiente', 'Início': new Date(Date.now() + 259200000).toISOString(), 'Fim': new Date(Date.now() + 273600000).toISOString(), 'Descrição': 'Proteção de mananciais.', 'Duração': 240, 'Local': 'Joinville', 'Classe de Atividade': 'Audiência Pública', 'Região': 'Norte', 'Articulador': 'Ana Souza', 'STATUS': 'Confirmado' },
  { id: 6, 'Título': 'Entrevista Rádio Local', 'Início': new Date(Date.now() - 86400000).toISOString(), 'Fim': new Date(Date.now() - 82800000).toISOString(), 'Descrição': 'Pauta: Agricultura Familiar', 'Duração': 60, 'Local': 'Lages', 'Classe de Atividade': 'Imprensa', 'Região': 'Serra', 'Articulador': 'João Silva', 'STATUS': 'Realizado' },
];

// Funções Auxiliares
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
};

const isFuture = (dateString) => new Date(dateString) >= new Date();
const isPast = (dateString) => new Date(dateString) < new Date();

// Componentes Gráficos Nativos (Sem dependências)
const SimpleBarChart = ({ data, title }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[300px]">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 w-24 truncate" title={item.name}>{item.name}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${(item.value / maxVal) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs font-medium text-gray-800 w-6 text-right">{item.value}</span>
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

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[300px] flex flex-col items-center">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 self-start">{title}</h3>
      <div className="relative w-32 h-32">
        <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
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

            return <path key={i} d={pathData} fill={colors[i % colors.length]} />;
          })}
        </svg>
      </div>
      <div className="mt-4 w-full flex flex-wrap gap-2 justify-center">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></span>
            {item.name} ({(item.value / total * 100).toFixed(0)}%)
          </div>
        ))}
      </div>
    </div>
  );
};

// Visualização Abstrata de Mapas de Calor (Disposição em Grid Representativo)
const HeatmapGrid = ({ data, title, isFloripa }) => {
  // Simulação de mapa de calor baseada na densidade de eventos por região
  const maxDensity = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex-1 min-w-[300px]">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-xs text-gray-400 mb-4">Intensidade de agenda por localidade</p>
      
      <div className={`grid ${isFloripa ? 'grid-cols-2' : 'grid-cols-3'} gap-2 h-40`}>
        {data.map((item, i) => {
          const intensity = item.value / maxDensity;
          // Cores variando do cinza claro ao vermelho escuro baseado na intensidade
          const bgColor = intensity > 0.8 ? 'bg-red-500' : 
                          intensity > 0.5 ? 'bg-orange-400' : 
                          intensity > 0.2 ? 'bg-amber-300' : 
                          intensity > 0 ? 'bg-emerald-200' : 'bg-gray-50';
          
          return (
            <div key={i} className={`${bgColor} rounded-md flex items-center justify-center relative group transition-colors`}>
              <span className={`text-[10px] font-bold ${intensity > 0.5 ? 'text-white' : 'text-gray-700'} text-center px-1`}>
                {item.name.substring(0, 10)}{item.name.length > 10 ? '...' : ''}
              </span>
              {/* Tooltip */}
              <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-1 rounded -top-6 whitespace-nowrap z-10">
                {item.name}: {item.value} agendas
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('list'); // 'dashboard', 'list'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controls
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'future', 'past'
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'table'
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!API_URL) {
          console.warn("VITE_APPS_SCRIPT_URL não definida. Usando dados mockados.");
          setEvents(MOCK_DATA);
        } else {
          const response = await fetch(API_URL);
          const data = await response.json();
          setEvents(data);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setEvents(MOCK_DATA); // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update Status Logic
  const handleUpdateStatus = async (id, newStatus) => {
    // Optimistic UI update
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
        });
      } catch (error) {
        console.error("Erro ao atualizar status:", error);
        alert("Erro ao atualizar o status na planilha.");
      }
    }
  };

  // Data Processing for Filters
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      // Time filter
      if (timeFilter === 'future' && !isFuture(ev['Início'])) return false;
      if (timeFilter === 'past' && !isPast(ev['Início'])) return false;
      
      // Search filter
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
    }).sort((a, b) => new Date(a['Início']) - new Date(b['Início'])); // Ordena por data
  }, [events, search, timeFilter]);

  // Data Processing for Dashboard
  const dashboardStats = useMemo(() => {
    const agg = (key) => {
      const counts = {};
      events.forEach(ev => {
        const val = ev[key] || 'Não definido';
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    // Separando regiões gerais (SC) e regiões específicas de Floripa
    const todasRegioes = agg('Região');
    const scRegioes = todasRegioes.filter(r => !r.name.toLowerCase().includes('florianópolis (') && r.name !== 'Não definido');
    const floripaRegioes = todasRegioes.filter(r => r.name.toLowerCase().includes('florianópolis ('));

    return {
      classes: agg('Classe de Atividade'),
      regioes: todasRegioes,
      articuladores: agg('Articulador'),
      scHeatmap: scRegioes.length > 0 ? scRegioes : [{name: 'Oeste', value: 1}, {name: 'Norte', value: 2}, {name: 'Vale', value: 1}, {name: 'Sul', value: 1}, {name: 'Serra', value: 0}], // mock fallback if empty
      floripaHeatmap: floripaRegioes.length > 0 ? floripaRegioes : [{name: 'Norte da Ilha', value: 2}, {name: 'Sul da Ilha', value: 3}, {name: 'Continente', value: 1}, {name: 'Centro', value: 4}] // mock fallback if empty
    };
  }, [events]);

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Visão Geral da Agenda</h2>
        <span className="text-sm font-medium px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
          Total de Agendas: {events.length}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SimpleBarChart data={dashboardStats.classes} title="Agendas por Classe de Atividade" />
        <SimplePieChart data={dashboardStats.regioes} title="Distribuição por Região" />
        <SimplePieChart data={dashboardStats.articuladores} title="Volume por Articulador" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <HeatmapGrid data={dashboardStats.scHeatmap} title="Calor de Agendas - Santa Catarina" isFloripa={false} />
        <HeatmapGrid data={dashboardStats.floripaHeatmap} title="Calor de Agendas - Florianópolis" isFloripa={true} />
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Controles */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <input 
            type="text" 
            placeholder="Buscar por título, local, articulador..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        
        <div className="flex gap-2">
          <select 
            className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2 outline-none"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="all">Todas as Agendas</option>
            <option value="future">Agendas Futuras</option>
            <option value="past">Agendas Realizadas</option>
          </select>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('cards')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'cards' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Cards</button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>Lista</button>
          </div>
        </div>
      </div>

      {/* Exibição */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100 border-dashed">
          Nenhuma agenda encontrada com os filtros atuais.
        </div>
      ) : (
        <>
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((ev, i) => (
                <div key={i} onClick={() => setSelectedEvent(ev)} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${isFuture(ev['Início']) ? 'bg-emerald-500' : 'bg-gray-300'}`}></div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">{ev['Classe de Atividade'] || 'Sem Classe'}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${ev['STATUS'] === 'Confirmado' || ev['STATUS'] === 'Realizado' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                      {ev['STATUS'] || 'Pendente'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 leading-tight mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">{ev['Título']}</h3>
                  <div className="mt-auto space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> {formatDate(ev['Início'])}</div>
                    <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> <span className="truncate">{ev['Local'] || ev['Região']}</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3">Título</th>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Local/Região</th>
                      <th className="px-4 py-3">Articulador</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((ev, i) => (
                      <tr key={i} onClick={() => setSelectedEvent(ev)} className="bg-white border-b border-gray-50 hover:bg-emerald-50/50 cursor-pointer transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[200px]">{ev['Título']}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{formatDate(ev['Início'])}</td>
                        <td className="px-4 py-3 truncate max-w-[150px]">{ev['Local'] || ev['Região']}</td>
                        <td className="px-4 py-3">{ev['Articulador']}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${ev['STATUS'] === 'Confirmado' || ev['STATUS'] === 'Realizado' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
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
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
        <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col transform transition-transform translate-x-0 overflow-y-auto">
          {/* Header */}
          <div className="p-5 bg-gray-50 border-b border-gray-200 flex justify-between items-start sticky top-0 z-10">
            <div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded uppercase">{selectedEvent['Classe de Atividade']}</span>
              <h2 className="text-xl font-bold text-gray-900 mt-2 leading-tight">{selectedEvent['Título']}</h2>
            </div>
            <button onClick={() => setSelectedEvent(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6 flex-1">
            
            {/* Status Manager */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Status da Agenda</label>
              <select 
                className="w-full bg-white border border-blue-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none shadow-sm"
                value={selectedEvent['STATUS'] || 'Pendente'}
                onChange={(e) => handleUpdateStatus(selectedEvent.id, e.target.value)}
              >
                <option value="Pendente">Pendente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Realizado">Realizado</option>
              </select>
              <p className="text-[10px] text-blue-600 mt-2">* Alterar aqui sincroniza direto com a Planilha Sheets.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Início</label>
                <p className="text-sm font-medium text-gray-800">{formatDate(selectedEvent['Início'])}</p>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Fim</label>
                <p className="text-sm font-medium text-gray-800">{formatDate(selectedEvent['Fim'])}</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                   Local
                </label>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded-md border border-gray-100">{selectedEvent['Local'] || 'Não especificado'}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Região</label>
                  <p className="text-sm font-medium text-gray-800">{selectedEvent['Região']}</p>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Articulador</label>
                  <p className="text-sm font-medium text-gray-800">{selectedEvent['Articulador']}</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Descrição / Notas</label>
              <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap min-h-[100px]">
                {selectedEvent['Descrição'] || 'Nenhuma descrição fornecida no calendário.'}
              </div>
            </div>

            {/* Status Temporal Tag */}
            <div className="flex justify-center pt-4">
               <span className={`text-xs px-4 py-1.5 rounded-full font-medium ${isPastEvent ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'}`}>
                 {isPastEvent ? 'Esta agenda já passou' : 'Agenda futura'}
               </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col md:flex-row selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Sidebar / Topnav */}
      <nav className="bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col shadow-xl z-20">
        <div className="p-6">
          <h1 className="text-xl font-bold tracking-tight text-white">Tabulum</h1>
          <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-widest mt-1">GesTaAg • Marquito</p>
        </div>
        
        <div className="flex flex-row md:flex-col gap-1 px-4 pb-4 md:pb-0 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'list' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            Agendas
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path></svg>
            Dashboard
          </button>
        </div>

        <div className="mt-auto hidden md:block p-6">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400 leading-relaxed">Conectado via API Rest ao Google Sheets.</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`w-2 h-2 rounded-full ${API_URL ? 'bg-emerald-400' : 'bg-orange-400'}`}></span>
              <span className="text-[10px] text-slate-300 font-bold uppercase">{API_URL ? 'Planilha Sincronizada' : 'Modo Demonstração (Mock)'}</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-medium text-gray-500">Sincronizando com a Planilha...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto h-full">
            {activeTab === 'list' && renderList()}
            {activeTab === 'dashboard' && renderDashboard()}
          </div>
        )}
      </main>

      {/* Slide-over Panel for Details */}
      {renderDetails()}
      
      {/* Global CSS for some smooth animations without libs */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}} />
    </div>
  );
}
