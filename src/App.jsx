import React, { useState, useEffect, useMemo } from 'react';import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';import 'leaflet/dist/leaflet.css';// Variável de ambiente protegida (Configure no Vercel como VITE_URL_PLANILHA_CSV)const URL_PLANILHA_CSV = import.meta.env.VITE_URL_PLANILHA_CSV || '';// Paleta Mondrianconst PALETA = {carmesim: '#C8102E',mostarda: '#F2A900',azulEsverdeado: '#006A6B',branco: '#FFFFFF',preto: '#000000',fundo: '#F4F4F4'};// Parser CSV Nativo (Sem dependências externas)function parseCSV(texto) {let p = '', row = [''], ret = [row], i = 0, r = 0, s = !0, l;for (l of texto) {if ('"' === l) {if (s && l === p) row[i] += l;s = !s;} else if (',' === l && s) l = row[++i] = '';else if ('\n' === l && s) {if ('\r' === p) row[i] = row[i].slice(0, -1);row = ret[++r] = [l = '']; i = 0;} else row[i] += l;p = l;}const cabecalhos = ret[0];return ret.slice(1).map(linha => {let obj = {};cabecalhos.forEach((cabecalho, index) => {if (cabecalho) obj[cabecalho.trim()] = linha[index] ? linha[index].trim() : '';});return obj;}).filter(item => item['Título']); // Filtra linhas vazias}export default function App() {const [dados, setDados] = useState([]);const [carregando, setCarregando] = useState(true);const [erro, setErro] = useState(null);const [abaAtiva, setAbaAtiva] = useState('lista');const [busca, setBusca] = useState('');const [filtroStatus, setFiltroStatus] = useState('Todos');const [modoVisao, setModoVisao] = useState('cards');const [eventoSelecionado, setEventoSelecionado] = useState(null);useEffect(() => {if (!URL_PLANILHA_CSV) {setErro("URL da planilha não encontrada no ambiente (.env).");setCarregando(false);return;}const buscarDados = async () => {
  try {
    const resposta = await fetch(URL_PLANILHA_CSV);
    const textoCsv = await resposta.text();
    const dadosParseados = parseCSV(textoCsv);
    setDados(dadosParseados);
    setCarregando(false);
  } catch (error) {
    setErro("Falha ao carregar a planilha.");
    setCarregando(false);
  }
};
buscarDados();
}, []);const dadosProcessados = useMemo(() => {const hoje = new Date();hoje.setHours(0, 0, 0, 0);return dados.map(evento => {
  let statusCalculado = "Desconhecido";
  if (evento['Início']) {
    const partes = evento['Início'].split('/');
    if (partes.length === 3) {
      // Extraindo e formatando dd/mm/yyyy (suporta datas nativas do Apps Script)
      const dataEvento = new Date(partes[2].substring(0,4), parseInt(partes[1]) - 1, partes[0]);
      statusCalculado = dataEvento < hoje ? "Realizada" : "Futura";
    }
  }

  // Extrair coordenadas do Google Maps para os mapas
  let coords = null;
  if (evento['Local']) {
    const match = evento['Local'].match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) coords = [parseFloat(match[1]), parseFloat(match[2])];
  }

  return { ...evento, StatusDinâmico: statusCalculado, coords };
});
}, [dados]);const dadosFiltrados = useMemo(() => {return dadosProcessados.filter(evento => {if (filtroStatus !== 'Todos' && evento.StatusDinâmico !== filtroStatus) return false;const termo = busca.toLowerCase();return (evento['Título']?.toLowerCase().includes(termo) ||evento['Local']?.toLowerCase().includes(termo) ||evento['ARTICULADOR']?.toLowerCase().includes(termo));});}, [dadosProcessados, busca, filtroStatus]);const contarPor = (chave) => {const contagem = dadosProcessados.reduce((acc, curr) => {const valor = curr[chave] || 'Não Informado';acc[valor] = (acc[valor] || 0) + 1;return acc;}, {});return Object.keys(contagem).map(key => ({ name: key, value: contagem[key] })).sort((a, b) => b.value - a.value);};const dadosClasse = contarPor('CLASSE DE ATIVIDADE');const dadosArticulador = contarPor('ARTICULADOR');const eventosComMapa = dadosProcessados.filter(e => e.coords);const COLORS = [PALETA.azulEsverdeado, PALETA.mostarda, PALETA.carmesim, '#000000'];if (carregando) return Carregando GesTAg...;if (erro) return {erro};return ({/* HEADER MONDRIAN */}GesTAg<button style={abaAtiva === 'lista' ? styles.btnNavAtivo : styles.btnNav} onClick={() => setAbaAtiva('lista')}>LISTA<button style={abaAtiva === 'dashboard' ? styles.btnNavAtivo : styles.btnNav} onClick={() => setAbaAtiva('dashboard')}>DASHBOARD  <main style={styles.main}>
    {abaAtiva === 'lista' && (
      <section>
        <div style={styles.controlesGrid}>
          <input 
            type="text" 
            placeholder="BUSCAR AGENDA..." 
            value={busca} 
            onChange={(e) => setBusca(e.target.value)} 
            style={styles.inputBusca}
          />
          <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={styles.selectStatus}>
            <option value="Todos">TODOS OS STATUS</option>
            <option value="Futura">FUTURAS</option>
            <option value="Realizada">REALIZADAS</option>
          </select>
          <button onClick={() => setModoVisao(modoVisao === 'cards' ? 'lista' : 'cards')} style={styles.btnModoVisao}>
            VISÃO: {modoVisao.toUpperCase()}
          </button>
        </div>

        <div style={modoVisao === 'cards' ? styles.gridCards : styles.flexLista}>
          {dadosFiltrados.map((evento, index) => (
            <div key={index} style={styles.cardMondrian} onClick={() => setEventoSelecionado(evento)}>
              <div style={{...styles.faixaCor, backgroundColor: evento.StatusDinâmico === 'Futura' ? PALETA.azulEsverdeado : PALETA.mostarda}} />
              <div style={styles.cardConteudo}>
                <div style={styles.badgeMondrian}>{evento.StatusDinâmico.toUpperCase()}</div>
                <h3 style={styles.cardTitulo}>{evento['Título']?.toUpperCase()}</h3>
                <p style={styles.cardInfo}>DATA: {evento['Início']} {evento['Fim'] ? `- ${evento['Fim']}` : ''}</p>
                <p style={styles.cardInfo}>ARTICULADOR: {evento['ARTICULADOR'] || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    )}

    {abaAtiva === 'dashboard' && (
      <section style={styles.dashboardContainer}>
        <div style={styles.kpiContainer}>
          <div style={{...styles.kpiBox, borderBottom: `8px solid ${PALETA.preto}`}}>
            <span style={styles.kpiLabel}>TOTAL</span>
            <span style={styles.kpiValor}>{dadosProcessados.length}</span>
          </div>
          <div style={{...styles.kpiBox, borderBottom: `8px solid ${PALETA.azulEsverdeado}`}}>
            <span style={styles.kpiLabel}>FUTURAS</span>
            <span style={styles.kpiValor}>{dadosProcessados.filter(e => e.StatusDinâmico === 'Futura').length}</span>
          </div>
          <div style={{...styles.kpiBox, borderBottom: `8px solid ${PALETA.carmesim}`}}>
            <span style={styles.kpiLabel}>REALIZADAS</span>
            <span style={styles.kpiValor}>{dadosProcessados.filter(e => e.StatusDinâmico === 'Realizada').length}</span>
          </div>
        </div>

        <div style={styles.gridGraficos}>
          <div style={styles.boxMondrian}>
            <h3 style={styles.tituloBoxChart}>CLASSE DE ATIVIDADE</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dadosClasse} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{fill: PALETA.preto, fontWeight: 'bold'}}>
                  {dadosClasse.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{border: '4px solid #000', borderRadius: 0}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={styles.boxMondrian}>
            <h3 style={styles.tituloBoxChart}>ARTICULADOR</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dadosArticulador} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{fill: PALETA.preto, fontWeight: 'bold'}}>
                  {dadosArticulador.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{border: '4px solid #000', borderRadius: 0}} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={styles.gridGraficos}>
          <div style={styles.boxMondrian}>
            <h3 style={styles.tituloBoxChart}>MAPA DE CALOR: SANTA CATARINA</h3>
            <div style={{ height: '400px', width: '100%', borderTop: `4px solid ${PALETA.preto}` }}>
              <MapContainer center={[-27.2423, -50.2189]} zoom={6} style={{ height: '100%', width: '100%', background: PALETA.fundo }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
                {eventosComMapa.map((ev, idx) => (
                  <CircleMarker key={idx} center={ev.coords} radius={8} pathOptions={{ color: PALETA.preto, fillColor: PALETA.carmesim, fillOpacity: 0.7, weight: 2 }}>
                    <Popup>{ev['Título']}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div style={styles.boxMondrian}>
            <h3 style={styles.tituloBoxChart}>MAPA DE CALOR: FLORIANÓPOLIS</h3>
            <div style={{ height: '400px', width: '100%', borderTop: `4px solid ${PALETA.preto}` }}>
              <MapContainer center={[-27.5954, -48.5480]} zoom={11} style={{ height: '100%', width: '100%', background: PALETA.fundo }}>
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" />
                {eventosComMapa.map((ev, idx) => (
                  <CircleMarker key={idx} center={ev.coords} radius={12} pathOptions={{ color: PALETA.preto, fillColor: PALETA.mostarda, fillOpacity: 0.7, weight: 2 }}>
                    <Popup>{ev['Título']}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </section>
    )}
  </main>

  {/* MODAL MONDRIAN */}
  {eventoSelecionado && (
    <div style={styles.modalOverlay} onClick={() => setEventoSelecionado(null)}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeaderGrid}>
          <div style={{backgroundColor: PALETA.carmesim, width: '100%', height: '100%', borderRight: `4px solid ${PALETA.preto}`}}></div>
          <h2 style={styles.modalTitulo}>{eventoSelecionado['Título']?.toUpperCase()}</h2>
          <button style={styles.btnFecharModal} onClick={() => setEventoSelecionado(null)}>X</button>
        </div>
        
        <div style={styles.modalCorpo}>
          <div style={styles.infoMondrian}><strong>STATUS:</strong> {eventoSelecionado.StatusDinâmico.toUpperCase()}</div>
          <div style={styles.infoMondrian}><strong>INÍCIO:</strong> {eventoSelecionado['Início']}</div>
          <div style={styles.infoMondrian}><strong>FIM:</strong> {eventoSelecionado['Fim']}</div>
          <div style={styles.infoMondrian}><strong>DURAÇÃO:</strong> {eventoSelecionado['Duração']} min</div>
          <div style={styles.infoMondrian}><strong>ARTICULADOR:</strong> {eventoSelecionado['ARTICULADOR']}</div>
          <div style={styles.infoMondrian}><strong>CLASSE:</strong> {eventoSelecionado['CLASSE DE ATIVIDADE']}</div>
          <div style={{...styles.infoMondrian, gridColumn: '1 / -1'}}><strong>LOCAL:</strong> {eventoSelecionado['Local']}</div>
          
          <div style={styles.descricaoBox}>
            <strong>DESCRIÇÃO:</strong>
            <p style={{whiteSpace: 'pre-wrap', marginTop: '8px'}}>{eventoSelecionado['Descrição'] || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
);}// ESTILOS MONDRIANconst styles = {container: { fontFamily: '"Courier New", Courier, monospace', backgroundColor: PALETA.branco, minHeight: '100vh', color: PALETA.preto },loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '2rem', fontWeight: 'bold', border: 8px solid ${PALETA.preto}, margin: '20px' },erro: { backgroundColor: PALETA.carmesim, color: PALETA.branco, padding: '20px', border: 8px solid ${PALETA.preto}, margin: '20px', fontWeight: 'bold', textAlign: 'center' },header: { display: 'flex', borderBottom: 8px solid ${PALETA.preto}, backgroundColor: PALETA.branco },tituloBox: { padding: '20px 40px', backgroundColor: PALETA.mostarda, borderRight: 8px solid ${PALETA.preto}, fontSize: '2rem', fontWeight: '900', letterSpacing: '2px' },nav: { display: 'flex', flex: 1 },btnNav: { flex: 1, backgroundColor: PALETA.branco, border: 'none', borderRight: 4px solid ${PALETA.preto}, fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },btnNavAtivo: { flex: 1, backgroundColor: PALETA.preto, color: PALETA.branco, border: 'none', borderRight: 4px solid ${PALETA.preto}, fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', outline: 'none' },main: { padding: '40px', maxWidth: '1400px', margin: '0 auto' },controlesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' },inputBusca: { padding: '16px', border: 4px solid ${PALETA.preto}, fontSize: '1.2rem', fontWeight: 'bold', outline: 'none', backgroundColor: PALETA.branco, fontFamily: 'inherit' },selectStatus: { padding: '16px', border: 4px solid ${PALETA.preto}, fontSize: '1.2rem', fontWeight: 'bold', outline: 'none', backgroundColor: PALETA.branco, cursor: 'pointer', fontFamily: 'inherit' },btnModoVisao: { padding: '16px', border: 4px solid ${PALETA.preto}, backgroundColor: PALETA.azulEsverdeado, color: PALETA.branco, fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit' },gridCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' },flexLista: { display: 'flex', flexDirection: 'column', gap: '16px' },cardMondrian: { display: 'flex', border: 6px solid ${PALETA.preto}, backgroundColor: PALETA.branco, cursor: 'pointer', transition: 'transform 0.1s', position: 'relative' },faixaCor: { width: '20px', borderRight: 4px solid ${PALETA.preto} },cardConteudo: { padding: '20px', flex: 1 },badgeMondrian: { display: 'inline-block', border: 3px solid ${PALETA.preto}, padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px', backgroundColor: PALETA.branco },cardTitulo: { margin: '0 0 12px 0', fontSize: '1.2rem', fontWeight: '900', lineHeight: '1.2' },cardInfo: { margin: '4px 0', fontSize: '0.9rem', fontWeight: 'bold' },dashboardContainer: { display: 'flex', flexDirection: 'column', gap: '40px' },kpiContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' },kpiBox: { border: 6px solid ${PALETA.preto}, padding: '24px', backgroundColor: PALETA.branco, display: 'flex', flexDirection: 'column', alignItems: 'center' },kpiLabel: { fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px' },kpiValor: { fontSize: '4rem', fontWeight: '900', marginTop: '12px' },gridGraficos: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '40px' },boxMondrian: { border: 6px solid ${PALETA.preto}, backgroundColor: PALETA.branco },tituloBoxChart: { margin: 0, padding: '16px', borderBottom: 4px solid ${PALETA.preto}, backgroundColor: PALETA.mostarda, fontSize: '1.2rem', fontWeight: '900', textAlign: 'center' },modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '24px' },modalContent: { border: 8px solid ${PALETA.preto}, backgroundColor: PALETA.branco, width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' },modalHeaderGrid: { display: 'grid', gridTemplateColumns: '40px 1fr 60px', borderBottom: 6px solid ${PALETA.preto} },modalTitulo: { padding: '24px', margin: 0, fontSize: '1.8rem', fontWeight: '900' },btnFecharModal: { border: 'none', borderLeft: 6px solid ${PALETA.preto}, backgroundColor: PALETA.branco, fontSize: '2rem', fontWeight: 'bold', cursor: 'pointer' },modalCorpo: { padding: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },infoMondrian: { borderBottom: 3px solid ${PALETA.preto}, paddingBottom: '8px', fontSize: '1.1rem' },descricaoBox: { gridColumn: '1 / -1', border: 4px solid ${PALETA.preto}, padding: '20px', marginTop: '20px', backgroundColor: PALETA.branco }};
