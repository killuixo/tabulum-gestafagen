import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// CONFIGURAÇÃO DA API GOOGLE SHEETS
// ==========================================
const getApiUrl = () => {
  try { return import.meta.env.VITE_APPS_SCRIPT_URL || ''; }
  catch (e) { return ''; }
};
const API_URL = getApiUrl();

// ==========================================
// ÍCONES SVG MINIMALISTAS (PADRÃO TABULUM - EMENDAS)
// ==========================================
const Icon = ({ path, className = "w-4 h-4", onClick, size, style }) => (
  <svg
    onClick={onClick}
    style={{ width: size, height: size, ...style }}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {path}
  </svg>
);

const SearchIcon = (p) => <Icon {...p} path={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>} />;
const MapPinIcon = (p) => <Icon {...p} path={<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></>} />;
const MapIcon = (p) => <Icon {...p} path={<><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></>} />;
const UserIcon = (p) => <Icon {...p} path={<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />;
const TagIcon = (p) => <Icon {...p} path={<><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></>} />;
const CalendarIcon = (p) => <Icon {...p} path={<><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></>} />;
const ClockIcon = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />;
const LayersIcon = (p) => <Icon {...p} path={<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>} />;
const XIcon = (p) => <Icon {...p} path={<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>} />;
const RefreshCwIcon = (p) => <Icon {...p} path={<><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></>} />;
const LayoutDashboardIcon = (p) => <Icon {...p} path={<><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></>} />;
const TableIcon = (p) => <Icon {...p} path={<><path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/></>} />;
const ChevronUpIcon = (p) => <Icon {...p} path={<><path d="m18 15-6-6-6 6"/></>} />;
const ChevronDownIcon = (p) => <Icon {...p} path={<><path d="m6 9 6 6 6-6"/></>} />;
const GridIcon = (p) => <Icon {...p} path={<><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></>} />;
const ListIcon = (p) => <Icon {...p} path={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>} />;
const DownloadIcon = (p) => <Icon {...p} path={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></>} />;
const PrinterIcon = (p) => <Icon {...p} path={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></>} />;
const FilterIcon = (p) => <Icon {...p} path={<><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></>} />;
const AlertCircleIcon = (p) => <Icon {...p} path={<><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></>} />;

// ==========================================
// DICIONÁRIOS TERRITORIAIS (ABA APOIO: 56 BAIRROS REPLAN + REGIÕES SC)
// ==========================================
const FLORIPA_REPLAN = [
  { b: 'Abraão', r: 'Continental', d: 'Coqueiros' },
  { b: 'Agronômica', r: 'Central', d: 'Sede Insular' },
  { b: 'Alto Ribeirão', r: 'Sul', d: 'Ribeirão da Ilha' },
  { b: 'Armação', r: 'Sul', d: 'Pântano do Sul' },
  { b: 'Balneário', r: 'Continental', d: 'Estreito' },
  { b: 'Barra da Lagoa', r: 'Leste', d: 'Barra da Lagoa' },
  { b: 'Bom Abrigo', r: 'Continental', d: 'Coqueiros' },
  { b: 'Cachoeira do Bom Jesus', r: 'Norte', d: 'Cachoeira do Bom Jesus' },
  { b: 'Cacupé', r: 'Norte', d: 'Santo Antônio de Lisboa' },
  { b: 'Campeche', r: 'Sul', d: 'Campeche' },
  { b: 'Canasvieiras', r: 'Norte', d: 'Canasvieiras' },
  { b: 'Canto', r: 'Continental', d: 'Estreito' },
  { b: 'Capoeiras', r: 'Continental', d: 'Estreito' },
  { b: 'Capoeiras Oeste', r: 'Continental', d: 'Coqueiros' },
  { b: 'Carianos', r: 'Sul', d: 'Campeche' },
  { b: 'Carvoeira', r: 'Central', d: 'Trindade' },
  { b: 'Centro', r: 'Central', d: 'Sede Insular' },
  { b: 'Coloninha', r: 'Continental', d: 'Estreito' },
  { b: 'Coqueiros', r: 'Continental', d: 'Coqueiros' },
  { b: 'Córrego Grande', r: 'Central', d: 'Trindade' },
  { b: 'Costa da Lagoa', r: 'Leste', d: 'Lagoa da Conceição' },
  { b: 'Costeira do Pirajubaé', r: 'Sul', d: 'Saco dos Limões' },
  { b: 'Daniela', r: 'Norte', d: 'Canasvieiras' },
  { b: 'Estreito', r: 'Continental', d: 'Estreito' },
  { b: 'Ingleses', r: 'Norte', d: 'Ingleses' },
  { b: 'Itacorubi', r: 'Central', d: 'Trindade' },
  { b: 'Itaguaçu', r: 'Continental', d: 'Coqueiros' },
  { b: 'Jardim Atlântico', r: 'Continental', d: 'Estreito' },
  { b: 'João Paulo', r: 'Central', d: 'Saco Grande' },
  { b: 'José Mendes', r: 'Central', d: 'Sede Insular' },
  { b: 'Jurerê', r: 'Norte', d: 'Canasvieiras' },
  { b: 'Lagoa da Conceição', r: 'Leste', d: 'Lagoa da Conceição' },
  { b: 'Moçambique', r: 'Norte', d: 'Rio Vermelho' },
  { b: 'Monte Cristo', r: 'Continental', d: 'Estreito' },
  { b: 'Monte Verde', r: 'Central', d: 'Saco Grande' },
  { b: 'Morro das Pedras', r: 'Sul', d: 'Campeche' },
  { b: 'Pantanal', r: 'Central', d: 'Trindade' },
  { b: 'Pântano do Sul', r: 'Sul', d: 'Pântano do Sul' },
  { b: 'Ponta das Canas', r: 'Norte', d: 'Cachoeira do Bom Jesus' },
  { b: 'Praia Brava', r: 'Norte', d: 'Cachoeira do Bom Jesus' },
  { b: 'Praia do Forte', r: 'Norte', d: 'Canasvieiras' },
  { b: 'Ratones', r: 'Norte', d: 'Ratones' },
  { b: 'Ribeirão da Ilha', r: 'Sul', d: 'Ribeirão da Ilha' },
  { b: 'Rio Tavares', r: 'Sul', d: 'Campeche' },
  { b: 'Rio Vermelho', r: 'Norte', d: 'Rio Vermelho' },
  { b: 'Saco dos Limões', r: 'Central', d: 'Saco dos Limões' },
  { b: 'Saco Grande', r: 'Central', d: 'Saco Grande' },
  { b: 'Sambaqui', r: 'Norte', d: 'Santo Antônio de Lisboa' },
  { b: 'Santa Mônica', r: 'Central', d: 'Trindade' },
  { b: 'Santinho', r: 'Norte', d: 'Ingleses' },
  { b: 'Santo Antônio de Lisboa', r: 'Norte', d: 'Santo Antônio de Lisboa' },
  { b: 'Tapera da Base', r: 'Sul', d: 'Tapera da Base' },
  { b: 'Trindade', r: 'Central', d: 'Trindade' },
  { b: 'Vargem do Bom Jesus', r: 'Norte', d: 'Cachoeira do Bom Jesus' },
  { b: 'Vargem Grande', r: 'Norte', d: 'Ratones' },
  { b: 'Vargem Pequena', r: 'Norte', d: 'Canasvieiras' }
];

const FLORIPA_ALIASES = [
  { match: /(alesc|assembleia legislativa|palacio barriga verde|plenario|plenarinho|gabinete 26|gabinete 026)/, b: 'Centro' },
  { match: /(ufsc|reitoria da ufsc|cse ufsc|centro de cultura e eventos)/, b: 'Trindade' },
  { match: /(cca ufsc|udesc|ceart|epagri|cidasc)/, b: 'Itacorubi' },
  { match: /(centro administrativo)/, b: 'Saco Grande' },
  { match: /(ifsc continente)/, b: 'Coqueiros' },
  { match: /(parque da luz|bugio|mercado publico|largo da alfandega|catedral)/, b: 'Centro' },
  { match: /(sintrajusc)/, b: 'Campeche' }
];

const SC_REGION_MAP = {
  'FLORIANOPOLIS': 'GRANDE FLORIANÓPOLIS', 'SAO JOSE': 'GRANDE FLORIANÓPOLIS', 'PALHOCA': 'GRANDE FLORIANÓPOLIS',
  'BIGUACU': 'GRANDE FLORIANÓPOLIS', 'SANTO AMARO DA IMPERATRIZ': 'GRANDE FLORIANÓPOLIS', 'AGUAS MORNAS': 'GRANDE FLORIANÓPOLIS',
  'ALFREDO WAGNER': 'GRANDE FLORIANÓPOLIS', 'ANTONIO CARLOS': 'GRANDE FLORIANÓPOLIS', 'GOVERNADOR CELSO RAMOS': 'GRANDE FLORIANÓPOLIS',
  'GAROPABA': 'SUL II', 'IMBITUBA': 'SUL II', 'LAGUNA': 'SUL II', 'TUBARAO': 'SUL II', 'IMARUI': 'SUL II', 'JAGUARUNA': 'SUL II', 'CAPIVARI DE BAIXO': 'SUL II', 'GRAVATAL': 'SUL II', 'BRACO DO NORTE': 'SUL II',
  'CRICIUMA': 'SUL I', 'ARARANGUA': 'SUL I', 'ICARA': 'SUL I', 'FORQUILHINHA': 'SUL I', 'URUSSANGA': 'SUL I', 'SIDEROPOLIS': 'SUL I', 'NOVA VENEZA': 'SUL I', 'LAURO MULLER': 'SUL I', 'SOMBRIO': 'SUL I', 'JACINTO MACHADO': 'SUL I',
  'JOINVILLE': 'NORTE', 'JARAGUA DO SUL': 'NORTE', 'SAO FRANCISCO DO SUL': 'NORTE', 'ITAPOA': 'NORTE', 'ARAQUARI': 'NORTE', 'GUARAMIRIM': 'NORTE', 'BARRA VELHA': 'NORTE', 'CORUPA': 'NORTE', 'SCHROEDER': 'NORTE',
  'BLUMENAU': 'VALE DO ITAJAÍ', 'GASPAR': 'VALE DO ITAJAÍ', 'INDAIAL': 'VALE DO ITAJAÍ', 'TIMBO': 'VALE DO ITAJAÍ', 'POMERODE': 'VALE DO ITAJAÍ', 'BRUSQUE': 'VALE DO ITAJAÍ',
  'ITAJAI': 'LITORAL DO VALE DO ITAJAÍ', 'BALNEARIO CAMBORIU': 'LITORAL DO VALE DO ITAJAÍ', 'CAMBORIU': 'LITORAL DO VALE DO ITAJAÍ', 'NAVEGANTES': 'LITORAL DO VALE DO ITAJAÍ', 'BOMBINHAS': 'LITORAL DO VALE DO ITAJAÍ', 'PORTO BELO': 'LITORAL DO VALE DO ITAJAÍ', 'ITAPEMA': 'LITORAL DO VALE DO ITAJAÍ', 'PENHA': 'LITORAL DO VALE DO ITAJAÍ',
  'RIO DO SUL': 'ALTO VALE DO ITAJAÍ', 'IBIRAMA': 'ALTO VALE DO ITAJAÍ', 'PRESIDENTE GETULIO': 'ALTO VALE DO ITAJAÍ', 'ITUPORANGA': 'ALTO VALE DO ITAJAÍ', 'AGROLANDIA': 'ALTO VALE DO ITAJAÍ', 'TAIO': 'ALTO VALE DO ITAJAÍ',
  'LAGES': 'SERRANA', 'URUBICI': 'SERRANA', 'SAO JOAQUIM': 'SERRANA', 'BOM JARDIM DA SERRA': 'SERRANA', 'URUPEMA': 'SERRANA', 'CURITIBANOS': 'SERRANA', 'PONTE ALTA': 'SERRANA', 'CORREIA PINTO': 'SERRANA', 'OTACILIO COSTA': 'SERRANA', 'CAMPO BELO DO SUL': 'SERRANA',
  'CANOINHAS': 'PLANALTO NORTE', 'MAFRA': 'PLANALTO NORTE', 'SAO BENTO DO SUL': 'PLANALTO NORTE', 'RIO NEGRINHO': 'PLANALTO NORTE', 'PORTO UNIAO': 'PLANALTO NORTE', 'ITAIOPOLIS': 'PLANALTO NORTE', 'PAPANDUVA': 'PLANALTO NORTE',
  'CHAPECO': 'OESTE I', 'XANXERE': 'OESTE I', 'QUILOMBO': 'OESTE I', 'XAXIM': 'OESTE I', 'PINHALZINHO': 'OESTE I', 'CORONEL FREITAS': 'OESTE I',
  'CONCORDIA': 'OESTE II', 'SEARA': 'OESTE II', 'IPUMIRIM': 'OESTE II',
  'JOACABA': 'MEIO-OESTE I', 'HERVAL D\'OESTE': 'MEIO-OESTE I', 'CAMPOS NOVOS': 'MEIO-OESTE I',
  'CACADOR': 'MEIO-OESTE II', 'VIDEIRA': 'MEIO-OESTE II', 'FRAIBURGO': 'MEIO-OESTE II',
  'SAO MIGUEL DO OESTE': 'EXTREMO-OESTE', 'MARAVILHA': 'EXTREMO-OESTE', 'DIONISIO CERQUEIRA': 'EXTREMO-OESTE', 'ITAPIRANGA': 'EXTREMO-OESTE'
};

const MOCK_DATA = [
  { id: 2, 'Título': 'Sessão Plenária ALESC', 'Início': new Date(Date.now() + 86400000).toISOString(), 'Fim': new Date(Date.now() + 93600000).toISOString(), 'Descrição': 'Votação ambiental.', 'Duração': 120, 'Local': 'ALESC - Centro, Florianópolis', 'Classe de Atividade': 'PLENÁRIA', 'Município': 'Florianópolis', 'Articulador': 'Carla', 'STATUS': 'Confirmado', 'Prioridade': 'Alta' },
  { id: 3, 'Título': 'Reunião Associação Comunitária', 'Início': new Date(Date.now() + 172800000).toISOString(), 'Fim': new Date(Date.now() + 182800000).toISOString(), 'Descrição': 'Pauta de saneamento e agroecologia.', 'Duração': 150, 'Local': 'Imbituba, SC', 'Classe de Atividade': 'REUNIÃO', 'Município': 'Imbituba', 'Articulador': 'Laura', 'STATUS': 'Pendente', 'Prioridade': 'Média' }
];

// ==========================================
// FUNÇÕES UTILITÁRIAS E PARSERS
// ==========================================
function normalizeStr(str) {
  if (!str) return '';
  return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
}

function normalizerFilter(str) {
  if (!str) return '';
  return String(str).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function toProperCase(str) {
  if (!str || typeof str !== 'string') return '';
  const lowerExceptions = ['da', 'de', 'do', 'das', 'dos', 'e', 'em'];
  return str.trim().toLowerCase().split(/\s+/).map((w, idx) => {
    if (idx > 0 && lowerExceptions.includes(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}

function parseLocalDate(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
  const s = String(dateVal).trim();
  const isoDayMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDayMatch) {
    return new Date(Number(isoDayMatch[1]), Number(isoDayMatch[2]) - 1, Number(isoDayMatch[3]), 12, 0, 0);
  }
  const brDayMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brDayMatch) {
    return new Date(Number(brDayMatch[3]), Number(brDayMatch[2]) - 1, Number(brDayMatch[1]), 12, 0, 0);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(dateVal) {
  const d = parseLocalDate(dateVal);
  if (!d) return '-';
  const s = String(dateVal).trim();
  const hasTime = s.includes(':') && !s.endsWith('00:00:00.000Z');
  if (hasTime) {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  }
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

function getTodayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
}

function isFuture(dateVal) {
  const d = parseLocalDate(dateVal);
  return d ? d >= getTodayStart() : false;
}

function isPast(dateVal) {
  const d = parseLocalDate(dateVal);
  return d ? d < getTodayStart() : false;
}

function stripHtml(str) {
  if (!str) return '';
  return String(str).replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
}

function enrichFloripaLocation(evento, isOnline) {
  if (isOnline) {
    return { bairro: 'Digital / Online', distrito: 'Virtual', regiao: 'Online' };
  }
  const textToSearch = normalizerFilter([evento['Local'] || '', evento['Título'] || '', evento['Descrição'] || ''].join(' '));
  const sortedReplan = [...FLORIPA_REPLAN].sort((a, b) => b.b.length - a.b.length);
  for (let item of sortedReplan) {
    if (textToSearch.includes(normalizerFilter(item.b))) {
      return { bairro: item.b, distrito: item.d, regiao: item.r };
    }
  }
  for (let alias of FLORIPA_ALIASES) {
    if (alias.match.test(textToSearch)) {
      const found = FLORIPA_REPLAN.find(r => r.b === alias.b);
      if (found) return { bairro: found.b, distrito: found.d, regiao: found.r };
    }
  }
  return { bairro: 'Centro / Não Especificado', distrito: 'Sede Insular', regiao: 'Central' };
}

function normalizeData(data) {
  return data.map(item => {
    const newItem = { id: item.id };
    const keys = Object.keys(item);
    keys.forEach(k => { newItem[k] = item[k]; });

    keys.forEach(k => {
      if (k === 'id') return;
      const normK = normalizerFilter(k);
      if (normK.includes('titulo')) newItem['Título'] = String(item[k] || '').trim();
      if (normK.includes('inicio')) newItem['Início'] = item[k];
      if (normK.includes('fim')) newItem['Fim'] = item[k];
      if (normK.includes('descri')) newItem['Descrição'] = stripHtml(item[k]);
      if (normK.includes('duracao')) newItem['Duração'] = Number(item[k]) || 0;
      if (normK.includes('local')) newItem['Local'] = String(item[k] || '').trim();
      if (normK === 'classe de atividade' || normK === 'classe') {
        newItem['Classe de Atividade'] = item[k] ? String(item[k]).trim().toUpperCase() : 'OUTROS EVENTOS';
      }
      if (normK === 'municipio') newItem['Município_Original'] = String(item[k] || '').trim();
      if (normK === 'regiao') newItem['Região'] = String(item[k] || '').trim();
      if (normK.includes('articulador') || normK.includes('responsavel')) {
        if (!newItem['Articulador'] || (String(newItem['Articulador']).trim() === '' && item[k])) {
          newItem['Articulador'] = toProperCase(String(item[k]));
        }
      }
      if (normK === 'status') newItem['STATUS'] = String(item[k] || 'Pendente').trim();
      if (normK === 'prioridade' || normK === 'importancia') newItem['Prioridade'] = String(item[k] || '').trim();
    });

    Object.keys(newItem).forEach(k => {
      if (typeof newItem[k] === 'string' && (newItem[k].includes('#REF!') || newItem[k].includes('#N/A'))) {
        newItem[k] = '';
      }
    });

    const rawMun = newItem['Município_Original'] || newItem['Município'] || '';
    const fullText = normalizerFilter(`${rawMun} ${newItem['Local']} ${newItem['Título']}`);
    const isOnline = rawMun.toLowerCase().includes('online') || /(meet\.google|zoom\.us|online|on-line|virtual|remoto)/.test(fullText);
    newItem['Modalidade'] = isOnline ? 'Online' : 'Presencial';

    const cleanMun = rawMun.replace(/\(online\)/ig, '').trim();
    newItem['Município'] = cleanMun ? toProperCase(cleanMun) : '';

    const normMun = normalizeStr(newItem['Município']);
    newItem['Região'] = newItem['Região'] || SC_REGION_MAP[normMun] || (newItem['Município'] ? 'OUTRA REGIÃO SC' : '');

    const isFloripa = normMun.includes('FLORIANOPOLIS') || normMun.includes('FLORIPA');
    if (isFloripa) {
      const floripaGeo = enrichFloripaLocation(newItem, isOnline);
      newItem['Bairro'] = floripaGeo.bairro;
      newItem['Distrito'] = floripaGeo.distrito;
      newItem['Região Floripa'] = floripaGeo.regiao;
    } else {
      newItem['Bairro'] = '';
      newItem['Distrito'] = '';
      newItem['Região Floripa'] = '';
    }

    const pNorm = normalizerFilter(newItem['Prioridade']);
    if (pNorm.includes('alta') || pNorm.includes('urgente') || pNorm.includes('maxima') || pNorm === '1') {
      newItem['Prioridade'] = 'Alta';
    } else if (pNorm.includes('media') || pNorm === '2') {
      newItem['Prioridade'] = 'Média';
    } else if (pNorm.includes('baixa') || pNorm === '3') {
      newItem['Prioridade'] = 'Baixa';
    } else {
      newItem['Prioridade'] = 'Sem Prioridade';
    }

    const dObj = parseLocalDate(newItem['Início']);
    newItem['ANO'] = dObj ? String(dObj.getFullYear()) : '';
    newItem['MES_ANO'] = dObj ? `${String(dObj.getMonth() + 1).padStart(2, '0')}/${dObj.getFullYear()}` : '';
    newItem['_SORT_MES'] = dObj ? `${dObj.getFullYear()}-${String(dObj.getMonth() + 1).padStart(2, '0')}` : '';

    return newItem;
  });
}

function sortEventsList(list, sortConfig) {
  if (!sortConfig || !sortConfig.key) return list;
  const sorted = [...list];
  sorted.sort((a, b) => {
    if (sortConfig.key === 'Início') {
      const tA = parseLocalDate(a['Início'])?.getTime() || 0;
      const tB = parseLocalDate(b['Início'])?.getTime() || 0;
      return sortConfig.direction === 'asc' ? tA - tB : tB - tA;
    }
    if (sortConfig.key === 'Duração') {
      const dA = Number(a['Duração']) || 0;
      const dB = Number(b['Duração']) || 0;
      return sortConfig.direction === 'asc' ? dA - dB : dB - dA;
    }
    const strA = String(a[sortConfig.key] || '').trim();
    const strB = String(b[sortConfig.key] || '').trim();
    if (!strA && strB) return 1;
    if (strA && !strB) return -1;
    const cmp = strA.localeCompare(strB, 'pt-BR', { sensitivity: 'base', numeric: true });
    return sortConfig.direction === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

// Metadados das dimensões para as Fichas de Cruzamento (igual ao TABULUM - Emendas)
const ENTITY_TYPE_META = {
  municipio: { label: 'Município', plural: 'Municípios', field: 'Município' },
  regiao: { label: 'Região SC', plural: 'Regiões de SC', field: 'Região' },
  bairro: { label: 'Bairro (Floripa)', plural: 'Bairros (Floripa)', field: 'Bairro' },
  distrito: { label: 'Distrito (Floripa)', plural: 'Distritos (Floripa)', field: 'Distrito' },
  classe: { label: 'Classe de Atividade', plural: 'Classes de Atividade', field: 'Classe de Atividade' },
  articulador: { label: 'Articulador', plural: 'Articuladores', field: 'Articulador' },
  status: { label: 'Status', plural: 'Status', field: 'STATUS' },
  prioridade: { label: 'Prioridade', plural: 'Prioridades', field: 'Prioridade' },
  modalidade: { label: 'Modalidade', plural: 'Modalidades', field: 'Modalidade' },
  mes_ano: { label: 'Mês/Ano', plural: 'Meses/Anos', field: 'MES_ANO' },
  ano: { label: 'Ano', plural: 'Anos', field: 'ANO' }
};

export default function App() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapGeoJson, setMapGeoJson] = useState(null);

  const [currentView, setCurrentView] = useState('list'); // 'list' | 'dashboard' | 'entity' | 'detail'
  const [viewMode, setViewMode] = useState('table');      // 'table' | 'cards'
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [selectedEntityFicha, setSelectedEntityFicha] = useState(null);
  const [entityHistory, setEntityHistory] = useState([]);

  // Paginação exclusiva para o modo Card (5, 25, 50, 100, 200, Todas - padrão 50)
  const [cardsPerPage, setCardsPerPage] = useState(50);
  const [currentCardPage, setCurrentCardPage] = useState(1);

  // Controles de Escopo e Tempo (Preservados do GesTAgen original)
  const [searchTerm, setSearchTerm] = useState('');
  const [scopeCapital, setScopeCapital] = useState(true);
  const [scopeInterior, setScopeInterior] = useState(true);
  const [showFuture, setShowFuture] = useState(true);
  const [showPast, setShowPast] = useState(false);
  const [showPessoal, setShowPessoal] = useState(false);
  const [showOnlyImportant, setShowOnlyImportant] = useState(false);

  // Filtros Universais de Multiseleção
  const [filterMunicipios, setFilterMunicipios] = useState([]);
  const [filterRegioes, setFilterRegioes] = useState([]);
  const [filterBairros, setFilterBairros] = useState([]);
  const [filterClasses, setFilterClasses] = useState([]);
  const [filterArticuladores, setFilterArticuladores] = useState([]);
  const [filterStatus, setFilterStatus] = useState([]);
  const [filterPrioridades, setFilterPrioridades] = useState([]);
  const [filterModalidades, setFilterModalidades] = useState([]);
  const [filterAnos, setFilterAnos] = useState([]);

  const [sortConfig, setSortConfig] = useState({ key: 'Início', direction: 'asc' });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    setCurrentCardPage(1);
  }, [
    searchTerm, scopeCapital, scopeInterior, showFuture, showPast, showPessoal, showOnlyImportant,
    filterMunicipios, filterRegioes, filterBairros, filterClasses, filterArticuladores,
    filterStatus, filterPrioridades, filterModalidades, filterAnos, sortConfig, cardsPerPage
  ]);

  const fetchSheetData = async () => {
    setLoading(true);
    try {
      if (!API_URL) throw new Error("Sem API URL, usando mock");
      const response = await fetch(API_URL, { redirect: "follow" });
      const text = await response.text();
      const parsed = JSON.parse(text);
      const rawArray = Array.isArray(parsed) ? parsed : (parsed.events || []);
      setEvents(normalizeData(rawArray));
    } catch (error) {
      console.warn("Usando base local de demonstração:", error);
      setEvents(normalizeData(MOCK_DATA));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "TABULUM - GesTAgen";
    fetchSheetData();

    fetch('https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-42-mun.json')
      .then(res => res.json())
      .then(data => setMapGeoJson(data))
      .catch(err => console.error("Erro ao carregar GeoJSON de SC:", err));
  }, []);

  // Atualizações diretas no Google Sheets (Coluna J = Status, Coluna K = Articulador Input, Coluna L = Prioridade)
  const handleUpdateStatus = async (id, newStatus) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, 'STATUS': newStatus } : ev));
    if (selectedEvent && selectedEvent.id === id) setSelectedEvent(prev => ({ ...prev, 'STATUS': newStatus }));
    if (API_URL) fetch(API_URL, { method: 'POST', body: JSON.stringify({ id, status: newStatus }), redirect: "follow" }).catch(() => {});
  };

  const handleUpdatePriority = async (id, newPriority) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, 'Prioridade': newPriority } : ev));
    if (selectedEvent && selectedEvent.id === id) setSelectedEvent(prev => ({ ...prev, 'Prioridade': newPriority }));
    if (API_URL) fetch(API_URL, { method: 'POST', body: JSON.stringify({ id, prioridade: newPriority === 'Sem Prioridade' ? '' : newPriority }), redirect: "follow" }).catch(() => {});
  };

  const handleUpdateArticulador = async (id, newArticulador) => {
    const cleanArt = toProperCase(newArticulador);
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, 'Articulador': cleanArt } : ev));
    if (selectedEvent && selectedEvent.id === id) setSelectedEvent(prev => ({ ...prev, 'Articulador': cleanArt }));
    if (API_URL) fetch(API_URL, { method: 'POST', body: JSON.stringify({ id, articuladorInput: cleanArt }), redirect: "follow" }).catch(() => {});
  };

  // Listas únicas para os MultiSelects
  const municipiosOptions = useMemo(() => [...new Set(events.map(e => e['Município']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [events]);
  const regioesOptions = useMemo(() => [...new Set(events.map(e => e['Região']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [events]);
  const bairrosOptions = useMemo(() => [...new Set(events.map(e => e['Bairro']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [events]);
  const classesOptions = useMemo(() => [...new Set(events.map(e => e['Classe de Atividade']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [events]);
  const articuladoresOptions = useMemo(() => [...new Set(events.map(e => e['Articulador']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [events]);
  const statusOptions = useMemo(() => [...new Set(events.map(e => e['STATUS']).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')), [events]);
  const prioridadesOptions = ['Alta', 'Média', 'Baixa', 'Sem Prioridade'];
  const modalidadesOptions = ['Presencial', 'Online'];
  const anosOptions = useMemo(() => [...new Set(events.map(e => e['ANO']).filter(Boolean))].sort(), [events]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setScopeCapital(true);
    setScopeInterior(true);
    setShowFuture(true);
    setShowPast(false);
    setShowPessoal(false);
    setShowOnlyImportant(false);
    setFilterMunicipios([]);
    setFilterRegioes([]);
    setFilterBairros([]);
    setFilterClasses([]);
    setFilterArticuladores([]);
    setFilterStatus([]);
    setFilterPrioridades([]);
    setFilterModalidades([]);
    setFilterAnos([]);
  };

  const resetToFrontPage = () => {
    setCurrentView('list');
    setViewMode('table');
    setSelectedEntityFicha(null);
    setEntityHistory([]);
    clearAllFilters();
    setSortConfig({ key: 'Início', direction: 'asc' });
  };

  // Navegação de Fichas Cruzadas (idêntica ao TABULUM - Emendas)
  const openEntityFicha = (type, value, e = null) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!value || String(value).trim() === '' || String(value).trim() === '-') return;
    const cleanVal = String(value).trim();

    if (currentView === 'entity' && selectedEntityFicha) {
      if (selectedEntityFicha.type === type && selectedEntityFicha.value === cleanVal) return;
      setEntityHistory(prev => [...prev, selectedEntityFicha]);
    } else {
      setEntityHistory([]);
    }

    setSelectedEntityFicha({ type, value: cleanVal });
    setCurrentView('entity');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackFromEntityFicha = () => {
    if (entityHistory.length > 0) {
      const previous = entityHistory[entityHistory.length - 1];
      setEntityHistory(prev => prev.slice(0, -1));
      setSelectedEntityFicha(previous);
    } else {
      setSelectedEntityFicha(null);
      setCurrentView('list');
    }
  };

  const applyEntityFilterToMainList = (type, value) => {
    clearAllFilters();
    setShowPast(true);
    setShowFuture(true);
    setSelectedEntityFicha(null);
    setEntityHistory([]);
    setCurrentView('list');
    if (type === 'municipio') setFilterMunicipios([value]);
    if (type === 'regiao') setFilterRegioes([value]);
    if (type === 'bairro') setFilterBairros([value]);
    if (type === 'classe') setFilterClasses([value]);
    if (type === 'articulador') setFilterArticuladores([value]);
    if (type === 'status') setFilterStatus([value]);
    if (type === 'prioridade') setFilterPrioridades([value]);
    if (type === 'modalidade') setFilterModalidades([value]);
    if (type === 'ano') setFilterAnos([String(value)]);
    if (type === 'mes_ano') setSearchTerm(String(value));
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Eventos filtrados e ordenados
  const filteredAndSortedEvents = useMemo(() => {
    const filtered = events.filter(ev => {
      const isF = isFuture(ev['Início']);
      const isP = isPast(ev['Início']);
      if (!showFuture && isF) return false;
      if (!showPast && isP) return false;
      if (!showFuture && !showPast) return false;

      const isPessoal = normalizerFilter(ev['Classe de Atividade']).includes('pessoal') || normalizerFilter(ev['Classe de Atividade']).includes('feriado');
      if (!showPessoal && isPessoal) return false;

      if (showOnlyImportant && ev['Prioridade'] !== 'Alta') return false;

      const normMun = normalizerFilter(ev['Município']);
      const isFloripa = normMun.includes('florianopolis') || normMun.includes('floripa');
      if (!scopeCapital && isFloripa) return false;
      if (!scopeInterior && !isFloripa) return false;
      if (!scopeCapital && !scopeInterior) return false;

      if (filterMunicipios.length > 0 && !filterMunicipios.includes(ev['Município'])) return false;
      if (filterRegioes.length > 0 && !filterRegioes.includes(ev['Região'])) return false;
      if (filterBairros.length > 0 && !filterBairros.includes(ev['Bairro'])) return false;
      if (filterClasses.length > 0 && !filterClasses.includes(ev['Classe de Atividade'])) return false;
      if (filterArticuladores.length > 0 && !filterArticuladores.includes(ev['Articulador'])) return false;
      if (filterStatus.length > 0 && !filterStatus.includes(ev['STATUS'])) return false;
      if (filterPrioridades.length > 0 && !filterPrioridades.includes(ev['Prioridade'])) return false;
      if (filterModalidades.length > 0 && !filterModalidades.includes(ev['Modalidade'])) return false;
      if (filterAnos.length > 0 && !filterAnos.includes(ev['ANO'])) return false;

      if (searchTerm.trim() !== '') {
        const term = normalizerFilter(searchTerm);
        const bag = normalizerFilter([
          ev['Título'], ev['Descrição'], ev['Local'], ev['Município'],
          ev['Região'], ev['Bairro'], ev['Distrito'], ev['Articulador'],
          ev['Classe de Atividade'], ev['STATUS'], ev['Prioridade'], ev['MES_ANO']
        ].join(' '));
        if (!bag.includes(term)) return false;
      }

      return true;
    });

    return sortEventsList(filtered, sortConfig);
  }, [
    events, searchTerm, scopeCapital, scopeInterior, showFuture, showPast, showPessoal, showOnlyImportant,
    filterMunicipios, filterRegioes, filterBairros, filterClasses, filterArticuladores,
    filterStatus, filterPrioridades, filterModalidades, filterAnos, sortConfig
  ]);

  // Métricas do Gráfico Resumido de Informações Gerais (Preservado e levado para a Barra Superior Fixa)
  const summaryStats = useMemo(() => {
    const total = filteredAndSortedEvents.length;
    let capital = 0;
    let futuras = 0;
    let pendentes = 0;

    filteredAndSortedEvents.forEach(ev => {
      const mun = normalizerFilter(ev['Município']);
      if (mun.includes('florianopolis') || mun.includes('floripa')) capital++;
      if (isFuture(ev['Início'])) futuras++;
      if (ev['STATUS'] === 'Pendente') pendentes++;
    });

    return { total, capital, interior: total - capital, futuras, pendentes };
  }, [filteredAndSortedEvents]);

  const upcomingImportantCount = useMemo(() => {
    return events.filter(ev => isFuture(ev['Início']) && ev['Prioridade'] === 'Alta').length;
  }, [events]);

  const exportRowsToCSV = (rowsToExport, filename = "agendas_filtradas.csv") => {
    if (!rowsToExport || rowsToExport.length === 0) {
      alert("Nenhum dado disponível para exportar.");
      return;
    }
    const headers = ['Título', 'Início', 'Fim', 'Duração', 'Classe de Atividade', 'Município', 'Região', 'Bairro', 'Distrito', 'Articulador', 'Modalidade', 'STATUS', 'Prioridade', 'Local', 'Descrição'];
    const csvRows = [headers.map(h => `"${h}"`).join(',')];
    rowsToExport.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    });
    const csvString = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusClasses = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'confirmado') return 'bg-teal-700 text-white border-slate-700 hover:bg-teal-800';
    if (s === 'realizado') return 'bg-amber-300 text-slate-900 border-slate-700 hover:bg-amber-400';
    return 'bg-slate-100 text-slate-800 border-slate-400 hover:bg-slate-200';
  };

  const getPrioridadeClasses = (prio) => {
    const p = String(prio || '').toLowerCase();
    if (p === 'alta') return 'bg-rose-700 text-white border-rose-900 hover:bg-rose-800';
    if (p === 'média' || p === 'media') return 'bg-amber-300 text-slate-900 border-slate-700 hover:bg-amber-400';
    if (p === 'baixa') return 'bg-teal-700 text-white border-teal-900 hover:bg-teal-800';
    return 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100';
  };

  const getClasseBadgeClasses = (classe) => {
    const c = String(classe || '').toUpperCase();
    if (c.includes('PLENÁRIA') || c.includes('AUDIÊNCIA') || c.includes('SESSÃO')) {
      return 'bg-rose-50 text-rose-800 border-rose-600/70 hover:bg-rose-100';
    }
    if (c.includes('REUNIÃO') || c.includes('SEMINÁRIO')) {
      return 'bg-teal-50 text-teal-800 border-teal-600/70 hover:bg-teal-100';
    }
    if (c.includes('VIAGEM') || c.includes('EVENTO') || c.includes('ATO')) {
      return 'bg-amber-50 text-amber-900 border-amber-500/80 hover:bg-amber-100';
    }
    return 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100';
  };

  const sortableFieldsList = [
    { key: 'Início', label: 'Data' },
    { key: 'Título', label: 'Título' },
    { key: 'Classe de Atividade', label: 'Classe de Atividade' },
    { key: 'Município', label: 'Município' },
    { key: 'Região', label: 'Região SC' },
    { key: 'Bairro', label: 'Bairro (Floripa)' },
    { key: 'Articulador', label: 'Articulador' },
    { key: 'STATUS', label: 'Status' },
    { key: 'Prioridade', label: 'Prioridade' },
    { key: 'Duração', label: 'Duração (min)' }
  ];

  const getCurrentPageTitle = () => {
    if (currentView === 'list') return 'Painel de Agendas';
    if (currentView === 'dashboard') return 'Dashboard & Mapas';
    if (currentView === 'entity' && selectedEntityFicha) {
      const meta = ENTITY_TYPE_META[selectedEntityFicha.type];
      return `${meta ? meta.label : 'Ficha'}: ${selectedEntityFicha.value}`;
    }
    if (currentView === 'detail' && selectedEvent) {
      return selectedEvent['Título'];
    }
    return 'Painel de Agendas';
  };

  // MultiSelect minimalista e suave (idêntico ao TABULUM - Emendas)
  const MultiSelect = ({ id, label, options, selected, onChange }) => {
    const isOpen = openDropdown === id;
    const [optionSearch, setOptionSearch] = useState('');

    const handleToggleDropdown = (e) => {
      e.stopPropagation();
      setOpenDropdown(isOpen ? null : id);
    };

    const handleToggleOption = (e, opt) => {
      e.stopPropagation();
      if (selected.includes(opt)) {
        onChange(selected.filter(i => i !== opt));
      } else {
        onChange([...selected, opt]);
      }
    };

    const handleClear = (e) => {
      e.stopPropagation();
      onChange([]);
    };

    let displayText = label;
    if (selected.length === 1) displayText = `${label}: ${selected[0]}`;
    else if (selected.length > 1) displayText = `${label} (${selected.length})`;

    const visibleOptions = options.filter(opt =>
      String(opt).toLowerCase().includes(optionSearch.toLowerCase())
    );

    return (
      <div className="relative">
        <div
          onClick={handleToggleDropdown}
          className={`px-2 py-1 rounded-xs border transition-colors text-xs cursor-pointer flex justify-between items-center gap-1 max-w-[165px] ${
            selected.length > 0
              ? 'border-teal-700 bg-teal-50 text-teal-950 font-semibold'
              : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300 hover:bg-slate-100/80 font-normal'
          }`}
        >
          <span className="truncate" title={displayText}>{displayText}</span>
          <div className="flex items-center space-x-0.5 flex-shrink-0">
            {selected.length > 0 && (
              <span onClick={handleClear} className="hover:text-rose-700 p-0.5" title="Limpar filtro">
                <XIcon className="w-3 h-3" />
              </span>
            )}
            <ChevronDownIcon className="w-3 h-3 text-slate-400" />
          </div>
        </div>

        {isOpen && (
          <div
            className="absolute z-50 top-full left-0 mt-1 w-60 max-h-64 overflow-y-auto bg-white border border-slate-300 shadow-md rounded-xs flex flex-col p-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {options.length > 7 && (
              <input
                type="text"
                placeholder="Buscar opção..."
                value={optionSearch}
                onChange={(e) => setOptionSearch(e.target.value)}
                className="mb-1.5 px-2 py-1 text-xs border border-slate-200 focus:outline-none focus:border-teal-700 text-slate-800 rounded-xs"
              />
            )}
            {visibleOptions.map(opt => (
              <label key={opt} className="flex items-center space-x-2 cursor-pointer hover:bg-amber-50/70 px-1.5 py-1 rounded-xs transition-colors">
                <input
                  type="checkbox"
                  className="accent-teal-700 w-3.5 h-3.5 border border-slate-400 cursor-pointer flex-shrink-0"
                  checked={selected.includes(opt)}
                  onChange={(e) => handleToggleOption(e, opt)}
                />
                <span className="text-xs text-slate-700 truncate flex-1" title={opt}>{opt}</span>
              </label>
            ))}
            {visibleOptions.length === 0 && (
              <span className="text-xs text-slate-400 italic p-2 text-center">Nenhum item</span>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // BARRA SUPERIOR ÚNICA E FIXA (Sem barra lateral + Gráfico Geral Fixo Integrado)
  // ============================================================================
  const UnifiedTopBar = () => {
    const activeFilterCount =
      filterMunicipios.length +
      filterRegioes.length +
      filterBairros.length +
      filterClasses.length +
      filterArticuladores.length +
      filterStatus.length +
      filterPrioridades.length +
      filterModalidades.length +
      filterAnos.length;

    const hasFilters = Boolean(searchTerm) || activeFilterCount > 0 || !scopeCapital || !scopeInterior || showOnlyImportant || showPessoal;

    const rowsForExport = currentView === 'entity' && selectedEntityFicha
      ? events.filter(e => String(e[ENTITY_TYPE_META[selectedEntityFicha.type]?.field] || '').trim().toLowerCase() === String(selectedEntityFicha.value).trim().toLowerCase())
      : filteredAndSortedEvents;

    const capPct = summaryStats.total === 0 ? 0 : (summaryStats.capital / summaryStats.total) * 100;
    const intPct = summaryStats.total === 0 ? 0 : (summaryStats.interior / summaryStats.total) * 100;

    return (
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-300 shadow-xs print:hidden">
        {/* Filete Mondrian Delicado: Carmesim, Azul-Esverdeado e Amarelo */}
        <div className="h-1 w-full flex">
          <div className="w-1/3 bg-rose-700"></div>
          <div className="w-1/3 bg-teal-700"></div>
          <div className="w-1/3 bg-amber-300"></div>
        </div>

        {/* LINHA 1: Logo + Título + Navegação Painel/Dashboard + GRÁFICO RESUMIDO FIXO + Prioridades + Sincronizar */}
        <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80">
          {/* Esquerda: Marca + Página Atual + Navegação */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex items-center cursor-pointer group flex-shrink-0" onClick={resetToFrontPage} title="Voltar ao Início e Limpar Filtros">
              <img
                src="https://raw.githubusercontent.com/killuixo/tabulum-gestafagen/refs/heads/main/icon-192.png"
                alt="Ícone TABULUM"
                className="w-6 h-6 sm:w-7 sm:h-7 mr-2 object-contain transition-transform group-hover:scale-105"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 whitespace-nowrap">
                TABULUM - GesTAgen
              </span>
            </div>

            <span className="text-slate-300 select-none">|</span>

            <span className="text-xs sm:text-sm font-semibold text-teal-800 truncate max-w-[140px] sm:max-w-[260px]" title={getCurrentPageTitle()}>
              {getCurrentPageTitle()}
            </span>

            <div className="flex border border-slate-300 rounded-xs overflow-hidden bg-slate-50 ml-1 flex-shrink-0">
              <button
                onClick={() => { setCurrentView('list'); setSelectedEntityFicha(null); }}
                className={`px-2.5 py-1 flex items-center text-xs font-medium border-r border-slate-300 transition-colors ${
                  currentView === 'list' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 sm:mr-1" /> <span className="hidden sm:inline">Painel</span>
              </button>
              <button
                onClick={() => { setCurrentView('dashboard'); setSelectedEntityFicha(null); }}
                className={`px-2.5 py-1 flex items-center text-xs font-medium transition-colors ${
                  currentView === 'dashboard' ? 'bg-amber-300 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboardIcon className="w-3.5 h-3.5 sm:mr-1" /> <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </div>

          {/* Centro/Direita: GRÁFICO DE INFORMAÇÕES GERAIS FIXO (antigo widget da barra lateral) + Botão de Prioridades + Sincronizar */}
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {/* Widget Gráfico Resumido Fixo */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-300 px-3 py-1 rounded-xs">
              <div className="flex items-baseline gap-1.5 border-r border-slate-200 pr-2.5">
                <span className="text-[10px] font-semibold uppercase text-slate-500">Visíveis:</span>
                <span className="text-sm font-bold text-rose-700 leading-none">{summaryStats.total}</span>
              </div>

              <div className="w-32 sm:w-40 flex flex-col justify-center">
                <div className="flex justify-between text-[9px] font-semibold uppercase mb-0.5">
                  <span className="text-teal-800">Cap: {summaryStats.capital}</span>
                  <span className="text-amber-800">Est: {summaryStats.interior}</span>
                </div>
                <div className="h-1.5 w-full flex bg-slate-200 border border-slate-300 overflow-hidden">
                  <div className="h-full bg-teal-700 transition-all duration-500" style={{ width: `${capPct}%` }}></div>
                  <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${intPct}%` }}></div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2.5 border-l border-slate-200 pl-2.5 text-[10px] font-semibold uppercase">
                <span className="text-slate-600">Futuras: <strong className="text-teal-700">{summaryStats.futuras}</strong></span>
                <span className="text-slate-600">Pendentes: <strong className="text-rose-700">{summaryStats.pendentes}</strong></span>
              </div>
            </div>

            {/* Botão Fixo de Prioridades */}
            <button
              onClick={() => {
                setCurrentView('list');
                setShowOnlyImportant(!showOnlyImportant);
                if (!showOnlyImportant) {
                  setShowFuture(true);
                  setShowPast(false);
                }
              }}
              className={`px-2.5 py-1 border rounded-xs text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showOnlyImportant
                  ? 'bg-rose-700 text-white border-rose-900'
                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
              }`}
              title="Filtrar próximos compromissos de Alta Prioridade"
            >
              <AlertCircleIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prioridades</span>
              <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-xs ${showOnlyImportant ? 'bg-white text-rose-800' : 'bg-rose-700 text-white'}`}>
                {upcomingImportantCount}
              </span>
            </button>

            {/* Botão Sincronizar Planilha */}
            <button
              onClick={fetchSheetData}
              className="px-2 py-1 text-xs font-medium text-teal-800 bg-teal-50/80 hover:bg-teal-100 border border-teal-200 rounded-xs flex items-center transition-colors flex-shrink-0"
              title="Recarregar dados da Planilha Google Sheets"
            >
              <RefreshCwIcon className="w-3.5 h-3.5 sm:mr-1" />
              <span className="hidden lg:inline">{API_URL ? 'Sincronizar' : 'Demo'}</span>
            </button>
          </div>
        </div>

        {/* LINHA 2: Busca Universal + Toggles Rápidos + Multiseleção Suave + Ordenar Por + Lista/Card + Exportar */}
        {(currentView === 'list' || currentView === 'dashboard' || currentView === 'entity') && (
          <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-1.5 bg-white">
            {/* Lado Esquerdo: Busca + Toggles + Multiseleção */}
            <div className="flex flex-wrap items-center gap-1.5 flex-1">
              <div className="relative w-36 sm:w-44">
                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Procura universal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1 bg-slate-50/80 border border-slate-200 rounded-xs text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-700 focus:bg-white"
                />
              </div>

              {/* Toggles Rápidos Compactos (Capital / Estado / Futuras / Passadas / Pessoal) */}
              <div className="flex items-center border border-slate-200 rounded-xs bg-slate-50/70 overflow-hidden text-[11px]">
                <button
                  onClick={() => setScopeCapital(!scopeCapital)}
                  className={`px-2 py-1 border-r border-slate-200 transition-colors ${
                    scopeCapital ? 'bg-teal-700 text-white font-medium' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Incluir agendas de Florianópolis"
                >
                  Floripa
                </button>
                <button
                  onClick={() => setScopeInterior(!scopeInterior)}
                  className={`px-2 py-1 border-r border-slate-200 transition-colors ${
                    scopeInterior ? 'bg-teal-700 text-white font-medium' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Incluir agendas das demais cidades de SC"
                >
                  Estado
                </button>
                <button
                  onClick={() => setShowFuture(!showFuture)}
                  className={`px-2 py-1 border-r border-slate-200 transition-colors ${
                    showFuture ? 'bg-amber-200 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Exibir agendas futuras e de hoje"
                >
                  Futuras
                </button>
                <button
                  onClick={() => setShowPast(!showPast)}
                  className={`px-2 py-1 border-r border-slate-200 transition-colors ${
                    showPast ? 'bg-amber-200 text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Exibir histórico de agendas passadas"
                >
                  Passadas
                </button>
                <button
                  onClick={() => setShowPessoal(!showPessoal)}
                  className={`px-2 py-1 transition-colors ${
                    showPessoal ? 'bg-slate-800 text-white font-medium' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                  title="Exibir ou ocultar agendas pessoais"
                >
                  Pessoal
                </button>
              </div>

              <button
                onClick={() => setMobileFiltersExpanded(prev => !prev)}
                className={`sm:hidden px-2 py-1 border rounded-xs text-xs flex items-center gap-1 ${
                  activeFilterCount > 0 ? 'border-teal-700 bg-teal-50 text-teal-900 font-semibold' : 'border-slate-200 text-slate-600'
                }`}
              >
                <FilterIcon className="w-3 h-3" />
                <span>Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
              </button>

              {/* Todos os Parâmetros da Planilha em Multiseleção */}
              <div className={`${mobileFiltersExpanded ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-1.5`}>
                <MultiSelect id="mun" label="Município" options={municipiosOptions} selected={filterMunicipios} onChange={setFilterMunicipios} />
                <MultiSelect id="reg" label="Região SC" options={regioesOptions} selected={filterRegioes} onChange={setFilterRegioes} />
                <MultiSelect id="bai" label="Bairro (Floripa)" options={bairrosOptions} selected={filterBairros} onChange={setFilterBairros} />
                <MultiSelect id="cla" label="Classe" options={classesOptions} selected={filterClasses} onChange={setFilterClasses} />
                <MultiSelect id="art" label="Articulador" options={articuladoresOptions} selected={filterArticuladores} onChange={setFilterArticuladores} />
                <MultiSelect id="sta" label="Status" options={statusOptions} selected={filterStatus} onChange={setFilterStatus} />
                <MultiSelect id="pri" label="Prioridade" options={prioridadesOptions} selected={filterPrioridades} onChange={setFilterPrioridades} />
                <MultiSelect id="mod" label="Modalidade" options={modalidadesOptions} selected={filterModalidades} onChange={setFilterModalidades} />
                <MultiSelect id="ano" label="Ano" options={anosOptions} selected={filterAnos} onChange={setFilterAnos} />

                {hasFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xs flex items-center transition-colors"
                    title="Limpar todos os filtros"
                  >
                    <XIcon className="w-3 h-3 mr-0.5" /> Limpar
                  </button>
                )}
              </div>
            </div>

            {/* Lado Direito: Ordenar Por + Alternância Lista/Card + Exportar CSV/PDF */}
            <div className="flex flex-wrap items-center gap-2 ml-auto">
              <div className="flex items-center border border-slate-200 rounded-xs bg-slate-50/70">
                <select
                  value={sortConfig.key || ''}
                  onChange={(e) => setSortConfig({ key: e.target.value || 'Início', direction: sortConfig.direction })}
                  className="px-2 py-1 text-xs text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                  title="Ordenar agendas por campo"
                >
                  {sortableFieldsList.map(f => (
                    <option key={f.key} value={f.key}>Ordenar: {f.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSortConfig(prev => ({ ...prev, direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
                  className="px-1.5 py-1 border-l border-slate-200 bg-amber-100/80 hover:bg-amber-200 text-xs font-semibold text-slate-800 flex items-center"
                  title={sortConfig.direction === 'asc' ? 'Ordem Crescente' : 'Ordem Decrescente'}
                >
                  {sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
                </button>
              </div>

              {currentView !== 'dashboard' && (
                <div className="flex items-center gap-1.5">
                  <div className="flex border border-slate-200 rounded-xs overflow-hidden bg-slate-50/70">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`px-2 py-1 flex items-center text-xs border-r border-slate-200 transition-colors ${
                        viewMode === 'table' ? 'bg-slate-800 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <ListIcon className="w-3.5 h-3.5 mr-1" /> Lista
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`px-2 py-1 flex items-center text-xs transition-colors ${
                        viewMode === 'cards' ? 'bg-slate-800 text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <GridIcon className="w-3.5 h-3.5 mr-1" /> Card
                    </button>
                  </div>

                  {viewMode === 'cards' && (
                    <select
                      value={cardsPerPage}
                      onChange={(e) => setCardsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="px-2 py-1 text-xs border border-slate-200 rounded-xs bg-slate-50/70 text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value={5}>5 / pág</option>
                      <option value={25}>25 / pág</option>
                      <option value={50}>50 / pág</option>
                      <option value={100}>100 / pág</option>
                      <option value={200}>200 / pág</option>
                      <option value="all">Todas</option>
                    </select>
                  )}
                </div>
              )}

              <div className="flex items-center border border-slate-200 rounded-xs bg-slate-50/70 overflow-hidden">
                <span className="px-2 py-1 text-[11px] text-slate-500 border-r border-slate-200 select-none">
                  Exportar:
                </span>
                <button
                  onClick={() => exportRowsToCSV(rowsForExport, "agendas_filtradas.csv")}
                  className="px-2 py-1 text-xs text-slate-700 hover:bg-amber-100 border-r border-slate-200 flex items-center transition-colors"
                >
                  <DownloadIcon className="w-3 h-3 mr-1" /> CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-2 py-1 text-xs text-slate-700 hover:bg-teal-700 hover:text-white flex items-center transition-colors"
                >
                  <PrinterIcon className="w-3 h-3 mr-1" /> PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
    );
  };

  // ============================================================================
  // TABELA E CARDS NO PADRÃO SUAVE DO TABULUM - EMENDAS
  // ============================================================================
  const renderAgendasTableOrCards = (rows, activeSortConfig, onRequestSort, activeViewMode) => {
    const SortableHeader = ({ label, sortKey, extraClasses = "" }) => {
      const isActive = activeSortConfig?.key === sortKey;
      return (
        <th
          className={`py-2.5 text-left text-[11px] font-bold text-slate-800 uppercase cursor-pointer hover:bg-amber-300/70 transition-colors border-r border-slate-300 print:border-slate-800 select-none ${extraClasses}`}
          onClick={() => onRequestSort(sortKey)}
          title={`Ordenar por ${label}`}
        >
          <div className="flex items-center justify-between gap-1">
            <span>{label}</span>
            {isActive ? (
              activeSortConfig.direction === 'asc' ? <ChevronUpIcon className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDownIcon className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <ChevronUpIcon className="w-3.5 h-3.5 opacity-20 print:hidden flex-shrink-0" />
            )}
          </div>
        </th>
      );
    };

    if (activeViewMode === 'table') {
      return (
        <div className="bg-white border border-slate-300 overflow-x-auto shadow-xs print:shadow-none print:border print:overflow-visible print:w-full">
          <table className="min-w-[1150px] w-full border-collapse table-fixed print:min-w-0 print:w-full">
            <thead className="bg-amber-200/85 border-b border-slate-400 print:bg-amber-200">
              <tr>
                <SortableHeader label="Data / Hora" sortKey="Início" extraClasses="w-[125px] px-2.5" />
                <SortableHeader label="Classe" sortKey="Classe de Atividade" extraClasses="w-[135px] px-2" />
                <SortableHeader label="Título / Compromisso" sortKey="Título" extraClasses="w-[28%] min-w-[240px] px-3" />
                <SortableHeader label="Município" sortKey="Município" extraClasses="w-[130px] px-2.5" />
                <SortableHeader label="Região / Bairro" sortKey="Região" extraClasses="w-[150px] px-2.5" />
                <SortableHeader label="Articulador" sortKey="Articulador" extraClasses="w-[110px] px-2.5" />
                <SortableHeader label="Duração" sortKey="Duração" extraClasses="w-[80px] px-2" />
                <SortableHeader label="Prioridade" sortKey="Prioridade" extraClasses="w-[105px] px-2" />
                <SortableHeader label="Status" sortKey="STATUS" extraClasses="w-[110px] px-2 border-r-0" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 print:text-[9px]">
              {rows.map((ev, idx) => (
                <tr
                  key={ev.id || idx}
                  onClick={() => { setSelectedEvent(ev); setCurrentView('detail'); }}
                  className="hover:bg-amber-50/50 cursor-pointer transition-colors print:break-inside-avoid"
                >
                  <td className="px-2.5 py-2.5 text-xs font-bold text-slate-900 border-r border-slate-200 align-top whitespace-normal">
                    {formatDate(ev['Início'])}
                    {ev['Modalidade'] === 'Online' && (
                      <span className="block mt-0.5 text-[9px] font-semibold uppercase text-amber-800 bg-amber-100 px-1 py-0.2 w-fit border border-amber-300">
                        Online
                      </span>
                    )}
                  </td>

                  <td
                    onClick={(e) => ev['Classe de Atividade'] && openEntityFicha('classe', ev['Classe de Atividade'], e)}
                    className="px-2 py-2.5 border-r border-slate-200 align-top"
                  >
                    <span
                      className={`block w-full text-center border px-1.5 py-0.5 text-[10px] font-semibold uppercase whitespace-normal break-words leading-tight transition-colors ${getClasseBadgeClasses(ev['Classe de Atividade'])}`}
                      title={`Abrir Ficha da Classe: ${ev['Classe de Atividade']}`}
                    >
                      {ev['Classe de Atividade'] || '-'}
                    </span>
                  </td>

                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-900 border-r border-slate-200 align-top whitespace-normal break-words leading-snug">
                    {ev['Título']}
                    {ev['Local'] && (
                      <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                        📍 {ev['Local']}
                      </span>
                    )}
                  </td>

                  <td
                    onClick={(e) => ev['Município'] && openEntityFicha('municipio', ev['Município'], e)}
                    className="px-2.5 py-2.5 text-xs font-bold uppercase text-teal-700 hover:text-rose-700 hover:underline border-r border-slate-200 align-top whitespace-normal break-words"
                    title={ev['Município'] ? `Abrir Ficha do Município: ${ev['Município']}` : ''}
                  >
                    {ev['Município'] || '-'}
                  </td>

                  <td className="px-2.5 py-2.5 text-[11px] font-medium text-slate-700 border-r border-slate-200 align-top whitespace-normal break-words">
                    {ev['Bairro'] ? (
                      <span
                        onClick={(e) => openEntityFicha('bairro', ev['Bairro'], e)}
                        className="text-teal-800 hover:text-rose-700 hover:underline font-semibold block"
                        title={`Abrir Ficha do Bairro: ${ev['Bairro']}`}
                      >
                        {ev['Bairro']} <small className="text-slate-500 font-normal">({ev['Distrito']})</small>
                      </span>
                    ) : (
                      <span
                        onClick={(e) => ev['Região'] && openEntityFicha('regiao', ev['Região'], e)}
                        className="hover:text-teal-700 hover:underline uppercase"
                        title={ev['Região'] ? `Abrir Ficha da Região: ${ev['Região']}` : ''}
                      >
                        {ev['Região'] || '-'}
                      </span>
                    )}
                  </td>

                  <td
                    onClick={(e) => ev['Articulador'] && openEntityFicha('articulador', ev['Articulador'], e)}
                    className="px-2.5 py-2.5 text-xs font-semibold text-rose-700 hover:text-teal-700 hover:underline border-r border-slate-200 align-top whitespace-normal break-words"
                    title={ev['Articulador'] ? `Abrir Ficha do Articulador: ${ev['Articulador']}` : ''}
                  >
                    {ev['Articulador'] || '-'}
                  </td>

                  <td className="px-2 py-2.5 text-xs font-medium text-slate-700 border-r border-slate-200 align-top text-center">
                    {ev['Duração'] ? `${ev['Duração']}m` : '-'}
                  </td>

                  <td className="px-2 py-2.5 border-r border-slate-200 align-top" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={ev['Prioridade'] || 'Sem Prioridade'}
                      onChange={(e) => handleUpdatePriority(ev.id, e.target.value)}
                      className={`w-full text-center border px-1 py-0.5 text-[10px] font-semibold uppercase cursor-pointer focus:outline-none ${getPrioridadeClasses(ev['Prioridade'])}`}
                    >
                      <option value="Sem Prioridade">S/ Prior.</option>
                      <option value="Baixa">Baixa</option>
                      <option value="Média">Média</option>
                      <option value="Alta">Alta</option>
                    </select>
                  </td>

                  <td className="px-2 py-2.5 align-top border-r-0" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={ev['STATUS'] || 'Pendente'}
                      onChange={(e) => handleUpdateStatus(ev.id, e.target.value)}
                      className={`w-full text-center border px-1 py-0.5 text-[10px] font-semibold uppercase cursor-pointer focus:outline-none ${getStatusClasses(ev['STATUS'])}`}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Confirmado">Confirmado</option>
                      <option value="Realizado">Realizado</option>
                    </select>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-10 text-center font-medium text-slate-400 uppercase text-xs">
                    Nenhuma agenda encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="bg-slate-50 px-4 py-2 text-xs text-slate-600 flex flex-wrap justify-between gap-2 border-t border-slate-300 print:hidden">
            <span>Exibindo todas as <strong>{rows.length}</strong> agendas filtradas</span>
            <span className="text-slate-400">Clique em qualquer Município, Região, Bairro, Classe ou Articulador para abrir sua Ficha Cruzada</span>
          </div>
        </div>
      );
    }

    // MODO CARD PAGINADO (padrão suave TABULUM - Emendas)
    const totalCards = rows.length;
    const effectivePerPage = cardsPerPage === 'all' ? (totalCards || 1) : Number(cardsPerPage);
    const totalPages = Math.max(Math.ceil(totalCards / effectivePerPage), 1);
    const safePage = Math.min(currentCardPage, totalPages);
    const startIndex = cardsPerPage === 'all' ? 0 : (safePage - 1) * effectivePerPage;
    const endIndex = cardsPerPage === 'all' ? totalCards : Math.min(startIndex + effectivePerPage, totalCards);
    const paginatedCards = rows.slice(startIndex, endIndex);

    const PaginationBar = () => (
      <div className="bg-white border border-slate-300 px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 print:hidden">
        <div>
          Exibindo <strong>{totalCards > 0 ? startIndex + 1 : 0}–{endIndex}</strong> de <strong>{totalCards}</strong> agendas
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-slate-600">
            <span>Agendas por página:</span>
            <select
              value={cardsPerPage}
              onChange={(e) => setCardsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2 py-0.5 border border-slate-300 rounded-xs bg-slate-50 text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value="all">Todas</option>
            </select>
          </label>

          {cardsPerPage !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1 ml-2">
              <button
                disabled={safePage <= 1}
                onClick={() => { setCurrentCardPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-2 py-0.5 border border-slate-300 rounded-xs bg-slate-50 hover:bg-amber-100 disabled:opacity-40 font-medium"
              >
                ← Anterior
              </button>
              <span className="px-2 font-semibold text-slate-800">
                Pág. {safePage} de {totalPages}
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() => { setCurrentCardPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-2 py-0.5 border border-slate-300 rounded-xs bg-slate-50 hover:bg-amber-100 disabled:opacity-40 font-medium"
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="space-y-4">
        <PaginationBar />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
          {paginatedCards.map((ev, idx) => (
            <div
              key={ev.id || idx}
              onClick={() => { setSelectedEvent(ev); setCurrentView('detail'); }}
              className="border border-slate-300 bg-white shadow-xs hover:border-slate-500 transition-all flex flex-col cursor-pointer"
            >
              <div className="bg-amber-100/90 border-b border-slate-300 px-3.5 py-2 flex justify-between items-center gap-2">
                <button
                  onClick={(e) => ev['Classe de Atividade'] && openEntityFicha('classe', ev['Classe de Atividade'], e)}
                  className={`border px-2 py-0.5 text-[10px] font-semibold uppercase transition-colors ${getClasseBadgeClasses(ev['Classe de Atividade'])}`}
                  title={`Abrir Ficha da Classe: ${ev['Classe de Atividade']}`}
                >
                  {ev['Classe de Atividade'] || 'Sem Classe'}
                </button>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-teal-700" />
                  {formatDate(ev['Início'])}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col space-y-2.5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  {ev['Município'] ? (
                    <button
                      onClick={(e) => openEntityFicha('municipio', ev['Município'], e)}
                      className="flex items-start text-left hover:underline"
                      title={`Abrir Ficha do Município: ${ev['Município']}`}
                    >
                      <MapPinIcon className="w-3.5 h-3.5 mr-1 mt-0.5 text-teal-700 flex-shrink-0" />
                      <span className="text-teal-700 font-bold uppercase text-xs">{ev['Município']}</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Município não informado</span>
                  )}

                  {ev['Bairro'] ? (
                    <button
                      onClick={(e) => openEntityFicha('bairro', ev['Bairro'], e)}
                      className="text-[11px] font-semibold text-slate-600 hover:text-rose-700 hover:underline uppercase"
                    >
                      {ev['Bairro']}
                    </button>
                  ) : ev['Região'] ? (
                    <button
                      onClick={(e) => openEntityFicha('regiao', ev['Região'], e)}
                      className="text-[11px] font-semibold text-slate-500 hover:text-teal-700 hover:underline uppercase"
                    >
                      {ev['Região']}
                    </button>
                  ) : null}
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug break-words">
                    {ev['Título']}
                  </h3>
                  {ev['Local'] && (
                    <p className="text-xs text-slate-600 mt-1 break-words">
                      📍 {ev['Local']}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-600">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-slate-400 mr-1">Articulador:</span>
                    {ev['Articulador'] ? (
                      <button
                        onClick={(e) => openEntityFicha('articulador', ev['Articulador'], e)}
                        className="font-semibold text-rose-700 hover:underline uppercase"
                      >
                        {ev['Articulador']}
                      </button>
                    ) : '-'}
                  </div>
                  <span>⏱️ {ev['Duração'] || 0} min</span>
                </div>
              </div>

              <div className="bg-slate-50/80 border-t border-slate-200 px-3.5 py-2 flex justify-between items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <select
                  value={ev['Prioridade'] || 'Sem Prioridade'}
                  onChange={(e) => handleUpdatePriority(ev.id, e.target.value)}
                  className={`flex-1 text-center border px-2 py-1 text-[10px] font-semibold uppercase cursor-pointer focus:outline-none ${getPrioridadeClasses(ev['Prioridade'])}`}
                >
                  <option value="Sem Prioridade">Sem Prioridade</option>
                  <option value="Baixa">Prioridade Baixa</option>
                  <option value="Média">Prioridade Média</option>
                  <option value="Alta">Prioridade Alta</option>
                </select>

                <select
                  value={ev['STATUS'] || 'Pendente'}
                  onChange={(e) => handleUpdateStatus(ev.id, e.target.value)}
                  className={`flex-1 text-center border px-2 py-1 text-[10px] font-semibold uppercase cursor-pointer focus:outline-none ${getStatusClasses(ev['STATUS'])}`}
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Realizado">Realizado</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        {totalCards > 0 && <PaginationBar />}
      </div>
    );
  };

  const ListView = () => (
    <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 animate-in fade-in">
      {renderAgendasTableOrCards(filteredAndSortedEvents, sortConfig, requestSort, viewMode)}
    </div>
  );

  // ============================================================================
  // FICHA INTERATIVA DE CRUZAMENTO DE DADOS (PADRÃO TABULUM - EMENDAS)
  // ============================================================================
  const EntityProfileView = () => {
    const [fichaSearch, setFichaSearch] = useState('');
    const [fichaSortConfig, setFichaSortConfig] = useState({ key: 'Início', direction: 'desc' });
    const [crossSortByDim, setCrossSortByDim] = useState({});

    if (!selectedEntityFicha) return null;
    const { type, value } = selectedEntityFicha;
    const meta = ENTITY_TYPE_META[type] || { label: 'Categoria', plural: 'Categorias', field: type };

    const baseEntityEvents = useMemo(() => {
      return events.filter(e => {
        const isPessoal = normalizerFilter(e['Classe de Atividade']).includes('pessoal') || normalizerFilter(e['Classe de Atividade']).includes('feriado');
        if (!showPessoal && isPessoal) return false;
        const cellVal = String(e[meta.field] || '').trim();
        return cellVal.toLowerCase() === String(value).trim().toLowerCase();
      });
    }, [events, meta.field, value, showPessoal]);

    const fichaEvents = useMemo(() => {
      const filtered = baseEntityEvents.filter(e => {
        const matchesGlobalSearch = searchTerm === '' || JSON.stringify(e).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesInnerSearch = fichaSearch === '' || JSON.stringify(e).toLowerCase().includes(fichaSearch.toLowerCase());
        return matchesGlobalSearch && matchesInnerSearch;
      });
      return sortEventsList(filtered, fichaSortConfig);
    }, [baseEntityEvents, searchTerm, fichaSearch, fichaSortConfig]);

    const requestFichaSort = (key) => {
      let direction = 'asc';
      if (fichaSortConfig && fichaSortConfig.key === key && fichaSortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setFichaSortConfig({ key, direction });
    };

    const totalVisitas = baseEntityEvents.length;
    const totalPresenciais = baseEntityEvents.filter(e => e['Modalidade'] === 'Presencial').length;
    const totalOnline = baseEntityEvents.filter(e => e['Modalidade'] === 'Online').length;
    const totalHoras = (baseEntityEvents.reduce((acc, e) => acc + (Number(e['Duração']) || 0), 0) / 60).toFixed(1);

    let lastVisitDate = null;
    let nextVisitDate = null;
    baseEntityEvents.forEach(ev => {
      const d = parseLocalDate(ev['Início']);
      if (d) {
        if (d < getTodayStart() && (!lastVisitDate || d > lastVisitDate)) lastVisitDate = d;
        if (d >= getTodayStart() && (!nextVisitDate || d < nextVisitDate)) nextVisitDate = d;
      }
    });

    const buildBreakdown = (dimType) => {
      const dimMeta = ENTITY_TYPE_META[dimType];
      const map = {};
      baseEntityEvents.forEach(e => {
        const raw = String(e[dimMeta.field] || '').trim();
        const key = raw || 'Não informado';
        if (!map[key]) {
          map[key] = { name: key, isValid: Boolean(raw), count: 0, presenciais: 0, horas: 0 };
        }
        map[key].count += 1;
        if (e['Modalidade'] === 'Presencial') map[key].presenciais += 1;
        map[key].horas += (Number(e['Duração']) || 0) / 60;
      });

      const items = Object.values(map);
      const sortConf = crossSortByDim[dimType] || { key: 'count', direction: 'desc' };

      items.sort((a, b) => {
        if (sortConf.key === 'name') {
          const cmp = a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base', numeric: true });
          return sortConf.direction === 'asc' ? cmp : -cmp;
        }
        const diff = a[sortConf.key] - b[sortConf.key];
        return sortConf.direction === 'asc' ? diff : -diff;
      });

      return items;
    };

    const toggleCrossSort = (dimType, key) => {
      setCrossSortByDim(prev => {
        const current = prev[dimType] || { key: 'count', direction: 'desc' };
        const nextDir = current.key === key && current.direction === 'desc' ? 'asc' : 'desc';
        return { ...prev, [dimType]: { key, direction: nextDir } };
      });
    };

    const crossDimensions = [
      'classe',
      'articulador',
      'municipio',
      'regiao',
      'bairro',
      'status',
      'prioridade',
      'modalidade',
      'mes_ano'
    ].filter(d => d !== type);

    const uniqueCounts = {
      municipios: new Set(baseEntityEvents.map(e => e['Município']).filter(Boolean)).size,
      regioes: new Set(baseEntityEvents.map(e => e['Região']).filter(Boolean)).size,
      articuladores: new Set(baseEntityEvents.map(e => e['Articulador']).filter(Boolean)).size,
      classes: new Set(baseEntityEvents.map(e => e['Classe de Atividade']).filter(Boolean)).size,
      bairros: new Set(baseEntityEvents.map(e => e['Bairro']).filter(Boolean)).size,
      altaPrioridade: baseEntityEvents.filter(e => e['Prioridade'] === 'Alta').length
    };

    return (
      <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 animate-in fade-in">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={goBackFromEntityFicha}
              className="bg-slate-800 text-white px-3 py-1.5 font-semibold text-xs rounded-xs hover:bg-slate-700 flex items-center"
            >
              ← {entityHistory.length > 0 ? `Voltar para ${entityHistory[entityHistory.length - 1].value}` : 'Voltar ao Painel'}
            </button>
            <button
              onClick={() => applyEntityFilterToMainList(type, value)}
              className="bg-amber-200 text-slate-900 px-3 py-1.5 font-semibold text-xs border border-slate-300 rounded-xs hover:bg-amber-300 flex items-center"
            >
              <FilterIcon className="w-3.5 h-3.5 mr-1.5" /> Aplicar como Filtro no Painel
            </button>
          </div>

          <div className="relative w-56">
            <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Filtrar em ${value}...`}
              value={fichaSearch}
              onChange={(e) => setFichaSearch(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 bg-white border border-slate-300 rounded-xs text-xs focus:outline-none focus:border-teal-700"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-300 shadow-xs mb-5">
          <div className="bg-teal-700 border-b border-slate-300 p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="inline-block bg-amber-300 text-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                Ficha de {meta.label}
              </span>
              <h1 className="text-xl sm:text-3xl font-bold text-white uppercase tracking-tight break-words">
                {value}
              </h1>
            </div>
            <div className="bg-white border border-slate-300 px-3.5 py-2 text-right rounded-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total de Visitas / Agendas</span>
              <span className="text-xl font-bold text-rose-700">{totalVisitas}</span>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-b border-slate-200 bg-slate-50/50">
            <div className="bg-white border border-slate-200 p-3.5">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Presenciais vs. Online</p>
              <p className="text-lg sm:text-xl font-bold text-slate-900">{totalPresenciais} presenciais</p>
              <p className="text-[11px] font-medium text-teal-700 mt-0.5">{totalOnline} agendas online</p>
            </div>
            <div className="bg-white border border-slate-200 p-3.5">
              <p className="text-[10px] font-bold uppercase text-teal-700 mb-1">Tempo Total Dedicado</p>
              <p className="text-lg sm:text-xl font-bold text-teal-700">{totalHoras} horas</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">Soma de duração das agendas</p>
            </div>
            <div className="bg-white border border-slate-200 p-3.5">
              <p className="text-[10px] font-bold uppercase text-rose-700 mb-1">Histórico de Presença</p>
              <p className="text-xs font-bold text-slate-900">Última: <span className="text-rose-700">{lastVisitDate ? formatDate(lastVisitDate) : 'Sem registro'}</span></p>
              <p className="text-xs font-bold text-slate-900 mt-1">Próxima: <span className="text-teal-700">{nextVisitDate ? formatDate(nextVisitDate) : 'Nenhuma agendada'}</span></p>
            </div>
            <div className="bg-amber-50/80 border border-amber-200 p-3.5 flex flex-col justify-between">
              <p className="text-[10px] font-bold uppercase text-slate-700 mb-1">Resumo de Vínculos</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px] font-medium text-slate-800">
                <span>Municípios: <strong>{uniqueCounts.municipios}</strong></span>
                <span>Regiões: <strong>{uniqueCounts.regioes}</strong></span>
                <span>Articuladores: <strong>{uniqueCounts.articuladores}</strong></span>
                <span>Classes: <strong>{uniqueCounts.classes}</strong></span>
                <span>Bairros: <strong>{uniqueCounts.bairros}</strong></span>
                <span>Alta Prior.: <strong className="text-rose-700">{uniqueCounts.altaPrioridade}</strong></span>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-xs sm:text-sm font-bold uppercase text-slate-800 tracking-wider mb-3 flex items-center">
              <span className="w-2 h-4 bg-rose-700 mr-2"></span>
              Cruzamento de Dados ({value}) — Clique nos títulos para ordenar ou em qualquer item para abrir sua Ficha
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {crossDimensions.map(dimKey => {
                const dimMeta = ENTITY_TYPE_META[dimKey];
                const rows = buildBreakdown(dimKey);
                if (dimKey === 'bairro' && rows.filter(r => r.isValid).length === 0) return null;
                const sortConf = crossSortByDim[dimKey] || { key: 'count', direction: 'desc' };

                const CrossSortHeader = ({ label, colKey, align = 'left' }) => {
                  const active = sortConf.key === colKey;
                  return (
                    <th
                      onClick={() => toggleCrossSort(dimKey, colKey)}
                      className={`py-1.5 px-2 text-[10px] font-bold uppercase text-slate-700 cursor-pointer hover:bg-amber-200/60 select-none border-b border-slate-300 ${
                        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
                      }`}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {label}
                        {active && (sortConf.direction === 'asc' ? ' ▲' : ' ▼')}
                      </span>
                    </th>
                  );
                };

                return (
                  <div key={dimKey} className="border border-slate-300 bg-white flex flex-col">
                    <div className="bg-amber-100/90 border-b border-slate-300 px-3 py-1.5 flex justify-between items-center">
                      <span className="font-bold text-xs uppercase text-slate-800">{dimMeta.plural}</span>
                      <span className="bg-white border border-slate-300 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">
                        {rows.filter(r => r.isValid).length}
                      </span>
                    </div>
                    <div className="max-h-56 overflow-y-auto flex-1">
                      <table className="w-full border-collapse text-xs">
                        <thead className="bg-slate-50 sticky top-0 z-10">
                          <tr>
                            <CrossSortHeader label={dimMeta.label} colKey="name" align="left" />
                            <CrossSortHeader label="Visitas" colKey="count" align="center" />
                            <CrossSortHeader label="Pres." colKey="presenciais" align="center" />
                            <CrossSortHeader label="Horas" colKey="horas" align="right" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rows.map((item, i) => (
                            <tr
                              key={i}
                              onClick={() => item.isValid && openEntityFicha(dimKey, item.name)}
                              className={item.isValid ? "hover:bg-teal-50/70 cursor-pointer transition-colors" : "text-slate-400 italic"}
                            >
                              <td className="py-1.5 px-2 font-medium text-[11px] text-teal-800 hover:underline whitespace-normal break-words">
                                {item.name}
                              </td>
                              <td className="py-1.5 px-2 text-center font-bold text-[11px] text-rose-700">
                                {item.count}
                              </td>
                              <td className="py-1.5 px-2 text-center font-semibold text-[11px] text-slate-700">
                                {item.presenciais}
                              </td>
                              <td className="py-1.5 px-2 text-right font-medium text-[11px] text-slate-800 whitespace-nowrap">
                                {item.horas.toFixed(1)}h
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {renderAgendasTableOrCards(fichaEvents, fichaSortConfig, requestFichaSort, viewMode)}
      </div>
    );
  };

  // ============================================================================
  // DASHBOARD E MAPA VETORIAL LIMPO (PADRÃO TABULUM - EMENDAS)
  // ============================================================================
  const DashboardView = () => {
    const [hoveredMuni, setHoveredMuni] = useState(null);
    const [mapMetric, setMapMetric] = useState('visitas'); // 'visitas' | 'horas'

    const totalAgendas = filteredAndSortedEvents.length;
    const totalHorasGlobal = (filteredAndSortedEvents.reduce((acc, ev) => acc + (Number(ev['Duração']) || 0), 0) / 60).toFixed(1);
    const totalMunicipiosVisitados = new Set(filteredAndSortedEvents.map(ev => ev['Município']).filter(Boolean)).size;

    const buildGroupStats = (field, ignoreList = []) => {
      const acc = {};
      filteredAndSortedEvents.forEach(ev => {
        const key = String(ev[field] || '').trim();
        if (!key || ignoreList.includes(normalizerFilter(key))) return;
        if (!acc[key]) acc[key] = { key, count: 0, horas: 0 };
        acc[key].count += 1;
        acc[key].horas += (Number(ev['Duração']) || 0) / 60;
      });
      return Object.values(acc).sort((a, b) => b.count - a.count);
    };

    const classesData = buildGroupStats('Classe de Atividade', ['outros eventos']);
    const regioesData = buildGroupStats('Região');
    const articuladoresData = buildGroupStats('Articulador');
    const bairrosFloripaData = buildGroupStats('Bairro', ['centro / nao especificado', 'digital / online']);

    // Evolução Mensal no formato de colunas verticais limpas do TABULUM - Emendas
    const timelineMensalData = useMemo(() => {
      const map = {};
      filteredAndSortedEvents.forEach(ev => {
        const sortKey = ev['_SORT_MES'];
        const label = ev['MES_ANO'];
        if (!sortKey || !label) return;
        if (!map[sortKey]) map[sortKey] = { sortKey, label, count: 0, horas: 0 };
        map[sortKey].count += 1;
        map[sortKey].horas += (Number(ev['Duração']) || 0) / 60;
      });
      return Object.values(map).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }, [filteredAndSortedEvents]);

    const agendasPorMuni = useMemo(() => {
      const map = {};
      filteredAndSortedEvents.forEach(ev => {
        const mName = normalizeStr(ev['Município']);
        if (mName) {
          if (!map[mName]) map[mName] = { count: 0, horas: 0 };
          map[mName].count += 1;
          map[mName].horas += (Number(ev['Duração']) || 0) / 60;
        }
      });
      return map;
    }, [filteredAndSortedEvents]);

    // Cores Mondrian Suaves no Mapa Vetorial (Branco, Amarelo, Azul-Esverdeado, Carmesim)
    const getMuniColor = (muniStats) => {
      if (!muniStats || muniStats.count === 0) return '#ffffff';
      if (mapMetric === 'horas') {
        const h = muniStats.horas;
        if (h <= 4) return '#fcd34d';   // Amarelo Mondrian
        if (h <= 15) return '#007D8A';  // Azul-Esverdeado Mondrian
        return '#be123c';               // Carmesim Mondrian
      }
      const qtd = muniStats.count;
      if (qtd <= 2) return '#fcd34d';
      if (qtd <= 8) return '#007D8A';
      return '#be123c';
    };

    const renderMap = () => {
      if (!mapGeoJson) return <div className="p-8 text-center font-medium text-slate-500">Carregando Mapa de Santa Catarina...</div>;

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      mapGeoJson.features.forEach(f => {
        const processRings = (rings) => {
          rings.forEach(ring => ring.forEach(coord => {
            if (coord[0] < minX) minX = coord[0];
            if (coord[0] > maxX) maxX = coord[0];
            if (coord[1] < minY) minY = coord[1];
            if (coord[1] > maxY) maxY = coord[1];
          }));
        };
        if (f.geometry.type === 'Polygon') processRings(f.geometry.coordinates);
        else if (f.geometry.type === 'MultiPolygon') f.geometry.coordinates.forEach(processRings);
      });

      const mapWidth = 800; const mapHeight = 580;
      const scaleX = mapWidth / (maxX - minX);
      const scaleY = mapHeight / (maxY - minY);
      const scale = Math.min(scaleX, scaleY) * 0.95;

      const offsetX = (mapWidth - (maxX - minX) * scale) / 2;
      const offsetY = (mapHeight - (maxY - minY) * scale) / 2;

      const project = (coord) => {
        const x = (coord[0] - minX) * scale + offsetX;
        const y = mapHeight - ((coord[1] - minY) * scale) - offsetY;
        return `${x},${y}`;
      };

      const generatePath = (geometry) => {
        const createString = (rings) => rings.map(ring => "M" + ring.map(coord => project(coord)).join("L") + "Z").join(" ");
        if (geometry.type === 'Polygon') return createString(geometry.coordinates);
        if (geometry.type === 'MultiPolygon') return geometry.coordinates.map(createString).join(" ");
        return "";
      };

      return (
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-auto select-none"
          onClick={() => setHoveredMuni(null)}
        >
          {mapGeoJson.features.map((feature, i) => {
            const mName = normalizeStr(feature.properties.name);
            const stats = agendasPorMuni[mName] || { count: 0, horas: 0 };
            return (
              <path
                key={i}
                d={generatePath(feature.geometry)}
                fill={getMuniColor(stats)}
                stroke="#334155"
                strokeWidth="0.75"
                className="hover:stroke-[2.2px] transition-all cursor-pointer relative"
                onMouseEnter={(e) => {
                  setHoveredMuni({
                    name: feature.properties.name,
                    count: stats.count,
                    horas: stats.horas,
                    x: e.clientX,
                    y: e.clientY,
                    isTouch: false
                  });
                }}
                onMouseMove={(e) => {
                  setHoveredMuni(prev => prev && !prev.isTouch ? {
                    ...prev,
                    x: e.clientX,
                    y: e.clientY
                  } : prev);
                }}
                onMouseLeave={() => {
                  setHoveredMuni(prev => (prev && !prev.isTouch ? null : prev));
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  const touch = e.touches && e.touches[0];
                  setHoveredMuni({
                    name: feature.properties.name,
                    count: stats.count,
                    horas: stats.horas,
                    x: touch ? touch.clientX : 180,
                    y: touch ? touch.clientY : 240,
                    isTouch: true
                  });
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openEntityFicha('municipio', feature.properties.name);
                }}
              />
            );
          })}
        </svg>
      );
    };

    return (
      <div className="max-w-[98%] xl:max-w-[1600px] mx-auto px-3 sm:px-4 py-4 animate-in fade-in space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Coluna Esquerda: Card Resumo + Barras por Classe, Região e Articulador */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-amber-200/90 border border-slate-400 p-4 shadow-xs flex flex-col justify-center">
              <div className="flex justify-between items-center border-b border-slate-500/40 pb-2 mb-2.5">
                <p className="text-slate-900 font-bold uppercase text-xs tracking-wider">
                  Total no Filtro
                </p>
                <span className="bg-white border border-slate-400 px-2 py-0.5 text-[11px] font-bold text-rose-700 uppercase">
                  {totalMunicipiosVisitados} {totalMunicipiosVisitados === 1 ? 'município' : 'municípios'}
                </span>
              </div>
              <h2 className="text-2xl xl:text-3xl font-black text-slate-900 leading-none">
                {totalAgendas} {totalAgendas === 1 ? 'agenda' : 'agendas'}
              </h2>
              <div className="mt-2.5 pt-2 border-t border-slate-500/30 flex justify-between items-baseline">
                <span className="text-[11px] font-semibold uppercase text-slate-800">Tempo Dedicado:</span>
                <span className="text-sm font-bold text-teal-900">{totalHorasGlobal} horas</span>
              </div>
            </div>

            {/* Por Classe de Atividade */}
            <div className="bg-white border border-slate-300 p-4 shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3.5">
                <p className="text-slate-900 font-bold uppercase text-xs tracking-wider">
                  Por Classe de Atividade ({classesData.length})
                </p>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Agendas • Horas</span>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {classesData.length > 0 ? classesData.map((d) => {
                  const maxVal = Math.max(...classesData.map(r => r.count), 1);
                  const pct = Math.max((d.count / maxVal) * 100, 4);
                  return (
                    <div key={d.key} className="cursor-pointer group" onClick={() => openEntityFicha('classe', d.key)}>
                      <div className="flex justify-between items-baseline text-[11px] font-semibold uppercase mb-1 text-slate-800 group-hover:text-rose-700">
                        <span className="truncate pr-2" title={d.key}>{d.key}</span>
                        <span className="whitespace-nowrap">
                          <strong className="text-rose-700">{d.count} ag.</strong> • {d.horas.toFixed(1)}h
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 border border-slate-300">
                        <div className="h-full bg-rose-700" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-slate-400 uppercase">Sem dados.</p>}
              </div>
            </div>

            {/* Por Região de SC */}
            <div className="bg-white border border-slate-300 p-4 shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3.5">
                <p className="text-slate-900 font-bold uppercase text-xs tracking-wider">
                  Por Região de SC ({regioesData.length})
                </p>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Visitas • Horas</span>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {regioesData.length > 0 ? regioesData.map((d) => {
                  const maxVal = Math.max(...regioesData.map(r => r.count), 1);
                  const pct = Math.max((d.count / maxVal) * 100, 4);
                  return (
                    <div key={d.key} className="cursor-pointer group" onClick={() => openEntityFicha('regiao', d.key)}>
                      <div className="flex justify-between items-baseline text-[11px] font-semibold uppercase mb-1 text-slate-800 group-hover:text-teal-700">
                        <span className="truncate pr-2" title={d.key}>{d.key}</span>
                        <span className="whitespace-nowrap">
                          <strong className="text-teal-700">{d.count} ag.</strong> • {d.horas.toFixed(1)}h
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 border border-slate-300">
                        <div className="h-full bg-teal-700" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-slate-400 uppercase">Sem dados.</p>}
              </div>
            </div>

            {/* Por Articulador */}
            <div className="bg-white border border-slate-300 p-4 shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3.5">
                <p className="text-slate-900 font-bold uppercase text-xs tracking-wider">
                  Por Articulador ({articuladoresData.length})
                </p>
                <span className="text-[10px] font-semibold uppercase text-slate-400">Agendas • Horas</span>
              </div>
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {articuladoresData.length > 0 ? articuladoresData.map((d) => {
                  const maxVal = Math.max(...articuladoresData.map(r => r.count), 1);
                  const pct = Math.max((d.count / maxVal) * 100, 4);
                  return (
                    <div key={d.key} className="cursor-pointer group" onClick={() => openEntityFicha('articulador', d.key)}>
                      <div className="flex justify-between items-baseline text-[11px] font-semibold uppercase mb-1 text-slate-800 group-hover:text-rose-700">
                        <span className="truncate pr-2">{d.key}</span>
                        <span className="whitespace-nowrap">
                          <strong className="text-rose-700">{d.count} ag.</strong> • {d.horas.toFixed(1)}h
                        </span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 border border-slate-300">
                        <div className="h-full bg-amber-400" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                }) : <p className="text-xs text-slate-400 uppercase">Sem dados.</p>}
              </div>
            </div>
          </div>

          {/* Coluna Direita (2/3): Mapa Vetorial Limpo de SC + Evolução Mensal em Colunas + Bairros de Florianópolis */}
          <div className="lg:col-span-2 space-y-5 self-start">
            {/* Mapa de Santa Catarina no padrão TABULUM - Emendas */}
            <div className="bg-white border border-slate-300 shadow-xs flex flex-col relative overflow-hidden">
              <div className="bg-teal-700 border-b border-slate-300 p-3 flex flex-wrap justify-between items-center gap-3 z-10">
                <p className="text-white font-bold uppercase text-xs sm:text-sm tracking-wider flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1.5" /> Mapa de Presença em Santa Catarina
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex border border-slate-800 bg-white rounded-xs overflow-hidden">
                    <button
                      onClick={() => setMapMetric('visitas')}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors border-r border-slate-300 ${
                        mapMetric === 'visitas' ? 'bg-amber-300 text-slate-900' : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Por Visitas (Nº)
                    </button>
                    <button
                      onClick={() => setMapMetric('horas')}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase transition-colors ${
                        mapMetric === 'horas' ? 'bg-amber-300 text-slate-900' : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Por Horas (h)
                    </button>
                  </div>

                  {mapMetric === 'visitas' ? (
                    <div className="flex space-x-2 text-[10px] font-semibold uppercase text-white items-center">
                      <div className="w-3 h-3 bg-amber-300 border border-slate-900"></div> <span>1–2 vis.</span>
                      <div className="w-3 h-3 bg-[#007D8A] border border-white ml-1.5"></div> <span>3–8 vis.</span>
                      <div className="w-3 h-3 bg-rose-700 border border-white ml-1.5"></div> <span>9+ vis.</span>
                    </div>
                  ) : (
                    <div className="flex space-x-2 text-[10px] font-semibold uppercase text-white items-center">
                      <div className="w-3 h-3 bg-amber-300 border border-slate-900"></div> <span>Até 4h</span>
                      <div className="w-3 h-3 bg-[#007D8A] border border-white ml-1.5"></div> <span>4h–15h</span>
                      <div className="w-3 h-3 bg-rose-700 border border-white ml-1.5"></div> <span>+15h</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-2 sm:p-4 bg-white relative flex flex-col items-center justify-center">
                {renderMap()}

                {hoveredMuni && (
                  <div
                    className={`${
                      hoveredMuni.isTouch
                        ? 'sticky bottom-2 left-2 right-2 w-full max-w-sm mx-auto mt-2'
                        : 'fixed pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-12px]'
                    } bg-white border border-slate-800 p-3 shadow-md z-50`}
                    style={!hoveredMuni.isTouch ? { left: hoveredMuni.x, top: hoveredMuni.y } : {}}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <p className="font-bold text-rose-700 text-xs sm:text-sm uppercase">{hoveredMuni.name}</p>
                      {hoveredMuni.isTouch && (
                        <button onClick={() => setHoveredMuni(null)} className="text-slate-400 hover:text-slate-800 p-0.5">
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {hoveredMuni.count > 0 ? (
                      <div className="mt-1 space-y-0.5">
                        <p className="font-semibold text-xs text-teal-800">
                          Visitas / Agendas: <strong>{hoveredMuni.count}</strong>
                        </p>
                        <p className="font-bold text-xs text-slate-900">
                          Tempo dedicado: {hoveredMuni.horas.toFixed(1)}h
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1">Nenhuma visita no filtro atual</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Gráfico de Evolução Mensal das Agendas (Colunas Verticais Limpas no padrão TABULUM - Emendas) */}
            <div className="bg-white border border-slate-300 p-4 shadow-xs">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
                <p className="text-slate-900 font-bold uppercase text-xs tracking-wider">
                  Evolução Mensal das Agendas
                </p>
                <span className="text-[10px] font-semibold uppercase text-slate-400">
                  Clique na coluna de um mês para abrir sua Ficha
                </span>
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="flex items-end h-44 space-x-2.5 border-b border-l border-slate-300 px-3 pt-8 pb-2 min-w-[480px]">
                  {timelineMensalData.length > 0 ? timelineMensalData.map((d) => {
                    const maxVal = Math.max(...timelineMensalData.map(r => r.count), 1);
                    const pct = Math.max((d.count / maxVal) * 100, 6);
                    return (
                      <div
                        key={d.sortKey}
                        onClick={() => openEntityFicha('mes_ano', d.label)}
                        className="flex-1 min-w-[38px] flex flex-col items-center group relative h-full justify-end cursor-pointer"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-slate-900 text-white text-[10px] font-medium px-2 py-0.5 pointer-events-none whitespace-nowrap z-10 rounded-xs shadow-xs">
                          {d.label}: {d.count} ag. • {d.horas.toFixed(1)}h
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 mb-1">{d.count}</span>
                        <div
                          className="w-full max-w-[36px] bg-teal-700 border border-slate-700 transition-all group-hover:bg-amber-300"
                          style={{ height: `${pct}%` }}
                        ></div>
                        <span className="text-[10px] font-bold mt-1.5 text-slate-800 whitespace-nowrap">{d.label}</span>
                      </div>
                    );
                  }) : (
                    <p className="text-xs text-slate-400 uppercase self-center w-full text-center">Sem dados no período.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Presença por Bairros de Florianópolis (56 Bairros REPLAN) */}
            {bairrosFloripaData.length > 0 && (
              <div className="bg-white border border-slate-300 p-4 shadow-xs">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-3.5">
                  <p className="text-slate-900 font-bold uppercase text-xs tracking-wider">
                    Presença nos Bairros de Florianópolis ({bairrosFloripaData.length} bairros identificados)
                  </p>
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Clique para abrir a Ficha do Bairro</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {bairrosFloripaData.map((d) => {
                    const maxVal = Math.max(...bairrosFloripaData.map(r => r.count), 1);
                    const pct = Math.max((d.count / maxVal) * 100, 5);
                    return (
                      <div key={d.key} className="cursor-pointer group" onClick={() => openEntityFicha('bairro', d.key)}>
                        <div className="flex justify-between items-baseline text-[11px] font-semibold uppercase mb-1 text-slate-800 group-hover:text-rose-700">
                          <span className="truncate pr-2">{d.key}</span>
                          <span className="whitespace-nowrap">
                            <strong className="text-rose-700">{d.count} ag.</strong> • {d.horas.toFixed(1)}h
                          </span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 border border-slate-300">
                          <div className="h-full bg-rose-700" style={{ width: `${pct}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // FICHA INDIVIDUAL DE DETALHE DO COMPROMISSO (PADRÃO TABULUM - EMENDAS)
  // ============================================================================
  const DetailView = () => {
    if (!selectedEvent) return null;
    const data = selectedEvent;

    const InfoField = ({ label, value, icon: IconComponent, entityType = null, color = 'teal' }) => {
      const colorClass =
        color === 'teal' ? 'text-teal-700' :
        color === 'red' ? 'text-rose-700' :
        color === 'yellow' ? 'text-amber-700' : 'text-slate-700';

      return (
        <div className="mb-3 bg-white p-3 border border-slate-200 relative">
          <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center ${colorClass}`}>
            {IconComponent && <IconComponent className="h-3.5 w-3.5 mr-1" />} {label}
          </label>
          <div className="text-slate-900 font-medium text-sm break-words flex items-center justify-between gap-2">
            {entityType && value ? (
              <button
                onClick={(e) => openEntityFicha(entityType, value, e)}
                className="font-semibold text-left hover:text-rose-700 hover:underline"
              >
                {value}
              </button>
            ) : (
              <span>{value || <span className="text-slate-400 italic">Não informado</span>}</span>
            )}
            {entityType && value && (
              <button
                onClick={(e) => openEntityFicha(entityType, value, e)}
                className="text-[10px] bg-amber-100 text-slate-800 border border-slate-300 px-1.5 py-0.5 uppercase font-semibold hover:bg-amber-200 flex-shrink-0"
              >
                Abrir Ficha
              </button>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-5 animate-in fade-in">
        <button
          onClick={() => {
            if (selectedEntityFicha) setCurrentView('entity');
            else setCurrentView('list');
          }}
          className="bg-slate-800 text-white px-3.5 py-1.5 font-semibold uppercase text-xs rounded-xs hover:bg-slate-700 mb-4 flex items-center"
        >
          ← {selectedEntityFicha ? `Voltar para Ficha de ${selectedEntityFicha.value}` : 'Voltar ao Painel'}
        </button>

        <div className="bg-white border border-slate-300 shadow-xs">
          <div className="bg-rose-700 border-b border-slate-300 p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="inline-block bg-amber-300 text-slate-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                {data['Classe de Atividade']} • {data['Modalidade']}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {data['Título']}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={data['Prioridade'] || 'Sem Prioridade'}
                onChange={(e) => handleUpdatePriority(data.id, e.target.value)}
                className={`border px-3 py-1.5 text-xs font-bold uppercase cursor-pointer ${getPrioridadeClasses(data['Prioridade'])}`}
              >
                <option value="Sem Prioridade">Sem Prioridade</option>
                <option value="Baixa">Prioridade Baixa</option>
                <option value="Média">Prioridade Média</option>
                <option value="Alta">Prioridade Alta</option>
              </select>

              <select
                value={data['STATUS'] || 'Pendente'}
                onChange={(e) => handleUpdateStatus(data.id, e.target.value)}
                className={`border px-3 py-1.5 text-xs font-bold uppercase cursor-pointer ${getStatusClasses(data['STATUS'])}`}
              >
                <option value="Pendente">Pendente</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Realizado">Realizado</option>
              </select>
            </div>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 bg-slate-50/70 border border-slate-200 p-4">
              <div className="bg-slate-800 text-white font-bold uppercase text-xs py-1 px-2.5 inline-block mb-2">
                Localização Territorial
              </div>
              <InfoField label="Município" value={data['Município']} icon={MapPinIcon} entityType="municipio" color="teal" />
              <InfoField label="Região de SC" value={data['Região']} icon={MapIcon} entityType="regiao" color="black" />
              {data['Bairro'] && (
                <InfoField label="Bairro REPLAN (Florianópolis)" value={data['Bairro']} icon={MapPinIcon} entityType="bairro" color="red" />
              )}
              <InfoField label="Endereço / Local Físico" value={data['Local']} color="black" />
            </div>

            <div className="space-y-2 bg-slate-50/70 border border-slate-200 p-4">
              <div className="bg-teal-700 text-white font-bold uppercase text-xs py-1 px-2.5 inline-block mb-2">
                Articulação & Horário
              </div>
              <InfoField label="Data de Início" value={formatDate(data['Início'])} icon={CalendarIcon} color="teal" />
              <InfoField label="Duração Estimada" value={`${data['Duração'] || 0} minutos`} icon={ClockIcon} color="black" />
              <InfoField label="Classe de Atividade" value={data['Classe de Atividade']} icon={LayersIcon} entityType="classe" color="red" />
              <InfoField label="Articulador Responsável" value={data['Articulador']} icon={UserIcon} entityType="articulador" color="red" />

              <div className="bg-white p-3 border border-slate-200">
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Definir / Corrigir Articulador (Salva na Coluna K sem afetar fórmulas)
                </label>
                <input
                  type="text"
                  defaultValue={data['Articulador'] || ''}
                  placeholder="Digite o nome do articulador e clique fora..."
                  onBlur={(e) => handleUpdateArticulador(data.id, e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 focus:outline-none focus:border-teal-700"
                />
              </div>
            </div>

            {data['Descrição'] && (
              <div className="col-span-1 md:col-span-2 bg-amber-50/60 border border-amber-200 p-4">
                <div className="bg-amber-300 text-slate-900 font-bold uppercase text-xs py-1 px-2.5 inline-block mb-2">
                  Descrição / Pauta da Agenda
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-white p-3 border border-slate-200">
                  {data['Descrição']}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="text-center p-6 bg-white border border-slate-300 shadow-xs">
          <div className="flex space-x-2 justify-center mb-4">
            <div className="w-4 h-4 bg-rose-700 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-4 h-4 bg-amber-300 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-teal-700 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-slate-700 font-bold text-xs uppercase tracking-widest">Carregando Agendas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-amber-200 selection:text-slate-900 pb-12 print:pb-0">
      <UnifiedTopBar />
      {/* Espaçador para compensar a altura da barra superior 100% fixa */}
      <div className="h-[108px] sm:h-[96px] print:hidden"></div>
      <main>
        {currentView === 'list' && <ListView />}
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'entity' && <EntityProfileView />}
        {currentView === 'detail' && <DetailView />}
      </main>
    </div>
  );
}
