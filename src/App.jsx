import React, { useState, useEffect, useMemo, useRef } from 'react';

// ==========================================
// CONFIGURAÇÃO DA API E ESTÉTICA MONDRIAN
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
  pureWhite: '#ffffff',
  navy: '#1D3557',
  orange: '#E05A47',
  purple: '#5E3A87'
};

// Paleta expandida para gráficos sem perder a identidade Mondrian
const CHART_PALETTE = [
  COLORS.crimson,
  COLORS.teal,
  COLORS.mustard,
  COLORS.black,
  '#2B580C',
  '#7F2CCB',
  '#D9534F',
  '#005066'
];

// ==========================================
// BASE OFICIAL DA ABA "APOIO" (56 BAIRROS REPLAN + REGIÕES SC)
// ==========================================
const FLORIPA_REPLAN = [
  { b: 'Abraão', r: 'Continental', d: 'Coqueiros', coords: [-27.602, -48.591] },
  { b: 'Agronômica', r: 'Central', d: 'Sede Insular', coords: [-27.576, -48.536] },
  { b: 'Alto Ribeirão', r: 'Sul', d: 'Ribeirão da Ilha', coords: [-27.705, -48.525] },
  { b: 'Armação', r: 'Sul', d: 'Pântano do Sul', coords: [-27.752, -48.504] },
  { b: 'Balneário', r: 'Continental', d: 'Estreito', coords: [-27.576, -48.582] },
  { b: 'Barra da Lagoa', r: 'Leste', d: 'Barra da Lagoa', coords: [-27.574, -48.425] },
  { b: 'Bom Abrigo', r: 'Continental', d: 'Coqueiros', coords: [-27.608, -48.586] },
  { b: 'Cachoeira do Bom Jesus', r: 'Norte', d: 'Cachoeira do Bom Jesus', coords: [-27.437, -48.436] },
  { b: 'Cacupé', r: 'Norte', d: 'Santo Antônio de Lisboa', coords: [-27.531, -48.523] },
  { b: 'Campeche', r: 'Sul', d: 'Campeche', coords: [-27.681, -48.497] },
  { b: 'Canasvieiras', r: 'Norte', d: 'Canasvieiras', coords: [-27.428, -48.461] },
  { b: 'Canto', r: 'Continental', d: 'Estreito', coords: [-27.582, -48.579] },
  { b: 'Capoeiras', r: 'Continental', d: 'Estreito', coords: [-27.595, -48.598] },
  { b: 'Capoeiras Oeste', r: 'Continental', d: 'Coqueiros', coords: [-27.599, -48.605] },
  { b: 'Carianos', r: 'Sul', d: 'Campeche', coords: [-27.665, -48.535] },
  { b: 'Carvoeira', r: 'Central', d: 'Trindade', coords: [-27.604, -48.521] },
  { b: 'Centro', r: 'Central', d: 'Sede Insular', coords: [-27.595, -48.548] },
  { b: 'Coloninha', r: 'Continental', d: 'Estreito', coords: [-27.589, -48.592] },
  { b: 'Coqueiros', r: 'Continental', d: 'Coqueiros', coords: [-27.602, -48.579] },
  { b: 'Córrego Grande', r: 'Central', d: 'Trindade', coords: [-27.595, -48.508] },
  { b: 'Costa da Lagoa', r: 'Leste', d: 'Lagoa da Conceição', coords: [-27.561, -48.463] },
  { b: 'Costeira do Pirajubaé', r: 'Sul', d: 'Saco dos Limões', coords: [-27.632, -48.524] },
  { b: 'Daniela', r: 'Norte', d: 'Canasvieiras', coords: [-27.452, -48.532] },
  { b: 'Estreito', r: 'Continental', d: 'Estreito', coords: [-27.585, -48.577] },
  { b: 'Ingleses', r: 'Norte', d: 'Ingleses', coords: [-27.436, -48.397] },
  { b: 'Itacorubi', r: 'Central', d: 'Trindade', coords: [-27.575, -48.508] },
  { b: 'Itaguaçu', r: 'Continental', d: 'Coqueiros', coords: [-27.606, -48.595] },
  { b: 'Jardim Atlântico', r: 'Continental', d: 'Estreito', coords: [-27.577, -48.598] },
  { b: 'João Paulo', r: 'Central', d: 'Saco Grande', coords: [-27.561, -48.512] },
  { b: 'José Mendes', r: 'Central', d: 'Sede Insular', coords: [-27.609, -48.545] },
  { b: 'Jurerê', r: 'Norte', d: 'Canasvieiras', coords: [-27.438, -48.493] },
  { b: 'Lagoa da Conceição', r: 'Leste', d: 'Lagoa da Conceição', coords: [-27.603, -48.461] },
  { b: 'Moçambique', r: 'Norte', d: 'Rio Vermelho', coords: [-27.515, -48.415] },
  { b: 'Monte Cristo', r: 'Continental', d: 'Estreito', coords: [-27.588, -48.604] },
  { b: 'Monte Verde', r: 'Central', d: 'Saco Grande', coords: [-27.551, -48.498] },
  { b: 'Morro das Pedras', r: 'Sul', d: 'Campeche', coords: [-27.716, -48.502] },
  { b: 'Pantanal', r: 'Central', d: 'Trindade', coords: [-27.602, -48.516] },
  { b: 'Pântano do Sul', r: 'Sul', d: 'Pântano do Sul', coords: [-27.781, -48.509] },
  { b: 'Ponta das Canas', r: 'Norte', d: 'Cachoeira do Bom Jesus', coords: [-27.399, -48.431] },
  { b: 'Praia Brava', r: 'Norte', d: 'Cachoeira do Bom Jesus', coords: [-27.398, -48.414] },
  { b: 'Praia do Forte', r: 'Norte', d: 'Canasvieiras', coords: [-27.441, -48.519] },
  { b: 'Ratones', r: 'Norte', d: 'Ratones', coords: [-27.503, -48.484] },
  { b: 'Ribeirão da Ilha', r: 'Sul', d: 'Ribeirão da Ilha', coords: [-27.721, -48.536] },
  { b: 'Rio Tavares', r: 'Sul', d: 'Campeche', coords: [-27.652, -48.485] },
  { b: 'Rio Vermelho', r: 'Norte', d: 'Rio Vermelho', coords: [-27.493, -48.406] },
  { b: 'Saco dos Limões', r: 'Central', d: 'Saco dos Limões', coords: [-27.608, -48.532] },
  { b: 'Saco Grande', r: 'Central', d: 'Saco Grande', coords: [-27.545, -48.498] },
  { b: 'Sambaqui', r: 'Norte', d: 'Santo Antônio de Lisboa', coords: [-27.485, -48.528] },
  { b: 'Santa Mônica', r: 'Central', d: 'Trindade', coords: [-27.588, -48.513] },
  { b: 'Santinho', r: 'Norte', d: 'Ingleses', coords: [-27.459, -48.378] },
  { b: 'Santo Antônio de Lisboa', r: 'Norte', d: 'Santo Antônio de Lisboa', coords: [-27.502, -48.514] },
  { b: 'Tapera da Base', r: 'Sul', d: 'Tapera da Base', coords: [-27.684, -48.555] },
  { b: 'Trindade', r: 'Central', d: 'Trindade', coords: [-27.583, -48.523] },
  { b: 'Vargem do Bom Jesus', r: 'Norte', d: 'Cachoeira do Bom Jesus', coords: [-27.452, -48.445] },
  { b: 'Vargem Grande', r: 'Norte', d: 'Ratones', coords: [-27.461, -48.465] },
  { b: 'Vargem Pequena', r: 'Norte', d: 'Canasvieiras', coords: [-27.468, -48.482] }
];

// Atalhos institucionais frequentes em Florianópolis
const FLORIPA_ALIASES = [
  { match: /(alesc|assembleia legislativa|palacio barriga verde|plenario|plenarinho|gabinete 26|gabinete 026)/, b: 'Centro' },
  { match: /(ufsc|reitoria da ufsc|cse ufsc|centro de cultura e eventos)/, b: 'Trindade' },
  { match: /(cca ufsc|udesc|ceart|epagri|cidasc)/, b: 'Itacorubi' },
  { match: /(centro administrativo)/, b: 'Saco Grande' },
  { match: /(ifsc continente)/, b: 'Coqueiros' },
  { match: /(parque da luz|bugio|mercado publico|largo da alfandega|catedral)/, b: 'Centro' },
  { match: /(sintrajusc)/, b: 'Campeche' }
];

// Mapeamento Regional de SC (Base Apoio)
const SC_REGION_MAP = {
  'florianopolis': 'GRANDE FLORIANÓPOLIS', 'sao jose': 'GRANDE FLORIANÓPOLIS', 'palhoca': 'GRANDE FLORIANÓPOLIS',
  'biguacu': 'GRANDE FLORIANÓPOLIS', 'santo amaro da imperatriz': 'GRANDE FLORIANÓPOLIS', 'aguas mornas': 'GRANDE FLORIANÓPOLIS',
  'alfredo wagner': 'GRANDE FLORIANÓPOLIS', 'antonio carlos': 'GRANDE FLORIANÓPOLIS', 'governador celso ramos': 'GRANDE FLORIANÓPOLIS',
  'garopaba': 'SUL II', 'imbituba': 'SUL II', 'laguna': 'SUL II', 'tubarao': 'SUL II', 'imarui': 'SUL II', 'jaguaruna': 'SUL II', 'capivari de baixo': 'SUL II', 'gravatal': 'SUL II', 'braco do norte': 'SUL II',
  'criciuma': 'SUL I', 'ararangua': 'SUL I', 'icara': 'SUL I', 'forquilhinha': 'SUL I', 'urussanga': 'SUL I', 'sideropolis': 'SUL I', 'nova veneza': 'SUL I', 'lauro muller': 'SUL I', 'sombrio': 'SUL I', 'jacinto machado': 'SUL I',
  'joinville': 'NORTE', 'jaragua do sul': 'NORTE', 'sao francisco do sul': 'NORTE', 'itapoa': 'NORTE', 'araquari': 'NORTE', 'guaramirim': 'NORTE', 'barra velha': 'NORTE', 'corupa': 'NORTE', 'schroeder': 'NORTE',
  'blumenau': 'VALE DO ITAJAÍ', 'gaspar': 'VALE DO ITAJAÍ', 'indaial': 'VALE DO ITAJAÍ', 'timbo': 'VALE DO ITAJAÍ', 'pomerode': 'VALE DO ITAJAÍ', 'brusque': 'VALE DO ITAJAÍ',
  'itajai': 'LITORAL DO VALE DO ITAJAÍ', 'balneario camboriu': 'LITORAL DO VALE DO ITAJAÍ', 'camboriu': 'LITORAL DO VALE DO ITAJAÍ', 'navegantes': 'LITORAL DO VALE DO ITAJAÍ', 'bombinhas': 'LITORAL DO VALE DO ITAJAÍ', 'porto belo': 'LITORAL DO VALE DO ITAJAÍ', 'itapema': 'LITORAL DO VALE DO ITAJAÍ', 'penha': 'LITORAL DO VALE DO ITAJAÍ',
  'rio do sul': 'ALTO VALE DO ITAJAÍ', 'ibirama': 'ALTO VALE DO ITAJAÍ', 'presidente getulio': 'ALTO VALE DO ITAJAÍ', 'ituporanga': 'ALTO VALE DO ITAJAÍ', 'agrolandia': 'ALTO VALE DO ITAJAÍ', 'taio': 'ALTO VALE DO ITAJAÍ',
  'lages': 'SERRANA', 'urubici': 'SERRANA', 'sao joaquim': 'SERRANA', 'bom jardim da serra': 'SERRANA', 'urupema': 'SERRANA', 'curitibanos': 'SERRANA', 'ponte alta': 'SERRANA', 'correia pinto': 'SERRANA', 'otacilio costa': 'SERRANA', 'campo belo do sul': 'SERRANA',
  'canoinhas': 'PLANALTO NORTE', 'mafra': 'PLANALTO NORTE', 'sao bento do sul': 'PLANALTO NORTE', 'rio negrinho': 'PLANALTO NORTE', 'porto uniao': 'PLANALTO NORTE', 'itaiopolis': 'PLANALTO NORTE', 'papanduva': 'PLANALTO NORTE',
  'chapeco': 'OESTE I', 'xanxere': 'OESTE I', 'quilombo': 'OESTE I', 'xaxim': 'OESTE I', 'pinhalzinho': 'OESTE I', 'coronel freitas': 'OESTE I',
  'concordia': 'OESTE II', 'seara': 'OESTE II', 'ipumirim': 'OESTE II',
  'joacaba': 'MEIO-OESTE I', 'herval d\'oeste': 'MEIO-OESTE I', 'campos novos': 'MEIO-OESTE I',
  'cacador': 'MEIO-OESTE II', 'videira': 'MEIO-OESTE II', 'fraiburgo': 'MEIO-OESTE II',
  'sao miguel do oeste': 'EXTREMO-OESTE', 'maravilha': 'EXTREMO-OESTE', 'dionisio cerqueira': 'EXTREMO-OESTE', 'itapiranga': 'EXTREMO-OESTE'
};

const MOCK_DATA = [
  { id: 2, 'Título': 'Sessão Plenária ALESC', 'Início': '2026-11-12', 'Fim': '2026-11-12', 'Descrição': 'Votação ambiental. Assessoria: Carla', 'Duração': 120, 'Local': 'ALESC - Centro, Florianópolis', 'CLASSE DE ATIVIDADE': 'PLENÁRIA', 'MUNICÍPIO': 'Florianópolis', 'ARTICULADOR': 'Carla', 'STATUS': 'Confirmado', 'PRIORIDADE': 'Alta' },
  { id: 3, 'Título': 'Plenária Agroflorestas', 'Início': '2026-11-15', 'Fim': '2026-11-15', 'Descrição': 'Encontro regional no sul. Assessoria: Laura', 'Duração': 180, 'Local': 'Imbituba, SC', 'CLASSE DE ATIVIDADE': 'PLENÁRIA', 'MUNICÍPIO': 'Imbituba', 'ARTICULADOR': 'Laura', 'STATUS': 'Pendente', 'PRIORIDADE': 'Alta' },
  { id: 4, 'Título': 'Reunião Conselho do Parque das Dunas', 'Início': '2026-10-20', 'Fim': '2026-10-20', 'Descrição': 'Assessoria: Caio', 'Duração': 90, 'Local': 'Lagoa da Conceição, Florianópolis', 'CLASSE DE ATIVIDADE': 'REUNIÃO', 'MUNICÍPIO': 'Florianópolis', 'ARTICULADOR': 'Caio', 'STATUS': 'Realizado', 'PRIORIDADE': 'Média' },
  { id: 5, 'Título': 'Audiência Pública Transição Energética', 'Início': '2026-11-22', 'Fim': '2026-11-22', 'Descrição': 'Assessoria: Vina', 'Duração': 240, 'Local': 'Criciúma, SC', 'CLASSE DE ATIVIDADE': 'AUDIÊNCIA PÚBLICA', 'MUNICÍPIO': 'Criciúma', 'ARTICULADOR': 'Vina', 'STATUS': 'Confirmado', 'PRIORIDADE': 'Alta' }
];

// ==========================================
// FUNÇÕES UTILITÁRIAS E PARSER DE DATAS (FUSO -03:00 SEGURO)
// ==========================================
const normalizerFilter = (str) => {
  if (!str) return '';
  return str.toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const toProperCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  const lowerExceptions = ['da', 'de', 'do', 'das', 'dos', 'e', 'em'];
  return str.trim().toLowerCase().split(/\s+/).map((w, idx) => {
    if (idx > 0 && lowerExceptions.includes(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
};

// Corrige o bug de UTC em strings 'YYYY-MM-DD' ou 'DD/MM/YYYY'
const parseLocalDate = (dateVal) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
  const s = dateVal.toString().trim();
  // Formato YYYY-MM-DD puro
  const isoDayMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDayMatch) {
    return new Date(Number(isoDayMatch[1]), Number(isoDayMatch[2]) - 1, Number(isoDayMatch[3]), 12, 0, 0);
  }
  // Formato DD/MM/YYYY puro
  const brDayMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brDayMatch) {
    return new Date(Number(brDayMatch[3]), Number(brDayMatch[2]) - 1, Number(brDayMatch[1]), 12, 0, 0);
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const formatDate = (dateVal) => {
  const d = parseLocalDate(dateVal);
  if (!d) return 'Data Inválida';
  const s = dateVal.toString().trim();
  const hasTime = s.includes(':') && !s.endsWith('00:00:00.000Z');
  if (hasTime) {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
  }
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
};

const getTodayStart = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
};

const isFutureOrToday = (dateVal) => {
  const d = parseLocalDate(dateVal);
  return d ? d >= getTodayStart() : false;
};

const isPastEvent = (dateVal) => {
  const d = parseLocalDate(dateVal);
  return d ? d < getTodayStart() : false;
};

const stripHtml = (str) => {
  if (!str) return '';
  return str.toString().replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
};

const enrichFloripaLocation = (evento, isOnline) => {
  if (isOnline) {
    return { bairro: 'Digital / Online', distrito: 'Virtual', regiao: 'Online', coords: null };
  }
  const textToSearch = normalizerFilter([evento['Local'] || '', evento['Título'] || '', evento['Descrição'] || ''].join(' '));
  
  // 1. Procura nos 56 bairros REPLAN oficiais (do nome mais específico/longo para o mais curto)
  const sortedReplan = [...FLORIPA_REPLAN].sort((a, b) => b.b.length - a.b.length);
  for (let item of sortedReplan) {
    const key = normalizerFilter(item.b);
    if (textToSearch.includes(key)) {
      return { bairro: item.b, distrito: item.d, regiao: item.r, coords: item.coords };
    }
  }
  // 2. Procura por pontos institucionais (ALESC, UFSC, UDESC, Gabinete 26, etc.)
  for (let alias of FLORIPA_ALIASES) {
    if (alias.match.test(textToSearch)) {
      const found = FLORIPA_REPLAN.find(r => r.b === alias.b);
      if (found) return { bairro: found.b, distrito: found.d, regiao: found.r, coords: found.coords };
    }
  }
  return { bairro: 'Não Especificado', distrito: 'Sede Insular', regiao: 'Central', coords: [-27.595, -48.548] };
};

const normalizeData = (rawEvents, apoioList = []) => {
  // Constrói dicionário dinâmico de Regiões SC se a aba Apoio vier da API
  const dynamicRegionMap = { ...SC_REGION_MAP };
  apoioList.forEach(row => {
    if (row['Município'] && row['Região em SC']) {
      dynamicRegionMap[normalizerFilter(row['Município'])] = row['Região em SC'].toString().trim().toUpperCase();
    }
  });

  return rawEvents.map(item => {
    const newItem = { id: item.id };
    const keys = Object.keys(item);
    keys.forEach(k => { newItem[k] = item[k]; });

    keys.forEach(k => {
      if (k === 'id') return;
      const normK = normalizerFilter(k);
      if (normK.includes('titulo')) newItem['Título'] = (item[k] || '').toString().trim();
      if (normK.includes('inicio')) newItem['Início'] = item[k];
      if (normK.includes('fim')) newItem['Fim'] = item[k];
      if (normK.includes('descri')) newItem['Descrição'] = stripHtml(item[k]);
      if (normK.includes('duracao')) newItem['Duração'] = Number(item[k]) || 0;
      if (normK.includes('local')) newItem['Local'] = (item[k] || '').toString().trim();
      if (normK === 'classe de atividade' || normK === 'classe') {
        newItem['Classe de Atividade'] = item[k] ? item[k].toString().trim().toUpperCase() : 'SEM CLASSE';
      }
      if (normK === 'municipio') newItem['Município_Original'] = (item[k] || '').toString().trim();
      if (normK === 'articulador') newItem['Articulador'] = toProperCase((item[k] || '').toString());
      if (normK.includes('articulador') && normK.includes('input')) {
        newItem['Articulador Input'] = toProperCase((item[k] || '').toString());
      }
      if (normK === 'status') newItem['STATUS'] = (item[k] || 'Pendente').toString().trim();
      if (normK === 'prioridade' || normK === 'importancia') newItem['Prioridade'] = (item[k] || '').toString().trim();
    });

    // Limpa eventuais erros de fórmula (#REF!, #N/A)
    Object.keys(newItem).forEach(k => {
      if (typeof newItem[k] === 'string' && (newItem[k].includes('#REF!') || newItem[k].includes('#N/A'))) {
        newItem[k] = '';
      }
    });

    // Se houver sobrescrita manual na Coluna K (Articulador Input), ela tem precedência
    if (newItem['Articulador Input'] && newItem['Articulador Input'].trim() !== '') {
      newItem['Articulador'] = newItem['Articulador Input'];
    }

    // Identifica se o evento é Online / Remoto
    const rawMun = newItem['Município_Original'] || '';
    const fullText = normalizerFilter(`${rawMun} ${newItem['Local']} ${newItem['Título']}`);
    const isOnline = rawMun.toLowerCase().includes('online') || /(meet\.google|zoom\.us|online|on-line|virtual|remoto|live )/.test(fullText);
    newItem['Modalidade'] = isOnline ? 'ONLINE' : 'PRESENCIAL';

    // Limpa sufixo "(Online)" do nome do município para cruzamento territorial limpo
    const cleanMunRaw = rawMun.replace(/\(online\)/ig, '').trim();
    newItem['Município'] = cleanMunRaw ? toProperCase(cleanMunRaw) : 'Não Identificado';

    const normMun = normalizerFilter(newItem['Município']);
    const isFloripa = normMun === 'florianopolis' || normMun === 'floripa';

    newItem['Região SC'] = dynamicRegionMap[normMun] || (newItem['Município'] === 'Não Identificado' ? 'NÃO IDENTIFICADA' : 'OUTRA REGIÃO SC');

    if (isFloripa) {
      const floripaGeo = enrichFloripaLocation(newItem, isOnline);
      newItem['Bairro'] = floripaGeo.bairro;
      newItem['Distrito'] = floripaGeo.distrito;
      newItem['Região Floripa'] = floripaGeo.regiao;
      newItem['_coords'] = floripaGeo.coords;
    } else {
      newItem['Bairro'] = '-';
      newItem['Distrito'] = '-';
      newItem['Região Floripa'] = '-';
      newItem['_coords'] = null;
    }

    // Normaliza Prioridade
    const pNorm = normalizerFilter(newItem['Prioridade']);
    if (pNorm.includes('alta') || pNorm.includes('urgente') || pNorm === '1') newItem['Prioridade'] = 'Alta';
    else if (pNorm.includes('media') || pNorm === '2') newItem['Prioridade'] = 'Média';
    else if (pNorm.includes('baixa') || pNorm === '3') newItem['Prioridade'] = 'Baixa';
    else newItem['Prioridade'] = 'Sem Prioridade';

    // Chave para deduplicação visual opcional
    const dObj = parseLocalDate(newItem['Início']);
    const dayStr = dObj ? `${dObj.getFullYear()}-${String(dObj.getMonth()+1).padStart(2,'0')}-${String(dObj.getDate()).padStart(2,'0')}` : 'sem-data';
    newItem['_dedupKey'] = `${dayStr}_${normalizerFilter(newItem['Título'])}`;

    return newItem;
  });
};

// ==========================================
// MULTI-SELECT UNIVERSAL COM BUSCA E CONTADOR
// ==========================================
const MultiSelect = ({ label, options, countsMap = {}, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!internalSearch) return options;
    const term = normalizerFilter(internalSearch);
    return options.filter(opt => normalizerFilter(opt).includes(term));
  }, [options, internalSearch]);

  const toggleOption = (opt) => {
    if (selected.includes(opt)) onChange(selected.filter(o => o !== opt));
    else onChange([...selected, opt]);
  };

  return (
    <div className="relative flex-1 min-w-[170px]" ref={dropdownRef}>
      {label && <span className="block text-[8px] font-black uppercase tracking-wider text-[#111111] mb-1">{label}</span>}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-[#111111] border-[3px] border-[#111111] font-black text-[9px] uppercase px-2.5 py-2 text-left shadow-[3px_3px_0px_0px_#111111] flex justify-between items-center transition-transform hover:-translate-y-0.5 ${selected.length > 0 ? 'bg-[#EAA221]' : 'bg-[#Fdfcf0]'}`}
      >
        <span className="truncate pr-1">
          {selected.length === 0 ? placeholder : selected.length === 1 ? selected[0] : `${selected.length} SELECIONADOS`}
        </span>
        <span className="text-[11px] leading-none">{isOpen ? '▲' : '▼'}</span>
      </button>
      
      {isOpen && (
        <div className="absolute z-50 top-full mt-1 left-0 w-full min-w-[230px] bg-[#ffffff] border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] max-h-72 flex flex-col">
          <div className="p-2 border-b-[3px] border-[#111111] bg-[#Fdfcf0]">
            <input
              type="text"
              placeholder="FILTRAR OPÇÕES..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full px-2 py-1 text-[9px] font-black uppercase bg-[#ffffff] border-[2px] border-[#111111] focus:outline-none"
            />
          </div>
          <div className="flex border-b-[3px] border-[#111111] text-[8px] font-black uppercase">
            <button
              type="button"
              onClick={() => onChange([...filteredOptions])}
              className="flex-1 py-1.5 px-2 hover:bg-[#007D8A] hover:text-[#Fdfcf0] border-r-[2px] border-[#111111] transition-colors"
            >
              Marcar ({filteredOptions.length})
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              className="flex-1 py-1.5 px-2 hover:bg-[#C1272D] hover:text-[#Fdfcf0] transition-colors"
            >
              Limpar
            </button>
          </div>
          <div className="overflow-y-auto custom-scrollbar flex-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-[9px] font-black uppercase text-center opacity-50">Nenhuma opção</div>
            ) : (
              filteredOptions.map((opt, i) => {
                const isSel = selected.includes(opt);
                const count = countsMap[opt] || 0;
                return (
                  <div 
                    key={i} 
                    onClick={() => toggleOption(opt)}
                    className={`flex items-center justify-between px-3 py-2 border-b-[2px] border-[#111111] cursor-pointer transition-colors ${isSel ? 'bg-[#Fdfcf0]' : 'hover:bg-[#Fdfcf0]'}`}
                  >
                    <div className="flex items-center min-w-0 pr-2">
                      <div className={`w-3 h-3 border-[2px] border-[#111111] mr-2 flex-shrink-0 flex items-center justify-center text-[8px] font-black ${isSel ? 'bg-[#C1272D] text-[#ffffff]' : 'bg-[#Fdfcf0]'}`}>
                        {isSel ? '✓' : ''}
                      </div>
                      <span className="font-black text-[9px] uppercase text-[#111111] truncate">{opt}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 bg-[#111111] text-[#Fdfcf0] flex-shrink-0">
                        {count}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// COMPONENTES GRÁFICOS INTERATIVOS (CLIQUE PARA FICHAS)
// ==========================================
const InteractiveBarChart = ({ data, title, subtitle, onItemClick, metricSuffix = '' }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col h-full min-h-[320px]">
      <div className="border-b-[3px] border-[#111111] pb-2 mb-4 flex justify-between items-end">
        <div>
          <h3 className="text-[12px] font-black text-[#111111] uppercase tracking-widest">{title}</h3>
          {subtitle && <p className="text-[8px] font-bold uppercase text-[#007D8A] mt-0.5">{subtitle}</p>}
        </div>
        <span className="text-[9px] font-black uppercase bg-[#111111] text-[#Fdfcf0] px-2 py-0.5">{data.length} itens</span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
        {data.length === 0 && <div className="text-[10px] font-black text-[#111111] opacity-50 uppercase text-center py-8">Sem dados válidos</div>}
        {data.map((item, i) => (
          <div 
            key={i} 
            onClick={() => onItemClick && onItemClick(item.name)}
            className={`flex items-center gap-2 group ${onItemClick ? 'cursor-pointer hover:translate-x-1 transition-transform' : ''}`}
          >
            <span className="text-[9px] font-black text-[#111111] w-32 uppercase truncate group-hover:text-[#C1272D] group-hover:underline" title={item.name}>
              {item.name}
            </span>
            <div className="flex-1 h-5 bg-[#Fdfcf0] border-[2px] border-[#111111] overflow-hidden relative">
              <div 
                className="h-full border-r-[2px] border-[#111111] transition-all duration-500" 
                style={{ width: `${Math.max((item.value / maxVal) * 100, 3)}%`, backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }}
              />
            </div>
            <span className="text-[10px] font-black text-[#111111] w-14 text-right">
              {item.value}{metricSuffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const InteractiveDonutChart = ({ data, title, onSliceClick }) => {
  const topData = useMemo(() => {
    if (data.length <= 6) return data;
    const top5 = data.slice(0, 5);
    const othersVal = data.slice(5).reduce((acc, c) => acc + c.value, 0);
    return [...top5, { name: 'OUTROS (' + (data.length - 5) + ')', value: othersVal, isOther: true }];
  }, [data]);

  const total = topData.reduce((acc, curr) => acc + curr.value, 0);
  let cumulativePercent = 0;
  const getCoordinatesForPercent = (percent) => [Math.cos(2 * Math.PI * percent), Math.sin(2 * Math.PI * percent)];

  return (
    <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col items-center h-full min-h-[320px]">
      <h3 className="text-[12px] font-black text-[#111111] mb-4 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2 w-full">{title}</h3>
      {(topData.length === 0 || total === 0) ? (
        <div className="flex-1 flex items-center justify-center text-[10px] font-black text-[#111111] opacity-50 uppercase py-10">Sem dados válidos</div>
      ) : (
        <>
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full drop-shadow-[4px_4px_0px_#111111]">
              <circle cx="0" cy="0" r="1.05" fill="#111111" />
              {topData.map((slice, i) => {
                if (slice.value === 0) return null;
                const percent = slice.value / total;
                if (percent >= 0.999) return <circle key={i} cx="0" cy="0" r="1" fill={CHART_PALETTE[i % CHART_PALETTE.length]} stroke="#111111" strokeWidth="0.04" />;
                const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
                cumulativePercent += percent;
                const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                const largeArcFlag = percent > 0.5 ? 1 : 0;
                const pathData = [`M ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, `L 0 0`].join(' ');
                return (
                  <path 
                    key={i} 
                    d={pathData} 
                    fill={CHART_PALETTE[i % CHART_PALETTE.length]} 
                    stroke="#111111" 
                    strokeWidth="0.04"
                    className={onSliceClick && !slice.isOther ? "cursor-pointer hover:opacity-80" : ""}
                    onClick={() => onSliceClick && !slice.isOther && onSliceClick(slice.name)}
                  />
                );
              })}
              <circle cx="0" cy="0" r="0.45" fill="#Fdfcf0" stroke="#111111" strokeWidth="0.05" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[13px] font-black text-[#111111] leading-none">{total}</span>
              <span className="text-[7px] font-black uppercase text-[#111111]">Total</span>
            </div>
          </div>
          <div className="mt-5 w-full flex flex-wrap gap-1.5 justify-center overflow-y-auto max-h-[120px] custom-scrollbar">
            {topData.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSliceClick && !item.isOther && onSliceClick(item.name)}
                className="flex items-center gap-1.5 text-[8px] font-black text-[#111111] bg-[#Fdfcf0] border-[2px] border-[#111111] px-2 py-1 shadow-[2px_2px_0px_0px_#111111] uppercase hover:bg-[#EAA221] transition-colors"
              >
                <span className="w-2.5 h-2.5 border-[2px] border-[#111111] block" style={{ backgroundColor: CHART_PALETTE[i % CHART_PALETTE.length] }} />
                {item.name}: {item.value} ({(item.value / total * 100).toFixed(0)}%)
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SimpleLineChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col items-center justify-center min-h-[280px]">
        <h3 className="text-[12px] font-black text-[#111111] mb-4 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2 w-full">{title}</h3>
        <span className="text-[10px] font-black text-[#111111] opacity-50 uppercase">Sem dados válidos no período</span>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value), 4);
  const width = 1000;
  const height = 280;
  const padding = 55;

  const points = data.map((d, i) => {
    const x = padding + (i * (width - 2 * padding) / Math.max(data.length - 1, 1));
    const y = height - padding - ((d.value / maxVal) * (height - 2 * padding));
    return { x, y, value: d.value, hours: d.hours, name: d.name };
  });

  return (
    <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col w-full overflow-x-auto">
      <h3 className="text-[12px] font-black text-[#111111] mb-3 uppercase tracking-widest border-b-[3px] border-[#111111] pb-2 min-w-[600px]">{title}</h3>
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
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="13" fontWeight="900" stroke="#Fdfcf0" strokeWidth="4" strokeLinejoin="round" fill="none">{p.value}</text>
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="13" fontWeight="900" fill="#111111">{p.value}</text>
              <text x={p.x} y={height - 20} textAnchor="middle" fontSize="11" fontWeight="900" fill="#111111">{p.name}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

// ==========================================
// MAPA APRIMORADO: COROPLÉTICO SC + CLUSTERS MONDRIAN (SEM JITTER ALEATÓRIO)
// ==========================================
const EnhancedTerritorialMap = ({ events, title, isFloripa, onMunicipioClick, onEventClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const [mapMode, setMapMode] = useState('clusters'); // 'clusters' | 'pins'

  useEffect(() => {
    let isMounted = true;
    let loadingTimer;

    const initAndRenderMap = async () => {
      if (!mapRef.current || !window.L || !isMounted) return;

      if (!window.SC_GEOJSON_DATA) {
        try {
          const res = await fetch('https://raw.githubusercontent.com/tbrugz/geodata-br/master/geojson/geojs-42-mun.json');
          const geoData = await res.json();
          if (!isMounted) return;
          window.SC_GEOJSON_DATA = geoData;
          window.SC_GEO_CENTROIDS = {};
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
            window.SC_GEO_CENTROIDS[name] = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
          });
        } catch (e) {
          console.warn("Falha ao buscar GeoJSON de SC:", e);
        }
      }

      if (!mapInstanceRef.current) {
        const mapCenter = isFloripa ? [-27.595, -48.52] : [-27.273, -50.49];
        const mapZoom = isFloripa ? 11 : 7;
        mapInstanceRef.current = window.L.map(mapRef.current, { scrollWheelZoom: false }).setView(mapCenter, mapZoom);
        window.L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
          attribution: '© Google Maps'
        }).addTo(mapInstanceRef.current);
      }

      const map = mapInstanceRef.current;
      if (layerGroupRef.current) map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = window.L.layerGroup().addTo(map);

      // Agrupamento por Município (SC) ou Bairro REPLAN (Floripa)
      const groups = {};
      const countsByNormMun = {};

      events.forEach(ev => {
        if (ev['Modalidade'] === 'ONLINE') return; // Não plota agendas remotas no mapa físico
        const groupKey = isFloripa ? (ev['Bairro'] || 'Centro') : (ev['Município'] || 'Não Identificado');
        if (groupKey === 'Não Identificado' || groupKey === '-') return;

        const normMun = normalizerFilter(ev['Município']);
        countsByNormMun[normMun] = (countsByNormMun[normMun] || 0) + 1;

        if (!groups[groupKey]) {
          let coords = null;
          if (isFloripa) {
            const replan = FLORIPA_REPLAN.find(r => r.b === groupKey);
            coords = replan ? replan.coords : [-27.595, -48.548];
          } else if (window.SC_GEO_CENTROIDS && window.SC_GEO_CENTROIDS[normMun]) {
            coords = window.SC_GEO_CENTROIDS[normMun];
          }
          groups[groupKey] = { name: groupKey, municipio: ev['Município'], coords, list: [], altaCount: 0, hours: 0 };
        }
        groups[groupKey].list.push(ev);
        groups[groupKey].hours += (Number(ev['Duração']) || 0) / 60;
        if (ev['Prioridade'] === 'Alta') groups[groupKey].altaCount++;
      });

      // Camada Coroplética dos 295 municípios de SC
      if (!isFloripa && window.SC_GEOJSON_DATA) {
        const geoLayer = window.L.geoJSON(window.SC_GEOJSON_DATA, {
          style: (feature) => {
            const normName = normalizerFilter(feature.properties.name);
            const count = countsByNormMun[normName] || 0;
            let fillColor = '#Fdfcf0';
            let fillOpacity = 0.25;
            if (count >= 15) { fillColor = COLORS.crimson; fillOpacity = 0.65; }
            else if (count >= 5) { fillColor = COLORS.mustard; fillOpacity = 0.6; }
            else if (count >= 1) { fillColor = COLORS.teal; fillOpacity = 0.55; }
            return {
              color: '#111111',
              weight: count > 0 ? 2 : 0.8,
              fillColor,
              fillOpacity
            };
          },
          onEachFeature: (feature, layer) => {
            const munName = feature.properties.name;
            const normName = normalizerFilter(munName);
            const count = countsByNormMun[normName] || 0;
            layer.bindTooltip(`
              <div style="font-weight:900; text-transform:uppercase; font-size:10px;">
                <div>${munName}</div>
                <div style="color:${count > 0 ? '#C1272D' : '#666'}">${count} VISITA(S) / AGENDA(S)</div>
                <div style="font-size:8px; color:#007D8A;">Clique para abrir a Ficha Territorial</div>
              </div>
            `, { className: 'custom-leaflet-tooltip' });
            layer.on('click', () => {
              if (onMunicipioClick) onMunicipioClick(toProperCase(munName));
            });
          }
        });
        layerGroupRef.current.addLayer(geoLayer);
      }

      // Renderiza Clusters Consolidados ou Pinos Determinísticos
      Object.values(groups).forEach(group => {
        if (!group.coords) return;
        const count = group.list.length;

        if (mapMode === 'clusters') {
          const size = Math.min(24 + Math.sqrt(count) * 6, 52);
          const bgColor = group.altaCount > 0 ? COLORS.crimson : count >= 5 ? COLORS.mustard : COLORS.teal;
          const textColor = bgColor === COLORS.mustard ? '#111111' : '#Fdfcf0';

          const html = `
            <div style="
              width:${size}px; height:${size}px;
              background:${bgColor}; color:${textColor};
              border:3px solid #111111;
              box-shadow:3px 3px 0px #111111;
              display:flex; align-items:center; justify-content:center;
              font-weight:900; font-size:${size > 34 ? 12 : 10}px;
            ">
              ${count}
            </div>
          `;
          const icon = window.L.divIcon({
            className: 'mondrian-cluster-icon',
            html,
            iconSize: [size, size],
            iconAnchor: [size / 2, size / 2]
          });

          const marker = window.L.marker(group.coords, { icon });
          marker.bindTooltip(`
            <div style="font-weight:900; text-transform:uppercase; font-size:10px; min-width:160px;">
              <div style="background:#111111; color:#Fdfcf0; padding:2px 6px; margin-bottom:4px;">${group.name}</div>
              <div>📌 <b>${count}</b> agenda(s) presenciais</div>
              <div>⏱️ <b>${group.hours.toFixed(1)}h</b> dedicadas</div>
              ${group.altaCount > 0 ? `<div style="color:#C1272D;">🔥 ${group.altaCount} de Alta Prioridade</div>` : ''}
              <div style="margin-top:4px; font-size:8px; color:#007D8A;">Clique para abrir a Ficha Cruzada</div>
            </div>
          `, { direction: 'top', className: 'custom-leaflet-tooltip' });

          marker.on('click', () => {
            if (onMunicipioClick) onMunicipioClick(group.municipio);
          });
          layerGroupRef.current.addLayer(marker);
        } else {
          // Modo Pinos Individuais com espiral determinística (nunca usa Math.random)
          const stepRadius = isFloripa ? 0.0022 : 0.012;
          group.list.forEach((ev, idx) => {
            const angle = idx * 1.15;
            const r = idx === 0 ? 0 : stepRadius * Math.sqrt(idx);
            const coords = [group.coords[0] + r * Math.cos(angle), group.coords[1] + r * Math.sin(angle)];
            const prioColor = ev['Prioridade'] === 'Alta' ? COLORS.crimson : ev['Prioridade'] === 'Média' ? COLORS.mustard : COLORS.teal;

            const icon = window.L.divIcon({
              className: 'custom-mondrian-marker',
              html: `<div style="width:13px; height:13px; background:${prioColor}; border:2.5px solid #111111; box-shadow:2px 2px 0px #111111; transform:rotate(45deg);"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });

            const m = window.L.marker(coords, { icon });
            m.bindTooltip(`
              <div style="font-weight:900; text-transform:uppercase; font-size:10px;">
                <div style="background:#111111; color:#Fdfcf0; padding:2px 4px; display:inline-block; margin-bottom:4px; font-size:8px;">${ev['Classe de Atividade']}</div>
                <div>${ev['Título']}</div>
                <div style="color:#C1272D; font-size:9px;">📍 ${ev['Município']} ${isFloripa ? `(${ev['Bairro']})` : ''}</div>
                <div style="color:#007D8A; font-size:9px;">🕒 ${formatDate(ev['Início'])}</div>
              </div>
            `, { direction: 'top', className: 'custom-leaflet-tooltip' });

            m.on('click', () => {
              if (onEventClick) onEventClick(ev);
            });
            layerGroupRef.current.addLayer(m);
          });
        }
      });
    };

    if (!window.L) {
      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link');
        css.id = 'leaflet-css'; css.rel = 'stylesheet';
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
        if (window.L) { if (isMounted) initAndRenderMap(); }
        else { loadingTimer = setTimeout(checkAndInit, 100); }
      };
      checkAndInit();
    } else {
      initAndRenderMap();
    }

    return () => {
      isMounted = false;
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [events, isFloripa, mapMode]);

  return (
    <div className="bg-[#ffffff] p-5 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-[3px] border-[#111111] pb-3 mb-3 gap-3">
        <div>
          <h3 className="text-[12px] font-black text-[#111111] uppercase tracking-widest">{title}</h3>
          <p className="text-[9px] font-bold uppercase text-[#007D8A]">
            Clique em um município ou marcador para abrir a Ficha Territorial Cruzada
          </p>
        </div>
        <div className="flex gap-2 bg-[#111111] p-1 border-[2px] border-[#111111]">
          <button
            type="button"
            onClick={() => setMapMode('clusters')}
            className={`px-3 py-1 text-[9px] font-black uppercase ${mapMode === 'clusters' ? 'bg-[#EAA221] text-[#111111]' : 'text-[#Fdfcf0]'}`}
          >
            Clusters (Total por Local)
          </button>
          <button
            type="button"
            onClick={() => setMapMode('pins')}
            className={`px-3 py-1 text-[9px] font-black uppercase ${mapMode === 'pins' ? 'bg-[#EAA221] text-[#111111]' : 'text-[#Fdfcf0]'}`}
          >
            Pinos Individuais
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-3 text-[8px] font-black uppercase">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#C1272D] border-[2px] border-[#111111] block" /> Alta Prioridade / 15+ Visitas</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#EAA221] border-[2px] border-[#111111] block" /> Média / 5–14 Visitas</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#007D8A] border-[2px] border-[#111111] block" /> Normal / 1–4 Visitas</div>
      </div>

      <div className="w-full h-[500px] border-[3px] border-[#111111] relative z-0 bg-[#Fdfcf0]">
        <div ref={mapRef} style={{ height: '100%', width: '100%', zIndex: 0 }} />
      </div>
    </div>
  );
};

// ==========================================
// COMPONENTE PRINCIPAL: TABULUM - GesTAgen v2.0
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'dashboard' | 'fichas'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros Universais Superiores (Multi-seleção + Busca Universal)
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFuture, setShowFuture] = useState(true);
  const [showPast, setShowPast] = useState(true);
  const [showPessoal, setShowPessoal] = useState(false);
  const [dedupVisual, setDedupVisual] = useState(true); // Remove visualmente as duplicatas da planilha

  const [scopeCapital, setScopeCapital] = useState(true);
  const [scopeInterior, setScopeInterior] = useState(true);
  const [selectedModalidades, setSelectedModalidades] = useState([]);

  const [selectedRegioesSC, setSelectedRegioesSC] = useState([]);
  const [selectedMunicipios, setSelectedMunicipios] = useState([]);
  const [selectedBairrosFloripa, setSelectedBairrosFloripa] = useState([]);
  const [selectedArticuladores, setSelectedArticuladores] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedPrioridades, setSelectedPrioridades] = useState([]);

  const [viewMode, setViewMode] = useState('cards');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fichaModal, setFichaModal] = useState(null); // { type: 'municipio' | 'articulador', name: string }
  const [sortConfig, setSortConfig] = useState({ key: 'Início', direction: 'asc' });

  // Carregamento inicial + suporte a URL params para Interoperabilidade TABULUM (?municipio=Imbituba)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const munParam = params.get('municipio');
    if (munParam) {
      setFichaModal({ type: 'municipio', name: toProperCase(munParam) });
    }

    const fetchData = async () => {
      try {
        if (!API_URL) throw new Error("Sem API URL, usando mock");
        const sep = API_URL.includes('?') ? '&' : '?';
        const response = await fetch(`${API_URL}${sep}includeApoio=1`, { redirect: "follow" });
        const json = await response.json();
        if (Array.isArray(json)) {
          setEvents(normalizeData(json));
        } else if (json && Array.isArray(json.events)) {
          setEvents(normalizeData(json.events, json.apoio || []));
        } else {
          throw new Error("Formato JSON inválido");
        }
      } catch (error) {
        console.warn("Usando base local de demonstração:", error);
        setEvents(normalizeData(MOCK_DATA));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Atualizações no Google Sheets (Coluna J = Status, Coluna K = Articulador Input, Coluna L = Prioridade)
  const handleUpdateField = async (id, fieldKey, value, postPayload) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, [fieldKey]: value } : ev));
    if (selectedEvent && selectedEvent.id === id) {
      setSelectedEvent(prev => ({ ...prev, [fieldKey]: value }));
    }
    if (API_URL) {
      fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ id, ...postPayload }),
        redirect: "follow"
      }).catch(() => {});
    }
  };

  // Opções e contadores dinâmicos para todos os MultiSelects
  const filterMeta = useMemo(() => {
    const buildMeta = (key) => {
      const counts = {};
      events.forEach(e => {
        const val = e[key];
        if (val && val !== '-' && val.toString().trim() !== '') {
          counts[val] = (counts[val] || 0) + 1;
        }
      });
      const options = Object.keys(counts).sort((a, b) => a.localeCompare(b, 'pt-BR'));
      return { options, counts };
    };
    return {
      regioesSC: buildMeta('Região SC'),
      municipios: buildMeta('Município'),
      bairros: buildMeta('Bairro'),
      articuladores: buildMeta('Articulador'),
      classes: buildMeta('Classe de Atividade'),
      status: buildMeta('STATUS'),
      prioridades: buildMeta('Prioridade'),
      modalidades: buildMeta('Modalidade')
    };
  }, [events]);

  // Filtro Global Unificado
  const filteredEvents = useMemo(() => {
    const seenDedup = new Set();

    let result = events.filter(ev => {
      if (dedupVisual) {
        if (seenDedup.has(ev._dedupKey)) return false;
      }

      const isF = isFutureOrToday(ev['Início']);
      const isP = isPastEvent(ev['Início']);
      if (!showFuture && isF) return false;
      if (!showPast && isP) return false;
      if (!showFuture && !showPast) return false;

      if (dateFrom) {
        const dEv = parseLocalDate(ev['Início']);
        const dFrom = parseLocalDate(dateFrom);
        if (dEv && dFrom && dEv < dFrom) return false;
      }
      if (dateTo) {
        const dEv = parseLocalDate(ev['Início']);
        const dTo = parseLocalDate(dateTo);
        if (dEv && dTo && dEv > dTo) return false;
      }

      const isPessoal = normalizerFilter(ev['Classe de Atividade']).includes('pessoal') || normalizerFilter(ev['Classe de Atividade']).includes('feriado');
      if (!showPessoal && isPessoal) return false;

      const normMun = normalizerFilter(ev['Município']);
      const isFloripa = normMun === 'florianopolis' || normMun === 'floripa';
      if (!scopeCapital && isFloripa) return false;
      if (!scopeInterior && !isFloripa) return false;

      if (selectedRegioesSC.length > 0 && !selectedRegioesSC.includes(ev['Região SC'])) return false;
      if (selectedMunicipios.length > 0 && !selectedMunicipios.includes(ev['Município'])) return false;
      if (selectedBairrosFloripa.length > 0 && !selectedBairrosFloripa.includes(ev['Bairro'])) return false;
      if (selectedArticuladores.length > 0 && !selectedArticuladores.includes(ev['Articulador'])) return false;
      if (selectedClasses.length > 0 && !selectedClasses.includes(ev['Classe de Atividade'])) return false;
      if (selectedStatus.length > 0 && !selectedStatus.includes(ev['STATUS'])) return false;
      if (selectedPrioridades.length > 0 && !selectedPrioridades.includes(ev['Prioridade'])) return false;
      if (selectedModalidades.length > 0 && !selectedModalidades.includes(ev['Modalidade'])) return false;

      if (search.trim() !== '') {
        const terms = normalizerFilter(search).split(/\s+/);
        const searchableBag = normalizerFilter([
          ev['Título'], ev['Descrição'], ev['Local'], ev['Município'],
          ev['Região SC'], ev['Bairro'], ev['Distrito'], ev['Articulador'],
          ev['Classe de Atividade'], ev['STATUS'], ev['Prioridade']
        ].join(' '));
        const matchesAllTerms = terms.every(t => searchableBag.includes(t));
        if (!matchesAllTerms) return false;
      }

      if (dedupVisual) seenDedup.add(ev._dedupKey);
      return true;
    });

    result.sort((a, b) => {
      if (sortConfig.key === 'Início') {
        const aTime = parseLocalDate(a['Início'])?.getTime() || 0;
        const bTime = parseLocalDate(b['Início'])?.getTime() || 0;
        return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
      }
      if (sortConfig.key === 'Duração') {
        return sortConfig.direction === 'asc' ? (a['Duração'] - b['Duração']) : (b['Duração'] - a['Duração']);
      }
      const aVal = (a[sortConfig.key] || '').toString().toLowerCase();
      const bVal = (b[sortConfig.key] || '').toString().toLowerCase();
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    events, search, dateFrom, dateTo, showFuture, showPast, showPessoal, dedupVisual,
    scopeCapital, scopeInterior, selectedRegioesSC, selectedMunicipios, selectedBairrosFloripa,
    selectedArticuladores, selectedClasses, selectedStatus, selectedPrioridades, selectedModalidades, sortConfig
  ]);

  // ==========================================
  // CÁLCULO DE FICHAS CRUZADAS (DOSSIÊ DE MUNICÍPIO OU ARTICULADOR)
  // ==========================================
  const activeFichaData = useMemo(() => {
    if (!fichaModal) return null;
    const isMun = fichaModal.type === 'municipio';
    const targetName = fichaModal.name;

    // Usa o universo deduplicado (sem agendas pessoais) para a ficha refletir o histórico completo daquele Município/Articulador
    const seen = new Set();
    const matchingEvents = events.filter(ev => {
      if (dedupVisual) {
        if (seen.has(ev._dedupKey)) return false;
      }
      const isPessoal = normalizerFilter(ev['Classe de Atividade']).includes('pessoal');
      if (!showPessoal && isPessoal) return false;
      const match = isMun ? ev['Município'] === targetName : ev['Articulador'] === targetName;
      if (match && dedupVisual) seen.add(ev._dedupKey);
      return match;
    }).sort((a, b) => (parseLocalDate(b['Início'])?.getTime() || 0) - (parseLocalDate(a['Início'])?.getTime() || 0));

    let presenciais = 0, online = 0, totalMinutos = 0, confirmados = 0, realizados = 0, pendentes = 0, altaPrio = 0;
    let lastVisitDate = null, nextVisitDate = null;
    const byClass = {}, byCrossEntity = {}, byBairro = {}, byMonth = {};

    matchingEvents.forEach(ev => {
      if (ev['Modalidade'] === 'ONLINE') online++; else presenciais++;
      totalMinutos += Number(ev['Duração']) || 0;

      if (ev['STATUS'] === 'Confirmado') confirmados++;
      else if (ev['STATUS'] === 'Realizado') realizados++;
      else pendentes++;

      if (ev['Prioridade'] === 'Alta') altaPrio++;

      const d = parseLocalDate(ev['Início']);
      if (d) {
        if (d < getTodayStart() && (!lastVisitDate || d > lastVisitDate)) lastVisitDate = d;
        if (d >= getTodayStart() && (!nextVisitDate || d < nextVisitDate)) nextVisitDate = d;
        const mKey = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        byMonth[mKey] = (byMonth[mKey] || 0) + 1;
      }

      const cls = ev['Classe de Atividade'] || 'SEM CLASSE';
      byClass[cls] = (byClass[cls] || 0) + 1;

      const crossKey = isMun ? (ev['Articulador'] || 'Sem Articulador') : (ev['Município'] || 'Não Identificado');
      byCrossEntity[crossKey] = (byCrossEntity[crossKey] || 0) + 1;

      if (isMun && ev['Bairro'] && ev['Bairro'] !== '-') {
        byBairro[ev['Bairro']] = (byBairro[ev['Bairro']] || 0) + 1;
      }
    });

    const toSortedArray = (obj) => Object.entries(obj).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    return {
      type: fichaModal.type,
      name: targetName,
      regiaoSC: isMun ? (matchingEvents[0]?.['Região SC'] || SC_REGION_MAP[normalizerFilter(targetName)] || 'SANTA CATARINA') : null,
      total: matchingEvents.length,
      presenciais,
      online,
      horas: (totalMinutos / 60).toFixed(1),
      confirmados,
      realizados,
      pendentes,
      altaPrio,
      lastVisit: lastVisitDate ? formatDate(lastVisitDate) : 'Sem registro anterior',
      nextVisit: nextVisitDate ? formatDate(nextVisitDate) : 'Nenhuma agendada',
      classesList: toSortedArray(byClass),
      crossList: toSortedArray(byCrossEntity),
      bairrosList: toSortedArray(byBairro),
      eventsList: matchingEvents
    };
  }, [fichaModal, events, dedupVisual, showPessoal]);

  // ==========================================
  // ESTATÍSTICAS DO DASHBOARD E RANKINGS
  // ==========================================
  const dashboardStats = useMemo(() => {
    const aggCount = (key, ignoreValues = []) => {
      const counts = {};
      filteredEvents.forEach(ev => {
        const val = ev[key];
        if (!val || val === '-' || val.toString().trim() === '') return;
        if (ignoreValues.includes(normalizerFilter(val))) return;
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const temporalMap = {};
    let totalMin = 0, presenciaisCount = 0, onlineCount = 0, municipiosUnicos = new Set();

    filteredEvents.forEach(ev => {
      totalMin += Number(ev['Duração']) || 0;
      if (ev['Modalidade'] === 'ONLINE') onlineCount++; else presenciaisCount++;
      if (ev['Município'] && ev['Município'] !== 'Não Identificado') municipiosUnicos.add(ev['Município']);

      const d = parseLocalDate(ev['Início']);
      if (d) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!temporalMap[key]) temporalMap[key] = { value: 0, hours: 0 };
        temporalMap[key].value += 1;
        temporalMap[key].hours += (Number(ev['Duração']) || 0) / 60;
      }
    });

    const temporalLine = Object.entries(temporalMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => {
        const [y, m] = k.split('-');
        return { name: `${m}/${y}`, value: v.value, hours: Number(v.hours.toFixed(1)) };
      });

    return {
      totalHours: (totalMin / 60).toFixed(1),
      presenciaisCount,
      onlineCount,
      municipiosVisitadosCount: municipiosUnicos.size,
      municipiosRanking: aggCount('Município', ['nao identificado']),
      regioesSCRanking: aggCount('Região SC', ['nao identificada']),
      bairrosFloripaRanking: aggCount('Bairro', ['nao especificado', 'digital / online']),
      classes: aggCount('Classe de Atividade', ['outros eventos', 'sem classe']),
      articuladores: aggCount('Articulador'),
      temporalLine
    };
  }, [filteredEvents]);

  const resetAllFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setShowFuture(true);
    setShowPast(true);
    setShowPessoal(false);
    setScopeCapital(true);
    setScopeInterior(true);
    setSelectedRegioesSC([]);
    setSelectedMunicipios([]);
    setSelectedBairrosFloripa([]);
    setSelectedArticuladores([]);
    setSelectedClasses([]);
    setSelectedStatus([]);
    setSelectedPrioridades([]);
    setSelectedModalidades([]);
  };

  const activeFiltersCount = [
    search, dateFrom, dateTo,
    ...selectedRegioesSC, ...selectedMunicipios, ...selectedBairrosFloripa,
    ...selectedArticuladores, ...selectedClasses, ...selectedStatus,
    ...selectedPrioridades, ...selectedModalidades
  ].filter(Boolean).length;

  // ==========================================
  // BARRA SUPERIOR UNIVERSAL DE FILTROS E BUSCA
  // ==========================================
  const renderUniversalTopBar = () => (
    <div className="bg-[#ffffff] border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] p-4 mb-6 flex flex-col gap-3 relative z-30">
      {/* Linha 1: Busca Universal + Botões Rápidos de Tempo/Escopo */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="🔎 PROCURA UNIVERSAL (TÍTULO, DESCRIÇÃO, MUNICÍPIO, BAIRRO, ARTICULADOR, CLASSE, LOCAL)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-full px-4 py-2.5 bg-[#Fdfcf0] border-[3px] border-[#111111] focus:outline-none focus:bg-[#ffffff] font-black text-[10px] uppercase shadow-[4px_4px_0px_0px_#111111] text-[#111111] placeholder-[#111111]/60"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#C1272D] text-[#Fdfcf0] px-2 py-0.5 text-[9px] font-black border-[2px] border-[#111111]"
            >
              LIMPAR
            </button>
          )}
        </div>

        {/* Datas De / Até */}
        <div className="flex items-center gap-2 bg-[#Fdfcf0] px-2.5 py-1.5 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
          <span className="text-[8px] font-black uppercase">DE:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-transparent text-[9px] font-black uppercase focus:outline-none"
          />
          <span className="text-[8px] font-black uppercase ml-1">ATÉ:</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-transparent text-[9px] font-black uppercase focus:outline-none"
          />
        </div>

        {/* Toggles Rápidos */}
        <div className="flex flex-wrap gap-1.5 bg-[#111111] p-1.5 border-[3px] border-[#111111]">
          <button
            type="button"
            onClick={() => setScopeCapital(!scopeCapital)}
            className={`px-2.5 py-1 text-[8px] font-black uppercase border-2 ${scopeCapital ? 'bg-[#007D8A] text-[#Fdfcf0] border-[#Fdfcf0]' : 'text-[#Fdfcf0] border-transparent opacity-60'}`}
          >
            {scopeCapital ? '✓ ' : ''}CAPITAL
          </button>
          <button
            type="button"
            onClick={() => setScopeInterior(!scopeInterior)}
            className={`px-2.5 py-1 text-[8px] font-black uppercase border-2 ${scopeInterior ? 'bg-[#007D8A] text-[#Fdfcf0] border-[#Fdfcf0]' : 'text-[#Fdfcf0] border-transparent opacity-60'}`}
          >
            {scopeInterior ? '✓ ' : ''}ESTADO (SC)
          </button>
          <button
            type="button"
            onClick={() => setShowFuture(!showFuture)}
            className={`px-2.5 py-1 text-[8px] font-black uppercase border-2 ${showFuture ? 'bg-[#EAA221] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent opacity-60'}`}
          >
            {showFuture ? '✓ ' : ''}FUTUROS
          </button>
          <button
            type="button"
            onClick={() => setShowPast(!showPast)}
            className={`px-2.5 py-1 text-[8px] font-black uppercase border-2 ${showPast ? 'bg-[#EAA221] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent opacity-60'}`}
          >
            {showPast ? '✓ ' : ''}PASSADOS
          </button>
          <button
            type="button"
            onClick={() => setShowPessoal(!showPessoal)}
            className={`px-2.5 py-1 text-[8px] font-black uppercase border-2 ${showPessoal ? 'bg-[#Fdfcf0] text-[#111111] border-[#111111]' : 'text-[#Fdfcf0] border-transparent opacity-60'}`}
          >
            {showPessoal ? '✓ ' : ''}PESSOAL
          </button>
          <button
            type="button"
            onClick={() => setDedupVisual(!dedupVisual)}
            title="Oculta linhas duplicadas geradas pela varredura da agenda"
            className={`px-2.5 py-1 text-[8px] font-black uppercase border-2 ${dedupVisual ? 'bg-[#C1272D] text-[#Fdfcf0] border-[#Fdfcf0]' : 'text-[#Fdfcf0] border-transparent opacity-60'}`}
          >
            {dedupVisual ? '✓ ' : ''}SEM DUPLICATAS
          </button>
        </div>
      </div>

      {/* Linha 2: Todos os Parâmetros da Planilha em Multi-Seleção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2.5 pt-2 border-t-[2px] border-dashed border-[#111111]">
        <MultiSelect
          label="1. Região SC"
          options={filterMeta.regioesSC.options}
          countsMap={filterMeta.regioesSC.counts}
          selected={selectedRegioesSC}
          onChange={setSelectedRegioesSC}
          placeholder="TODAS REGIÕES"
        />
        <MultiSelect
          label="2. Município"
          options={filterMeta.municipios.options}
          countsMap={filterMeta.municipios.counts}
          selected={selectedMunicipios}
          onChange={setSelectedMunicipios}
          placeholder="TODOS MUNICÍPIOS"
        />
        <MultiSelect
          label="3. Bairro (Floripa)"
          options={filterMeta.bairros.options}
          countsMap={filterMeta.bairros.counts}
          selected={selectedBairrosFloripa}
          onChange={setSelectedBairrosFloripa}
          placeholder="TODOS BAIRROS"
        />
        <MultiSelect
          label="4. Classe de Atividade"
          options={filterMeta.classes.options}
          countsMap={filterMeta.classes.counts}
          selected={selectedClasses}
          onChange={setSelectedClasses}
          placeholder="TODAS CLASSES"
        />
        <MultiSelect
          label="5. Articulador"
          options={filterMeta.articuladores.options}
          countsMap={filterMeta.articuladores.counts}
          selected={selectedArticuladores}
          onChange={setSelectedArticuladores}
          placeholder="TODOS ARTICULADORES"
        />
        <MultiSelect
          label="6. Status"
          options={filterMeta.status.options}
          countsMap={filterMeta.status.counts}
          selected={selectedStatus}
          onChange={setSelectedStatus}
          placeholder="TODOS STATUS"
        />
        <MultiSelect
          label="7. Prioridade"
          options={filterMeta.prioridades.options}
          countsMap={filterMeta.prioridades.counts}
          selected={selectedPrioridades}
          onChange={setSelectedPrioridades}
          placeholder="TODAS PRIORIDADES"
        />
        <MultiSelect
          label="8. Modalidade"
          options={filterMeta.modalidades.options}
          countsMap={filterMeta.modalidades.counts}
          selected={selectedModalidades}
          onChange={setSelectedModalidades}
          placeholder="PRESENCIAL / ONLINE"
        />
      </div>

      {/* Linha 3: Barra de Status Ativo e Ações Rápidas */}
      <div className="flex flex-wrap justify-between items-center pt-2 border-t-[3px] border-[#111111] gap-2">
        <div className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase">
          <span className="bg-[#111111] text-[#Fdfcf0] px-2.5 py-1">
            EXIBINDO: {filteredEvents.length} AGENDAS ({dashboardStats.totalHours}h TOTAIS)
          </span>
          <span className="text-[#007D8A]">
            📍 PRESENCIAIS: {dashboardStats.presenciaisCount} | 💻 ONLINE: {dashboardStats.onlineCount}
          </span>
          <span className="text-[#C1272D]">
            🏛️ MUNICÍPIOS NO FILTRO: {dashboardStats.municipiosVisitadosCount}
          </span>
          {selectedMunicipios.length === 1 && (
            <button
              type="button"
              onClick={() => setFichaModal({ type: 'municipio', name: selectedMunicipios[0] })}
              className="bg-[#C1272D] text-[#Fdfcf0] px-3 py-1 border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111] hover:bg-[#EAA221] hover:text-[#111111] transition-colors"
            >
              📋 ABRIR FICHA DE {selectedMunicipios[0]}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={resetAllFilters}
              className="px-3 py-1 bg-[#C1272D] text-[#Fdfcf0] text-[9px] font-black uppercase border-[2px] border-[#111111] shadow-[2px_2px_0px_0px_#111111]"
            >
              LIMPAR FILTROS ({activeFiltersCount})
            </button>
          )}
          <button
            type="button"
            onClick={() => setSortConfig(prev => ({ key: 'Início', direction: prev.direction === 'asc' ? 'desc' : 'asc' }))}
            className="px-3 py-1 bg-[#Fdfcf0] text-[#111111] text-[9px] font-black uppercase border-[2px] border-[#111111]"
          >
            DATA: {sortConfig.direction === 'asc' ? 'CRESCENTE ▲' : 'DECRESCENTE ▼'}
          </button>
          {activeTab === 'list' && (
            <div className="flex bg-[#111111] p-0.5 border-[2px] border-[#111111]">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 text-[8px] font-black uppercase ${viewMode === 'cards' ? 'bg-[#EAA221] text-[#111111]' : 'text-[#Fdfcf0]'}`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-[8px] font-black uppercase ${viewMode === 'table' ? 'bg-[#EAA221] text-[#111111]' : 'text-[#Fdfcf0]'}`}
              >
                Tabela
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ==========================================
  // ABA 1: LISTA E CARDS INTERATIVOS
  // ==========================================
  const renderList = () => (
    <div className="space-y-6 pb-10">
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 font-black text-xl text-[#111111] opacity-50 bg-[#ffffff] border-[4px] border-[#111111] border-dashed">
          NENHUM COMPROMISSO ENCONTRADO COM OS FILTROS ATUAIS
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredEvents.map((ev, i) => {
            const prio = ev['Prioridade'];
            const prioBg = prio === 'Alta' ? 'bg-[#C1272D] text-[#Fdfcf0]' : prio === 'Média' ? 'bg-[#EAA221] text-[#111111]' : prio === 'Baixa' ? 'bg-[#007D8A] text-[#Fdfcf0]' : 'bg-[#ffffff] text-[#111111]';

            return (
              <div
                key={ev.id || i}
                onClick={() => setSelectedEvent(ev)}
                className="bg-[#ffffff] p-4 border-[4px] border-[#111111] shadow-[6px_6px_0px_0px_#111111] hover:shadow-[10px_10px_0px_0px_#111111] hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-full relative"
              >
                <div
                  className="absolute top-0 right-0 px-2 py-0.5 border-l-[3px] border-b-[3px] border-[#111111] text-[7px] font-black uppercase"
                  style={{ backgroundColor: ev['Modalidade'] === 'ONLINE' ? COLORS.mustard : isFutureOrToday(ev['Início']) ? COLORS.teal : '#cccccc', color: ev['Modalidade'] === 'ONLINE' ? '#111111' : '#ffffff' }}
                >
                  {ev['Modalidade']}
                </div>

                <div className="flex items-center gap-1.5 mb-2 pr-14">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#Fdfcf0] bg-[#111111] px-2 py-0.5 border-[2px] border-[#111111]">
                    {ev['Classe de Atividade']}
                  </span>
                </div>

                <h3 className="font-black text-base text-[#111111] leading-tight mb-3 uppercase line-clamp-3">
                  {ev['Título']}
                </h3>

                <div className="mt-auto space-y-1.5 border-t-[3px] border-[#111111] pt-2.5 text-[9px] font-black uppercase">
                  <div className="flex justify-between items-center text-[#111111]">
                    <span>🕒 {formatDate(ev['Início'])}</span>
                    <span className="bg-[#Fdfcf0] px-1.5 py-0.5 border border-[#111111]">{ev['Duração']} min</span>
                  </div>

                  {/* Clique direto no Município abre a Ficha Territorial */}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFichaModal({ type: 'municipio', name: ev['Município'] }); }}
                      className="text-left text-[#C1272D] hover:underline flex items-center gap-1 truncate max-w-full"
                      title="Clique para abrir a Ficha Cruzada deste Município"
                    >
                      <span>📍 {ev['Município']}</span>
                      {ev['Bairro'] && ev['Bairro'] !== '-' && <span className="text-[#111111]">({ev['Bairro']})</span>}
                      <span className="bg-[#C1272D] text-[#Fdfcf0] text-[7px] px-1 ml-1">FICHA ↗</span>
                    </button>
                  </div>

                  {ev['Articulador'] && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFichaModal({ type: 'articulador', name: ev['Articulador'] }); }}
                      className="text-left text-[#007D8A] hover:underline flex items-center gap-1 truncate"
                      title="Clique para abrir a Ficha deste Articulador"
                    >
                      <span>🤝 {ev['Articulador']}</span>
                      <span className="bg-[#007D8A] text-[#Fdfcf0] text-[7px] px-1">VER ↗</span>
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-end mt-3 gap-2">
                  <select
                    value={prio}
                    onChange={(e) => { e.stopPropagation(); handleUpdateField(ev.id, 'Prioridade', e.target.value, { prioridade: e.target.value }); }}
                    onClick={(e) => e.stopPropagation()}
                    className={`border-[2px] border-[#111111] px-1 py-1 text-[8px] font-black uppercase outline-none cursor-pointer flex-1 text-center ${prioBg}`}
                  >
                    <option value="Sem Prioridade">S/ Prioridade</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                  <select
                    value={ev['STATUS'] || 'Pendente'}
                    onChange={(e) => { e.stopPropagation(); handleUpdateField(ev.id, 'STATUS', e.target.value, { status: e.target.value }); }}
                    onClick={(e) => e.stopPropagation()}
                    className={`border-[2px] border-[#111111] px-1 py-1 text-[8px] font-black uppercase outline-none cursor-pointer flex-1 text-center ${
                      ev['STATUS'] === 'Confirmado' ? 'bg-[#007D8A] text-[#Fdfcf0]' : ev['STATUS'] === 'Realizado' ? 'bg-[#EAA221] text-[#111111]' : 'bg-[#ffffff] text-[#111111]'
                    }`}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Realizado">Realizado</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#ffffff] border-[4px] border-[#111111] shadow-[8px_8px_0px_0px_#111111] overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[9px] text-[#Fdfcf0] uppercase bg-[#111111]">
              <tr>
                <th className="px-3 py-3 font-black border-b-[3px] border-[#Fdfcf0]">Data</th>
                <th className="px-3 py-3 font-black border-b-[3px] border-[#Fdfcf0]">Título</th>
                <th className="px-3 py-3 font-black border-b-[3px] border-[#Fdfcf0]">Classe</th>
                <th className="px-3 py-3 font-black border-b-[3px] border-[#Fdfcf0]">Município (Ficha)</th>
                <th className="px-3 py-3 font-black border-b-[3px] border-[#Fdfcf0]">Bairro / Região</th>
                <th className="px-3 py-3 font-black border-b-[3px] border-[#Fdfcf0]">Articulador</th>
                <th className="px-3 py-3 font-black border-b-[3px] border-[#Fdfcf0]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((ev, i) => (
                <tr key={ev.id || i} onClick={() => setSelectedEvent(ev)} className="border-b-[2px] border-[#111111] hover:bg-[#Fdfcf0] cursor-pointer text-[10px]">
                  <td className="px-3 py-2.5 font-bold whitespace-nowrap">{formatDate(ev['Início'])}</td>
                  <td className="px-3 py-2.5 font-black uppercase max-w-[260px] truncate" title={ev['Título']}>{ev['Título']}</td>
                  <td className="px-3 py-2.5 font-black uppercase text-[8px]"><span className="bg-[#111111] text-[#Fdfcf0] px-1.5 py-0.5">{ev['Classe de Atividade']}</span></td>
                  <td className="px-3 py-2.5 font-black uppercase">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setFichaModal({ type: 'municipio', name: ev['Município'] }); }}
                      className="text-[#C1272D] hover:underline flex items-center gap-1"
                    >
                      {ev['Município']} <span className="text-[7px] bg-[#C1272D] text-[#Fdfcf0] px-1">FICHA</span>
                    </button>
                  </td>
                  <td className="px-3 py-2.5 font-bold uppercase text-[9px]">
                    {ev['Bairro'] !== '-' ? `${ev['Bairro']} (${ev['Distrito']})` : ev['Região SC']}
                  </td>
                  <td className="px-3 py-2.5 font-black uppercase">
                    {ev['Articulador'] ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFichaModal({ type: 'articulador', name: ev['Articulador'] }); }}
                        className="text-[#007D8A] hover:underline"
                      >
                        {ev['Articulador']}
                      </button>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-2.5 font-black uppercase text-[8px]">{ev['STATUS']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ==========================================
  // ABA 2: FICHAS & CRUZAMENTOS TERRITORIAIS (EXPLORADOR DE MUNICÍPIOS)
  // ==========================================
  const renderFichasExplorer = () => {
    const munStatsList = dashboardStats.municipiosRanking;
    return (
      <div className="space-y-6 pb-10">
        <div className="bg-[#ffffff] border-[4px] border-[#111111] p-5 shadow-[6px_6px_0px_0px_#111111] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Diretório de Fichas Municipais & Articuladores</h2>
            <p className="text-[10px] font-bold uppercase text-[#007D8A] mt-1">
              Clique em qualquer Município ou Articulador para abrir o Dossiê Cruzado de visitas, horas, assessores e classes de atividade
            </p>
          </div>
          <span className="bg-[#C1272D] text-[#Fdfcf0] px-4 py-2 font-black text-xs uppercase border-[3px] border-[#111111]">
            {munStatsList.length} MUNICÍPIOS COM REGISTRO
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {munStatsList.map((m, idx) => {
            const reg = SC_REGION_MAP[normalizerFilter(m.name)] || 'SANTA CATARINA';
            return (
              <div
                key={idx}
                onClick={() => setFichaModal({ type: 'municipio', name: m.name })}
                className="bg-[#ffffff] border-[4px] border-[#111111] p-4 shadow-[5px_5px_0px_0px_#111111] hover:bg-[#EAA221] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="text-[8px] font-black uppercase bg-[#111111] text-[#Fdfcf0] px-2 py-0.5">{reg}</span>
                  <h3 className="text-base font-black uppercase mt-2 text-[#111111]">{m.name}</h3>
                </div>
                <div className="mt-4 pt-2 border-t-[2px] border-[#111111] flex justify-between items-end">
                  <span className="text-[9px] font-black uppercase text-[#007D8A]">Abrir Ficha Cruzada ↗</span>
                  <span className="text-lg font-black text-[#C1272D] leading-none">{m.value} <small className="text-[8px]">agendas</small></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ==========================================
  // ABA 3: DASHBOARD E MAPAS DE PRECISÃO
  // ==========================================
  const renderDashboard = () => (
    <div className="space-y-8 pb-10">
      {/* KPIs de Precisão */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#ffffff] border-[4px] border-[#111111] p-4 shadow-[5px_5px_0px_0px_#111111]">
          <span className="text-[8px] font-black uppercase text-[#111111] opacity-70">Total de Agendas</span>
          <p className="text-2xl font-black text-[#C1272D] mt-1">{filteredEvents.length}</p>
        </div>
        <div className="bg-[#ffffff] border-[4px] border-[#111111] p-4 shadow-[5px_5px_0px_0px_#111111]">
          <span className="text-[8px] font-black uppercase text-[#111111] opacity-70">Horas Dedicadas</span>
          <p className="text-2xl font-black text-[#007D8A] mt-1">{dashboardStats.totalHours}h</p>
        </div>
        <div className="bg-[#ffffff] border-[4px] border-[#111111] p-4 shadow-[5px_5px_0px_0px_#111111]">
          <span className="text-[8px] font-black uppercase text-[#111111] opacity-70">Agendas Presenciais</span>
          <p className="text-2xl font-black text-[#111111] mt-1">{dashboardStats.presenciaisCount}</p>
        </div>
        <div className="bg-[#ffffff] border-[4px] border-[#111111] p-4 shadow-[5px_5px_0px_0px_#111111]">
          <span className="text-[8px] font-black uppercase text-[#111111] opacity-70">Agendas Online</span>
          <p className="text-2xl font-black text-[#EAA221] mt-1">{dashboardStats.onlineCount}</p>
        </div>
        <div className="bg-[#ffffff] border-[4px] border-[#111111] p-4 shadow-[5px_5px_0px_0px_#111111]">
          <span className="text-[8px] font-black uppercase text-[#111111] opacity-70">Municípios Visitados</span>
          <p className="text-2xl font-black text-[#C1272D] mt-1">{dashboardStats.municipiosVisitadosCount}</p>
        </div>
      </div>

      {/* Linha 1 de Gráficos: Municípios, Regiões SC e Bairros de Floripa */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InteractiveBarChart
          data={dashboardStats.municipiosRanking}
          title="Visitas por Município"
          subtitle="Clique no município para abrir a Ficha"
          onItemClick={(name) => setFichaModal({ type: 'municipio', name })}
        />
        <InteractiveBarChart
          data={dashboardStats.regioesSCRanking}
          title="Presença por Região de SC"
          subtitle="Clique para filtrar a macrorregião"
          onItemClick={(reg) => setSelectedRegioesSC([reg])}
        />
        <InteractiveBarChart
          data={dashboardStats.bairrosFloripaRanking}
          title="Bairros REPLAN (Florianópolis)"
          subtitle="56 bairros oficiais da aba Apoio"
          onItemClick={(bairro) => setSelectedBairrosFloripa([bairro])}
        />
      </div>

      {/* Linha 2 de Gráficos: Classes de Atividade e Articuladores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InteractiveBarChart
          data={dashboardStats.classes}
          title="Classes de Atividade"
          subtitle="Clique para filtrar por classe"
          onItemClick={(cls) => setSelectedClasses([cls])}
        />
        <InteractiveDonutChart
          data={dashboardStats.classes}
          title="Proporção de Classes (Top 5 + Outros)"
          onSliceClick={(cls) => setSelectedClasses([cls])}
        />
        <InteractiveBarChart
          data={dashboardStats.articuladores}
          title="Atuação por Articulador"
          subtitle="Clique no nome para abrir a Ficha do Assessor"
          onItemClick={(art) => setFichaModal({ type: 'articulador', name: art })}
        />
      </div>

      <SimpleLineChart data={dashboardStats.temporalLine} title="Evolução Mensal das Agendas" />

      {/* Mapas Aprimorados */}
      <div className="grid grid-cols-1 gap-8">
        <EnhancedTerritorialMap
          events={filteredEvents}
          title="Mapa Territorial de Santa Catarina (Coroplético + Clusters de Visitas)"
          isFloripa={false}
          onMunicipioClick={(mun) => setFichaModal({ type: 'municipio', name: mun })}
          onEventClick={(ev) => setSelectedEvent(ev)}
        />
        <EnhancedTerritorialMap
          events={filteredEvents.filter(e => normalizerFilter(e['Município']) === 'florianopolis')}
          title="Mapa Urbano de Florianópolis (56 Bairros REPLAN)"
          isFloripa={true}
          onMunicipioClick={() => setFichaModal({ type: 'municipio', name: 'Florianópolis' })}
          onEventClick={(ev) => setSelectedEvent(ev)}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#Fdfcf0] font-sans text-[#111111] flex flex-col md:flex-row selection:bg-[#EAA221] selection:text-[#111111]">
      {/* SIDEBAR MONDRIAN */}
      <nav className="bg-[#111111] text-[#Fdfcf0] w-full md:w-60 flex-shrink-0 flex flex-col z-40 border-r-[6px] border-[#111111]">
        <div
          className="p-5 bg-[#C1272D] flex flex-col cursor-pointer hover:bg-[#A31F25] transition-colors border-b-[4px] border-[#111111]"
          onClick={resetAllFilters}
          title="Limpar todos os filtros"
        >
          <div className="flex items-center gap-3">
            <img
              src="https://raw.githubusercontent.com/killuixo/tabulum-gestafagen/refs/heads/main/icon-192.png"
              alt="Icon"
              className="w-10 h-10 flex-shrink-0 object-contain drop-shadow-[2px_2px_0px_rgba(17,17,17,1)]"
            />
            <div className="flex flex-col flex-1">
              <h1 className="text-2xl font-black tracking-tighter text-[#Fdfcf0] leading-none">TABULUM</h1>
              <p className="text-[8px] text-[#Fdfcf0] font-black uppercase tracking-widest bg-[#111111] px-1.5 py-0.5 border-[2px] border-[#Fdfcf0] text-center mt-1">
                GesTAgen v2.0
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col p-4 gap-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-4 py-3 border-[3px] border-[#Fdfcf0] text-[10px] font-black uppercase text-left transition-all ${
              activeTab === 'list' ? 'bg-[#EAA221] text-[#111111] shadow-[4px_4px_0px_0px_#ffffff]' : 'bg-[#111111] hover:bg-[#222222]'
            }`}
          >
            ■ AGENDAS ({filteredEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fichas')}
            className={`px-4 py-3 border-[3px] border-[#Fdfcf0] text-[10px] font-black uppercase text-left transition-all ${
              activeTab === 'fichas' ? 'bg-[#C1272D] text-[#Fdfcf0] shadow-[4px_4px_0px_0px_#ffffff]' : 'bg-[#111111] hover:bg-[#222222]'
            }`}
          >
            ■ FICHAS MUNICIPAIS ({dashboardStats.municipiosVisitadosCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 border-[3px] border-[#Fdfcf0] text-[10px] font-black uppercase text-left transition-all ${
              activeTab === 'dashboard' ? 'bg-[#007D8A] text-[#Fdfcf0] shadow-[4px_4px_0px_0px_#ffffff]' : 'bg-[#111111] hover:bg-[#222222]'
            }`}
          >
            ■ DASHBOARD & MAPAS
          </button>
        </div>

        <div className="mt-auto hidden md:block p-4">
          <div className="bg-[#Fdfcf0] border-[3px] border-[#111111] p-3 text-[#111111] text-[8px] font-black uppercase space-y-1">
            <div className="border-b-[2px] border-[#111111] pb-1">Suíte TABULUM</div>
            <div className="text-[#007D8A]">● GesTAgen (Ativo)</div>
            <div className="opacity-60">○ SIG-Emendas (Pronto p/ Link)</div>
            <div className="opacity-60">○ MapEl Votos (Pronto p/ Link)</div>
            <div className="opacity-60">○ GestUP Lideranças</div>
          </div>
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full border-[6px] border-t-[#C1272D] border-r-[#EAA221] border-b-[#007D8A] border-l-transparent animate-spin" />
            <div className="font-black uppercase text-sm bg-[#ffffff] px-4 py-2 border-[3px] border-[#111111]">
              Sincronizando Planilha Google Sheets...
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {renderUniversalTopBar()}
            {activeTab === 'list' && renderList()}
            {activeTab === 'fichas' && renderFichasExplorer()}
            {activeTab === 'dashboard' && renderDashboard()}
          </div>
        )}
      </main>

      {/* ==========================================
          MODAL DE FICHA CRUZADA (DOSSIÊ DE MUNICÍPIO OU ARTICULADOR)
          ========================================== */}
      {activeFichaData && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
          onClick={() => setFichaModal(null)}
        >
          <div
            className="bg-[#Fdfcf0] w-full max-w-4xl max-h-[90vh] border-[6px] border-[#111111] shadow-[12px_12px_0px_0px_#111111] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho da Ficha */}
            <div className="p-5 bg-[#C1272D] text-[#Fdfcf0] border-b-[4px] border-[#111111] flex justify-between items-start">
              <div>
                <span className="bg-[#111111] text-[#EAA221] text-[9px] font-black uppercase px-2.5 py-1 border-[2px] border-[#Fdfcf0]">
                  {activeFichaData.type === 'municipio' ? `DOSSIÊ MUNICIPAL • ${activeFichaData.regiaoSC}` : 'FICHA DE ARTICULADOR / ASSESSORIA'}
                </span>
                <h2 className="text-2xl md:text-3xl font-black uppercase mt-2 leading-none">{activeFichaData.name}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activeFichaData.type === 'municipio') setSelectedMunicipios([activeFichaData.name]);
                    else setSelectedArticuladores([activeFichaData.name]);
                    setFichaModal(null);
                  }}
                  className="px-3 py-2 bg-[#EAA221] text-[#111111] font-black text-[9px] uppercase border-[3px] border-[#111111] shadow-[3px_3px_0px_0px_#111111]"
                >
                  FILTRAR PAINEL POR ESTE NOME
                </button>
                <button
                  type="button"
                  onClick={() => setFichaModal(null)}
                  className="px-3 py-2 bg-[#111111] text-[#Fdfcf0] font-black text-xs border-[3px] border-[#Fdfcf0]"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Corpo da Ficha */}
            <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
              {/* Indicadores Principais */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <div className="bg-[#ffffff] p-3 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                  <span className="text-[8px] font-black uppercase block opacity-70">Total de Visitas/Agendas</span>
                  <span className="text-2xl font-black text-[#C1272D]">{activeFichaData.total}</span>
                </div>
                <div className="bg-[#ffffff] p-3 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                  <span className="text-[8px] font-black uppercase block opacity-70">Presenciais vs Online</span>
                  <span className="text-sm font-black text-[#007D8A]">{activeFichaData.presenciais} Pres. / {activeFichaData.online} On.</span>
                </div>
                <div className="bg-[#ffffff] p-3 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                  <span className="text-[8px] font-black uppercase block opacity-70">Tempo Dedicado</span>
                  <span className="text-2xl font-black text-[#111111]">{activeFichaData.horas}h</span>
                </div>
                <div className="bg-[#ffffff] p-3 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                  <span className="text-[8px] font-black uppercase block opacity-70">Última Visita/Agenda</span>
                  <span className="text-xs font-black text-[#111111]">{activeFichaData.lastVisit}</span>
                </div>
                <div className="bg-[#ffffff] p-3 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                  <span className="text-[8px] font-black uppercase block opacity-70">Próxima Agenda</span>
                  <span className="text-xs font-black text-[#007D8A]">{activeFichaData.nextVisit}</span>
                </div>
                <div className="bg-[#ffffff] p-3 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                  <span className="text-[8px] font-black uppercase block opacity-70">Alta Prioridade</span>
                  <span className="text-2xl font-black text-[#C1272D]">{activeFichaData.altaPrio}</span>
                </div>
              </div>

              {/* Cruzamentos (Articuladores x Classes x Bairros) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#ffffff] p-4 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                  <h4 className="text-[10px] font-black uppercase border-b-[2px] border-[#111111] pb-1.5 mb-3">
                    {activeFichaData.type === 'municipio' ? '🤝 Articuladores que Atuaram no Município' : '📍 Municípios Articulados pelo Assessor'}
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {activeFichaData.crossList.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          if (item.name !== 'Sem Articulador' && item.name !== 'Não Identificado') {
                            setFichaModal({ type: activeFichaData.type === 'municipio' ? 'articulador' : 'municipio', name: item.name });
                          }
                        }}
                        className="flex justify-between items-center text-[9px] font-black uppercase bg-[#Fdfcf0] px-2.5 py-1.5 border-[2px] border-[#111111] cursor-pointer hover:bg-[#EAA221]"
                      >
                        <span>{item.name}</span>
                        <span className="bg-[#111111] text-[#Fdfcf0] px-2 py-0.5">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#ffffff] p-4 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                  <h4 className="text-[10px] font-black uppercase border-b-[2px] border-[#111111] pb-1.5 mb-3">
                    📂 Classes de Atividade Realizadas
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {activeFichaData.classesList.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[9px] font-black uppercase bg-[#Fdfcf0] px-2.5 py-1.5 border-[2px] border-[#111111]">
                        <span>{item.name}</span>
                        <span className="bg-[#007D8A] text-[#Fdfcf0] px-2 py-0.5">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subdivisão por Bairros REPLAN caso seja Florianópolis */}
              {activeFichaData.bairrosList.length > 0 && (
                <div className="bg-[#ffffff] p-4 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                  <h4 className="text-[10px] font-black uppercase border-b-[2px] border-[#111111] pb-1.5 mb-3">
                    🏘️ Distribuição por Bairros REPLAN ({activeFichaData.bairrosList.length} bairros)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activeFichaData.bairrosList.map((b, i) => (
                      <span key={i} className="text-[9px] font-black uppercase bg-[#Fdfcf0] border-[2px] border-[#111111] px-2.5 py-1">
                        {b.name}: <b className="text-[#C1272D]">{b.value}</b>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico Completo de Agendas da Ficha */}
              <div className="bg-[#ffffff] p-4 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                <h4 className="text-[10px] font-black uppercase border-b-[2px] border-[#111111] pb-1.5 mb-3">
                  📅 Linha do Tempo de Compromissos ({activeFichaData.eventsList.length})
                </h4>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {activeFichaData.eventsList.map((ev, i) => (
                    <div
                      key={i}
                      onClick={() => { setFichaModal(null); setSelectedEvent(ev); }}
                      className="p-2.5 bg-[#Fdfcf0] border-[2px] border-[#111111] hover:bg-[#EAA221] cursor-pointer flex flex-col md:flex-row justify-between md:items-center gap-2 text-[9px] font-black uppercase"
                    >
                      <div className="flex items-center gap-2">
                        <span className="bg-[#111111] text-[#Fdfcf0] px-1.5 py-0.5">{formatDate(ev['Início'])}</span>
                        <span className="text-[#C1272D]">[{ev['Classe de Atividade']}]</span>
                        <span>{ev['Título']}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {ev['Articulador'] && <span className="text-[#007D8A]">🤝 {ev['Articulador']}</span>}
                        <span className="px-1.5 py-0.5 border border-[#111111] bg-[#ffffff]">{ev['STATUS']}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          DRAWER DE DETALHES DO EVENTO INDIVIDUAL + EDIÇÃO SEGURA (COLUNAS J, K, L)
          ========================================== */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[999] flex justify-end" onClick={() => setSelectedEvent(null)}>
          <div
            className="bg-[#Fdfcf0] w-full max-w-lg h-full border-l-[6px] border-[#111111] flex flex-col overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 bg-[#ffffff] border-b-[4px] border-[#111111] sticky top-0 z-10 flex justify-between items-start">
              <div>
                <span className="bg-[#111111] text-[#Fdfcf0] text-[9px] font-black uppercase px-2 py-1">
                  {selectedEvent['Classe de Atividade']} • {selectedEvent['Modalidade']}
                </span>
                <h2 className="text-xl font-black text-[#111111] leading-tight uppercase mt-2">{selectedEvent['Título']}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-2 bg-[#C1272D] text-[#Fdfcf0] border-[3px] border-[#111111] font-black"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Edição de Status (Col J) e Prioridade (Col L) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-black uppercase block mb-1">Status (Coluna J)</label>
                  <select
                    value={selectedEvent['STATUS'] || 'Pendente'}
                    onChange={(e) => handleUpdateField(selectedEvent.id, 'STATUS', e.target.value, { status: e.target.value })}
                    className="w-full border-[3px] border-[#111111] font-black text-xs uppercase p-2.5 bg-[#ffffff]"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Realizado">Realizado</option>
                  </select>
                </div>
                <div>
                  <label className="text-[8px] font-black uppercase block mb-1">Prioridade (Coluna L)</label>
                  <select
                    value={selectedEvent['Prioridade'] || 'Sem Prioridade'}
                    onChange={(e) => handleUpdateField(selectedEvent.id, 'Prioridade', e.target.value, { prioridade: e.target.value })}
                    className="w-full border-[3px] border-[#111111] font-black text-xs uppercase p-2.5 bg-[#ffffff]"
                  >
                    <option value="Sem Prioridade">Sem Prioridade</option>
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
              </div>

              {/* Edição Manual de Articulador via Coluna K (ARTICULADOR - INPUT) sem quebrar ARRAYFORMULA */}
              <div className="bg-[#ffffff] p-4 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111]">
                <label className="text-[8px] font-black uppercase text-[#007D8A] block mb-1">
                  Articulador Responsável (Salva na Coluna K - ARTICULADOR INPUT)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={selectedEvent['Articulador'] || ''}
                    placeholder="Digite o nome do articulador..."
                    onBlur={(e) => handleUpdateField(selectedEvent.id, 'Articulador', toProperCase(e.target.value), { articuladorInput: toProperCase(e.target.value) })}
                    className="flex-1 px-3 py-2 bg-[#Fdfcf0] border-[2px] border-[#111111] font-black text-xs uppercase"
                  />
                  {selectedEvent['Articulador'] && (
                    <button
                      type="button"
                      onClick={() => {
                        const art = selectedEvent['Articulador'];
                        setSelectedEvent(null);
                        setFichaModal({ type: 'articulador', name: art });
                      }}
                      className="px-3 py-2 bg-[#007D8A] text-[#Fdfcf0] text-[9px] font-black uppercase border-[2px] border-[#111111]"
                    >
                      Abrir Ficha ↗
                    </button>
                  )}
                </div>
              </div>

              {/* Metadados Completos */}
              <div className="bg-[#ffffff] p-4 border-[3px] border-[#111111] shadow-[4px_4px_0px_0px_#111111] space-y-3 text-xs">
                <div className="flex justify-between items-center border-b border-[#111111]/20 pb-2">
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#C1272D] block">Município / Região SC</span>
                    <span className="font-black uppercase">{selectedEvent['Município']} ({selectedEvent['Região SC']})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const mun = selectedEvent['Município'];
                      setSelectedEvent(null);
                      setFichaModal({ type: 'municipio', name: mun });
                    }}
                    className="px-3 py-1.5 bg-[#C1272D] text-[#Fdfcf0] text-[9px] font-black uppercase border-[2px] border-[#111111]"
                  >
                    Dossiê Municipal ↗
                  </button>
                </div>

                {selectedEvent['Bairro'] !== '-' && (
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#007D8A] block">Bairro REPLAN / Distrito / Região Floripa</span>
                    <span className="font-black uppercase">{selectedEvent['Bairro']} • {selectedEvent['Distrito']} • {selectedEvent['Região Floripa']}</span>
                  </div>
                )}

                <div>
                  <span className="text-[8px] font-black uppercase text-[#111111] opacity-70 block">Data e Duração</span>
                  <span className="font-bold uppercase">{formatDate(selectedEvent['Início'])} ({selectedEvent['Duração']} minutos)</span>
                </div>

                <div>
                  <span className="text-[8px] font-black uppercase text-[#111111] opacity-70 block">Local Registrado</span>
                  <span className="font-bold uppercase">{selectedEvent['Local'] || 'Não informado'}</span>
                </div>

                {selectedEvent['Descrição'] && (
                  <div>
                    <span className="text-[8px] font-black uppercase text-[#111111] opacity-70 block">Descrição / Pauta</span>
                    <p className="font-bold text-[11px] bg-[#Fdfcf0] p-3 border-[2px] border-[#111111] mt-1 whitespace-pre-wrap">
                      {selectedEvent['Descrição']}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #Fdfcf0; border-left: 2px solid #111111; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #111111; }
        .leaflet-container { background: #Fdfcf0 !important; font-family: inherit !important; z-index: 0 !important; }
        .custom-leaflet-tooltip { border: 3px solid #111111 !important; border-radius: 0 !important; background: #ffffff !important; color: #111111 !important; box-shadow: 4px 4px 0px 0px #111111 !important; padding: 8px 10px !important; }
        .custom-leaflet-tooltip::before { display: none !important; }
      `}} />
    </div>
  );
}
