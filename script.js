/* =====================================================================
   SPOTTER CODE v2 — script.js
   JavaScript ES6+ puro. Módulos: Utils · Constantes · Estado · Demo ·
   Cálculos · Modais · Planner (modelo) · Formulários · Gráficos ·
   Views · Ações · Pomodoro (reservado) · Import/Export · Efeitos · Init
   ===================================================================== */
'use strict';

/* =====================================================================
   1. UTILITÁRIOS
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Math.random().toString(36).slice(2, 10);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const z2 = n => String(n).padStart(2, '0');
const fmtDate = d => `${d.getFullYear()}-${z2(d.getMonth() + 1)}-${z2(d.getDate())}`;
const todayStr = () => fmtDate(new Date());
const parseD = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseD(s); d.setDate(d.getDate() + n); return fmtDate(d); };
const diffDays = (a, b) => Math.round((parseD(a) - parseD(b)) / 864e5);
const brDate = s => (s ? s.split('-').reverse().join('/') : '—');
const fmtH = min => (min / 60).toFixed(1);
const fmtHM = min => `${Math.floor(min / 60)}h${z2(Math.round(min % 60))}`;
const avg = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const sum = a => a.reduce((x, y) => x + y, 0);
const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const fmtNum = n => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const toMin = hhmm => { const [h, m] = String(hhmm || '0:0').split(':').map(Number); return (h || 0) * 60 + (m || 0); };
const fromMin = m => `${z2(Math.floor(m / 60) % 24)}:${z2(m % 60)}`;
const mondayOf = s => addDays(s, -((parseD(s).getDay() + 6) % 7));
const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

/** Gerador pseudo-aleatório com semente (dados de demo reprodutíveis). */
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* =====================================================================
   2. CONSTANTES & BASE DO EDITAL
   Observação: agrupamento em blocos e incidência são ESTIMATIVAS editáveis.
   ===================================================================== */
const STATUS = ['Não Visto', 'Teoria Concluída', 'Revisado', 'Dominado'];
const STATUS_WEIGHT = { 'Não Visto': 0, 'Teoria Concluída': 0.5, 'Revisado': 0.8, 'Dominado': 1 };
const INC_WEIGHT = { Alta: 3, Média: 2, Baixa: 1 };
const BLOCK_COLORS = { I: '#d9dee5', II: '#ffb300', III: '#9b6bff' };

/* ---- Caderno de Erros ---- */
const CAT_ATENCAO = 'Falta de Atenção', CAT_TEORIA = 'Teoria', CAT_PULO = 'Pulo do gato';
const ERR_CATS = [CAT_ATENCAO, CAT_TEORIA, CAT_PULO];
const ERR_ORIGINS = ['Tarefa do dia', 'Revisão', 'Simulado'];

/* ---- Simulados ---- */
const MOCK_TYPES = ['Nivelamento', 'Conteúdo', 'Real'];
const BOARDS = ['Cebraspe', 'FGV', 'Vunesp', 'Quadrix', 'Outra'];

/* ---- Planner ---- */
const PLAN_TYPES = ['Lei seca', 'Teoria', 'Flashcards', 'Questões', 'Caderno de Erros', 'Revisão', 'Compromisso', 'Simulado', 'Prova', 'Rotina'];
const STUDY_TYPES = ['Lei seca', 'Teoria', 'Flashcards', 'Questões', 'Caderno de Erros', 'Revisão'];   // contam para a meta diária de blocos
const REGISTER_TYPES = ['Lei seca', 'Teoria', 'Flashcards', 'Questões', 'Revisão', 'Simulado'];                    // têm botão "Registrar estudo"
const MULTI_SUBJ = ['Lei seca', 'Flashcards', 'Questões', 'Revisão'];              // várias matérias
const QUESTION_TYPES = ['Questões'];                           // registram questões e acertos
const TITLE_TYPES = ['Compromisso', 'Simulado', 'Prova', 'Rotina'];                // usam título
const DESC_TYPES = ['Revisão', 'Compromisso', 'Simulado', 'Prova'];                // abrem modal de descrição ao clicar
const TAG_TYPES = ['Revisão', 'Compromisso', 'Simulado', 'Prova'];                 // aparecem no calendário mensal
const TYPE_COLOR = { 'Lei seca': '#2979ff', 'Teoria': '#00e5ff', 'Flashcards': '#9b6bff', 'Questões': '#00f59b', 'Caderno de Erros': '#e8eef5', 'Revisão': '#ffb300', 'Compromisso': '#ff7a45', 'Simulado': '#ff2d55', 'Prova': '#ec407a', 'Rotina': '#5f6b7a' };
const TYPE_ICON = { 'Lei seca': 'fa-scale-balanced', 'Teoria': 'fa-book-open', 'Flashcards': 'fa-clone', 'Questões': 'fa-circle-question', 'Caderno de Erros': 'fa-book-bookmark', 'Revisão': 'fa-arrows-rotate', 'Compromisso': 'fa-calendar-day', 'Simulado': 'fa-file-pen', 'Prova': 'fa-flag-checkered', 'Rotina': 'fa-repeat' };
const FIXED_COLOR_TYPES = ['Compromisso', 'Simulado', 'Prova', 'Rotina', 'Caderno de Erros']; // cor fixa; os demais usam a cor da matéria
const TRAIN_COLOR = '#ff5252';                                                       // rotinas de treino (academia, jiu-jitsu…)
const TRAIN_RE = /treino|academia|jiu|muscula|crossfit|corrida|nata[cç]|luta|funcional/i;
const isTraining = it => it.type === 'Rotina' && TRAIN_RE.test(it.title || '');
const SUBJ_PALETTE = ['#00e5ff', '#2979ff', '#9b6bff', '#ff2d55', '#ffb300', '#00f59b', '#ff7ab6', '#7d96ae', '#4dd0e1', '#c0ca33', '#ff8a65'];
const REMINDERS = [{ v: 'none', l: 'Sem lembrete' }, { v: 'dia', l: 'No dia' }, { v: '1dia', l: '1 dia antes' }, { v: '1semana', l: '1 semana antes' }];
const REM_LEAD = { none: null, dia: 0, '1dia': 1, '1semana': 7 };
let GRID_START = 5, GRID_END = 24, GRID_ROWS = 19;   // faixa visível do cronograma: padrão 5h–24h; amplia sozinha (ver updateGridRange)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];                                  // seg–dom (valores de Date.getDay)
const DAY_LABEL = { 0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb' };

const SUBJECTS = {
  'Língua Portuguesa': { short: 'Português', block: 'I' },
  'Raciocínio Lógico': { short: 'Rac. Lógico', block: 'I' },
  'Informática': { short: 'Informática', block: 'I' },
  'Direito Constitucional': { short: 'D. Const.', block: 'II' },
  'Direito Administrativo': { short: 'D. Adm.', block: 'II' },
  'Direito Penal': { short: 'D. Penal', block: 'II' },
  'Processo Penal': { short: 'Proc. Penal', block: 'II' },
  'Legislação Especial': { short: 'Leg. Especial', block: 'II' },
  'Direitos Humanos': { short: 'D. Humanos', block: 'II' },
  'Contabilidade': { short: 'Contab.', block: 'III' },
  'Estatística': { short: 'Estatística', block: 'III' }
};
// Assuntos do Radar = assuntos do Spotter (data-incidencia.js); nível Alta/Média/Baixa pelo nº de válidas 2009–2025
Object.keys(SUBJECTS).forEach(n => { const d = INC_SPOTTER[n]; SUBJECTS[n].topics = d ? d.items.map(([t, v]) => [t, incLevelOf(v)]) : []; });
const SUBJECT_CATALOG = Object.keys(SUBJECTS);   // as 11 matérias do edital da PF
const SUBJECT_NAMES = [...SUBJECT_CATALOG];       // matérias ATIVAS do concurso atual (alterada in-place por applySubjects)
let CUR_SUBJ = null;                              // { pool:[...], active:[...], custom:[{name,short,block,root,seed?}] } do concurso atual
const shortOf = n => (n.length > 14 ? n.slice(0, 13) + '…' : n);
let CUR_KIND = 'pf';  // concurso atual: 'pf' (Polícia Federal) ou 'prf' (Polícia Rodoviária Federal)
let CUR_INC = true;   // o concurso atual tem base de incidência (só a PF por enquanto)
const KINDS = { pf: { name: 'Polícia Federal', inc: true }, prf: { name: 'Polícia Rodoviária Federal', inc: false } };
const PF_BLOCK = Object.fromEntries(Object.keys(SUBJECTS).map(n => [n, SUBJECTS[n].block]));   // blocos das matérias da PF (a PRF reagrupa)
let _prf = null;
/** Raízes do edital verificado da PRF (ids com prefixo "prf-"; "l" = itens equivalentes da PF). */
const prfRoots = () => parseEditalDSL(EDITAL_PRF_DSL, 'prf-');
/** Matérias da PRF: as em comum usam o nome da PF; as exclusivas viram matérias próprias (raiz = a do edital da PRF). */
function prfSubjects() {
  if (_prf) return JSON.parse(JSON.stringify(_prf));
  const pool = [], custom = [];
  prfRoots().forEach(r => { if (pool.includes(r.subj)) return; pool.push(r.subj); if (!SUBJECT_CATALOG.includes(r.subj)) custom.push({ name: r.subj, short: r.short || ({ 'Noções de Física': 'Física', 'Ética no Serviço Público': 'Ética', 'Geopolítica Brasileira': 'Geopolítica', 'Língua Estrangeira': 'Língua Estr.', 'Legislação de Trânsito': 'Leg. Trânsito' }[r.subj] || shortOf(r.subj)), block: r.block, root: r.id, prf: true }); });
  _prf = { pool, active: [...pool], custom }; return JSON.parse(JSON.stringify(_prf));
}
const prfBlock = () => Object.fromEntries(prfRoots().map(r => [r.subj, r.block]));
/** Normaliza o cadastro de matérias de um estado salvo: pool = matérias que pertencem ao concurso; active = as que aparecem (sem campo = todas as do catálogo). */
function normSubjects(raw) {
  const rc = raw && Array.isArray(raw.custom) ? raw.custom : [];
  const custom0 = rc.filter(c => c && c.name && c.root).map(c => ({ name: String(c.name), short: c.short || shortOf(String(c.name)), block: ['I', 'II', 'III'].includes(c.block) ? c.block : 'II', root: c.root, ...(c.prf ? { prf: true } : {}) }));
  const known = new Set([...SUBJECT_CATALOG, ...custom0.map(c => c.name)]);
  let pool = raw && Array.isArray(raw.pool) ? raw.pool.filter(n => known.has(n)) : [...SUBJECT_CATALOG, ...custom0.map(c => c.name)];
  pool = [...new Set(pool)]; if (!pool.length) pool = [...SUBJECT_CATALOG];
  let active = raw && Array.isArray(raw.active) ? raw.active.filter(n => pool.includes(n)) : [...pool];
  if (!active.length) active = [...pool];
  return { pool, active, custom: custom0.filter(c => pool.includes(c.name)) };
}
/** Define quais matérias existem no concurso em uso: SUBJECTS ganha as próprias e SUBJECT_NAMES vira a lista ativa. */
function applySubjects(sub) {
  if (!sub.pool) sub.pool = [...SUBJECT_CATALOG, ...sub.custom.map(c => c.name)];
  CUR_SUBJ = sub;
  Object.keys(SUBJECTS).forEach(n => { if (!SUBJECT_CATALOG.includes(n)) delete SUBJECTS[n]; });
  sub.custom.forEach(c => { SUBJECTS[c.name] = { short: c.short || shortOf(c.name), block: c.block || 'II', topics: [] }; });
  const pb = CUR_KIND === 'prf' ? prfBlock() : null;
  SUBJECT_CATALOG.forEach(n => { SUBJECTS[n].block = (pb && pb[n]) || PF_BLOCK[n]; });
  SUBJECT_NAMES.length = 0;
  sub.pool.forEach(n => { if (sub.active.includes(n)) SUBJECT_NAMES.push(n); });
}
const subjShort = n => SUBJECTS[n]?.short || n;

/* ---- Revisões (ciclos) ---- */
const INC_LEVELS = ['Alta', 'Média', 'Baixa'];
const INC_COLOR = { Alta: '#ff2d55', Média: '#ffb300', Baixa: '#00f59b' };
const CONTACTS_PRE = { Alta: 6, Média: 4, Baixa: 3 };      // referência pré-edital
const CONTACTS_POST = { Alta: 12, Média: 6, Baixa: 4 };    // referência pós-edital
const DEFAULT_INC = { 'Língua Portuguesa': 'Alta', 'Raciocínio Lógico': 'Média', 'Informática': 'Média', 'Direito Constitucional': 'Alta', 'Direito Administrativo': 'Alta', 'Direito Penal': 'Alta', 'Processo Penal': 'Alta', 'Legislação Especial': 'Alta', 'Direitos Humanos': 'Média', 'Contabilidade': 'Baixa', 'Estatística': 'Baixa' };
const REVIEW_SRC = ['Teoria', 'Lei seca'];                  // tipos de estudo que alimentam as revisões
const SCHEMA = 4;
/** Dicionário padrão de temas para a análise dos debriefings (editável em Configurações). */
const DEFAULT_THEMES = [
  { name: 'Gestão de tempo', words: ['tempo', 'corrid', 'pressa', 'cronometr', 'ritmo', 'demor', 'apress'] },
  { name: 'Emocional / ansiedade', words: ['ansios', 'ansied', 'nervos', 'emocion', 'pressao', 'medo', 'tens', 'estress', 'calm', 'tranquil', 'confian', 'relax', 'seguran'] },
  { name: 'Sono e descanso', words: ['sono', 'dormi', 'descans', 'cansad', 'cansaco', 'fadiga', 'exaust'] },
  { name: 'Estratégia / ordem das matérias', words: ['estrateg', 'ordem', 'comecei', 'comecar', 'planejament', 'sequencia'] },
  { name: 'Atenção e leitura', words: ['atenc', 'desatenc', 'distra', 'leitura', 'li errad', 'pegadinha', 'enunciad', 'interpreta'] },
  { name: 'Foco e concentração', words: ['foco', 'focad', 'concentr'] },
  { name: 'Alimentação e saúde', words: ['aliment', 'comida', 'almoc', 'lanche', 'fome', 'cafe', 'saude', 'doente', 'hidrat'] },
  { name: 'Chute / insegurança', words: ['chute', 'chutei', 'inseguran', 'duvida', 'indecis'] },
  { name: 'Domínio do conteúdo', words: ['conteudo', 'teoria', 'revis', 'nao sabia', 'fraco', 'dominei', 'domino', 'lacuna'] },
  { name: 'Redação', words: ['redacao', 'discursiv'] },
  { name: 'Ambiente e local', words: ['barulh', 'ambiente', 'calor', 'frio', 'cadeira'] }
];

/* =====================================================================
   3. ESTADO & PERSISTÊNCIA (localStorage)
   ===================================================================== */
let STORE_KEY = null;   // definido ao entrar em um concurso (spotter-u:<usuário>:c:<id>)
let S; // estado global
let _revCache = null; // cache do motor de revisões (válido só durante um render)
const UI = {
  view: 'overview',
  plannerDate: todayStr(),
  weekStart: mondayOf(todayStr()),
  month: todayStr().slice(0, 7),
  routineMonth: todayStr().slice(0, 7), manage: false,
  annualYear: new Date().getFullYear(),
  radar: { q: '', subject: '', inc: '', year: '', status: '', assunto: '' },
  edital: { q: '', edit: false, open: {} },
  revSubj: '', revList: -1,
  revYear: new Date().getFullYear(),
  revIdx: null, cfgTab: 'conta',
  err: { cat: '', mock: '' },
  openMock: null
};

function buildSyllabus(statusFn = () => 'Não Visto') {
  const rows = [];
  SUBJECT_NAMES.forEach(subject => SUBJECTS[subject].topics.forEach(([topic, incidence]) => {
    rows.push({ id: uid(), subject, topic, incidence, status: statusFn(subject, topic), custom: false });
  }));
  return rows;
}
const defaultRev = () => {
  const subj = {};
  SUBJECT_NAMES.forEach(n => { const inc = DEFAULT_INC[n] || 'Média'; subj[n] = { inc, contacts: CONTACTS_PRE[inc], c0: null, contactsPre: null, blocks: {} }; });
  return { startMonth: todayStr().slice(0, 7), editalOut: false, editalDate: '', subj, done: {} };
};
/** Raiz de uma matéria própria (as da PRF vêm do edital verticalizado dela). */
function customRoot(c) {
  const src = c.prf ? prfRoots().find(r => r.id === c.root) : null;
  return src ? src : { id: c.root, t: c.name, subj: c.name, root: true, c: [] };
}
/** Fonte do edital verificado do concurso atual. */
const edSourceRoots = () => (CUR_KIND === 'prf' ? prfRoots() : parseEditalDSL(EDITAL_DSL));
/** Árvore do edital só com as matérias ativas (+ uma raiz para cada matéria própria da PF, se houver). `skip` = ids de raízes a omitir (ex.: "ti"). */
function buildEditalTree(sub, skip = []) {
  const tree = edSourceRoots().filter(r => !skip.includes(r.id) && (!r.subj || sub.active.includes(r.subj)));
  sub.custom.forEach(c => { if (sub.active.includes(c.name) && !tree.some(r => r.id === c.root)) tree.push(customRoot(c)); });
  return tree;
}
const defaultState = () => ({
  schema: SCHEMA, kind: CUR_KIND,
  settings: { examDate: addDays(todayStr(), 120), cutoff: 70, dailyGoal: 4, lastCut: null },
  syllabus: CUR_INC ? buildSyllabus() : [], hasInc: CUR_INC, plan: [], mocks: [], strategies: [], errors: [], log: [],
  rev: defaultRev(), themes: DEFAULT_THEMES.map(t => ({ name: t.name, words: [...t.words] })),
  edital: { v: 1, tree: buildEditalTree({ active: [...SUBJECT_NAMES], custom: (CUR_SUBJ && CUR_SUBJ.custom) || [] }, CUR_INC ? [] : ['ti']), checks: {} }, routineColors: {},
  subjects: { pool: [...((CUR_SUBJ && CUR_SUBJ.pool) || SUBJECT_NAMES)], active: [...SUBJECT_NAMES], custom: ((CUR_SUBJ && CUR_SUBJ.custom) || []).map(c => ({ ...c })) }
});
/** Converte dados salvos em versões anteriores para o formato atual (sem perder registros). */
function migrate(p) {
  CUR_KIND = p.kind === 'prf' ? 'prf' : 'pf'; CUR_INC = KINDS[CUR_KIND].inc;
  const sub = normSubjects(p.subjects); applySubjects(sub);
  const d = defaultState();
  const st = { ...d, ...p, subjects: sub, settings: { ...d.settings, ...(p.settings || {}) } };
  st.hasInc = CUR_INC; st.kind = CUR_KIND;
  ['syllabus', 'plan', 'mocks', 'strategies', 'errors', 'log'].forEach(k => { if (!Array.isArray(st[k])) st[k] = d[k]; });
  // v4: assuntos do Radar passam a ser os do Spotter (preserva status e assuntos próprios com progresso)
  if ((p.schema || 0) < 4) {
    const old = st.syllabus, fresh = buildSyllabus();
    fresh.forEach(r => { const o = old.find(x => x.subject === r.subject && norm(x.topic) === norm(r.topic)); if (o) r.status = o.status; });
    old.forEach(o => { if (fresh.some(r => r.subject === o.subject && norm(r.topic) === norm(o.topic))) return; if (o.custom || o.status !== 'Não Visto') fresh.push({ ...o, custom: true }); });
    st.syllabus = fresh;
    // v4: item "fixo" vira série (repete no dia da semana da data original)
    st.plan.forEach(it => { it.repeat = it.fixed ? [wdOf(it.date)] : (it.repeat || []); it.skip = it.skip || []; delete it.fixed; });
  }
  st.plan.forEach(it => { if (!Array.isArray(it.repeat)) it.repeat = []; if (!Array.isArray(it.skip)) it.skip = []; if (!it.regs) it.regs = {}; if (!it.doneDates) it.doneDates = []; });
  if (!st.edital || !Array.isArray(st.edital.tree) || !st.edital.tree.length) st.edital = d.edital;
  if (!st.edital.checks) st.edital.checks = {};
  sub.custom.forEach(c => { if (sub.active.includes(c.name) && !st.edital.tree.some(r => r.id === c.root)) st.edital.tree.push(customRoot(c)); });
  if (!st.routineColors || typeof st.routineColors !== 'object') st.routineColors = {};
  // Matérias novas (ex.: Direitos Humanos) entram no radar
  if (CUR_INC) SUBJECT_NAMES.forEach(n => { if (!st.syllabus.some(x => x.subject === n)) SUBJECTS[n].topics.forEach(([topic, incidence]) => st.syllabus.push({ id: uid(), subject: n, topic, incidence, status: 'Não Visto', custom: false })); });
  // Revisões antigas (24h/7d/30d/60d) viram registros de assunto estudado (uma única vez)
  if ((p.schema || 0) < 3 && Array.isArray(p.reviews)) p.reviews.forEach(r => { if (r && r.topic && r.subject) st.log.push({ id: uid(), date: r.baseDate || todayStr(), subject: r.subject, minutes: 0, questions: 0, hits: 0, src: 'Teoria', topic: r.topic }); });
  delete st.reviews;
  // Configuração de revisão
  const rev = { ...defaultRev(), ...(p.rev || {}) };
  rev.subj = { ...defaultRev().subj, ...((p.rev && p.rev.subj) || {}) };
  SUBJECT_NAMES.forEach(n => { rev.subj[n] = { ...defaultRev().subj[n], ...rev.subj[n] }; if (!rev.subj[n].blocks) rev.subj[n].blocks = {}; });
  if (!rev.done) rev.done = {};
  st.rev = rev;
  if (!Array.isArray(st.themes) || !st.themes.length) st.themes = d.themes;
  st.mocks.forEach(m => { if (m.debriefBad === undefined) m.debriefBad = ''; if (m.debriefGood === undefined) m.debriefGood = ''; });
  st.errors.forEach(e => { ['reason', 'study', 'pitfall', 'bizu'].forEach(k => { if (e[k] === undefined) e[k] = ''; }); });
  st.schema = SCHEMA;
  return st;
}
function loadState() {
  const m = Auth.meta(), kind = m && m.kind === 'prf' ? 'prf' : 'pf';
  try {
    const raw = STORE_KEY && localStorage.getItem(STORE_KEY);
    if (raw) { const p = JSON.parse(raw); p.kind = kind; return migrate(p); }   // o tipo do concurso (e não o ícone) decide se há Radar
  } catch (e) { console.warn('Falha ao ler localStorage', e); }
  return freshState(kind);
}
/** Estado inicial de um concurso: PF (com Radar e as 11 matérias) ou PRF (14 matérias do edital dela, sem Radar). */
function freshState(kind) {
  CUR_KIND = kind; CUR_INC = KINDS[kind].inc;
  applySubjects(kind === 'prf' ? normSubjects(prfSubjects()) : normSubjects(null));
  const st = defaultState(); st.kind = kind; st.hasInc = CUR_INC; return st;
}
/* ---- Progresso compartilhado PF ⇄ PRF (Edital Verificado) ----
   Cada item da PRF pode apontar para itens equivalentes da PF (" @ ids" no edital-prf; ou título idêntico com 3+ palavras).
   Marcou na PRF → marca os itens da PF; marcou na PF → o item da PRF fica marcado quando TODOS os itens da PF ligados a ele estão marcados. */
let _links = null, _chkSnap = {};
function sharedLinks() {
  if (_links) return _links;
  const pf = parseEditalDSL(EDITAL_DSL), idx = {}, all = (n, f) => { f(n); (n.c || []).forEach(x => all(x, f)); }, lv = n => (n.c && n.c.length ? n.c.flatMap(lv) : [n]);
  pf.forEach(r => all(r, n => { idx[n.id] = n; }));
  const toks = t => norm(t).split(/\s+/).filter(w => w.length > 2);
  const byTitle = {}; pf.forEach(r => all(r, n => { if (n !== r) (byTitle[r.subj + '|' + norm(n.t)] = byTitle[r.subj + '|' + norm(n.t)] || n); }));
  const fwd = {}, rev = {};
  prfRoots().forEach(r => all(r, n => {
    if (n.c && n.c.length) return;
    let src = (n.l || []).map(id => idx[id]).filter(Boolean);
    if (!n.l && toks(n.t).length >= 3 && byTitle[r.subj + '|' + norm(n.t)]) src = [byTitle[r.subj + '|' + norm(n.t)]];
    const ids = [...new Set(src.flatMap(lv).map(x => x.id))]; if (!ids.length) return;
    fwd[n.id] = ids; ids.forEach(i => (rev[i] = rev[i] || []).push(n.id));
  }));
  return (_links = { fwd, rev });
}
const otherMeta = kind => Auth.fixed().find(c => c.kind === (kind === 'pf' ? 'prf' : 'pf'));
function readOther(m) { try { return JSON.parse(localStorage.getItem(Auth.dataKey(Auth.user, m.id)) || 'null'); } catch (e) { return null; } }
function writeOther(m, st) { try { localStorage.setItem(Auth.dataKey(Auth.user, m.id), JSON.stringify(st)); } catch (e) { /* sem espaço: ignora */ } }
const setChk = (ck, id, v) => { if (v) ck[id] = true; else delete ck[id]; };
/** Ao salvar: leva para o outro concurso as marcações que mudaram. */
function pushShared() {
  if (!S || !S.edital || (S.kind !== 'pf' && S.kind !== 'prf')) return;
  const cur = S.edital.checks || (S.edital.checks = {}), prev = _chkSnap, changed = [];
  new Set([...Object.keys(cur), ...Object.keys(prev)]).forEach(id => { if (!!cur[id] !== !!prev[id]) changed.push(id); });
  if (changed.length) {
    const m = otherMeta(S.kind), o = m && readOther(m), L = sharedLinks();
    if (o && o.edital) {
      const ock = o.edital.checks || (o.edital.checks = {});
      if (S.kind === 'prf') {
        const touched = new Set();
        changed.forEach(id => { (L.fwd[id] || []).forEach(pfId => { setChk(ock, pfId, !!cur[id]); (L.rev[pfId] || []).forEach(x => touched.add(x)); }); });
        touched.forEach(x => setChk(cur, x, L.fwd[x].every(pfId => ock[pfId])));
      } else {
        changed.forEach(id => { (L.rev[id] || []).forEach(x => setChk(ock, x, L.fwd[x].every(pfId => cur[pfId]))); });
      }
      writeOther(m, o);
    }
  }
  _chkSnap = { ...cur };
}
/** Ao entrar: junta o que já estava marcado nos dois lados (só marca, nunca desmarca). */
function pullShared() {
  if (!S || !S.edital || (S.kind !== 'pf' && S.kind !== 'prf')) { _chkSnap = {}; return; }
  const m = otherMeta(S.kind), o = m && readOther(m), L = sharedLinks(), cur = S.edital.checks || (S.edital.checks = {});
  if (o && o.edital) {
    const ock = o.edital.checks || (o.edital.checks = {}); let mine = false, theirs = false;
    const prfCk = S.kind === 'prf' ? cur : ock, pfCk = S.kind === 'prf' ? ock : cur;
    Object.keys(L.fwd).forEach(x => {
      const ps = L.fwd[x], all = ps.every(i => pfCk[i]);
      if (prfCk[x] && !all) { ps.forEach(i => { if (!pfCk[i]) { pfCk[i] = true; if (pfCk === cur) mine = true; else theirs = true; } }); }
      else if (!prfCk[x] && all) { prfCk[x] = true; if (prfCk === cur) mine = true; else theirs = true; }
    });
    if (theirs) writeOther(m, o);
    if (mine) save();
  }
  _chkSnap = { ...cur };
}
function save() { if (!STORE_KEY) return; pushShared(); try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { toast('Não foi possível salvar (armazenamento cheio?)', 'err'); } }
/** Persiste e re-renderiza. */
/** Caderno de Erros do dia: fica "Feito" sozinho quando ≥1 erro foi resolvido hoje e não restam erros em aberto. O tempo (duração do bloco) entra nas horas totais, sem matéria. */
function syncCaderno() {
  const t = todayStr(), open = S.errors.filter(e => !e.resolved).length, ok = open === 0 && S.errors.some(e => e.resolved && e.resolvedDate === t);
  let changed = false;
  occurrences(t).forEach(({ it }) => {
    if (it.type !== 'Caderno de Erros') return;
    const ids = (it.regs || {})[t] || [], auto = S.log.find(l => ids.includes(l.id) && l.auto);
    if (ok && !isDone(it, t)) {
      const l = { id: uid(), date: t, subject: '', minutes: durMin(it), questions: 0, hits: 0, src: 'Caderno de Erros', topic: '', planId: it.id, planDate: t, auto: true };
      S.log.push(l); it.regs = it.regs || {}; it.regs[t] = [l.id]; it.doneDates = (it.doneDates || []).concat(t); changed = true;
    } else if (!ok && auto) {
      S.log = S.log.filter(l => l !== auto); it.regs[t] = ids.filter(i => i !== auto.id); if (!it.regs[t].length) delete it.regs[t];
      it.doneDates = (it.doneDates || []).filter(x => x !== t); changed = true;
    }
  });
  return changed;
}
function commit() { syncCaderno(); save(); renderAll(); }

/* =====================================================================
   3b. CONTAS, CONCURSOS (perfis) E LOGIN
   Armazenamento local (sem servidor): usuários em `spotter-users-v1`, sessão em
   `spotter-session-v1`, e um estado completo por concurso em `spotter-u:<usuário>:c:<id>`.
   Senhas guardadas com sal + SHA-256 iterado (não é proteção contra quem acessa o navegador).
   ===================================================================== */
const K_USERS = 'spotter-users-v1', K_SESS = 'spotter-session-v1', K_LEGACY = 'spotter-code-v2', K_MENU = 'spotter-menu-collapsed';
const lsGet = (k, d = null) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const sha256 = (() => {
  const K = [], H0 = [], primes = [];
  for (let n = 2; primes.length < 64; n++) if (primes.every(p => n % p)) primes.push(n);
  const frac = x => Math.floor((x - Math.floor(x)) * 4294967296);
  primes.forEach((p, i) => { K[i] = frac(Math.cbrt(p)); if (i < 8) H0[i] = frac(Math.sqrt(p)); });
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  return bytes => {
    const l = bytes.length, nb = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(nb); m.set(bytes); m[l] = 0x80;
    const dv = new DataView(m.buffer); dv.setUint32(nb - 4, (l * 8) >>> 0); dv.setUint32(nb - 8, Math.floor(l * 8 / 4294967296));
    const h = H0.slice(), w = new Array(64);
    for (let o = 0; o < nb; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = dv.getUint32(o + i * 4);
      for (let i = 16; i < 64; i++) { const a = w[i - 15], b = w[i - 2]; w[i] = (w[i - 16] + (rotr(a, 7) ^ rotr(a, 18) ^ (a >>> 3)) + w[i - 7] + (rotr(b, 17) ^ rotr(b, 19) ^ (b >>> 10))) | 0; }
      let [a, b, c, d, e, f, g, hh] = h;
      for (let i = 0; i < 64; i++) {
        const t1 = (hh + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) | 0, t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        hh = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      [a, b, c, d, e, f, g, hh].forEach((v, i) => { h[i] = (h[i] + v) | 0; });
    }
    const out = new Uint8Array(32), ov = new DataView(out.buffer); h.forEach((v, i) => ov.setUint32(i * 4, v >>> 0)); return out;
  };
})();
const hex8 = u8 => [...u8].map(b => b.toString(16).padStart(2, '0')).join('');
const hashPw = (pw, salt) => {
  const te = new TextEncoder(), base = te.encode(salt + ':' + pw); let h = sha256(base);
  for (let i = 0; i < 4000; i++) { const x = new Uint8Array(32 + base.length); x.set(h); x.set(base, 32); h = sha256(x); }
  return hex8(h);
};
const newSalt = () => { const a = new Uint8Array(16); (crypto && crypto.getRandomValues) ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.floor(Math.random() * 256); }); return hex8(a); };
const NICK_RE = /^[A-Za-z0-9._-]{3,24}$/;

const Auth = {
  user: null, cid: null,
  users: () => lsGet(K_USERS, {}),
  idxKey: u => `spotter-u:${u}:idx`,
  dataKey: (u, id) => `spotter-u:${u}:c:${id}`,
  concursos() { return this.user ? lsGet(this.idxKey(this.user), []) : []; },
  setConcursos(list) { lsSet(this.idxKey(this.user), list); },
  meta(id = this.cid) { return this.concursos().find(c => c.id === id) || null; },
  /** Só para os testes automáticos: cria uma conta se `window.SPOTTER_DEV = {nick, pw}` existir. No programa publicado não há conta pré-criada. */
  seed() {
    const dev = typeof window !== 'undefined' && window.SPOTTER_DEV;
    if (!dev || !dev.nick || !dev.pw || Object.keys(this.users()).length) return;
    this.createUser(dev.nick, dev.pw);
    const key = dev.nick.toLowerCase(), id = uid(); lsSet(this.idxKey(key), [{ id, name: 'Polícia Federal', icon: null, kind: 'pf', created: todayStr() }]);
    try { const old = localStorage.getItem(K_LEGACY); if (old) localStorage.setItem(this.dataKey(key, id), old); } catch (e) { /* sem dados antigos */ }
  },
  /** Backup completo: todos os concursos da conta logada (sem senha). */
  exportAll() {
    const concursos = this.concursos().map(meta => ({ meta, state: lsGet(this.dataKey(this.user, meta.id), null) }));
    return { app: 'SPOTTER CODE', format: 'spotter-backup', version: 1, exported: new Date().toISOString(), concursos };
  },
  /** Restaura um backup completo. PF e PRF substituem os atuais; concursos antigos entram como "legacy" (ocultos). */
  importAll(obj) {
    if (!obj || obj.format !== 'spotter-backup' || !Array.isArray(obj.concursos)) return { ok: false, error: 'Este arquivo não é um backup do SPOTTER CODE.' };
    const list = this.concursos(); let n = 0;
    for (const item of obj.concursos) {
      const m = item && item.meta, st = item && item.state;
      if (!m || !st || typeof st !== 'object' || Array.isArray(st)) continue;
      const kind = m.kind === 'pf' || m.kind === 'prf' ? m.kind : 'legacy';
      const icon = m.icon == null || (typeof m.icon === 'string' && /^(data:image\/(png|jpeg|webp);base64,|builtin:(pf|prf)$)/.test(m.icon)) ? (m.icon || null) : null;
      let target = kind === 'legacy' ? null : list.find(c => c.kind === kind);
      if (!target) { target = { id: uid(), name: kind === 'legacy' ? String(m.name || 'Concurso antigo').slice(0, 60) : KINDS[kind].name, icon, kind, created: todayStr() }; list.push(target); }
      else target.icon = icon;
      if (!lsSet(this.dataKey(this.user, target.id), st)) return { ok: false, error: 'Sem espaço no navegador para restaurar o backup.' };
      n++;
    }
    if (!n) return { ok: false, error: 'O backup não tem nenhum concurso válido.' };
    this.setConcursos(list); this.ensureFixed();
    if (this.cid && this.meta(this.cid)) this.enter(this.cid);
    return { ok: true, n };
  },
  createUser(nick, pw) { const u = this.users(), salt = newSalt(); u[nick.toLowerCase()] = { nick, salt, hash: hashPw(pw, salt), created: todayStr() }; lsSet(K_USERS, u); },
  register(nick, pw, pw2) {
    nick = String(nick || '').trim();
    if (!nick || !pw) return { ok: false, error: 'Informe usuário e senha.' };
    if (!NICK_RE.test(nick)) return { ok: false, error: 'Usuário: 3 a 24 caracteres (letras, números, ponto, hífen ou _).' };
    if (pw.length < 8) return { ok: false, error: 'A senha deve ter pelo menos 8 caracteres.' };
    if (pw !== pw2) return { ok: false, error: 'As senhas não conferem.' };
    if (this.users()[nick.toLowerCase()]) return { ok: false, error: 'Este usuário já existe.' };
    this.createUser(nick, pw); return this.login(nick, pw);
  },
  login(nick, pw) {
    nick = String(nick || '').trim();
    if (!nick || !pw) return { ok: false, error: 'Informe usuário e senha.' };
    const u = this.users()[nick.toLowerCase()];
    if (!u || hashPw(pw, u.salt) !== u.hash) return { ok: false, error: 'Usuário ou senha incorretos.' };
    this.user = nick.toLowerCase(); this.cid = null; this.ensureFixed(); lsSet(K_SESS, { user: this.user, cid: null }); return { ok: true };
  },
  logout() { this.user = null; this.cid = null; STORE_KEY = null; try { localStorage.removeItem(K_SESS); } catch (e) { /* ignora */ } showAuth('login'); },
  changePassword(cur, nw, nw2) {
    const us = this.users(), u = us[this.user];
    if (!u || hashPw(cur, u.salt) !== u.hash) return { ok: false, error: 'Senha atual incorreta.' };
    if (nw.length < 8) return { ok: false, error: 'A nova senha deve ter pelo menos 8 caracteres.' };
    if (nw !== nw2) return { ok: false, error: 'As senhas não conferem.' };
    u.salt = newSalt(); u.hash = hashPw(nw, u.salt); lsSet(K_USERS, us); return { ok: true };
  },
  /** Os 2 concursos fixos (PF e PRF), nessa ordem. */
  fixed() { const l = this.concursos(); return ['pf', 'prf'].map(k => l.find(c => c.kind === k)).filter(Boolean); },
  /** Garante que o usuário tenha exatamente PF e PRF. Concursos antigos (criados em versões anteriores) não são apagados: só deixam de aparecer. */
  ensureFixed() {
    if (!this.user) return;
    let list = this.concursos(), changed = false;
    const score = c => {
      let sc = 0;
      try { const raw = JSON.parse(localStorage.getItem(this.dataKey(this.user, c.id)) || 'null'); if (raw && Array.isArray(raw.syllabus) && raw.syllabus.length) sc += 4; else if (raw && raw.hasInc !== false) sc += 1; } catch (e) { /* ilegível */ }
      if (c.icon === 'builtin:pf') sc += 2; if (/pol[ií]cia federal/i.test(c.name || '') && !/rodovi/i.test(c.name || '')) sc += 1; return sc;
    };
    ['pf', 'prf'].forEach(k => {
      if (list.some(c => c.kind === k)) return;
      const cand = list.filter(c => !c.kind).map(c => ({ c, sc: score(c) })).sort((a, b) => b.sc - a.sc)[0];
      if (k === 'pf' && cand && cand.sc > 0) { cand.c.kind = 'pf'; cand.c.name = KINDS.pf.name; changed = true; }
      else { list.push({ id: uid(), name: KINDS[k].name, icon: null, kind: k, created: todayStr() }); changed = true; }
    });
    list.forEach(c => { if (!c.kind) { c.kind = 'legacy'; changed = true; } });
    if (changed) this.setConcursos(list);
  },
  updateConcurso(id, patch) { this.setConcursos(this.concursos().map(c => (c.id === id ? { ...c, ...patch } : c))); },
  /** Entra no concurso: carrega o estado dele e mostra o app. */
  enter(id) {
    if (!this.meta(id)) return false;
    this.cid = id; lsSet(K_SESS, { user: this.user, cid: id }); STORE_KEY = this.dataKey(this.user, id);
    S = loadState(); pullShared(); if (syncCaderno()) save();
    UI.radar = { q: '', subject: '', inc: '', year: '', status: '', assunto: '' }; UI.revSubj = ''; fillSubjectSelects();
    Object.assign(UI, { revIdx: null, openMock: null, err: { cat: '', mock: '' }, plannerDate: todayStr(), weekStart: mondayOf(todayStr()), month: todayStr().slice(0, 7), view: 'overview' });
    showApp(); return true;
  },
  boot() {
    const s = lsGet(K_SESS), us = this.users();
    if (s && s.user && us[s.user]) { this.user = s.user; this.ensureFixed(); if (s.cid && this.meta(s.cid)) { this.enter(s.cid); return; } showAuth('profiles'); return; }
    showAuth('login');
  }
};
const iconSrc = m => { if (!m) return null; const ic = m.icon || (m.kind ? 'builtin:' + m.kind : ''); return !ic ? null : ic === 'builtin:pf' ? ASSETS.pf : ic === 'builtin:prf' ? ASSETS.prf : ic; };
const iconHTML = (m, cls = '') => { const src = iconSrc(m); return src ? `<img class="${cls}" src="${esc(src)}" alt="">` : `<i class="fa-solid fa-shield-halved ${cls}"></i>`; };
function fillSubjectSelects() { const el = $('#radarSubject'); if (el) el.innerHTML = optHTML([{ v: '', l: 'Todas as matérias' }].concat(SUBJECT_NAMES), UI.radar.subject); }
/** Garante assuntos do Radar, raiz do edital e configuração de revisão de uma matéria (ao ativá-la ou criá-la). */
function ensureSubjectData(name) {
  if (SUBJECT_CATALOG.includes(name)) {
    if (S.hasInc && !S.syllabus.some(x => x.subject === name)) SUBJECTS[name].topics.forEach(([topic, incidence]) => S.syllabus.push({ id: uid(), subject: name, topic, incidence, status: 'Não Visto', custom: false }));
    if (!S.edital.tree.some(r => r.subj === name)) edSourceRoots().filter(r => r.subj === name && (S.hasInc || r.id !== 'ti')).forEach(r => S.edital.tree.push(r));
  } else { const c = S.subjects.custom.find(x => x.name === name); if (c && !S.edital.tree.some(r => r.id === c.root)) S.edital.tree.push(customRoot(c)); }
  if (!S.rev.subj[name]) { const inc = DEFAULT_INC[name] || 'Média'; S.rev.subj[name] = { inc, contacts: CONTACTS_PRE[inc], c0: null, contactsPre: null, blocks: {} }; }
}
function resetSubjectUI() {
  if (UI.radar.subject && !SUBJECT_NAMES.includes(UI.radar.subject)) UI.radar.subject = '';
  if (UI.revSubj && !SUBJECT_NAMES.includes(UI.revSubj)) UI.revSubj = '';
  fillSubjectSelects();
}
/** Liga/desliga uma matéria do concurso atual. Desligar só esconde: os dados continuam guardados. */
function setSubjectActive(name, on) {
  const act = new Set(S.subjects.active);
  if (on) act.add(name); else { act.delete(name); if (!act.size) { toast('O concurso precisa ter ao menos uma matéria.', 'err'); return false; } }
  S.subjects.active = S.subjects.pool.filter(n => act.has(n)); applySubjects(S.subjects);
  if (on) ensureSubjectData(name);
  resetSubjectUI(); commit(); return true;
}
function renderCfgSubjects() {
  const host = $('#cfgSubjList'); if (!host) return;
  host.innerHTML = S.subjects.pool.map(n => {
    const on = S.subjects.active.includes(n), a = esc(n);
    return `<div class="subj-row ${on ? '' : 'off'}"><label class="chk"><input type="checkbox" data-action="subj-toggle" data-n="${a}" ${on ? 'checked' : ''}> ${a}</label></div>`;
  }).join('');
}
/** Reduz uma imagem enviada (PNG/JPG) para um ícone de até 256 px. */
function readIcon(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 256 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.max(1, Math.round(im.width * k)); c.height = Math.max(1, Math.round(im.height * k)); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.88)); }; im.onerror = rej; im.src = r.result; };
    r.onerror = rej; r.readAsDataURL(file);
  });
}
function showAuth(which) {
  $('.app').hidden = true; $('#auth').hidden = false;
  $('#loginView').hidden = which !== 'login'; $('#profilesView').hidden = which !== 'profiles';
  if (which === 'login') { authMode('login'); $('#authUser').value = ''; $('#authPass').value = ''; $('#authErr').textContent = ''; setTimeout(() => $('#authUser').focus(), 30); }
  else renderProfiles();
}
function showApp() { $('#auth').hidden = true; $('.app').hidden = false; renderBrand(); applyMenuState(); showView('overview'); }
function renderBrand() {
  const m = Auth.meta(); if (!m) return;
  $('#brandIcon').innerHTML = iconHTML(m); $('#brandName').textContent = m.name; $('#brand').title = m.name;
}
function authMode(mode) {
  const reg = mode === 'register';
  $('#loginForm').dataset.mode = mode;
  $('#authConfirmRow').hidden = !reg; $('#authSubmit').textContent = reg ? 'Cadastrar' : 'Entrar';
  $('#authSwitchTxt').textContent = reg ? 'Já tem uma conta?' : 'Não tem uma conta?'; $('#authSwitch').textContent = reg ? 'Entrar' : 'Cadastre-se';
  $('#authErr').textContent = ''; $('#authPass').autocomplete = reg ? 'new-password' : 'current-password';
}
function renderProfiles() {
  const list = Auth.fixed(), us = Auth.users()[Auth.user];
  $('#profUser').textContent = us ? us.nick : '';
  $('#profilesView').classList.toggle('manage', UI.manage);
  $('#profManage').textContent = UI.manage ? 'Concluído' : 'Trocar ícones';
  $('#profGrid').innerHTML = list.map(c => `<div class="prof" data-prof="${c.id}" tabindex="0" role="button" aria-label="Abrir ${esc(c.name)}"><div class="prof-ic">${iconHTML(c)}<span class="prof-edit" data-pedit="${c.id}" title="Editar"><i class="fa-solid fa-pen"></i></span></div><span class="prof-name">${esc(c.name)}</span></div>`).join('');
}
/** Troca do ícone do concurso (o nome e o tipo são fixos; sem ícone próprio usa o brasão padrão do concurso). */
function formConcurso(meta, after) {
  if (!meta) return;
  let icon = meta.icon || null;
  const prev = () => { const el = $('#cnPrev'); if (el) el.innerHTML = iconHTML({ icon, kind: meta.kind }, 'cn-img'); };
  openForm({
    title: `Ícone — ${meta.name}`,
    fields: [{ type: 'custom', full: true, html: '<label>Ícone (PNG ou JPG)</label><div class="cn-row"><div class="cn-prev" id="cnPrev"></div><input type="file" id="cnFile" accept="image/png,image/jpeg,image/webp"><button type="button" class="btn sm ghost" id="cnClear">Usar brasão padrão</button></div>' }],
    onMount: form => {
      prev();
      $('#cnFile', form).onchange = async e => { const f = e.target.files[0]; if (!f) return; try { icon = await readIcon(f); prev(); } catch (err) { toast('Não foi possível ler a imagem.', 'err'); } };
      $('#cnClear', form).onclick = () => { icon = null; $('#cnFile', form).value = ''; prev(); };
    },
    onSubmit: () => { Auth.updateConcurso(meta.id, { icon }); if (Auth.cid === meta.id) renderBrand(); if (after) after(); toast('Ícone atualizado', 'ok'); }
  });
}
function formPassword() {
  openForm({
    title: 'Alterar senha',
    fields: [{ name: 'cur', label: 'Senha atual', type: 'password', required: true, full: true }, { name: 'nw', label: 'Nova senha (mín. 8 caracteres)', type: 'password', required: true, full: true }, { name: 'nw2', label: 'Confirmar nova senha', type: 'password', required: true, full: true }],
    validate: d => { const r = Auth.changePassword(d.cur, d.nw, d.nw2); return r.ok ? '' : r.error; },
    onSubmit: () => toast('Senha alterada', 'ok')
  });
}
function applyMenuState() { const c = !!lsGet(K_MENU, false); $('.app').classList.toggle('collapsed', c); const b = $('#menuCollapse'); if (b) { b.title = c ? 'Expandir menu' : 'Recolher menu'; b.setAttribute('aria-label', b.title); } }
function bindAuthEvents() {
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault(); const reg = $('#loginForm').dataset.mode === 'register';
    $('#authErr').textContent = '';
    const r = reg ? Auth.register($('#authUser').value, $('#authPass').value, $('#authPass2').value) : Auth.login($('#authUser').value, $('#authPass').value);
    if (!r.ok) { $('#authErr').textContent = r.error; return; }
    UI.manage = false; showAuth('profiles');
  });
  $('#authSwitch').addEventListener('click', e => { e.preventDefault(); authMode($('#loginForm').dataset.mode === 'register' ? 'login' : 'register'); });
  $('#authEye').addEventListener('click', () => { const i = $('#authPass'), show = i.type === 'password'; i.type = show ? 'text' : 'password'; $('#authPass2').type = i.type; $('#authEye').innerHTML = `<i class="fa-regular ${show ? 'fa-eye-slash' : 'fa-eye'}"></i>`; });
  $('#profGrid').addEventListener('click', e => {
    const ed = e.target.closest('[data-pedit]'); if (ed) { e.stopPropagation(); formConcurso(Auth.meta(ed.dataset.pedit), renderProfiles); return; }
    const p = e.target.closest('[data-prof]'); if (p) { if (UI.manage) formConcurso(Auth.meta(p.dataset.prof), renderProfiles); else Auth.enter(p.dataset.prof); }
  });
  $('#profGrid').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { const t = e.target.closest('.prof'); if (t) { e.preventDefault(); t.click(); } } });
  $('#profManage').addEventListener('click', () => { UI.manage = !UI.manage; renderProfiles(); });
  $('#profLogout').addEventListener('click', () => Auth.logout());
  $('#btnLogout').addEventListener('click', () => Auth.logout());
  $('#btnSwitch').addEventListener('click', () => { Auth.cid = null; STORE_KEY = null; lsSet(K_SESS, { user: Auth.user, cid: null }); UI.manage = false; showAuth('profiles'); });
  $('#menuCollapse').addEventListener('click', () => { lsSet(K_MENU, !lsGet(K_MENU, false)); applyMenuState(); });
  $('#btnEditConcurso').addEventListener('click', () => formConcurso(Auth.meta(), () => { renderBrand(); renderConfig(); }));
  $('#btnChangePw').addEventListener('click', formPassword);
  $$('.cfg-tab').forEach(b => b.addEventListener('click', () => { UI.cfgTab = b.dataset.cfgtab; renderConfig(); }));
}

/* =====================================================================
   4. DADOS DE DEMONSTRAÇÃO (fictícios)
   ===================================================================== */
function buildDemo() {
  const rnd = mulberry32(2025);
  const t = todayStr();
  const st = defaultState();
  st.settings = { examDate: addDays(t, 1100), cutoff: 70, dailyGoal: 4, lastCut: 60 };

  const prog = { 'Língua Portuguesa': .9, 'Raciocínio Lógico': .6, 'Informática': .7, 'Direito Constitucional': .85, 'Direito Administrativo': .65, 'Direito Penal': .8, 'Processo Penal': .6, 'Legislação Especial': .5, 'Contabilidade': .3, 'Estatística': .25, 'Direitos Humanos': .55 };
  st.syllabus = buildSyllabus(subject => {
    const r = rnd(), p = prog[subject] ?? .5;
    if (r > p + .15) return 'Não Visto';
    if (r > p - .1) return 'Teoria Concluída';
    if (r > p - .45) return 'Revisado';
    return 'Dominado';
  });
  if (!CUR_INC) st.syllabus = [];

  // Log de estudo: 35 dias
  const base = { 'Língua Portuguesa': .82, 'Raciocínio Lógico': .64, 'Informática': .71, 'Direito Constitucional': .78, 'Direito Administrativo': .74, 'Direito Penal': .69, 'Processo Penal': .66, 'Legislação Especial': .72, 'Contabilidade': .55, 'Estatística': .52, 'Direitos Humanos': .6 };
  const pool0 = ['Língua Portuguesa', 'Direito Penal', 'Direito Penal', 'Processo Penal', 'Processo Penal', 'Direito Constitucional', 'Direito Constitucional', 'Direito Administrativo', 'Legislação Especial', 'Legislação Especial', 'Informática', 'Raciocínio Lógico', 'Língua Portuguesa', 'Contabilidade', 'Estatística', 'Direitos Humanos'];
  const pool = pool0.some(n => SUBJECT_NAMES.includes(n)) ? pool0.filter(n => SUBJECT_NAMES.includes(n)) : [...SUBJECT_NAMES];
  for (let i = 34; i >= 0; i--) {
    if (rnd() < 0.08) continue;
    const date = addDays(t, -i), wd = parseD(date).getDay();
    const sessions = (wd === 0 || wd === 6) ? 2 + Math.floor(rnd() * 2) : 2 + Math.floor(rnd() * 3);
    for (let k = 0; k < sessions; k++) {
      const subject = pool[Math.floor(rnd() * pool.length)];
      const minutes = 30 + Math.round(rnd() * 6) * 15;
      const questions = Math.round(minutes / 3 * (0.6 + rnd() * 0.8));
      const acc = clamp((base[subject] ?? .6) + (rnd() - .5) * .14 + (35 - i) * 0.0012, .3, .97);
      const r = rnd(), src = r < .4 ? 'Teoria' : r < .55 ? 'Lei seca' : 'Questões';
      const tps = SUBJECTS[subject].topics;
      const topic = src === 'Questões' ? '' : tps[Math.floor(rnd() * tps.length)][0];
      st.log.push({ id: uid(), date, subject, minutes, questions: src === 'Questões' ? questions : 0, hits: src === 'Questões' ? Math.round(questions * acc) : 0, src, topic });
    }
  }

  // Estratégias reutilizáveis
  const stratA = { id: uid(), label: 'A', order: ['Língua Portuguesa', 'Informática', 'Raciocínio Lógico', 'Direito Constitucional', 'Direito Administrativo', 'Direito Penal', 'Processo Penal', 'Legislação Especial', 'Redação'] };
  const stratB = { id: uid(), label: 'B', order: ['Direito Penal', 'Processo Penal', 'Legislação Especial', 'Direito Constitucional', 'Direito Administrativo', 'Língua Portuguesa', 'Informática', 'Raciocínio Lógico', 'Redação'] };
  st.strategies = [stratA, stratB];

  // Simulados (6), modelo Cebraspe: pontos = acertos − erros
  const debriefsBad = [
    'Perdi muito tempo em Português e faltou tempo para Penal. Muita pressa nos itens com negação.',
    'Errei dolo eventual por pressa e falta de atenção. Fiquei ansioso no meio da prova.',
    'Faltou tempo no final. Ansiedade alta e pouco sono na véspera.',
    'Errei por falta de atenção em prisões; ainda inseguro em legislação especial.',
    'Cansaço no final da prova e pouco tempo para revisar as marcações.',
    'Ainda erro negação lógica; tempo apertado nas últimas questões.'
  ];
  const debriefsGood = [
    'Comecei por Português e mantive o ritmo.',
    'Estava calmo no início e li os enunciados com cuidado.',
    'Boa gestão de tempo com a estratégia B.',
    'Dormi bem e estava tranquilo; mais foco na leitura.',
    'Boa estratégia de ordem das matérias e mais confiança.',
    'Melhor simulado até aqui: dormi bem, estava relaxado e com foco.'
  ];
  for (let i = 0; i < 6; i++) {
    const total = 120;
    const hits = Math.round(66 + i * 4.5 + (rnd() - .5) * 5);
    const errors = Math.round((total - hits) * .6);
    const blanks = total - hits - errors;
    const w = SUBJECT_NAMES.map(n => (base[n] || .6) * (0.8 + rnd() * .4));
    const wsum = sum(w);
    const subj = {};
    let acc = 0;
    SUBJECT_NAMES.forEach((n, k) => { const v = Math.floor(hits * w[k] / wsum); subj[n] = v; acc += v; });
    subj[SUBJECT_NAMES[0]] += hits - acc;
    const a = Math.round(errors * .4), p = Math.round(errors * .25);
    st.mocks.push({
      id: uid(), name: `Simulado PF #${i + 1}`, date: addDays(t, -(5 - i) * 14 - 4), board: 'Cebraspe', type: i === 0 ? 'Nivelamento' : i === 5 ? 'Real' : 'Conteúdo',
      source: 'Plataforma de questões (exemplo)', total, hits, errors, blanks, points: hits - errors, score: hits / total * 100,
      time: i === 1 || i === 2 ? 0 : 235 + Math.round(rnd() * 40), essay: i > 2 ? Math.round(18 + rnd() * 10) : null, cutoff: 60,
      subj, atp: { atencao: a, teoria: errors - a - p, pulo: p }, strategy: i < 3 ? stratA.id : stratB.id, debrief: '', debriefBad: debriefsBad[i], debriefGood: debriefsGood[i]
    });
  }

  // Revisões: o Gantt é calculado a partir da configuração (st.rev) e dos estudos registrados
  st.rev.startMonth = addDays(t, -35).slice(0, 7);

  // Erros (novo modelo)
  const m = st.mocks;
  [
    ['Direito Penal', 'Teoria do crime', CAT_ATENCAO, 'Simulado', m[1].id, '34, 35', { reason: 'Li "dolo eventual" e marquei culpa consciente por pressa.' }],
    ['Processo Penal', 'Prisões e liberdade provisória', CAT_TEORIA, 'Simulado', m[2].id, '78', { study: 'Prisão temporária: prazos (5+5 e 30+30) e rol de crimes da Lei 7.960.' }],
    ['Direito Constitucional', 'Remédios constitucionais', CAT_PULO, 'Tarefa do dia', '', '12, 13', { pitfall: 'Legitimidade ativa do mandado de segurança coletivo.', bizu: 'Partido (com representação no CN) ou organização sindical/entidade/associação há 1 ano.' }],
    ['Língua Portuguesa', 'Crase', CAT_TEORIA, 'Revisão', '', '5', { study: 'Casos facultativos e proibidos de crase; 30 questões do tema.' }],
    ['Informática', 'Segurança da informação', CAT_PULO, 'Simulado', m[3].id, '101', { pitfall: 'Vírus × worm × trojan em item certo/errado.', bizu: 'Worm se propaga sozinho; trojan depende da execução pelo usuário.' }],
    ['Legislação Especial', 'Lei de Drogas (11.343)', CAT_ATENCAO, 'Simulado', m[4].id, '90, 91', { reason: 'Não percebi o "e" que exigia todos os requisitos do tráfico privilegiado.' }],
    ['Direito Administrativo', 'Atos administrativos', CAT_TEORIA, 'Tarefa do dia', '', '8', { study: 'Convalidação × conversão do ato.' }],
    ['Raciocínio Lógico', 'Equivalências e negações', CAT_PULO, 'Simulado', m[5].id, '110', { pitfall: 'Negação de "todo" e "algum".', bizu: 'Nega "todo A é B" → "algum A não é B".' }]
  ].forEach(([subject, topic, category, origin, mockId, questions, extra], i) => st.errors.push({ id: uid(), date: addDays(t, -i * 2 - 1), subject, topic, category, origin, mockId, questions, reason: '', study: '', pitfall: '', bizu: '', ...extra, resolved: i > 5 }));

  // Planner: semana atual + item fixo + compromisso + prova
  const mon = mondayOf(t);
  const P = (type, off, start, end, extra = {}) => {
    const date = addDays(mon, off);
    st.plan.push({ id: uid(), type, date, start, end, subjects: [], title: '', desc: '', repeat: [], skip: [], until: null, reminder: 'none', doneDates: date < t ? [date] : [], regs: {}, ...extra });
  };
  P('Rotina', 0, '08:00', '17:00', { title: 'Trabalho', repeat: [1, 2, 3, 4, 5] });
  P('Lei seca', 0, '19:00', '20:30', { subjects: ['Direito Constitucional'] });
  P('Teoria', 1, '19:00', '20:30', { subjects: ['Processo Penal'] });
  P('Questões', 2, '19:00', '20:00', { subjects: ['Língua Portuguesa', 'Raciocínio Lógico'] });
  P('Flashcards', 3, '19:00', '19:30', { subjects: ['Informática'] });
  P('Revisão', 4, '19:00', '20:00', { subjects: ['Direito Penal', 'Processo Penal'], desc: 'Revisar anotações do caderno de erros desta semana.' });
  P('Questões', 5, '09:00', '12:00', { subjects: ['Direito Penal', 'Legislação Especial'] });
  P('Simulado', 6, '09:00', '13:30', { title: 'Simulado PF #7', desc: 'Simulado cronometrado com a estratégia B.' });
  P('Compromisso', 2, '21:00', '21:30', { title: 'Mentoria semanal', desc: 'Levar dúvidas de Processo Penal.', repeat: [3], reminder: 'dia' });
  st.plan.push({ id: uid(), type: 'Prova', date: addDays(t, 20), start: '13:30', end: '18:00', subjects: [], title: 'Prova (exemplo)', desc: 'Data fictícia de demonstração.', repeat: [], skip: [], until: null, reminder: 'none', doneDates: [], regs: {} });
  // Edital Verificado (exemplo): marca parte dos itens de cada matéria
  const leaves = [], walk = (n, subj) => { if (!n.c.length) leaves.push({ id: n.id, subj }); else n.c.forEach(c => walk(c, subj)); };
  st.edital.tree.forEach(m => m.c.forEach(c => walk(c, m.subj)));
  leaves.forEach(l => { if (rnd() < (prog[l.subj] || .3) * 0.9) st.edital.checks[l.id] = true; });
  return st;
}

/* =====================================================================
   5. PLANNER — MODELO (ocorrências, layout, lembretes)
   ===================================================================== */
const isDone = (it, date) => (it.doneDates || []).includes(date);
const wdOf = date => parseD(date).getDay();
/** Fim em minutos (00:00 como fim = meia-noite = 1440). */
const endMin = it => { const e = toMin(it.end); return e === 0 && toMin(it.start) > 0 ? 1440 : e; };
const durMin = it => Math.max(0, endMin(it) - toMin(it.start));
const itemName = (it, full = false) => it.type === 'Caderno de Erros' ? 'Revisar erros em aberto' : (it.subjects && it.subjects.length) ? it.subjects.map(n => (full ? n : subjShort(n))).join(' + ') : (it.title || it.type);
const isSeries = it => !!(it.repeat && it.repeat.length);
const subjColor = n => { const i = SUBJECT_CATALOG.indexOf(n), j = i >= 0 ? i : SUBJECT_CATALOG.length + Math.max(0, ((CUR_SUBJ && CUR_SUBJ.custom) || []).findIndex(c => c.name === n)); return SUBJ_PALETTE[j % SUBJ_PALETTE.length]; };
/** Cores do item: cor fixa (Compromisso, Simulado, Prova, Rotina, Caderno de Erros) ou cor de cada matéria (a 1ª é a principal). */
const itemColors = it => isTraining(it) ? [TRAIN_COLOR] : (FIXED_COLOR_TYPES.includes(it.type) || !(it.subjects && it.subjects.length)) ? [TYPE_COLOR[it.type]] : it.subjects.map(subjColor);
const itemColor = it => itemColors(it)[0];
const repeatText = it => (isSeries(it) ? DAY_ORDER.filter(d => it.repeat.includes(d)).map(d => DAY_LABEL[d]).join(', ') : '');
/** Duração legível: 60 → "1 hora", 90 → "1h30", 120 → "2 horas", 45 → "45 min". */
function fmtDur(min) {
  const m = Math.round(min); if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h}h${z2(r)}` : `${h} ${h === 1 ? 'hora' : 'horas'}`;
}

/** Ocorrências de itens do planner em uma data. Série = data inicial + dias da semana marcados, até `until`; `skip` = datas excluídas/movidas. */
function occurrences(date) {
  const out = [];
  S.plan.forEach(it => {
    if ((it.skip || []).includes(date)) return;
    if (it.date === date) out.push({ it, date });
    else if (isSeries(it) && date > it.date && (!it.until || date <= it.until) && it.repeat.includes(wdOf(date))) out.push({ it, date });
  });
  return out.sort((a, b) => a.it.start.localeCompare(b.it.start));
}

/** Distribui blocos sobrepostos em "faixas" lado a lado. */
function layoutDay(occs) {
  const evs = occs.map(o => ({ o, s: toMin(o.it.start), e: Math.max(endMin(o.it), toMin(o.it.start) + 15) })).sort((a, b) => a.s - b.s || b.e - a.e);
  const res = []; let cluster = [], clusterEnd = -1;
  const flush = () => {
    const lanes = [];
    cluster.forEach(ev => { let l = lanes.findIndex(end => end <= ev.s); if (l < 0) { l = lanes.length; lanes.push(0); } lanes[l] = ev.e; ev.lane = l; });
    cluster.forEach(ev => { ev.lanes = lanes.length; res.push(ev); });
    cluster = [];
  };
  evs.forEach(ev => { if (cluster.length && ev.s >= clusterEnd) { flush(); clusterEnd = -1; } cluster.push(ev); clusterEnd = Math.max(clusterEnd, ev.e); });
  if (cluster.length) flush();
  return res;
}

/** Lembretes: compromissos conforme a antecedência escolhida + simulados/provas dos próximos 7 dias. */
function getReminders() {
  const t = todayStr(), out = [];
  for (let i = 0; i <= 7; i++) {
    const d = addDays(t, i);
    occurrences(d).forEach(({ it }) => {
      if (it.type === 'Compromisso') { const lead = REM_LEAD[it.reminder || 'none']; if (lead !== null && i <= lead) out.push({ it, date: d, i }); }
      else if (it.type === 'Simulado' || it.type === 'Prova') out.push({ it, date: d, i });
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.it.start.localeCompare(b.it.start));
}

/* =====================================================================
   6. CÁLCULOS & MÉTRICAS
   ===================================================================== */
/* =====================================================================
   5b. REVISÕES — MOTOR DE CICLOS (Gantt)
   TR = TP ÷ C (TP = 12 meses). Ano civil: o 1º bloco começa no C0 e vai até dezembro; depois cada ano começa em janeiro
   (C1 reinicia), dividido em C períodos de TR meses; cada ciclo cai no último mês do seu período.
   ===================================================================== */
const mIdx = ym => { const [y, m] = ym.split('-').map(Number); return y * 12 + m - 1; };
const idxYM = i => `${Math.floor(i / 12)}-${z2(i % 12 + 1)}`;
const idxYear = i => Math.floor(i / 12);
const idxMon = i => i % 12;
const nowIdx = () => mIdx(todayStr().slice(0, 7));

/** Posições (meses após o início do bloco) dos C contatos. Ex.: C=4 → [2,5,8,11]; C=6 → [1,3,5,7,9,11]. */
function autoOffsets(contacts) {
  const c = Math.max(0, Math.floor(contacts)); if (!c) return [];
  const tr = 12 / c, out = [];
  for (let k = 1; k <= c; k++) { const o = Math.ceil(k * tr - 1e-9) - 1; if (o >= 0 && o <= 11 && !out.includes(o)) out.push(o); }
  return out;
}
function blockOffsets(cfg, s, contacts) {
  const o = cfg.blocks && cfg.blocks[s] ? cfg.blocks[s] : autoOffsets(contacts);
  return [...new Set(o)].filter(x => x >= 0 && x <= 11).sort((a, b) => a - b);
}
/** Mês do primeiro contato (C0): primeiro estudo registrado da matéria, ou o início das revisões. */
function firstContactIdx(name) {
  const from = S.rev.startMonth + '-01';   // estudos anteriores ao início configurado das revisões não definem o C0
  let first = null;
  S.log.forEach(l => { if (l.subject === name && l.date && l.date >= from && (first === null || l.date < first)) first = l.date; });
  return mIdx((first || from).slice(0, 7));
}
/** Cronograma de ciclos de uma matéria: { c0, cycles:[{idx,n,block}], blocks:[{s,limit,contacts}] } */
function revSchedule(name) {
  if (_revCache && _revCache[name]) return _revCache[name];
  const cfg = S.rev.subj[name];
  const m0 = cfg.c0 ? mIdx(cfg.c0) : firstContactIdx(name);
  const examIdx = S.settings.examDate ? mIdx(S.settings.examDate.slice(0, 7)) : m0 + 11;
  const endIdx = Math.max(examIdx, m0);
  const restart = S.rev.editalOut && S.rev.editalDate ? mIdx(S.rev.editalDate.slice(0, 7)) : null;
  const cycles = [], blocks = [];
  // Ano civil: o 1º bloco começa no início (C0) e vai até dezembro; os seguintes começam em janeiro e a numeração reinicia em C1.
  const seg = (start, limit, contacts, withC0) => {
    for (let s = start; s <= endIdx && s < limit; s = (Math.floor(s / 12) + 1) * 12) {
      const e = (Math.floor(s / 12) + 1) * 12;
      const offs = blockOffsets(cfg, s, contacts).filter(o => !(withC0 && s === start && o === 0));
      blocks.push({ s, e, limit, contacts });
      let n = 0;
      offs.forEach(o => { const idx = s + o; if (idx >= limit || idx > endIdx || idx >= e) return; n++; cycles.push({ idx, n, block: s }); });
    }
  };
  if (restart !== null && restart > m0) { seg(m0, restart, cfg.contactsPre ?? cfg.contacts, true); seg(restart, Infinity, cfg.contacts, false); }
  else seg(m0, Infinity, cfg.contacts, true);
  const out = { name, c0: m0, cycles, blocks, cfg, endIdx };
  if (_revCache) _revCache[name] = out;
  return out;
}
/** Assuntos únicos estudados (Teoria/Lei seca) da matéria até o fim do mês `uptoIdx`. */
function studiedTopics(name, uptoIdx) {
  const end = idxYM(uptoIdx) + '-31', map = new Map();
  S.log.forEach(l => {
    if (l.subject !== name || !l.topic || !REVIEW_SRC.includes(l.src) || !l.date || l.date > end) return;
    const k = norm(l.topic); if (!k) return;
    const fi = mIdx(l.date.slice(0, 7));
    if (!map.has(k)) map.set(k, { key: k, topic: l.topic.trim(), firstIdx: fi }); else if (fi < map.get(k).firstIdx) map.get(k).firstIdx = fi;
  });
  return [...map.values()];
}
const revKey = (name, tkey, block, n) => `${name}|${tkey}|${block}|${n}`;
/** Itens de revisão do mês `viewIdx` (método B: todos os assuntos estudados desde o C0). */
function reviewItems(viewIdx) {
  const now = nowIdx(), items = [];
  SUBJECT_NAMES.forEach(name => {
    const sch = revSchedule(name);
    const cur = sch.cycles.find(c => c.idx === viewIdx);
    const past = sch.cycles.filter(c => c.idx < viewIdx).pop();
    const isDn = (tk, c) => !!S.rev.done[revKey(name, tk, c.block, c.n)];
    const mkItem = (c, t, carried) => {
      const dn = isDn(t.key, c);
      const state = dn ? 'feito' : (carried || c.idx < now) ? 'atrasada' : c.idx === now ? 'revisar' : 'futuro';
      const stages = sch.cycles.filter(x => x.block === c.block && t.firstIdx <= x.idx).map(x => ({ n: x.n, idx: x.idx, state: isDn(t.key, x) ? 'done' : x.idx < now ? 'late' : x.idx === now ? 'due' : 'idle', cur: x.idx === c.idx }));
      items.push({ subject: name, topic: t.topic, tkey: t.key, cycle: c, state, stages, rkey: revKey(name, t.key, c.block, c.n) });
    };
    if (cur) {
      const pastTopics = past && viewIdx >= now ? studiedTopics(name, past.idx) : [];
      studiedTopics(name, cur.idx).forEach(t => mkItem(cur, t, pastTopics.some(p => p.key === t.key) && !isDn(t.key, past)));
    } else if (past && viewIdx >= now) {
      studiedTopics(name, past.idx).forEach(t => { if (!isDn(t.key, past)) mkItem(past, t, true); });
    }
  });
  return items;
}
const isCebraspe = board => board === 'Cebraspe';
const calcPoints = (board, hits, errors) => (isCebraspe(board) ? hits - errors : hits);
const precision = m => (m.hits + m.errors ? m.hits / (m.hits + m.errors) * 100 : 0);

function subjectStats() {
  const RECENT = [2018, 2021, 2025];   // incidência da banca = nº de válidas nas 3 últimas provas (Spotter)
  const maxInc = Math.max(1, ...SUBJECT_NAMES.map(n => discTotal(n, RECENT)));
  const edC = edCoverage();
  return SUBJECT_NAMES.map(name => {
    const logs = S.log.filter(l => l.subject === name);
    const minutes = sum(logs.map(l => l.minutes));
    const questions = sum(logs.map(l => l.questions));
    const hits = sum(logs.map(l => l.hits));
    const topics = S.syllabus.filter(x => x.subject === name);
    const ec = edC.subj[name], coverage = ec && ec.n ? ec.d / ec.n * 100 : 0;   // cobertura = Edital Verificado
    return { name, short: subjShort(name), block: SUBJECTS[name].block || 'II', minutes, questions, hits, acc: questions ? hits / questions * 100 : 0, coverage, incIdx: S.hasInc ? discTotal(name, RECENT) / maxInc * 100 : 0, topicCount: topics.length };
  });
}

/** Nota de corte (pontos) de um simulado: a da última prova real (Parâmetros) tem prioridade; sem ela, vale a do próprio simulado. */
const cutOf = m => (S.settings.lastCut != null ? S.settings.lastCut : (m.cutoff != null ? m.cutoff : null));
function calc() {
  const t = todayStr();
  const monthPrefix = t.slice(0, 7);
  const monthMin = sum(S.log.filter(l => l.date.startsWith(monthPrefix)).map(l => l.minutes));
  const weekMin = sum(S.log.filter(l => diffDays(t, l.date) >= 0 && diffDays(t, l.date) < 7).map(l => l.minutes));
  const totalQ = sum(S.log.map(l => l.questions));
  const totalHits = sum(S.log.map(l => l.hits));
  const accuracy = totalQ ? totalHits / totalQ * 100 : 0;
  const mocks = [...S.mocks].sort((a, b) => a.date.localeCompare(b.date));
  const mockAvg = avg(mocks.map(m => m.score));
  const last3 = avg(mocks.slice(-3).map(m => m.score));
  const ec = edCoverage(), coverage = ec.pct, edDone = ec.d, edTotal = ec.n;
  const rv = reviewItems(nowIdx());
  const pendingRev = rv.filter(r => r.state !== 'feito').length;
  const overdueRev = rv.filter(r => r.state === 'atrasada').length;
  const openErrors = S.errors.filter(e => !e.resolved).length;
  const doneBlocks = +(sum(occurrences(t).filter(({ it }) => STUDY_TYPES.includes(it.type) && isDone(it, t)).map(({ it }) => durMin(it) / 60))).toFixed(1);
  const goalPct = clamp(doneBlocks / (S.settings.dailyGoal || 1) * 100, 0, 100);
  // Competitividade: diferença média (pts − corte) dos últimos 3 simulados com corte informado, normalizada pelo total
  const withCut = mocks.filter(m => cutOf(m) != null && m.total).slice(-3);
  let compPct = 0, compLabel = withCut.length ? '' : (mocks.length ? 'Informe a nota de corte em Configurações' : 'Sem simulados'), delta = null;
  if (withCut.length) {
    delta = avg(withCut.map(m => m.points - cutOf(m)));
    const deltaPct = avg(withCut.map(m => (m.points - cutOf(m)) / m.total * 100));
    compPct = clamp(Math.round(50 + deltaPct * 4.5), 3, 98);
    compLabel = deltaPct >= 5 ? 'Zona de aprovação' : deltaPct >= 0 ? 'Na linha de corte' : deltaPct >= -8 ? 'Zona de risco' : 'Abaixo do corte';
  }
  return { monthMin, weekMin, totalQ, totalHits, accuracy, mocks, mockAvg, last3, coverage, edDone, edTotal, pendingRev, overdueRev, openErrors, doneBlocks, goalPct, compPct, compLabel, delta };
}
/* ---- Análise de palavras dos debriefings ---- */
/* ---- Temas dos debriefings (dicionário editável) ---- */
function themeMatches(text, themes) {
  const t = norm(text); if (!t) return [];
  return themes.filter(th => th.words.some(w => { const n = norm(w); return n && new RegExp('(^|[^a-z0-9])' + escRe(n)).test(t); }));
}
function themeStats() {
  const count = field => {
    const withText = S.mocks.filter(m => norm(m[field]));
    const map = {};
    withText.forEach(m => themeMatches(m[field], S.themes).forEach(th => { map[th.name] = (map[th.name] || 0) + 1; }));
    return { total: withText.length, list: Object.entries(map).map(([name, c]) => ({ name, count: c })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)) };
  };
  const bad = count('debriefBad'), good = count('debriefGood');
  return { bad: bad.list, totalBad: bad.total, good: good.list, totalGood: good.total };
}
const themesToText = themes => themes.map(t => `${t.name}: ${t.words.join(', ')}`).join('\n');
function parseThemes(text) {
  return String(text || '').split('\n').map(l => l.trim()).filter(Boolean).map(l => {
    const i = l.indexOf(':'); if (i < 1) return null;
    const name = l.slice(0, i).trim(), words = l.slice(i + 1).split(',').map(w => w.trim()).filter(Boolean);
    return name && words.length ? { name, words } : null;
  }).filter(Boolean);
}
/* ---- Estratégias × resultados ---- */
function strategyStats() {
  return S.strategies.map(st => {
    const ms = S.mocks.filter(m => m.strategy === st.id);
    const timed = ms.filter(m => m.time > 0 && m.type !== 'Conteúdo');
    return { id: st.id, label: st.label, order: st.order, n: ms.length, totalPts: sumArr(ms.map(m => m.points)), avgPts: avg(ms.map(m => m.points)), avgHits: avg(ms.map(m => m.hits)), avgErrors: avg(ms.map(m => m.errors)), avgTime: timed.length ? avg(timed.map(m => m.time)) : null, nTimed: timed.length };
  }).filter(s => s.n > 0);
}
/** Melhor = maior total de pontos acumulados; empate (±0,05) → menor tempo médio. Exige ≥ 2 simulados por estratégia. */
function strategyVerdict(stats) {
  if (!stats.length) return { html: 'Lance simulados com uma estratégia (ordem das matérias) para comparar os resultados.' };
  const el = stats.filter(s => s.n >= 2);
  if (el.length < 2) return { html: 'Dados insuficientes: são necessárias ao menos 2 estratégias com 2 simulados cada para indicar a melhor.' };
  const cmp = (a, b) => (Math.abs(b.totalPts - a.totalPts) > 0.05 ? b.totalPts - a.totalPts : (a.avgTime ?? Infinity) - (b.avgTime ?? Infinity));
  const sorted = [...el].sort(cmp), best = sorted[0], worst = sorted[sorted.length - 1];
  const tm = s => (s.avgTime != null ? ` e tempo médio de ${fmtHM(s.avgTime)}` : '');
  let cmpTxt = '';
  if (best.avgTime != null && worst.avgTime != null && Math.abs(best.avgTime - worst.avgTime) >= 1) cmpTxt = ` Ela usou ${fmtHM(Math.abs(best.avgTime - worst.avgTime))} ${best.avgTime < worst.avgTime ? 'a menos' : 'a mais'} que a pior.`;
  const pts = s => fmtNum(+s.totalPts.toFixed(1));
  return { best, worst, html: `<b>Melhor estratégia: ${esc(best.label)}</b> — ${pts(best)} pts no total (${best.n} simulados)${tm(best)}.${cmpTxt}<br><b>Pior estratégia: ${esc(worst.label)}</b> — ${pts(worst)} pts no total (${worst.n} simulados)${tm(worst)}.` };
}
/* =====================================================================
   7. TOASTS & MODAIS
   ===================================================================== */
function toast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`; el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = 0; el.style.transition = 'opacity .4s'; setTimeout(() => el.remove(), 400); }, 3600);
}

const optHTML = (opts, sel) => opts.map(o => { const v = typeof o === 'object' ? o.v : o, l = typeof o === 'object' ? o.l : o; return `<option value="${esc(v)}" ${String(v) === String(sel) ? 'selected' : ''}>${esc(l)}</option>`; }).join('');

/** HTML de um campo. `when: 'campo=valor1|valor2'` (ou 'campo=!valor') mostra/oculta dinamicamente. */
function fieldHTML(f) {
  const cls = 'field' + (f.full ? ' full' : '');
  const when = f.when ? ` data-when="${esc(f.when)}"` : '';
  if (f.type === 'custom') return `<div class="${cls}"${when}>${f.html}</div>`;
  const req = f.required ? 'required' : '';
  let input;
  if (f.type === 'select') input = `<select name="${f.name}" ${req}>${optHTML(f.options, f.value)}</select>`;
  else if (f.type === 'textarea') input = `<textarea name="${f.name}" ${req} placeholder="${esc(f.placeholder || '')}">${esc(f.value || '')}</textarea>`;
  else if (f.type === 'checks') input = `<div class="checks">${f.options.map(o => `<label class="chk"><input type="checkbox" name="${f.name}" value="${esc(o)}" ${(f.value || []).includes(o) ? 'checked' : ''}> ${esc(f.labels?.[o] || o)}</label>`).join('')}</div>`;
  else if (f.type === 'checkbox') return `<div class="${cls}"${when}><label class="chk"><input type="checkbox" name="${f.name}" ${f.value ? 'checked' : ''}> ${esc(f.label)}</label></div>`;
  else input = `<input name="${f.name}" type="${f.type || 'text'}" value="${esc(f.value ?? '')}" ${req} ${f.min !== undefined ? `min="${f.min}"` : ''} ${f.max !== undefined ? `max="${f.max}"` : ''} ${f.step ? `step="${f.step}"` : ''} placeholder="${esc(f.placeholder || '')}">`;
  return `<div class="${cls}"${when}><label>${esc(f.label)}</label>${input}</div>`;
}

function applyWhen(form) {
  $$('[data-when]', form).forEach(w => {
    const [name, raw] = w.dataset.when.split('=');
    const el = form.elements[name]; const cur = el ? el.value : '';
    const neg = raw.startsWith('!'); const vals = (neg ? raw.slice(1) : raw).split('|');
    const show = neg ? !vals.includes(cur) : vals.includes(cur);
    w.hidden = !show;
    $$('input,select,textarea', w).forEach(i => { i.disabled = !show; });
  });
}

function collect(form, fields) {
  const d = {};
  fields.forEach(f => {
    if (f.type === 'custom') return;
    if (f.type === 'checks') { d[f.name] = $$(`input[name="${f.name}"]:checked`, form).map(x => x.value); return; }
    const el = form.elements[f.name]; if (!el) return;
    if (f.type === 'checkbox') { d[f.name] = el.checked; return; }
    const v = el.value;
    d[f.name] = f.type === 'number' ? (v === '' ? null : Number(v)) : v.trim();
  });
  return d;
}

function resetModal(wide) {
  const form = $('#modalForm');
  form.onsubmit = null; form.onchange = null; form.oninput = null; form.onclick = null;
  $('.modal-box', $('#modal')).classList.toggle('wide', !!wide);
  return form;
}

function openForm({ title, fields, submitLabel = 'Salvar', onSubmit, onMount, onChange, onInput, validate, extra = [], wide = false }) {
  $('#modalTitle').textContent = title;
  const form = resetModal(wide);
  form.innerHTML = fields.map(fieldHTML).join('') + `<div class="form-actions"><span class="push"></span><button type="button" class="btn ghost" data-close>Cancelar</button><button class="btn primary">${esc(submitLabel)}</button></div>`;
  const push = $('.push', form);
  extra.forEach(x => { const b = document.createElement('button'); b.type = 'button'; b.className = `btn ${x.cls || ''}`; b.innerHTML = x.label; b.onclick = () => x.onClick(); push.appendChild(b); });
  form.onsubmit = e => {
    e.preventDefault();
    const data = collect(form, fields);
    const msg = validate && validate(data, form);
    if (msg) { toast(msg, 'err'); return; }
    const keep = onSubmit(data, form); if (keep !== 'keep') closeModal();
  };
  form.onchange = () => { applyWhen(form); if (onChange) onChange(form); };
  form.oninput = () => { if (onInput) onInput(form); };
  applyWhen(form);
  if (onMount) onMount(form);
  $('#modal').classList.add('open');
  const first = form.querySelector('input:not([disabled]),select:not([disabled]),textarea:not([disabled])'); if (first) setTimeout(() => first.focus(), 50);
}

/** Modal somente leitura (informações + ações). rows: [[rótulo, html]] */
function openInfo({ title, rows, actions = [] }) {
  $('#modalTitle').textContent = title;
  const form = resetModal(false);
  form.onsubmit = e => e.preventDefault();
  form.innerHTML = rows.map(([l, v]) => `<div class="info-row full"><span>${esc(l)}</span>${v}</div>`).join('') + `<div class="form-actions"><span class="push"></span></div>`;
  const push = $('.push', form);
  actions.filter(a => a.push).forEach(a => push.appendChild(mkBtn(a)));
  const bar = $('.form-actions', form);
  actions.filter(a => !a.push).forEach(a => bar.appendChild(mkBtn(a)));
  const close = document.createElement('button'); close.type = 'button'; close.className = 'btn primary'; close.textContent = 'Fechar'; close.setAttribute('data-close', ''); bar.appendChild(close);
  $('#modal').classList.add('open');
}
function mkBtn(a) { const b = document.createElement('button'); b.type = 'button'; b.className = `btn ${a.cls || ''}`; b.innerHTML = a.label; b.onclick = a.onClick; return b; }
function closeModal() { $('#modal').classList.remove('open'); }

/* =====================================================================
   8. FORMULÁRIOS — PLANNER
   ===================================================================== */
const subjectOpts = SUBJECT_NAMES;

/** Janela de escolha (ex.: "só esta data" / "esta e as próximas"). options: [{label, value, cls}] */
function choiceModal({ title, text, options, onPick }) {
  $('#modalTitle').textContent = title;
  const form = resetModal(false); form.onsubmit = e => e.preventDefault();
  form.innerHTML = `<div class="field full"><p style="font-size:14.5px;line-height:1.5">${esc(text)}</p></div><div class="form-actions"></div>`;
  const bar = $('.form-actions', form);
  options.forEach(o => { const b = mkBtn({ label: o.label, cls: o.cls || '', onClick: () => { closeModal(); onPick(o.value); } }); b.dataset.choice = o.value; bar.appendChild(b); });
  const c = document.createElement('button'); c.type = 'button'; c.className = 'btn ghost'; c.textContent = 'Cancelar'; c.setAttribute('data-close', ''); bar.appendChild(c);
  $('#modal').classList.add('open');
}

/** Cadastro/edição de item do planner. opts: { it, date, start } */
function formPlan(opts = {}) {
  const it = opts.it, occ = opts.date || UI.plannerDate, editing = !!it;
  const types = opts.types && !it ? opts.types : PLAN_TYPES;
  const v = it || { type: types[0] === 'Revisão' ? 'Revisão' : 'Questões', subjects: [], title: '', desc: '', start: opts.start || '', end: '', repeat: [], reminder: 'none' };
  const fields = [
    { name: 'type', label: 'Tipo', type: 'select', options: types, value: v.type, full: true },
    { name: 'date', label: 'Data', type: 'date', value: occ, required: true },
    { name: 'start', label: 'Início', type: 'time', value: v.start, required: true },
    { name: 'end', label: 'Fim', type: 'time', value: v.end },
    { name: 'subject', label: 'Matéria', type: 'select', options: subjectOpts, value: v.subjects?.[0] || SUBJECT_NAMES[0], when: 'type=Teoria', full: true },
    { name: 'subjects', label: 'Matérias (uma ou mais)', type: 'checks', options: SUBJECT_NAMES, value: v.subjects || [], when: 'type=' + MULTI_SUBJ.join('|'), full: true, labels: Object.fromEntries(SUBJECT_NAMES.map(n => [n, subjShort(n)])) },
    { name: 'title', label: 'Título', value: v.title, required: true, when: 'type=' + TITLE_TYPES.join('|'), full: true },
    { name: 'desc', label: 'Descrição', type: 'textarea', value: v.desc, when: 'type=' + DESC_TYPES.join('|'), full: true },
    { name: 'reminder', label: 'Lembrete', type: 'select', options: REMINDERS, value: v.reminder || 'none', when: 'type=Compromisso', full: true },
    { name: 'repeat', label: 'Repetir nos dias (a série começa na data acima; sem dias marcados = só nesta data)', type: 'checks', options: DAY_ORDER.map(String), value: (v.repeat || []).map(String), full: true, labels: Object.fromEntries(DAY_ORDER.map(d => [String(d), DAY_LABEL[d]])) }
  ];
  openForm({
    title: editing ? 'Editar tarefa' : 'Nova tarefa',
    fields,
    validate: d => {
      if (MULTI_SUBJ.includes(d.type) && !d.subjects.length) return 'Selecione ao menos uma matéria.';
      if (d.end && (d.end === '00:00' ? 1440 : toMin(d.end)) <= toMin(d.start)) return 'O horário de fim deve ser depois do início.';
      return '';
    },
    onChange: form => {
      if (!editing && form.elements.type.value === 'Rotina' && !$$('input[name="repeat"]:checked', form).length && form.elements.date.value) {
        const el = $(`input[name="repeat"][value="${wdOf(form.elements.date.value)}"]`, form); if (el) el.checked = true;
      }
    },
    onMount: form => { if (!editing && v.type === 'Rotina') { const el = $(`input[name="repeat"][value="${wdOf(occ)}"]`, form); if (el) el.checked = true; } },
    extra: editing ? [{ label: '<i class="fa-solid fa-trash"></i> Excluir', cls: 'danger', onClick: () => { if (deletePlan(it, occ)) closeModal(); } }] : [],
    onSubmit: d => savePlan(d, it, occ)
  });
}

function planRec(d) {
  return {
    type: d.type, date: d.date, start: d.start, end: d.end || fromMin(Math.min(toMin(d.start) + 60, 1439)),
    subjects: d.type === 'Teoria' ? [d.subject] : MULTI_SUBJ.includes(d.type) ? d.subjects : [],
    title: TITLE_TYPES.includes(d.type) ? d.title : '',
    desc: DESC_TYPES.includes(d.type) ? d.desc : '',
    reminder: d.type === 'Compromisso' ? d.reminder : 'none',
    repeat: [...new Set((d.repeat || []).map(Number).filter(n => n >= 0 && n <= 6))]
  };
}
function focusDate(date) { UI.plannerDate = date; UI.weekStart = mondayOf(date); UI.month = date.slice(0, 7); }

/** Aplica uma alteração a uma ocorrência. scope: 'all' (item inteiro / avulso), 'one' (só esta data) ou 'following' (esta e as próximas). */
function applyEdit(it, occDate, rec, scope) {
  const wasDone = isDone(it, occDate), myRegs = (it.regs || {})[occDate];
  const fresh = extra => ({ id: uid(), ...rec, skip: [], until: null, doneDates: [], regs: {}, ...extra });
  if (scope === 'one' && isSeries(it)) {
    it.skip = (it.skip || []).concat(occDate);
    it.doneDates = (it.doneDates || []).filter(x => x !== occDate); if (it.regs) delete it.regs[occDate];
    const n = fresh({ repeat: [] }); if (wasDone) n.doneDates = [rec.date]; if (myRegs) n.regs = { [rec.date]: myRegs };
    S.plan.push(n);
  } else if (scope === 'following' && isSeries(it) && occDate > it.date) {
    const n = fresh({}), shift = d => (d === occDate ? rec.date : d);
    (it.doneDates || []).filter(x => x >= occDate).forEach(x => n.doneDates.push(shift(x)));
    Object.keys(it.regs || {}).filter(k => k >= occDate).forEach(k => { n.regs[shift(k)] = it.regs[k]; delete it.regs[k]; });
    it.doneDates = (it.doneDates || []).filter(x => x < occDate);
    it.until = addDays(occDate, -1);
    S.plan.push(n);
  } else {
    const wasSeries = isSeries(it), keepUntil = wasSeries ? it.until : null;
    Object.assign(it, rec); it.until = rec.repeat.length ? keepUntil : null;
    if (!wasSeries) {   // item avulso: leva o estado "feito/registrado" para a nova data
      it.doneDates = wasDone ? [rec.date] : []; const all = Object.values(it.regs || {}).flat(); it.regs = all.length ? { [rec.date]: all } : {};
    }
  }
  focusDate(rec.date);
}

function savePlan(d, it, occDate) {
  const rec = planRec(d);
  if (!it) { S.plan.push({ id: uid(), ...rec, skip: [], until: null, doneDates: [], regs: {} }); focusDate(rec.date); commit(); toast('Planner atualizado', 'ok'); return; }
  if (isSeries(it)) {
    choiceModal({
      title: 'Editar tarefa repetida', text: 'Esta tarefa se repete. Aplicar a alteração:',
      options: [{ label: 'Só esta data', value: 'one' }, { label: 'Esta e as próximas', value: 'following', cls: 'primary' }],
      onPick: scope => { applyEdit(it, occDate, rec, scope); commit(); toast('Planner atualizado', 'ok'); }
    });
    return 'keep';
  }
  applyEdit(it, occDate, rec, 'all'); commit(); toast('Planner atualizado', 'ok');
}

/** Move uma ocorrência (arrastar no cronograma). */
function moveItem(it, occDate, newDate, newStart, newEnd) {
  const rec = { type: it.type, date: newDate, start: newStart, end: newEnd, subjects: [...(it.subjects || [])], title: it.title || '', desc: it.desc || '', reminder: it.reminder || 'none', repeat: [...(it.repeat || [])] };
  if (isSeries(it)) {
    choiceModal({
      title: 'Mover tarefa repetida', text: 'Esta tarefa se repete. Aplicar a mudança:',
      options: [{ label: 'Só esta data', value: 'one' }, { label: 'Esta e as próximas', value: 'following', cls: 'primary' }],
      onPick: scope => {
        const o = wdOf(occDate), n = wdOf(newDate);
        if (scope === 'following' && o !== n) { rec.repeat = rec.repeat.filter(x => x !== o); if (!rec.repeat.includes(n)) rec.repeat.push(n); }
        applyEdit(it, occDate, rec, scope); commit(); toast('Tarefa movida', 'ok');
      }
    });
    return;
  }
  applyEdit(it, occDate, rec, 'all'); commit(); toast('Tarefa movida', 'ok');
}

/** Exclui. Retorna true se excluiu na hora; false se abriu a janela de escolha (série) ou foi cancelado. */
function deletePlan(it, occDate) {
  if (isSeries(it)) {
    choiceModal({
      title: 'Excluir tarefa repetida', text: 'Esta tarefa se repete. O que excluir?',
      options: [{ label: 'Só este dia', value: 'one' }, { label: 'Este e os próximos', value: 'following' }, { label: 'Toda a série', value: 'all', cls: 'danger' }],
      onPick: scope => {
        if (scope === 'all' || (scope === 'following' && occDate <= it.date)) S.plan = S.plan.filter(x => x !== it);
        else if (scope === 'following') it.until = addDays(occDate, -1);
        else it.skip = (it.skip || []).concat(occDate);
        commit(); toast('Tarefa excluída', 'ok');
      }
    });
    return false;
  }
  if (!confirm('Excluir esta tarefa?')) return false;
  S.plan = S.plan.filter(x => x !== it);
  commit(); toast('Tarefa excluída', 'ok'); return true;
}

/** Clique em um bloco/tag/tarefa: descrição (Revisão, Compromisso, Simulado, Prova) ou edição direta. */
function openItem(id, date) {
  const it = S.plan.find(x => x.id === id); if (!it) return;
  if (!DESC_TYPES.includes(it.type)) { formPlan({ it, date }); return; }
  const rows = [
    ['Tipo', `<b style="color:${TYPE_COLOR[it.type]}">${esc(it.type)}</b>`],
    [it.subjects.length ? 'Matérias' : 'Título', esc(itemName(it, true))],
    ['Data e horário', `${brDate(date)} · ${esc(it.start)}–${esc(it.end)}`]
  ];
  if (it.desc) rows.push(['Descrição', `<div class="mx-text">${esc(it.desc)}</div>`]);
  if (it.type === 'Compromisso') rows.push(['Lembrete', esc(REMINDERS.find(r => r.v === (it.reminder || 'none')).l)]);
  if (isSeries(it)) rows.push(['Repetição', `Repete: ${esc(repeatText(it))}`]);
  openInfo({
    title: it.type, rows, actions: [
      { label: '<i class="fa-solid fa-trash"></i> Excluir', cls: 'danger', push: true, onClick: () => { if (deletePlan(it, date)) closeModal(); } },
      { label: '<i class="fa-solid fa-pen"></i> Editar', cls: '', onClick: () => formPlan({ it, date }) }
    ]
  });
}

/** Registrar estudo: lança no tempo líquido e nas questões por matéria. */
/** Registrar estudo de uma tarefa do planner (it) em uma data. Alimenta tempo, questões e revisões. */
function formStudy(it, date) {
  const type = it.type, multi = MULTI_SUBJ.includes(type), isQ = QUESTION_TYPES.includes(type);
  const prev = S.log.filter(l => regIds(it, date).includes(l.id));
  const editing = prev.length > 0;
  const ownNew = new Set(prev.flatMap(l => l.edNew || []));     // folhas que ESTE registro marcou no edital
  const locked = id => !!S.edital.checks[id] && !ownNew.has(id);  // já concluídas por outra via
  let rows = editing ? prev.map(l => ({ subject: l.subject, topic: l.topic || '', questions: l.questions || 0, hits: l.hits || 0, edIds: [...(l.edIds || [])] }))
    : (it.subjects && it.subjects.length ? it.subjects : [SUBJECT_NAMES[0]]).map(s => ({ subject: s, topic: '', questions: 0, hits: 0, edIds: [] }));
  if (!multi) rows = rows.slice(0, 1);
  const topicsOf = s => [...new Set(S.syllabus.filter(x => x.subject === s).map(x => x.topic))];
  const edPanel = r => {
    const sel = new Set(r.edIds), roots = edRoots().filter(x => x.subj === r.subject);
    if (!roots.length) return '<div class="muted hint">Esta matéria não tem itens no Edital Verificado.</div>';
    r.edOpen = r.edOpen || {};
    const node = (n, d) => {
      const lv = edLeaves(n), all = lv.every(l => locked(l.id) || sel.has(l.id)), none = lv.every(l => !locked(l.id) && !sel.has(l.id)), isLeaf = !(n.c && n.c.length);
      const fullyLocked = lv.every(l => locked(l.id));
      const open = !isLeaf && r.edOpen[n.id];
      return `<div class="edp-n" style="--d:${d}">${isLeaf ? '<span class="ed-sp"></span>' : `<button type="button" class="ed-tog ${open ? 'open' : ''}" data-edopen="${esc(n.id)}"><i class="fa-solid fa-chevron-right"></i></button>`}
        <label><input type="checkbox" class="ed-pick" data-node="${esc(n.id)}" ${all ? 'checked' : ''} ${fullyLocked ? 'disabled' : ''}> <span class="${fullyLocked ? 'muted' : ''}">${esc(n.t)}</span>${fullyLocked && isLeaf ? ' <small class="muted">(já concluído)</small>' : ''}</label></div>${open ? n.c.map(ch => node(ch, d + 1)).join('') : ''}`;
    };
    return roots.map(x => node(x, 0)).join('');
  };
  const edChips = r => { const t = r.edIds.map(id => { const f = edFind(id); return f ? f.n.t : ''; }).filter(Boolean); return t.length ? `<b>${t.length}</b> tópico(s) do edital: ${esc(t.slice(0, 3).join(' · '))}${t.length > 3 ? '…' : ''}` : 'Nenhum tópico do edital vinculado'; };
  const rowHTML = (r, i) => `<div class="sblk"><div class="srow" style="display:grid;gap:8px;grid-template-columns:${isQ ? '1.3fr 1.5fr 90px 90px' : '1fr 1.3fr'} auto;align-items:end;margin-bottom:10px">
      <div class="field"><label>Matéria</label><select class="rs">${optHTML(SUBJECT_NAMES, r.subject)}</select></div>
      <div class="field"><label>Assunto${REVIEW_SRC.includes(type) ? '' : ' (opcional)'}</label><input class="rt" list="dl-st-${i}" value="${esc(r.topic)}" placeholder="Digite ou escolha"><datalist id="dl-st-${i}">${topicsOf(r.subject).map(t => `<option value="${esc(t)}">`).join('')}</datalist></div>
      ${isQ ? `<div class="field"><label>Questões</label><input class="rq" type="number" min="0" value="${r.questions || ''}"></div><div class="field"><label>Acertos</label><input class="rh" type="number" min="0" value="${r.hits || ''}"></div>` : ''}
      ${multi && rows.length > 1 ? `<button type="button" class="icon-btn sm" data-rm="${i}" title="Remover matéria"><i class="fa-solid fa-xmark"></i></button>` : '<span></span>'}
    </div>
    <div class="st-ed"><button type="button" class="btn sm" data-edtog="${i}"><i class="fa-solid fa-link"></i> ${r.edPanel ? 'Fechar edital' : 'Vincular ao edital'}</button><span class="muted st-chips">${edChips(r)}</span></div>
    ${r.edPanel ? `<div class="edp">${edPanel(r)}</div>` : ''}</div>`;
  const draw = form => { $('#stRows', form).innerHTML = rows.map(rowHTML).join(''); sumUp(form); };
  const read = form => { rows = $$('.srow', form).map((el, i) => { const old = rows[i] || {}, subj = $('.rs', el).value; return { subject: subj, topic: $('.rt', el).value.trim(), questions: +($('.rq', el)?.value) || 0, hits: +($('.rh', el)?.value) || 0, edIds: old.subject === subj ? (old.edIds || []) : [], edOpen: old.edOpen, edPanel: old.edPanel }; }); };
  const sumUp = form => {
    const q = sum($$('.rq', form).map(x => +x.value || 0)), h = sum($$('.rh', form).map(x => +x.value || 0));
    const el = $('#stSum', form); if (el) el.innerHTML = isQ ? `Total: <b>${q}</b> questões · <b>${h}</b> acertos · Erros: <b>${Math.max(0, q - h)}</b>` : '';
  };
  openForm({
    title: `${editing ? 'Editar registro' : 'Registrar estudo'} — ${type}`, wide: true,
    fields: [
      { name: 'date', label: 'Data', type: 'date', value: editing ? prev[0].date : date, required: true },
      { name: 'minutes', label: isQ ? 'Tempo total (min)' : 'Tempo líquido (min)', type: 'number', min: 1, value: editing ? Math.round(sum(prev.map(l => l.minutes)) * 100) / 100 : durMin(it) || 60, required: true },
      { type: 'custom', full: true, html: '<div id="stRows"></div>' },
      ...(multi ? [{ type: 'custom', full: true, html: '<button type="button" class="btn sm" id="stAdd"><i class="fa-solid fa-plus"></i> Adicionar matéria</button>' }] : []),
      { type: 'custom', full: true, html: '<div class="preview" id="stSum"></div>' }
    ],
    validate: (d, form) => {
      read(form);
      if (!(d.minutes > 0)) return 'Informe o tempo.';
      if (new Set(rows.map(r => r.subject)).size !== rows.length) return 'Há matéria repetida. Use uma linha por matéria.';
      for (const r of rows) {
        if (REVIEW_SRC.includes(type) && !r.topic && !r.edIds.length) return `Informe o assunto de ${r.subject}.`;
        if (isQ && r.hits > r.questions) return `Em ${r.subject}, os acertos superam as questões resolvidas.`;
      }
      if (isQ && !sum(rows.map(r => r.questions))) return 'Informe as questões resolvidas.';
      return '';
    },
    onMount: form => {
      draw(form);
      form.onclick = e => {
        if (e.target.closest('#stAdd')) { read(form); const used = rows.map(r => r.subject); rows.push({ subject: SUBJECT_NAMES.find(n => !used.includes(n)) || SUBJECT_NAMES[0], topic: '', questions: 0, hits: 0, edIds: [] }); draw(form); return; }
        const rm = e.target.closest('[data-rm]'); if (rm) { read(form); rows.splice(+rm.dataset.rm, 1); draw(form); return; }
        const tg = e.target.closest('[data-edtog]'); if (tg) { read(form); const r = rows[+tg.dataset.edtog]; r.edPanel = !r.edPanel; draw(form); return; }
        const op = e.target.closest('[data-edopen]');
        if (op) { read(form); const r = rows[$$('.sblk', form).indexOf(op.closest('.sblk'))]; r.edOpen = r.edOpen || {}; r.edOpen[op.dataset.edopen] = !r.edOpen[op.dataset.edopen]; const top = $('.edp', op.closest('.sblk')).scrollTop; draw(form); $('.edp', $$('.sblk', form)[rows.indexOf(r)]).scrollTop = top; return; }
        const pk = e.target.closest('.ed-pick');
        if (pk) {
          read(form); const blk = pk.closest('.sblk'), r = rows[$$('.sblk', form).indexOf(blk)], f = edFind(pk.dataset.node); if (!f) return;
          const ids = edLeaves(f.n).map(l => l.id).filter(id => !locked(id)), cur = new Set(r.edIds);
          ids.forEach(id => (pk.checked ? cur.add(id) : cur.delete(id))); r.edIds = [...cur];
          const top = $('.edp', blk).scrollTop; draw(form); $('.edp', $$('.sblk', form)[rows.indexOf(r)]).scrollTop = top;
        }
      };
    },
    onChange: form => { $$('.srow', form).forEach((el, i) => { const dl = $('datalist', el); if (dl) dl.innerHTML = topicsOf($('.rs', el).value).map(t => `<option value="${esc(t)}">`).join(''); }); },
    onInput: form => sumUp(form),
    extra: editing ? [{ label: '<i class="fa-solid fa-rotate-left"></i> Desfazer registro', cls: 'danger', onClick: () => { undoReg(it, date); closeModal(); } }] : [],
    onSubmit: d => {
      const ids = regIds(it, date);
      ownNew.forEach(id => { delete S.edital.checks[id]; });         // desfaz as marcações do registro anterior (reaplicadas abaixo)
      S.log = S.log.filter(l => !ids.includes(l.id));
      const n = rows.length, per = Math.floor(d.minutes / n * 100) / 100, rest = Math.round((d.minutes - per * n) * 100) / 100;
      const novos = rows.map((r, i) => {
        const valid = r.edIds.filter(id => edFind(id) && !edFind(id).n.c?.length), fresh = valid.filter(id => !S.edital.checks[id]);
        fresh.forEach(id => { S.edital.checks[id] = true; });
        const first = valid.length ? edFind(valid[0]).n.t + (valid.length > 1 ? ` (+${valid.length - 1})` : '') : '';
        const o = { id: uid(), date: d.date, subject: r.subject, minutes: i === 0 ? Math.round((per + rest) * 100) / 100 : per, questions: isQ ? r.questions : 0, hits: isQ ? r.hits : 0, src: type, topic: r.topic || first, planId: it.id, planDate: date };
        if (valid.length) { o.edIds = valid; o.edNew = fresh; }
        return o;
      });
      S.log.push(...novos);
      it.regs = it.regs || {}; it.regs[date] = novos.map(l => l.id);
      if (!isDone(it, date)) it.doneDates = (it.doneDates || []).concat(date);
      commit(); toast(editing ? 'Registro atualizado' : 'Estudo registrado', 'ok');
    }
  });
}
function undoReg(it, date) {
  const ids = regIds(it, date);
  if (it.type !== 'Simulado') { S.log.filter(l => ids.includes(l.id)).forEach(l => (l.edNew || []).forEach(id => { delete S.edital.checks[id]; })); S.log = S.log.filter(l => !ids.includes(l.id)); }
  if (it.regs) delete it.regs[date];
  it.doneDates = (it.doneDates || []).filter(x => x !== date);
  commit(); toast(it.type === 'Simulado' ? 'Marcação desfeita (o simulado lançado continua na aba Simulados)' : 'Registro desfeito', 'ok');
}
/* =====================================================================
   9. FORMULÁRIOS — SIMULADOS, ERROS, RADAR, REVISÕES
   ===================================================================== */
function formMock(pre = {}) {
  let seq = [];
  const stratOpts = [{ v: '', l: 'Nova / nenhuma' }].concat(S.strategies.map(s => ({ v: s.id, l: `${s.label} — ${s.order.map(subjShort).join(' › ')}` })));
  const subjInputs = SUBJECT_NAMES.map((n, i) => `<div class="field"><label>${esc(subjShort(n))}</label><input type="number" name="sh${i}" min="0" step="1" placeholder="0"></div>`).join('');
  const stratHtml = `
    <label>Estratégia (ordem em que resolveu as matérias)</label>
    <select name="stratPick">${optHTML(stratOpts, '')}</select>
    <div class="strat-chips" id="stratBtns">${SUBJECT_NAMES.concat(['Redação']).map(n => `<button type="button" class="chip" data-subj="${esc(n)}">${esc(subjShort(n))}</button>`).join('')}</div>
    <div class="preview" id="stratSeq" style="margin-top:8px">Clique nas matérias na ordem em que as resolveu.</div>
    <button type="button" class="btn sm ghost" id="stratClear" style="margin-top:6px">Limpar ordem</button>`;
  const renderSeq = form => {
    $('#stratSeq', form).innerHTML = seq.length ? seq.map((n, i) => `<b>${i + 1}.</b> ${esc(subjShort(n))}`).join(' › ') : 'Clique nas matérias na ordem em que as resolveu.';
    $$('#stratBtns .chip', form).forEach(c => c.classList.toggle('active', seq.includes(c.dataset.subj)));
  };
  const preview = form => {
    const g = n => +form.elements[n].value || 0;
    const total = g('total'), h = g('hits'), e = g('errors'), b = g('blanks'), board = form.elements.board.value;
    const s = h + e + b, pts = calcPoints(board, h, e);
    const ok = total > 0 && s === total;
    $('#mockPrev', form).innerHTML = `Soma A+E+B: <b style="color:${ok ? 'var(--green)' : 'var(--crimson)'}">${s}/${total}</b> · Aproveitamento: <b>${total ? (h / total * 100).toFixed(1) : '0.0'}%</b> · Nota: <b>${fmtNum(pts)} pts</b> (${isCebraspe(board) ? 'acertos − erros' : 'acertos'}) · Precisão: <b>${h + e ? (h / (h + e) * 100).toFixed(1) : '0.0'}%</b>`;
  };
  openForm({
    title: 'Lançar simulado', wide: true,
    fields: [
      { name: 'name', label: 'Nome do simulado', required: true, full: true, value: pre.name || '' },
      { name: 'date', label: 'Data', type: 'date', value: pre.date || todayStr(), required: true },
      { name: 'board', label: 'Banca', type: 'select', options: BOARDS },
      { name: 'type', label: 'Tipo', type: 'select', options: MOCK_TYPES, value: 'Conteúdo' },
      { name: 'source', label: 'Fonte (onde foi feito)', placeholder: 'Ex.: plataforma, cursinho, prova anterior' },
      { name: 'total', label: 'Total de questões', type: 'number', min: 1, required: true },
      { name: 'hits', label: 'Acertos', type: 'number', min: 0, value: 0 },
      { name: 'errors', label: 'Erros', type: 'number', min: 0, value: 0 },
      { name: 'blanks', label: 'Brancos', type: 'number', min: 0, value: 0 },
      { name: 'cutoff', label: 'Nota de corte (pts) — opcional; só vale se a da última prova (Configurações) estiver vazia', type: 'number', step: 0.1 },
      { name: 'time', label: 'Tempo gasto (min) — obrigatório no tipo Real', type: 'number', min: 0, when: 'type=!Conteúdo' },
      { name: 'essay', label: 'Redação (nota) — opcional', type: 'number', min: 0, step: 0.1 },
      { type: 'custom', full: true, html: '<div class="preview" id="mockPrev"></div>' },
      { type: 'custom', full: true, html: `<label>Acertos por matéria (opcional — a soma deve bater com o total de acertos)</label><div class="subj-grid">${subjInputs}</div>` },
      { type: 'custom', full: true, html: `<label>Análise dos erros — ATP (opcional)</label><div class="trio">
          <div class="field"><label>Atenção</label><input type="number" name="atpA" min="0" placeholder="0"></div>
          <div class="field"><label>Teoria</label><input type="number" name="atpT" min="0" placeholder="0"></div>
          <div class="field"><label>Pulo do gato</label><input type="number" name="atpP" min="0" placeholder="0"></div></div>` },
      { type: 'custom', full: true, html: stratHtml },
      { name: 'debriefBad', label: 'O que deu errado', type: 'textarea', full: true, placeholder: 'Ex.: faltou tempo, ansiedade, erros por falta de atenção…' },
      { name: 'debriefGood', label: 'O que deu certo', type: 'textarea', full: true, placeholder: 'Ex.: boa gestão de tempo, dormi bem, estratégia…' }
    ],
    validate: (d, form) => {
      const s = (d.hits || 0) + (d.errors || 0) + (d.blanks || 0);
      if (s !== d.total) return `Acertos + erros + brancos (${s}) deve ser igual ao total de questões (${d.total ?? 0}).`;
      if (d.type === 'Real' && !(d.time > 0)) return 'No simulado do tipo Real, o tempo gasto é obrigatório.';
      const sh = SUBJECT_NAMES.map((n, i) => form.elements['sh' + i].value);
      if (sh.some(x => x !== '') && sum(sh.map(Number)) !== d.hits) return `A soma dos acertos por matéria (${sum(sh.map(Number))}) difere do total de acertos (${d.hits}).`;
      const atp = sum(['atpA', 'atpT', 'atpP'].map(n => +form.elements[n].value || 0));
      if (atp > (d.errors || 0)) return `A análise ATP (${atp}) não pode superar o total de erros (${d.errors}).`;
      return '';
    },
    onMount: form => {
      preview(form); renderSeq(form);
      form.onclick = e => {
        const c = e.target.closest('#stratBtns .chip');
        if (c) { const n = c.dataset.subj; seq = seq.includes(n) ? seq.filter(x => x !== n) : seq.concat(n); form.elements.stratPick.value = ''; renderSeq(form); }
        if (e.target.id === 'stratClear') { seq = []; form.elements.stratPick.value = ''; renderSeq(form); }
      };
    },
    onChange: form => {
      preview(form);
      const pick = S.strategies.find(s => s.id === form.elements.stratPick.value);
      if (pick && document.activeElement === form.elements.stratPick) { seq = [...pick.order]; renderSeq(form); }
    },
    onInput: preview,
    onSubmit: (d, form) => {
      const subj = {};
      SUBJECT_NAMES.forEach((n, i) => { const v = form.elements['sh' + i].value; if (v !== '') subj[n] = Number(v); });
      let strategy = null;
      if (seq.length) {
        const key = seq.join('|');
        let st = S.strategies.find(s => s.order.join('|') === key);
        if (!st) { const n = S.strategies.length; st = { id: uid(), label: n < 26 ? String.fromCharCode(65 + n) : `E${n + 1}`, order: [...seq] }; S.strategies.push(st); }
        strategy = st.id;
      }
      const g = n => +form.elements[n].value || 0;
      const atp = { atencao: g('atpA'), teoria: g('atpT'), pulo: g('atpP') };
      S.mocks.push({
        id: uid(), name: d.name, date: d.date, board: d.board, type: d.type, source: d.source, total: d.total, hits: d.hits || 0, errors: d.errors || 0, blanks: d.blanks || 0,
        points: calcPoints(d.board, d.hits || 0, d.errors || 0), score: (d.hits || 0) / d.total * 100,
        time: d.type === 'Conteúdo' ? 0 : (d.time || 0), essay: d.essay, cutoff: d.cutoff, subj, atp, strategy, debrief: '', debriefBad: d.debriefBad, debriefGood: d.debriefGood
      });
      if (pre.planId) { const pi = S.plan.find(x => x.id === pre.planId); if (pi) { pi.regs = pi.regs || {}; pi.regs[pre.planDate] = ['mock:' + S.mocks[S.mocks.length - 1].id]; if (!isDone(pi, pre.planDate)) pi.doneDates = (pi.doneDates || []).concat(pre.planDate); } }
      commit(); toast('Simulado lançado', 'ok');
    }
  });
}

function formError() {
  const mockOpts = S.mocks.length ? [...S.mocks].sort((a, b) => b.date.localeCompare(a.date)).map(m => ({ v: m.id, l: `${m.name} (${brDate(m.date)})` })) : [{ v: '', l: 'Nenhum simulado cadastrado' }];
  openForm({
    title: 'Registrar erro',
    fields: [
      { name: 'subject', label: 'Matéria', type: 'select', options: SUBJECT_NAMES },
      { name: 'topic', label: 'Assunto', required: true },
      { name: 'category', label: 'Categoria', type: 'select', options: ERR_CATS, full: true },
      { name: 'origin', label: 'Origem / fonte', type: 'select', options: ERR_ORIGINS },
      { name: 'mockId', label: 'Qual simulado?', type: 'select', options: mockOpts, when: 'origin=Simulado' },
      { name: 'questions', label: 'Nº das questões', placeholder: 'Ex.: 12, 15', full: true }
    ],
    validate: d => (d.origin === 'Simulado' && !d.mockId ? 'Cadastre um simulado antes de usar esta origem.' : ''),
    onSubmit: d => {
      S.errors.unshift({ id: uid(), date: todayStr(), subject: d.subject, topic: d.topic, category: d.category, origin: d.origin, mockId: d.origin === 'Simulado' ? d.mockId : '', questions: d.questions, reason: '', study: '', pitfall: '', bizu: '', resolved: false });
      commit(); toast('Erro registrado', 'ok');
    }
  });
}
/** Ao marcar como resolvido, pede os campos da categoria. */
function formResolve(e) {
  const f = e.category === CAT_ATENCAO ? [{ name: 'reason', label: 'Motivo', value: e.reason }]
    : e.category === CAT_TEORIA ? [{ name: 'study', label: 'O que estudar', value: e.study }]
    : [{ name: 'pitfall', label: 'Pegadinha', value: e.pitfall }, { name: 'bizu', label: 'Bizu', value: e.bizu }];
  openForm({
    title: `Resolver erro — ${e.category}`,
    fields: f.map(x => ({ ...x, type: 'textarea', required: true, full: true })),
    submitLabel: 'Marcar como resolvido',
    onSubmit: d => { Object.assign(e, d, { resolved: true, resolvedDate: todayStr() }); commit(); toast('Erro resolvido', 'ok'); }
  });
}
function formTopic() {
  openForm({
    title: 'Novo assunto no Radar',
    fields: [
      { name: 'subject', label: 'Matéria', type: 'select', options: SUBJECT_NAMES },
      { name: 'incidence', label: 'Incidência', type: 'select', options: ['Alta', 'Média', 'Baixa'], value: 'Média' },
      { name: 'topic', label: 'Assunto', required: true, full: true }
    ],
    onSubmit: d => { S.syllabus.push({ id: uid(), subject: d.subject, topic: d.topic, incidence: d.incidence, status: 'Não Visto', custom: true }); commit(); toast('Assunto adicionado', 'ok'); }
  });
}
/* =====================================================================
   10. GRÁFICOS (Chart.js)
   ===================================================================== */
const charts = {};
function mk(id, cfg) {
  const el = document.getElementById(id);
  if (!el || typeof Chart === 'undefined') return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(el, cfg);
}
function grad(chart, c1, c2) {
  const { ctx, chartArea } = chart;
  if (!chartArea) return c1;
  const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  return g;
}
function setupChartDefaults() {
  if (typeof Chart === 'undefined') return;
  Chart.defaults.color = '#8b929c';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.borderColor = 'rgba(255,255,255,.07)';
  Chart.defaults.maintainAspectRatio = false;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
  Object.assign(Chart.defaults.plugins.tooltip, { backgroundColor: 'rgba(14,15,17,.97)', borderColor: 'rgba(255,255,255,.35)', borderWidth: 1, padding: 12, titleColor: '#ffffff', bodyColor: '#e4e7ec', cornerRadius: 8, displayColors: true, titleFont: { family: "'JetBrains Mono',monospace", size: 12 } });
}

function chartMocks(c) {
  const ms = c.mocks;   // pontos = acertos − erros (modelo Cebraspe), já calculado em m.points
  mk('chartMocks', {
    type: 'line',
    data: {
      labels: ms.length ? ms.map(m => brDate(m.date).slice(0, 5)) : ['—'],
      datasets: [
        { label: 'Seus pontos', data: ms.map(m => +m.points.toFixed(1)), borderColor: '#f1f3f6', backgroundColor: '#f1f3f6', tension: 0, fill: false, pointRadius: 5, pointHoverRadius: 8, borderWidth: 3 },
        { label: 'Nota de corte (pts)', data: ms.map(m => cutOf(m)), borderColor: '#ff2d55', backgroundColor: '#ff2d55', borderDash: [7, 6], tension: 0, pointRadius: 3, borderWidth: 2, fill: false, spanGaps: false }
      ]
    },
    options: {
      scales: { y: { title: { display: true, text: 'pontos' } } }, interaction: { mode: 'index', intersect: false },
      plugins: { tooltip: { callbacks: { title: items => ms[items[0].dataIndex]?.name || '' } } }
    }
  });
}
function chartSubjects(sub) {
  mk('chartSubjects', {
    type: 'radar',
    data: {
      labels: sub.map(s => s.short),
      datasets: [
        { label: 'Seu acerto (%)', data: sub.map(s => +s.acc.toFixed(1)), borderColor: '#f1f3f6', backgroundColor: 'rgba(255,255,255,.16)', pointBackgroundColor: '#f1f3f6', borderWidth: 2 },
        { label: `Meta (${S.settings.cutoff}%)`, data: sub.map(() => S.settings.cutoff), borderColor: '#ffb300', borderDash: [5, 5], pointRadius: 0, borderWidth: 1.5, backgroundColor: 'transparent' }
      ]
    },
    options: { scales: { r: { min: 0, max: 100, angleLines: { color: 'rgba(255,255,255,.1)' }, grid: { color: 'rgba(255,255,255,.1)' }, ticks: { backdropColor: 'transparent', stepSize: 25 }, pointLabels: { color: '#d8e6f3', font: { size: 12 } } } } }
  });
}
function chartIncidence(sub) {
  mk('chartIncidence', {
    type: 'bar',
    data: {
      labels: sub.map(s => s.short),
      datasets: [
        { label: 'Incidência da banca (índice)', data: sub.map(s => +s.incIdx.toFixed(0)), backgroundColor: ctx => grad(ctx.chart, 'rgba(255,45,85,.9)', 'rgba(255,45,85,.15)'), borderRadius: 5 },
        { label: 'Seu acerto (%)', data: sub.map(s => +s.acc.toFixed(0)), backgroundColor: ctx => grad(ctx.chart, 'rgba(241,243,246,.9)', 'rgba(241,243,246,.12)'), borderRadius: 5 }
      ]
    },
    options: { layout: { padding: { top: 4, right: 8 } }, scales: { y: { min: 0, max: 100 }, x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 30, font: { size: 11 } } } } }
  });
}
function chartBlocks(sub) {
  const ordered = [...sub].sort((a, b) => a.block.localeCompare(b.block) || b.coverage - a.coverage);
  mk('chartBlocks', {
    type: 'bar',
    data: { labels: ordered.map(s => `[${s.block}] ${s.name}`), datasets: [{ label: 'Concluído (%)', data: ordered.map(s => +s.coverage.toFixed(0)), backgroundColor: ordered.map(s => BLOCK_COLORS[s.block] + 'cc'), borderColor: ordered.map(s => BLOCK_COLORS[s.block]), borderWidth: 1, borderRadius: 6 }] },
    options: { indexAxis: 'y', scales: { x: { min: 0, max: 100, ticks: { callback: v => v + '%' } } }, plugins: { legend: { display: false } } }
  });
}
function chartMockBreak() {
  const ms = [...S.mocks].sort((a, b) => a.date.localeCompare(b.date));
  mk('chartMockBreak', {
    type: 'bar',
    data: {
      labels: ms.map(m => m.name),
      datasets: [
        { label: 'Acertos', data: ms.map(m => m.hits), backgroundColor: 'rgba(0,245,155,.75)', borderRadius: 4 },
        { label: 'Erros', data: ms.map(m => m.errors), backgroundColor: 'rgba(255,45,85,.75)', borderRadius: 4 },
        { label: 'Brancos', data: ms.map(m => m.blanks), backgroundColor: 'rgba(255,179,0,.7)', borderRadius: 4 }
      ]
    },
    options: { scales: { x: { stacked: true }, y: { stacked: true } } }
  });
}
function chartAnalytics(sub) {
  const palette = ['#00e5ff', '#2979ff', '#9b6bff', '#ffb300', '#ff2d55', '#00f59b', '#ff7a45', '#4dd0e1', '#c0ca33', '#ec407a'];
  mk('chartTimeSubject', {
    type: 'doughnut',
    data: { labels: sub.map(s => s.name), datasets: [{ data: sub.map(s => +(s.minutes / 60).toFixed(1)), backgroundColor: palette.map(c => c + 'cc'), borderColor: '#0b0c0e', borderWidth: 3, hoverOffset: 10 }] },
    options: { cutout: '62%', plugins: { legend: { position: 'right', labels: { font: { size: 12 } } }, tooltip: { callbacks: { label: i => ` ${i.label}: ${i.parsed}h` } } } }
  });
  const t = todayStr(), monday = mondayOf(t);
  const labels = [], vals = [];
  for (let w = 7; w >= 0; w--) {
    const start = addDays(monday, -w * 7), end = addDays(start, 6);
    labels.push(brDate(start).slice(0, 5));
    vals.push(+(sum(S.log.filter(l => l.date >= start && l.date <= end).map(l => l.minutes)) / 60).toFixed(1));
  }
  mk('chartWeekly', {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Horas', data: vals, backgroundColor: ctx => grad(ctx.chart, 'rgba(255,179,0,.95)', 'rgba(255,179,0,.1)'), borderRadius: 6 }] },
    options: { scales: { y: { beginAtZero: true, ticks: { callback: v => v + 'h' } } }, plugins: { legend: { display: false } } }
  });
}

/* ---- Heatmap de consistência (5 semanas × 7 dias) ---- */
function renderHeatmap() {
  const t = todayStr(), wd = (parseD(t).getDay() + 6) % 7;
  const start = addDays(t, -wd - 28);
  const byDate = {};
  S.log.forEach(l => { byDate[l.date] = (byDate[l.date] || 0) + l.minutes; });
  let html = '';
  for (let w = 0; w < 5; w++) for (let d = 0; d < 7; d++) {
    const date = addDays(start, w * 7 + d), m = byDate[date] || 0, future = date > t;
    const lvl = m === 0 ? 0 : m < 60 ? 1 : m < 120 ? 2 : m < 180 ? 3 : 4;
    html += `<div class="heat-cell l${lvl} ${future ? 'future' : ''}" title="${brDate(date)} — ${fmtHM(m)}"></div>`;
  }
  $('#heatmap').innerHTML = html;
  $('#heatDays').innerHTML = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => `<span>${d}</span>`).join('');
  const sums = Array(7).fill(0), cnt = Array(7).fill(0);
  Object.entries(byDate).forEach(([date, m]) => { const i = parseD(date).getDay(); sums[i] += m; cnt[i]++; });
  const avgs = sums.map((s, i) => (cnt[i] ? s / cnt[i] : 0)), best = avgs.indexOf(Math.max(...avgs));
  $('#bestDay').textContent = Math.max(...avgs) > 0 ? `Pico: ${WEEKDAYS_FULL[best]} (~${fmtHM(avgs[best])}/dia)` : '';
}

/* =====================================================================
   11. RENDER — KPIs, HEADER (nav)
   ===================================================================== */
const KPI_DEFS = [
  { id: 'hours', icon: 'fa-clock', label: 'Horas líquidas (mês)', color: 'c-cyan', dec: 1, suf: 'h', val: c => c.monthMin / 60, sub: c => `Semana: ${fmtH(c.weekMin)}h`, bar: c => clamp(c.weekMin / 60 / 28 * 100, 0, 100) },
  { id: 'mockavg', icon: 'fa-file-pen', label: 'Aproveitamento nos simulados', color: 'c-gold', dec: 1, suf: '%', val: c => c.mockAvg, sub: c => c.mocks.length ? `Último: ${c.mocks[c.mocks.length - 1].score.toFixed(1)}% · ${c.mocks.length} simulados` : 'Nenhum simulado', bar: c => c.mockAvg },
  { id: 'coverage', icon: 'fa-list-check', label: 'Cobertura do edital', color: 'c-green', dec: 0, suf: '%', val: c => c.coverage, sub: c => `${c.edDone} de ${c.edTotal} tópicos do edital concluídos`, bar: c => c.coverage },
  { id: 'questions', icon: 'fa-circle-question', label: 'Questões resolvidas', color: 'c-blue', dec: 0, suf: '', val: c => c.totalQ, sub: c => `Taxa de acerto: ${c.accuracy.toFixed(1)}%`, bar: c => c.accuracy },
  { id: 'reviews', icon: 'fa-arrows-rotate', label: 'Revisões pendentes hoje', color: 'c-gold', dec: 0, suf: '', val: c => c.pendingRev, sub: c => c.overdueRev ? `${c.overdueRev} vencida(s)` : 'Em dia', bar: c => clamp(100 - c.pendingRev * 15, 0, 100) },
  { id: 'errors', icon: 'fa-triangle-exclamation', label: 'Desvios críticos', color: 'c-crimson', dec: 0, suf: '', val: c => c.openErrors, sub: () => 'erros sem resolução no caderno', bar: c => clamp(c.openErrors * 10, 0, 100) },
  { id: 'goal', icon: 'fa-bullseye', label: 'Meta diária de blocos', color: 'c-violet', dec: 0, suf: '%', val: c => c.goalPct, sub: c => `${c.doneBlocks}/${S.settings.dailyGoal} blocos hoje`, bar: c => c.goalPct },
  { id: 'comp', icon: 'fa-ranking-star', label: 'Competitividade (estimada)', color: 'c-green', dec: 0, suf: '%', val: c => c.compPct, sub: c => c.compLabel, bar: c => c.compPct }
];

function countUp(el, to, dec = 0, dur = 900) {
  const from = Number(el.dataset.v || 0); el.dataset.v = to;
  if (from === to) { el.firstChild.nodeValue = to.toFixed(dec); return; }
  const t0 = performance.now();
  const step = now => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3); el.firstChild.nodeValue = (from + (to - from) * e).toFixed(dec); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
function renderKPIs(c) {
  const grid = $('#kpiGrid');
  if (!grid.children.length) {
    grid.innerHTML = KPI_DEFS.map(k => `
      <div class="card kpi ${k.color}"><div class="glow"></div>
        <div class="kpi-top"><span>${k.label}</span><i class="fa-solid ${k.icon}"></i></div>
        <div class="kpi-val"><span id="kv-${k.id}" data-v="0">0</span><small>${k.suf}</small></div>
        <div class="kpi-sub" id="ks-${k.id}"></div>
        <div class="kpi-bar"><i id="kb-${k.id}"></i></div>
      </div>`).join('');
  }
  KPI_DEFS.forEach(k => {
    countUp($('#kv-' + k.id), +k.val(c).toFixed(k.dec), k.dec);
    $('#ks-' + k.id).textContent = k.sub(c);
    $('#kb-' + k.id).style.width = clamp(k.bar(c), 0, 100) + '%';
  });
}
function renderHeader(c) {
  $('#navRevCount').textContent = c.pendingRev || '';
  $('#navErrCount').textContent = c.openErrors || '';
}

/* =====================================================================
   12. RENDER — VIEWS
   ===================================================================== */
/* ---- Visão Geral (inclui o antigo Analytics) ---- */
function renderAnalyticsTable(sub) {
  const totalMin = sum(sub.map(s => s.minutes)) || 1;
  $('#analyticsBody').innerHTML = sub.map(s => `<tr><td><b>${esc(s.name)}</b> <span class="badge neutral">${s.block}</span></td>
    <td class="mono">${fmtHM(s.minutes)} <span class="muted">(${(s.minutes / totalMin * 100).toFixed(0)}%)</span></td><td class="mono">${s.questions}</td><td class="mono">${s.hits}</td>
    <td><span class="badge ${!s.questions ? 'neutral' : s.acc >= S.settings.cutoff ? 'ok' : s.acc >= S.settings.cutoff - 10 ? 'media' : 'alta'}">${s.questions ? s.acc.toFixed(1) + '%' : '—'}</span></td>
    <td style="min-width:140px"><div class="progress"><i style="width:${s.coverage}%"></i></div></td></tr>`).join('');
}
/* ---- Rotina Tracker (hábitos do Planner × dias do mês) ---- */
function routineTracker(ym) {
  const [y, m] = ym.split('-').map(Number), n = new Date(y, m, 0).getDate(), t = todayStr();
  const rows = new Map();
  for (let d = 1; d <= n; d++) {
    const date = `${ym}-${String(d).padStart(2, '0')}`;
    occurrences(date).forEach(o => {
      if (o.it.type !== 'Rotina') return;
      const key = norm(o.it.title || 'Rotina');
      const r = rows.get(key) || { title: o.it.title || 'Rotina', color: itemColor(o.it), cells: {} };
      r.cells[d] = { date, done: isDone(o.it, date), past: date < t, today: date === t };
      rows.set(key, r);
    });
  }
  return { n, days: n, rows: [...rows.values()].sort((a, b) => a.title.localeCompare(b.title)) };
}
const ROUTINE_PALETTE = ['#00e5ff', '#ffb300', '#ff5252', '#9b6bff', '#00f59b', '#ff7ab6', '#2979ff', '#c0ca33', '#ff8a65', '#4dd0e1', '#b39ddb', '#80cbc4'];
/** Cor individual de cada rotina (só no Rotina Tracker): atribuída na 1ª vez em que a rotina aparece e mantida depois. */
function routineColor(key) {
  const m = S.routineColors; if (m[key]) return m[key];
  const used = new Set(Object.values(m)); m[key] = ROUTINE_PALETTE.find(c => !used.has(c)) || ROUTINE_PALETTE[Object.keys(m).length % ROUTINE_PALETTE.length];
  return m[key];
}
function renderRoutineTracker() {
  const host = $('#routineTracker'); if (!host) return;
  const ym = UI.routineMonth, [y, m] = ym.split('-').map(Number);
  $('#rtLabel').textContent = `${MONTHS[m - 1]} ${y}`;
  const T = routineTracker(ym), before = JSON.stringify(S.routineColors);
  if (!T.rows.length) { host.innerHTML = '<div class="empty">Nenhuma rotina neste mês. Crie tarefas do tipo "Rotina" no Planner (com repetição) e marque-as nas tarefas do dia.</div>'; return; }
  const today = todayStr();
  const head = Array.from({ length: T.n }, (_, i) => `<span class="rt-d${`${ym}-${z2(i + 1)}` === today ? ' today' : ''}">${i + 1}</span>`).join('');
  const body = T.rows.map(r => {
    const col = routineColor(norm(r.title));
    const cells = Array.from({ length: T.n }, (_, i) => { const c = r.cells[i + 1], done = c && c.done; return `<span class="rt-c${done ? ' done' : ''}" style="--c:${col}" title="${brDate(`${ym}-${z2(i + 1)}`)}${done ? ' — feito' : ''}"></span>`; }).join('');
    return `<div class="rt-row"><div class="rt-name" title="${esc(r.title)}"><i style="background:${col}"></i>${esc(r.title)}</div><div class="rt-cells" style="--n:${T.n}">${cells}</div></div>`;
  }).join('');
  host.innerHTML = `<div class="rt-row rt-head"><div class="rt-name"></div><div class="rt-cells" style="--n:${T.n}">${head}</div></div>${body}`;
  if (JSON.stringify(S.routineColors) !== before) save();
}
function renderOverview(c) {
  const sub = subjectStats();
  renderKPIs(c); renderHeatmap(); renderRoutineTracker(); renderAnalyticsTable(sub);
  chartMocks(c); chartSubjects(sub); chartIncidence(sub); chartBlocks(sub); chartAnalytics(sub);
}

/* ---- Planner ---- */
const stripeGradient = cols => `linear-gradient(to bottom, ${cols.map((c, i) => `${c} ${i * 100 / cols.length}% ${(i + 1) * 100 / cols.length}%`).join(', ')})`;
/** Faixa do cronograma: padrão 5h–meia-noite; se alguma tarefa (de qualquer semana) começa antes ou termina depois, a faixa cresce até incluí-la. */
function updateGridRange() {
  let a = 5, b = 24;
  S.plan.forEach(it => { a = Math.min(a, Math.floor(toMin(it.start) / 60)); b = Math.max(b, Math.ceil(endMin(it) / 60)); });
  GRID_START = clamp(a, 0, 23); GRID_END = clamp(b, GRID_START + 1, 24); GRID_ROWS = GRID_END - GRID_START;
}
function renderWeek() {
  updateGridRange();
  const t = todayStr(), days = Array.from({ length: 7 }, (_, i) => addDays(UI.weekStart, i));
  $('#weekLabel').textContent = `${brDate(days[0]).slice(0, 5)} – ${brDate(days[6]).slice(0, 5)}`;
  let html = '<div class="week"><div class="wk-corner"></div>';
  days.forEach(d => {
    html += `<div class="wk-dayhead ${d === t ? 'today' : ''} ${d === UI.plannerDate ? 'sel' : ''}" data-action="pick-day" data-date="${d}">${WEEKDAYS[parseD(d).getDay()]}<b>${parseD(d).getDate()}</b></div>`;
  });
  html += `<div class="wk-hours" style="--rows:${GRID_ROWS}">${Array.from({ length: GRID_ROWS + 1 }, (_, i) => `<span style="top:${i === 0 ? '3px' : i === GRID_ROWS ? 'calc(100% - 14px)' : `calc(${i} / ${GRID_ROWS} * 100% - 7px)`}">${z2((GRID_START + i) % 24)}h</span>`).join('')}</div>`;
  const total = GRID_ROWS * 60;
  days.forEach(d => {
    const blocks = layoutDay(occurrences(d)).filter(ev => ev.e > GRID_START * 60 && ev.s < GRID_END * 60).map(ev => {
      const s = Math.max(ev.s, GRID_START * 60), e = Math.min(ev.e, GRID_END * 60), it = ev.o.it;
      const top = (s - GRID_START * 60) / total * 100, h = (e - s) / total * 100;
      const w = 100 / ev.lanes, l = ev.lane * w, cols = itemColors(it), teo = it.type === 'Teoria' && it.subjects && it.subjects[0], rot = it.type === 'Rotina' && it.title;
      const stripe = cols.length > 1 ? `<i class="wk-stripe" style="background:${stripeGradient(cols.slice(1))}"></i>` : '';
      return `<div class="wk-block ${(e - s) < 45 ? 'short' : ''}" style="--tc:${cols[0]};top:${top}%;height:calc(${h}% - 1px);left:calc(${l}% + 2px);width:calc(${w}% - 4px)" data-action="view-item" data-id="${it.id}" data-date="${d}" title="${esc(it.type)} · ${esc(itemName(it, true))}">
        <b>${teo ? esc(subjShort(it.subjects[0])) : rot ? esc(it.title) : esc(it.type)}</b>${teo ? '<span>Teoria</span>' : rot ? '<span>Rotina</span>' : ''}${stripe}<i class="wk-resize" data-resize title="Arraste para mudar a duração"></i></div>`;
    }).join('');
    html += `<div class="wk-col ${d === t ? 'today' : ''}" style="--rows:${GRID_ROWS}" data-action="grid-cell" data-date="${d}">${blocks}</div>`;
  });
  html += '</div>';
  $('#weekGrid').innerHTML = html;
}
const regIds = (it, date) => ((it.regs || {})[date] || []);
function renderDayTasks() {
  const date = UI.plannerDate;
  $('#plannerDate').value = date;
  const occ = occurrences(date);
  const study = occ.filter(({ it }) => STUDY_TYPES.includes(it.type));
  const doneH = sum(study.filter(({ it }) => isDone(it, date)).map(({ it }) => durMin(it) / 60));
  const totalH = sum(study.map(({ it }) => durMin(it) / 60));
  $('#plannerSummary').textContent = `${occ.filter(({ it }) => isDone(it, date)).length}/${occ.length} tarefas · ${fmtNum(+doneH.toFixed(1))}/${fmtNum(+totalH.toFixed(1))} blocos de estudo`;
  $('#plannerProgress').style.width = (totalH ? doneH / totalH * 100 : 0) + '%';
  const rowHtml = ({ it }) => {
    const reg = REGISTER_TYPES.includes(it.type), registered = reg && regIds(it, date).length > 0, color = itemColor(it);
    let act = '', lead = '', dur = '';
    if (it.type === 'Caderno de Erros') {
      if (isDone(it, date)) {
        const ents = S.log.filter(l => regIds(it, date).includes(l.id)), mats = new Set(S.errors.filter(e => e.resolved && e.resolvedDate === date).map(e => e.subject));
        if (!mats.size) ents.forEach(l => l.subject && mats.add(l.subject));
        dur = ` <span class="t-dur">· ${mats.size} matéria${mats.size === 1 ? '' : 's'} · ${fmtDur(sum(ents.map(l => l.minutes)) || durMin(it))}</span>`;
        act = `<span class="badge ok"><i class="fa-solid fa-check"></i> Feito</span>${ents.some(l => l.auto) ? `<button class="icon-btn sm" title="Ajustar o tempo" data-action="edit-caderno" data-id="${it.id}" data-date="${date}"><i class="fa-solid fa-pen"></i></button>` : ''}`;
      } else act = `<button class="btn sm primary" data-action="go-erros"><i class="fa-solid fa-book-bookmark"></i> Ir para o caderno</button>`;
    } else if (!reg) act = `<input type="checkbox" data-action="toggle-plan" data-id="${it.id}" data-date="${date}" ${isDone(it, date) ? 'checked' : ''}>`;
    else if (!registered) act = `<button class="btn sm primary" data-action="reg-study" data-id="${it.id}" data-date="${date}"><i class="fa-solid fa-pen-to-square"></i> Registrar estudo</button>`;
    else {
      const ents = S.log.filter(l => regIds(it, date).includes(l.id));
      if (it.type !== 'Simulado') dur = ` <span class="t-dur">· ${fmtDur(sum(ents.map(l => l.minutes)))}</span>`;
      act = `<span class="badge ok">Registrado</span>${it.type === 'Simulado' ? '' : `<button class="icon-btn sm" title="Editar registro" data-action="edit-study" data-id="${it.id}" data-date="${date}"><i class="fa-solid fa-pen"></i></button>`}<button class="icon-btn sm" title="Desfazer registro" data-action="undo-reg" data-id="${it.id}" data-date="${date}"><i class="fa-solid fa-rotate-left"></i></button>`;
    }
    return `<li class="task ${isDone(it, date) ? 'done' : ''}" style="--tc:${color}">${lead}
      <div class="t-body" data-action="view-item" data-id="${it.id}" data-date="${date}" style="cursor:pointer">
        <div class="t-title" style="color:${color}"><i class="fa-solid ${TYPE_ICON[it.type]}"></i> ${esc(it.type)}</div>
        <div class="t-meta"><span class="t-name">${esc(itemName(it, true))}</span>${dur}</div>
      </div><div class="t-act">${act}</div>
    </li>`;
  };
  const GROUPS = [['Blocos de estudo', ({ it }) => STUDY_TYPES.includes(it.type) || it.type === 'Simulado'], ['Tarefas', ({ it }) => !(STUDY_TYPES.includes(it.type) || it.type === 'Simulado')]];
  $('#taskList').innerHTML = occ.length ? GROUPS.map(([label, f]) => { const g = occ.filter(f); return g.length ? `<li class="grp">${label}</li>` + g.map(rowHtml).join('') : ''; }).join('') : `<li class="empty"><i class="fa-solid fa-mug-hot"></i>Nenhuma tarefa neste dia.</li>`;
}
function renderReminders() {
  const list = getReminders();
  $('#reminders').innerHTML = list.length ? list.map(({ it, date, i }) => {
    const box = !REGISTER_TYPES.includes(it.type) ? `<input type="checkbox" data-action="toggle-plan" data-id="${it.id}" data-date="${date}" ${isDone(it, date) ? 'checked' : ''}>` : '';
    return `<div class="rem ${isDone(it, date) ? 'done' : ''}" style="--tc:${TYPE_COLOR[it.type]};cursor:pointer" data-action="view-item" data-id="${it.id}" data-date="${date}">
      ${box}<i class="fa-solid ${TYPE_ICON[it.type]}"></i>
      <div><b>${esc(itemName(it, true))}</b><small>${esc(it.type)} · ${i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : `Em ${i} dias`} · ${brDate(date).slice(0, 5)} ${it.start}</small></div>
    </div>`;
  }).join('') : `<div class="empty"><i class="fa-solid fa-bell-slash"></i>Sem lembretes no momento.</div>`;
}
function renderMonth() {
  const [y, m] = UI.month.split('-').map(Number);
  $('#monthInput').value = UI.month;
  const first = `${y}-${z2(m)}-01`, lastDay = new Date(y, m, 0).getDate(), last = `${y}-${z2(m)}-${z2(lastDay)}`;
  const start = mondayOf(first), end = addDays(mondayOf(last), 6), t = todayStr();
  let html = `<div class="mc-head">${['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => `<span>${d}</span>`).join('')}</div><div class="mc-grid">`;
  for (let d = start; d <= end; d = addDays(d, 1)) {
    const tags = occurrences(d).filter(({ it }) => TAG_TYPES.includes(it.type)).map(({ it }) => `<span class="tag ${isDone(it, d) ? 'done' : ''}" style="--tc:${TYPE_COLOR[it.type]};cursor:pointer" data-action="view-item" data-id="${it.id}" data-date="${d}" title="${esc(itemName(it, true))}">${esc(it.type)}</span>`).join('');
    html += `<div class="mc-day ${d.slice(0, 7) !== UI.month ? 'other' : ''} ${d === t ? 'today' : ''}" data-action="month-day" data-date="${d}" title="Clique para cadastrar uma tarefa neste dia"><span class="mc-num">${parseD(d).getDate()}</span><div class="mc-tags">${tags}</div></div>`;
  }
  $('#monthGrid').innerHTML = html + '</div>';
}
/* ---- Programação anual: contagem por mês dos itens cadastrados no Planner (não usa a aba Revisões) ---- */
const ANNUAL_TYPES = [['Prova', 'Provas'], ['Compromisso', 'Compromissos'], ['Simulado', 'Simulados'], ['Revisão', 'Revisões']];
function annualCounts(year) {
  const out = Array.from({ length: 12 }, () => Object.fromEntries(ANNUAL_TYPES.map(([t]) => [t, 0])));
  for (let m = 0; m < 12; m++) {
    const n = new Date(year, m + 1, 0).getDate();
    for (let d = 1; d <= n; d++) occurrences(`${year}-${z2(m + 1)}-${z2(d)}`).forEach(({ it }) => { if (it.type in out[m]) out[m][it.type]++; });
  }
  return out;
}
function renderAnnual() {
  const host = $('#annualGrid'); if (!host) return;
  const y = UI.annualYear, cnt = annualCounts(y), now = todayStr().slice(0, 7);
  $('#annualYear').textContent = y;
  host.innerHTML = cnt.map((c, m) => {
    const ym = `${y}-${z2(m + 1)}`;
    return `<button type="button" class="an-m ${ym === now ? 'cur' : ''} ${ym === UI.month ? 'sel' : ''}" data-action="annual-month" data-ym="${ym}" title="Abrir ${MONTHS[m]} no calendário mensal">
      <b class="${ANNUAL_TYPES.some(([t]) => c[t]) ? '' : 'an-empty'}">${MONTHS[m]}</b>${ANNUAL_TYPES.filter(([t]) => c[t]).map(([t, l]) => `<span style="--tc:${TYPE_COLOR[t]}"><i></i>${l}<em class="mono">${c[t]}</em></span>`).join('')}</button>`;
  }).join('');
}
function renderPlanner() { renderWeek(); renderDayTasks(); renderReminders(); renderMonth(); renderAnnual(); }

/* ---- Radar — base: análise Spotter (6 provas, 2009–2025) · Estratégia Raio-X em bloco separado ---- */
const PIE_PALETTE = ['#00e5ff', '#2979ff', '#9b6bff', '#ffb300', '#ff2d55', '#00f59b', '#ff7a45', '#4dd0e1', '#c0ca33', '#ec407a', '#7d96ae', '#b39ddb', '#80cbc4', '#ffcc80', '#ef9a9a'];
const cut = (t, n) => (t.length > n ? t.slice(0, n - 2) + '…' : t);
const cntOf = x => incLookup(x.subject, x.topic);
function radarSubjectData(subject, assunto) {
  const d = INC_SPOTTER[subject]; if (!d) return { pie: [], bars: [] };
  const pie = d.items.map(([t, n]) => ({ l: t, v: n })); if (d.rest > 0) pie.push({ l: SEM_TOP, v: d.rest });
  let bars;
  if (assunto) {
    const it = d.items.find(i => i[0] === assunto); bars = [];
    if (it) { bars = (it[2] || []).map(([t, n]) => ({ l: t, v: n })); const rest = it[1] - sumArr(bars.map(x => x.v)); if (rest > 0) bars.push({ l: SEM_TOP, v: rest }); }
  } else bars = d.items.flatMap(([a, , tp]) => (tp || []).map(([t, n]) => ({ l: `${a} › ${t}`, v: n })));
  return { pie, bars: bars.sort((x, y) => y.v - x.v).slice(0, 14) };
}
function renderRadarExtra(f) {
  const out = [];
  if (f.subject) {
    const m = MATRIZ[f.subject], est = INC_EST[f.subject];
    if (m) out.push(`<div class="card"><div class="card-head"><h3><i class="fa-solid fa-table-list"></i> Matriz de disciplinas — ${esc(subjShort(f.subject))}</h3></div><div class="mx-tiles"><div class="mx-tile"><small>Importância</small><b style="font-size:15px">${esc(m.imp)}</b></div><div class="mx-tile"><small>Momento</small><b style="font-size:13px">${esc(m.mom)}</b></div><div class="mx-tile"><small>Faixa de esforço sugerida</small><b style="font-size:15px">${esc(m.esf)}</b></div></div><p class="muted hint">Fonte: Spotter (referência, não regra de horas).</p></div>`);
    if (est) out.push(`<div class="card"><div class="card-head"><h3><i class="fa-solid fa-ranking-star"></i> Estratégia Concursos — Raio-X (% das questões)</h3></div><p class="muted hint" style="margin-top:0">${esc(est.meta)}. Fonte independente: não é somada à análise Spotter.</p>${est.items.slice(0, 14).map(([t, v]) => `<div class="bar-row" style="grid-template-columns:minmax(0,1fr) 120px 52px"><span title="${esc(t)}">${esc(cut(t, 70))}</span><div class="bar"><i style="width:${Math.min(100, v)}%"></i></div><b>${fmtNum(+v.toFixed(1))}%</b></div>`).join('')}</div>`);
  } else {
    out.push(`<div class="card"><div class="card-head"><h3><i class="fa-solid fa-fire"></i> Assuntos prioritários 2018–2025 (Spotter)</h3></div>${TOP_PRIORITY.map(([a, d, n]) => `<div class="bar-row" style="grid-template-columns:minmax(0,1fr) 110px 40px"><span title="${esc(a)}">${esc(cut(a, 56))} <small class="muted">· ${esc(d)}</small></span><div class="bar"><i style="width:${n / TOP_PRIORITY[0][2] * 100}%"></i></div><b>${n}</b></div>`).join('')}</div>`);
    const ytot = OUT_OF_SYLLABUS.map(n => [n, discTotal(n)]);
    out.push(`<div class="card"><div class="card-head"><h3><i class="fa-solid fa-ban"></i> Fora do edital 2025 (histórico)</h3></div><p class="muted hint" style="margin-top:0">Disciplinas cobradas em provas antigas que não constam do edital atual — ficam fora do Radar e dos totais (${sumArr(ytot.map(x => x[1]))} questões).</p>${ytot.map(([n, v]) => `<div class="bar-row" style="grid-template-columns:140px 1fr 40px"><span>${esc(n)}</span><div class="bar"><i style="width:${v / Math.max(1, ...ytot.map(x => x[1])) * 100}%"></i></div><b>${v}</b></div>`).join('')}</div>`);
  }
  $('#radarExtra').innerHTML = out.join('');
}
function renderRadar() {
  const has = !!S.hasInc; $('#radarEmptyTxt').textContent = S.kind === 'prf' ? 'O Radar de Incidência da PRF ainda não está disponível.' : 'Este concurso ainda não tem base de incidência.'; $('#radarMain').hidden = !has; $('#radarEmpty').hidden = has; $('#radarTools').hidden = !has;
  if (!has) return;
  const f = UI.radar, q = norm(f.q), single = !!f.subject;
  if (!single) f.assunto = '';
  const syl = S.syllabus.filter(x => SUBJECT_NAMES.includes(x.subject));
  const base = syl.filter(x => (!f.subject || x.subject === f.subject) && (!f.inc || x.incidence === f.inc) && (!f.status || x.status === f.status) && (!q || norm(x.topic).includes(q) || norm(x.subject).includes(q)) && (!f.assunto || x.topic === f.assunto));
  const rows = [...base].sort((a, b) => (cntOf(b) ?? -1) - (cntOf(a) ?? -1) || INC_WEIGHT[b.incidence] - INC_WEIGHT[a.incidence] || a.topic.localeCompare(b.topic));
  const high = syl.filter(x => x.incidence === 'Alta');
  $('#radarStats').innerHTML = `
    <div class="stat-chip"><small>Base Spotter</small><b>${VALID_TOTAL} questões · ${EXAM_YEARS.length} provas</b></div>
    <div class="stat-chip"><small>Assuntos</small><b>${syl.length}</b></div>
    <div class="stat-chip"><small>Alta incidência dominada</small><b style="color:var(--crimson)">${high.filter(x => x.status === 'Dominado').length}/${high.length}</b></div>
    <div class="stat-chip"><small>Alta ainda não vista</small><b style="color:var(--gold)">${high.filter(x => x.status === 'Não Visto').length}</b></div>
    <div class="stat-chip"><small>Exibindo</small><b>${rows.length}</b></div>`;
  $('#radarNote').textContent = `Base de incidência: provas da PF (análise Spotter; provas de ${EXAM_YEARS.join(', ')}; ${VALID_TOTAL} questões válidas: ${VALID_TOTAL - sumArr(OUT_OF_SYLLABUS.map(n => discTotal(n)))} em matérias do edital 2025 e ${sumArr(OUT_OF_SYLLABUS.map(n => discTotal(n)))} fora dele). Níveis pelo nº de válidas: Alta ≥ 10 · Média 4–9 · Baixa ≤ 3. A Estratégia Concursos aparece em bloco separado e nunca é somada. Contagem por ano existe apenas por matéria.${single && f.year ? ' O filtro de ano não se aplica ao detalhe por assunto.' : ''}`;
  $('#radarAssunto').hidden = !single;
  if (single) $('#radarAssunto').innerHTML = optHTML([{ v: '', l: 'Todos os assuntos' }].concat(SUBJECTS[f.subject].topics.map(t => t[0])), f.assunto);
  const yr = f.year ? [+f.year] : EXAM_YEARS;
  if (!single) {
    $('#radarPieTitle').textContent = `Peso de cada matéria${f.year ? ` — ${f.year}` : ''}`; $('#radarBarTitle').textContent = `Ranking por matéria (questões válidas${f.year ? ', ' + f.year : ''})`; $('#radarLineTitle').textContent = 'Evolução por ano (todas as matérias do edital)';
    const tot = SUBJECT_NAMES.map(n => discTotal(n, yr));
    mk('chartRadarPie', { type: 'doughnut', data: { labels: SUBJECT_NAMES.map(subjShort), datasets: [{ data: tot, backgroundColor: SUBJECT_NAMES.map(subjColor), borderColor: '#0b0c0e', borderWidth: 2 }] }, options: { plugins: { legend: { position: 'right' } }, cutout: '58%' } });
    const ord = SUBJECT_NAMES.map((n, i) => ({ n, v: tot[i], c: subjColor(n) })).sort((a, b) => b.v - a.v);
    mk('chartRadarBar', { type: 'bar', data: { labels: ord.map(o => subjShort(o.n)), datasets: [{ data: ord.map(o => o.v), backgroundColor: ord.map(o => o.c), borderRadius: 6 }] }, options: { indexAxis: 'y', plugins: { legend: { display: false } } } });
  } else {
    const sd = radarSubjectData(f.subject, f.assunto);
    $('#radarPieTitle').textContent = `Assuntos de ${subjShort(f.subject)} (peso)`; $('#radarBarTitle').textContent = f.assunto ? `Tópicos de “${cut(f.assunto, 40)}”` : `Tópicos de ${subjShort(f.subject)} (maior incidência)`; $('#radarLineTitle').textContent = `Evolução por ano — ${subjShort(f.subject)}`;
    mk('chartRadarPie', { type: 'doughnut', data: { labels: sd.pie.map(o => cut(o.l, 34)), datasets: [{ data: sd.pie.map(o => o.v), backgroundColor: sd.pie.map((_, i) => PIE_PALETTE[i % PIE_PALETTE.length]), borderColor: '#0b0c0e', borderWidth: 2 }] }, options: { plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } } }, cutout: '58%' } });
    mk('chartRadarBar', { type: 'bar', data: { labels: sd.bars.map(o => cut(o.l, 44)), datasets: [{ data: sd.bars.map(o => o.v), backgroundColor: sd.bars.map(o => INC_COLOR[incLevelOf(o.v)]), borderRadius: 6 }] }, options: { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { y: { ticks: { autoSkip: false, font: { size: 11 } } } } } });
  }
  const lineVals = EXAM_YEARS.map(y => single ? discTotal(f.subject, [y]) : sumArr(SUBJECT_NAMES.map(n => discTotal(n, [y]))));
  mk('chartRadarLine', { type: 'line', data: { labels: EXAM_YEARS, datasets: [{ label: single ? subjShort(f.subject) : 'Total', data: lineVals, borderColor: '#f1f3f6', backgroundColor: '#f1f3f6', fill: false, tension: 0, pointRadius: 4 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });
  renderRadarExtra(f);
  const showTable = single || !!f.q || !!f.status;
  $('#radarTableCard').hidden = !showTable;
  if (!showTable) return;
  $('#radarHead').innerHTML = `<tr>${single ? '' : '<th>Matéria</th>'}<th>Assunto</th><th>Questões</th><th>Incidência</th><th>Status</th><th></th></tr>`;
  $('#radarBody').innerHTML = rows.length ? rows.map(x => `
    <tr>${single ? '' : `<td>${esc(subjShort(x.subject))}</td>`}<td>${esc(x.topic)}</td><td class="mono">${cntOf(x) ?? '—'}</td>
      <td><span class="badge ${x.incidence === 'Alta' ? 'alta' : x.incidence === 'Média' ? 'media' : 'baixa'}">${x.incidence}</span></td>
      <td><select class="status-select" data-action="set-status" data-id="${x.id}" data-s="${x.status}">${optHTML(STATUS, x.status)}</select></td>
      <td>${x.custom ? `<button class="icon-btn sm" data-action="del-topic" data-id="${x.id}"><i class="fa-solid fa-xmark"></i></button>` : ''}</td></tr>`).join('')
    : `<tr><td colspan="6" class="empty"><i class="fa-solid fa-filter-circle-xmark"></i>Nenhum assunto com esses filtros.</td></tr>`;
}

/* ---- Edital Verificado — árvore (tema → subtema → tópico → subtópico) ---- */
const edLeaves = n => (n.c && n.c.length ? n.c.flatMap(edLeaves) : (n.root ? [] : [n]));   // raiz própria vazia não conta como item
/** Raízes do edital das matérias ativas no concurso atual. */
const edRoots = () => (S.edital.tree || []).filter(r => !r.subj || SUBJECT_NAMES.includes(r.subj));
function edStats(n, memo) {
  if (memo.has(n.id)) return memo.get(n.id);
  let r;
  if (!n.c || !n.c.length) r = n.root ? { n: 0, d: 0 } : { n: 1, d: S.edital.checks[n.id] ? 1 : 0 };
  else { r = { n: 0, d: 0 }; n.c.forEach(ch => { const x = edStats(ch, memo); r.n += x.n; r.d += x.d; }); }
  memo.set(n.id, r); return r;
}
/** Cobertura do edital verificado: { total:{n,d}, subj:{matéria:{n,d}} } (a raiz "TI" soma em Informática). */
function edCoverage() {
  const memo = new Map(), subj = {}; let n = 0, d = 0;
  edRoots().forEach(r => {
    const x = edStats(r, memo); n += x.n; d += x.d;
    if (r.subj) { const o = subj[r.subj] || (subj[r.subj] = { n: 0, d: 0 }); o.n += x.n; o.d += x.d; }
  });
  return { n, d, pct: n ? d / n * 100 : 0, subj };
}
function edFind(id, list = S.edital.tree, parent = null) {
  for (let i = 0; i < list.length; i++) {
    const n = list[i]; if (n.id === id) return { n, parent, list, i };
    if (n.c) { const r = edFind(id, n.c, n); if (r) return r; }
  }
  return null;
}
function edMatch(n, q) { return norm(n.t).includes(q) || (n.c || []).some(ch => edMatch(ch, q)); }
function edNodeHTML(n, depth, ctx) {
  const st = edStats(n, ctx.memo), leaf = !n.c || !n.c.length, kids = leaf ? [] : n.c;
  const open = ctx.q ? true : !!UI.edital.open[n.id];
  const all = st.d === st.n, some = st.d > 0 && !all;
  const edit = UI.edital.edit ? `<span class="ed-tools"><button class="icon-btn sm" title="Renomear" data-action="ed-rename" data-id="${n.id}"><i class="fa-solid fa-pen"></i></button><button class="icon-btn sm" title="Adicionar subitem" data-action="ed-add" data-id="${n.id}"><i class="fa-solid fa-plus"></i></button><button class="icon-btn sm" title="Excluir" data-action="ed-del" data-id="${n.id}"><i class="fa-solid fa-trash"></i></button></span>` : '';
  let h = `<div class="ed-node ${all ? 'done' : ''}" style="--d:${depth}" data-ed="${n.id}">
    ${leaf ? '<span class="ed-sp"></span>' : `<button class="ed-tog ${open ? 'open' : ''}" data-action="ed-open" data-id="${n.id}" aria-label="Expandir"><i class="fa-solid fa-chevron-right"></i></button>`}
    ${n.root && leaf ? '<span class="ed-sp"></span>' : `<input type="checkbox" data-action="ed-check" data-id="${n.id}" ${all && st.n ? 'checked' : ''} ${some ? 'data-ind="1"' : ''}>`}
    <span class="ed-t">${esc(n.t)}</span>
    ${leaf ? '' : `<span class="ed-pct mono">${st.d}/${st.n} · ${Math.round(st.d / st.n * 100)}%</span>`}${edit}</div>`;
  if (open && kids.length) {
    const vis = ctx.q && !norm(n.t).includes(ctx.q) ? kids.filter(ch => edMatch(ch, ctx.q)) : kids;
    h += `<div class="ed-kids">${vis.map(ch => edNodeHTML(ch, depth + 1, ctx)).join('')}</div>`;
  }
  return h;
}
function renderEdital() {
  const E = UI.edital, q = norm(E.q), memo = new Map();
  const roots = edRoots().map(n => ({ n, st: edStats(n, memo) }));
  const tot = sumArr(roots.map(r => r.st.n)), done = sumArr(roots.map(r => r.st.d));
  $('#editalStats').innerHTML = `<div class="stat-chip"><small>Progresso geral</small><b style="color:var(--cyan)">${tot ? (done / tot * 100).toFixed(1) : '0.0'}%</b></div>`;
  $('#edEditBtn').classList.toggle('primary', E.edit);
  const shown = q ? roots.filter(r => edMatch(r.n, q)) : roots;
  $('#editalTree').innerHTML = shown.length ? shown.map(r => `<div class="card ed-card">${edNodeHTML(r.n, 0, { memo, q })}</div>`).join('') : `<div class="card empty"><i class="fa-solid fa-magnifying-glass"></i>Nada encontrado.</div>`;
  $$('#editalTree input[data-ind]').forEach(i => { i.indeterminate = true; });
}
/** Converte uma lista com recuo (espaços/tabs/marcadores) em árvore de itens. Retorna { nodes, count }. */
function edSetChecked(n, v) { edLeaves(n).forEach(l => { if (v) S.edital.checks[l.id] = true; else delete S.edital.checks[l.id]; }); }
function edNewId(parent) { let i = (parent.c ? parent.c.length : 0) + 1, id; do { id = `${parent.id}.${i++}${uid().slice(0, 3)}`; } while (edFind(id)); return id; }
function edRename(id) {
  const r = edFind(id); if (!r) return;
  openForm({ title: 'Renomear item', fields: [{ name: 't', label: 'Título', required: true, full: true, value: r.n.t }], onSubmit: d => { r.n.t = d.t; commit(); } });
}
function edAdd(id) {
  const r = edFind(id); if (!r) return;
  openForm({ title: `Novo subitem em “${cut(r.n.t, 40)}”`, fields: [{ name: 't', label: 'Título', required: true, full: true }], onSubmit: d => {
    const wasLeaf = !r.n.c || !r.n.c.length;
    r.n.c = r.n.c || []; r.n.c.push({ id: edNewId(r.n), t: d.t, c: [] });
    if (wasLeaf) delete S.edital.checks[r.n.id];     // o item vira pai: o estado passa a vir dos filhos
    UI.edital.open[r.n.id] = true; commit();
  } });
}
function edDel(id) {
  const r = edFind(id); if (!r) return;
  const n = edLeaves(r.n).length;
  if (!confirm(`Excluir “${r.n.t}”${n > 1 ? ` e seus ${n} itens` : ''} do edital?`)) return;
  edLeaves(r.n).forEach(l => delete S.edital.checks[l.id]);
  r.list.splice(r.i, 1); commit();
}
function edExpandAll(v) {
  UI.edital.open = {};
  if (v) { const walk = list => list.forEach(n => { if (n.c && n.c.length) { UI.edital.open[n.id] = true; walk(n.c); } }); walk(edRoots()); }
  renderEdital();
}
/* ---- Simulados ---- */
function mockExpanded(m) {
  const st = S.strategies.find(s => s.id === m.strategy);
  const subjEntries = Object.entries(m.subj || {}).filter(([, v]) => v != null);
  const maxS = Math.max(1, ...subjEntries.map(([, v]) => v));
  const atp = m.atp || { atencao: 0, teoria: 0, pulo: 0 };
  const atpTot = atp.atencao + atp.teoria + atp.pulo;
  const atpRow = (l, v) => `<div class="bar-row"><span>${l}</span><div class="bar"><i style="width:${atpTot ? v / atpTot * 100 : 0}%"></i></div><b>${v}</b></div>`;
  const nErr = S.errors.filter(e => e.mockId === m.id).length;
  return `<tr class="mock-exp"><td colspan="11">
    <div class="mx-tiles">
      <div class="mx-tile"><small>Fonte</small><b style="font-size:14px">${esc(m.source || '—')}</b></div>
      <div class="mx-tile"><small>Questões</small><b>${m.total}</b></div>
      <div class="mx-tile"><small>Acertos / Erros / Brancos</small><b><span class="okc">${m.hits}</span> / <span class="badc">${m.errors}</span> / <span style="color:var(--gold)">${m.blanks}</span></b></div>
    </div>
    <div class="mx-cols">
      <div><h5>Acertos por matéria</h5>${subjEntries.length ? subjEntries.map(([n, v]) => `<div class="bar-row"><span>${esc(subjShort(n))}</span><div class="bar"><i style="width:${v / maxS * 100}%"></i></div><b>${v}</b></div>`).join('') : '<span class="muted">Não informado.</span>'}</div>
      <div><h5>Análise dos erros (ATP)</h5>${atpTot ? atpRow('Atenção', atp.atencao) + atpRow('Teoria', atp.teoria) + atpRow('Pulo do gato', atp.pulo) : '<span class="muted">Não informado.</span>'}</div>
      <div><h5>Estratégia ${st ? esc(st.label) : ''}</h5><div class="mx-order">${st ? st.order.map((n, i) => `<b>${i + 1}.</b> ${esc(subjShort(n))}`).join(' › ') : '<span class="muted">Não informada.</span>'}</div></div>
      <div><h5>O que deu errado</h5><div class="mx-text">${m.debriefBad ? esc(m.debriefBad) : '<span class="muted">Não informado.</span>'}</div><h5 style="margin-top:12px">O que deu certo</h5><div class="mx-text">${m.debriefGood ? esc(m.debriefGood) : '<span class="muted">Não informado.</span>'}</div>${m.debrief ? `<h5 style="margin-top:12px">Debriefing (antigo)</h5><div class="mx-text">${esc(m.debrief)}</div>` : ''}</div>
    </div>
    <div style="margin-top:16px"><button class="btn sm" data-action="mock-errors" data-id="${m.id}"><i class="fa-solid fa-triangle-exclamation"></i> Ver erros deste simulado no caderno (${nErr})</button></div>
  </td></tr>`;
}
function renderMockAnalysis() {
  const stats = strategyStats(), v = strategyVerdict(stats);
  $('#stratVerdict').innerHTML = v.html;
  const timed = stats.filter(s => s.avgTime != null);
  mk('chartStratTime', { type: 'bar', data: { labels: timed.map(s => `Estratégia ${s.label}`), datasets: [{ label: 'Tempo médio (h)', data: timed.map(s => +(s.avgTime / 60).toFixed(2)), backgroundColor: '#d9dee5', borderRadius: 6 }] }, options: { plugins: { legend: { display: false }, tooltip: { callbacks: { label: i => ` ${fmtHM(timed[i.dataIndex].avgTime)}` } } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'horas' }, ticks: { callback: v => v + 'h' } } } } });
  mk('chartStratHits', { type: 'bar', data: { labels: stats.map(s => `Estratégia ${s.label} · ${s.n} simulado${s.n > 1 ? 's' : ''}`), datasets: [{ label: 'Pontos totais', data: stats.map(s => +s.totalPts.toFixed(1)), backgroundColor: '#00f59b', borderRadius: 6 }] }, options: { plugins: { legend: { display: false } }, scales: { y: { title: { display: true, text: 'pontos (soma)' } } } } });
  const T = themeStats();
  const list = (arr, total, empty, color) => arr.length ? `<div class="muted" style="font-size:12px;margin-bottom:6px">Base: ${total} simulado(s) com texto</div>` + arr.map(t => `<div class="bar-row" style="grid-template-columns:170px 1fr 70px"><span>${esc(t.name)}</span><div class="bar"><i style="width:${t.count / total * 100}%;background:${color}"></i></div><b>${t.count} de ${total}</b></div>`).join('') : `<div class="empty"><i class="fa-solid fa-comments"></i>${empty}</div>`;
  $('#themeBad').innerHTML = list(T.bad, T.totalBad, 'Preencha “O que deu errado” nos simulados.', 'var(--crimson)');
  $('#themeGood').innerHTML = list(T.good, T.totalGood, 'Preencha “O que deu certo” nos simulados.', 'var(--green)');
}
function renderMocks() {
  const c = calc(), ms = [...S.mocks].sort((a, b) => b.date.localeCompare(a.date));
  const best = S.mocks.length ? Math.max(...S.mocks.map(m => m.score)) : 0;
  const lastCut = [...c.mocks].reverse().find(m => cutOf(m) != null);
  const dLast = lastCut ? lastCut.points - cutOf(lastCut) : null;
  $('#mockStats').innerHTML = `
    <div class="stat-chip"><small>Simulados</small><b>${S.mocks.length}</b></div>
    <div class="stat-chip"><small>Aproveitamento médio</small><b>${c.mockAvg.toFixed(1)}%</b></div>
    <div class="stat-chip"><small>Melhor aproveitamento</small><b style="color:var(--green)">${best.toFixed(1)}%</b></div>
    <div class="stat-chip"><small>Média últimos 3</small><b style="color:var(--cyan)">${c.last3.toFixed(1)}%</b></div>
    <div class="stat-chip"><small>vs. corte (último com corte)</small><b style="color:${dLast === null ? 'var(--muted)' : dLast >= 0 ? 'var(--green)' : 'var(--crimson)'}">${dLast === null ? '—' : (dLast >= 0 ? '+' : '') + fmtNum(dLast) + ' pts'}</b></div>`;
  renderMockAnalysis();
  $('#mockBody').innerHTML = ms.length ? ms.map(m => {
    const open = UI.openMock === m.id, cut = cutOf(m) != null ? m.points - cutOf(m) : null, st = S.strategies.find(s => s.id === m.strategy);
    return `<tr class="mock-row ${open ? 'open' : ''}" data-action="toggle-mock" data-id="${m.id}">
      <td><i class="fa-solid fa-chevron-right chev"></i><b>${esc(m.name)}</b></td><td class="mono">${brDate(m.date)}</td><td>${esc(m.board)}</td>
      <td><b style="color:var(--cyan)">${m.score.toFixed(1)}%</b></td><td class="mono">${fmtNum(m.points)}</td>
      <td class="mono">${m.type === 'Conteúdo' || !m.time ? '—' : fmtHM(m.time)}</td><td class="mono">${m.essay ?? '—'}</td>
      <td>${cut === null ? '<span class="muted">—</span>' : `<span class="badge ${cut >= 0 ? 'ok' : 'alta'}">${cut >= 0 ? '+' : ''}${fmtNum(cut)} pts</span>`}</td>
      <td>${st ? `<span class="badge neutral">${esc(st.label)}</span>` : '<span class="muted">—</span>'}</td>
      <td><span class="badge ${m.type === 'Real' ? 'media' : 'neutral'}">${esc(m.type)}</span></td>
      <td><button class="icon-btn sm" data-action="del-mock" data-id="${m.id}"><i class="fa-solid fa-xmark"></i></button></td></tr>${open ? mockExpanded(m) : ''}`;
  }).join('') : `<tr><td colspan="11" class="empty"><i class="fa-solid fa-file-circle-question"></i>Nenhum simulado lançado.</td></tr>`;
  chartMockBreak();
}

/* ---- Revisões ---- */
const incOf = name => S.rev.subj[name].inc;
const ymLabel = i => `${MONTHS[idxMon(i)]}/${idxYear(i)}`;
const curRevIdx = () => (UI.revIdx == null ? nowIdx() : UI.revIdx);

function renderGantt() {
  const now = nowIdx();
  const scheds = SUBJECT_NAMES.map(revSchedule);
  const years = [idxYear(now), UI.revYear, ...scheds.flatMap(s => [idxYear(s.c0), idxYear(s.endIdx)])];
  const y0 = Math.min(...years), y1 = Math.max(...years);
  UI.revYear = clamp(UI.revYear, y0, y1);
  $('#ganttYear').innerHTML = optHTML(Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i), UI.revYear);
  let html = '<div class="gantt"><div class="g-h">Matéria</div>' + MONTHS_SHORT.map((m, i) => `<div class="g-h ${UI.revYear * 12 + i === now ? 'now' : ''}"><span>${m}</span></div>`).join('');
  scheds.forEach(sch => {
    const col = INC_COLOR[sch.cfg.inc];
    html += `<div title="Incidência ${sch.cfg.inc}">${esc(sch.name)}</div>`;
    for (let m = 0; m < 12; m++) {
      const idx = UI.revYear * 12 + m, cy = sch.cycles.find(c => c.idx === idx);
      const inner = idx === sch.c0 ? '<span class="gchip c0">C0</span>' : cy ? `<span class="gchip" style="--gc:${col}">C${cy.n}</span>` : '';
      html += `<div class="g-cell ${idx === now ? 'now' : ''}" data-action="gantt-cell" data-subject="${esc(sch.name)}" data-idx="${idx}">${inner}</div>`;
    }
  });
  $('#ganttGrid').innerHTML = html + '</div>';
}

/** Ano novo do Gantt: 'zero' deixa o ano em branco; 'repeat' copia os meses de ciclo do ano anterior. */
function ganttYearAction(mode) {
  const Y = UI.revYear; let n = 0;
  SUBJECT_NAMES.forEach(name => {
    const sch = revSchedule(name), blk = sch.blocks.filter(b => idxYear(b.s) === Y).pop(); if (!blk) return;
    const cfg = sch.cfg; cfg.blocks = cfg.blocks || {};
    if (mode === 'zero') { cfg.blocks[blk.s] = []; n++; return; }
    const prev = sch.cycles.filter(c => idxYear(c.idx) === Y - 1).map(c => idxMon(c.idx));
    const base = idxMon(blk.s);
    cfg.blocks[blk.s] = prev.filter(m => m >= base).map(m => m - base).filter(o => !(blk.s === sch.c0 && o === 0)); n++;
  });
  if (!n) { toast('Nenhuma matéria tem ciclos previstos em ' + Y, 'err'); return; }
  commit(); toast(mode === 'zero' ? `${Y} zerado: adicione os ciclos clicando nas caixinhas` : `Padrão de ${Y - 1} repetido em ${Y}`, 'ok');
}
/** Clique numa caixinha do Gantt: adicionar / mover / remover ciclo, ou alterar o mês do C0. */
function openGanttCell(name, idx) {
  const sch = revSchedule(name), cfg = sch.cfg;
  const head = `${name} — ${ymLabel(idx)}`;
  if (idx === sch.c0) {
    openForm({
      title: `C0 — ${name}`,
      fields: [
        { type: 'custom', full: true, html: `<p class="muted" style="font-size:13.5px">C0 é o mês do primeiro contato com a matéria. Por padrão é o mês do primeiro estudo registrado. Alterar o C0 recalcula os ciclos e descarta ajustes manuais de blocos desta matéria.</p>` },
        { name: 'c0', label: 'Mês do C0', type: 'month', value: idxYM(sch.c0), required: true }
      ],
      extra: cfg.c0 ? [{ label: 'Usar automático', onClick: () => { cfg.c0 = null; cfg.blocks = {}; commit(); closeModal(); } }] : [],
      onSubmit: d => { cfg.c0 = d.c0; cfg.blocks = {}; commit(); toast('C0 atualizado', 'ok'); }
    });
    return;
  }
  const blk = sch.blocks.find(b => idx >= b.s && idx < b.e && idx < b.limit);
  if (!blk || idx < sch.c0 || idx > sch.endIdx) { openInfo({ title: head, rows: [['Aviso', 'Este mês está fora do período de revisão (antes do C0 ou depois da prova).']] }); return; }
  const offs = blockOffsets(cfg, blk.s, blk.contacts), o = idx - blk.s, has = offs.includes(o);
  const isC0Block = blk.s === sch.c0;
  const save = list => { cfg.blocks[blk.s] = [...new Set(list)].filter(x => x >= 0 && x <= 11 && !(isC0Block && x === 0)).sort((a, b) => a - b); commit(); };
  if (!has) {
    openInfo({ title: head, rows: [['Ciclo', 'Não há ciclo neste mês.'], ['Bloco', `Ano civil ${idxYear(idx)} (a numeração reinicia em C1 a cada janeiro).`]], actions: [{ label: '<i class="fa-solid fa-plus"></i> Adicionar ciclo aqui', cls: 'primary', onClick: () => { save(offs.concat(o)); closeModal(); toast('Ciclo adicionado', 'ok'); } }] });
    return;
  }
  const free = []; for (let k = 0; k < blk.e - blk.s; k++) { const j = blk.s + k; if (k !== o && !offs.includes(k) && !(isC0Block && k === 0) && j <= sch.endIdx && j < blk.limit) free.push({ v: k, l: ymLabel(j) }); }
  openForm({
    title: head,
    fields: [
      { name: 'op', label: 'Ação', type: 'select', options: [{ v: 'move', l: 'Mover este ciclo para outro mês' }, { v: 'del', l: 'Remover este ciclo' }], full: true },
      { name: 'to', label: 'Novo mês', type: 'select', options: free.length ? free : [{ v: '', l: 'Sem mês livre' }], when: 'op=move', full: true }
    ],
    submitLabel: 'Aplicar',
    validate: d => (d.op === 'move' && d.to === '' ? 'Não há mês livre neste bloco.' : ''),
    onSubmit: d => save(d.op === 'del' ? offs.filter(x => x !== o) : offs.filter(x => x !== o).concat(+d.to))
  });
}

function renderReviews() {
  renderGantt();
  const vi = curRevIdx(), now = nowIdx();
  $('#revMonthLabel').textContent = ymLabel(vi);
  const all = reviewItems(vi);
  const subjF = UI.revSubj && SUBJECT_NAMES.includes(UI.revSubj) ? UI.revSubj : '';
  const items = subjF ? all.filter(r => r.subject === subjF) : all;
  $('#revSubject').innerHTML = optHTML([{ v: '', l: 'Todas as matérias' }].concat(SUBJECT_NAMES), subjF);
  const cnt = s => items.filter(r => r.state === s).length;
  $('#reviewStats').innerHTML = `
    <div class="stat-chip"><small>Atrasadas</small><b style="color:var(--crimson)">${cnt('atrasada')}</b></div>
    <div class="stat-chip"><small>Para revisar neste mês</small><b style="color:var(--gold)">${cnt('revisar')}</b></div>
    <div class="stat-chip"><small>Futuras</small><b>${cnt('futuro')}</b></div>
    <div class="stat-chip"><small>Feitas</small><b style="color:var(--green)">${cnt('feito')}</b></div>`;
  if (!items.length) {
    $('#reviewList').innerHTML = `<div class="empty"><i class="fa-solid fa-arrows-rotate"></i>Nenhuma revisão em ${ymLabel(vi)}. As revisões aparecem nos meses que têm ciclo (C1, C2…) para assuntos de Teoria e Lei seca já registrados.</div>`;
    return;
  }
  const split = S.rev.split && S.rev.split.idx === vi ? S.rev.split : null;
  let shown = items, tabs = '';
  if (split) {
    if (UI.revList == null || UI.revList >= split.lists.length) UI.revList = -1;
    const byKey = new Map(items.map(r => [r.rkey, r]));
    tabs = `<div class="chips" style="margin-bottom:12px"><button class="chip ${UI.revList === -1 ? 'active' : ''}" data-action="rev-list" data-id="-1">Todas (${items.length})</button>` + split.lists.map((l, i) => { const rs = l.map(k => byKey.get(k)).filter(Boolean); return `<button class="chip ${UI.revList === i ? 'active' : ''}" data-action="rev-list" data-id="${i}">Lista ${i + 1} · ${rs.filter(r => r.state === 'feito').length}/${rs.length}</button>`; }).join('') + `<button class="btn sm ghost" data-action="rev-split-clear"><i class="fa-solid fa-xmark"></i> Desfazer divisão</button></div>`;
    if (UI.revList >= 0) shown = split.lists[UI.revList].map(k => byKey.get(k)).filter(Boolean);
  }
  const order = { atrasada: 0, revisar: 1, futuro: 2, feito: 3 };
  if (!split || UI.revList === -1) shown.sort((a, b) => order[a.state] - order[b.state] || SUBJECT_NAMES.indexOf(a.subject) - SUBJECT_NAMES.indexOf(b.subject) || a.topic.localeCompare(b.topic));
  $('#reviewList').innerHTML = tabs + `<div style="display:flex;flex-direction:column;gap:10px">` + shown.map(r => {
    const badge = r.state === 'feito' ? '<span class="badge ok">Feito</span>' : r.state === 'atrasada' ? '<span class="badge alta">Atrasada</span>' : r.state === 'revisar' ? '<span class="badge media">Revisar neste mês</span>' : '<span class="badge neutral">Futura</span>';
    const stages = r.stages.map(s => `<div class="stage ${s.state === 'due' ? 'late' : s.state} ${s.cur ? 'cur' : ''}" title="${ymLabel(s.idx)}">C${s.n}</div>`).join('');
    return `<div class="review ${r.state === 'feito' ? 'done' : r.state === 'atrasada' ? 'overdue' : ''}">
      <div><h4 style="color:${INC_COLOR[incOf(r.subject)]}">${esc(r.subject)}</h4><small>${esc(r.topic)}</small><div style="margin-top:6px">${badge} <span class="muted mono" style="font-size:11.5px">C${r.cycle.n} · ${ymLabel(r.cycle.idx)}</span></div></div>
      <div class="stages">${stages}</div>
      <div><button class="btn sm ${r.state === 'feito' ? '' : 'primary'}" data-action="rev-done" data-key="${esc(r.rkey)}"><i class="fa-solid fa-check"></i> ${r.state === 'feito' ? 'Desfazer' : 'Marcar como feito'}</button></div>
    </div>`;
  }).join('') + '</div>';
}
/** Ordena intercalando as matérias (sempre a que ainda tem mais itens, evitando repetir a anterior) e reparte em k listas de tamanho quase igual. */
function interleaveSplit(items, k) {
  const st = { atrasada: 0, revisar: 1, futuro: 2 };
  const groups = new Map();
  [...items].sort((a, b) => (st[a.state] ?? 3) - (st[b.state] ?? 3) || a.topic.localeCompare(b.topic)).forEach(r => { if (!groups.has(r.subject)) groups.set(r.subject, []); groups.get(r.subject).push(r); });
  const seq = []; let last = null;
  while (seq.length < items.length) {
    const cand = [...groups.entries()].filter(([, g]) => g.length).sort((x, y) => y[1].length - x[1].length || SUBJECT_NAMES.indexOf(x[0]) - SUBJECT_NAMES.indexOf(y[0]));
    const pick = cand.find(([n]) => n !== last) || cand[0];
    seq.push(pick[1].shift()); last = pick[0];
  }
  const base = Math.floor(seq.length / k), extra = seq.length % k, lists = []; let pos = 0;
  for (let i = 0; i < k; i++) { const n = base + (i < extra ? 1 : 0); lists.push(seq.slice(pos, pos + n).map(r => r.rkey)); pos += n; }
  return lists;
}
function revSplitOpen() {
  const vi = curRevIdx(), pend = reviewItems(vi).filter(r => r.state !== 'feito' && (!UI.revSubj || r.subject === UI.revSubj));
  if (pend.length < 2) return toast('É preciso ter ao menos 2 revisões pendentes no mês para dividir em listas.', 'err');
  openForm({
    title: 'Listas intercaladas', submitLabel: 'Gerar listas',
    fields: [{ name: 'k', label: `Em quantas listas dividir as ${pend.length} revisões pendentes${UI.revSubj ? ' (matéria filtrada)' : ''}?`, type: 'number', required: true, full: true, value: Math.max(2, Math.ceil(pend.length / 10)) }],
    onSubmit: d => {
      const k = Math.floor(+d.k);
      if (!(k >= 2 && k <= pend.length)) { toast(`Use um número de 2 a ${pend.length}.`, 'err'); return 'keep'; }
      S.rev.split = { idx: vi, k, lists: interleaveSplit(pend, k) }; UI.revList = 0; commit(); toast(`${k} listas geradas (matérias intercaladas)`, 'ok');
    }
  });
}
/* ---- Caderno de Erros ---- */
function errSource(e) {
  const mock = e.origin === 'Simulado' ? S.mocks.find(m => m.id === e.mockId) : null;
  let s = e.origin || '—';
  if (e.origin === 'Simulado') s += mock ? `: ${mock.name}` : ' (excluído)';
  if (e.questions) s += ` · Questões ${e.questions}`;
  return s;
}
function renderErrors() {
  const f = UI.err;
  const rows = S.errors.filter(e => (!f.cat || e.category === f.cat) && (!f.mock || e.mockId === f.mock));
  const chips = [['', 'Todos', S.errors.length]].concat(ERR_CATS.map(c => [c, c, S.errors.filter(e => e.category === c).length]));
  $('#errChips').innerHTML = chips.map(([v, l, n]) => `<button class="chip ${f.cat === v ? 'active' : ''}" data-action="err-filter" data-cat="${esc(v)}">${esc(l)} (${n})</button>`).join('');
  const fm = f.mock ? S.mocks.find(m => m.id === f.mock) : null;
  $('#errNote').innerHTML = f.mock ? `<span class="err-note"><i class="fa-solid fa-filter"></i> Simulado: <b>${esc(fm ? fm.name : 'excluído')}</b> <button class="btn sm ghost" data-action="err-clear-mock">limpar</button></span>` : '';
  const block = (l, v) => `<div class="err-block"><span>${l}</span>${esc(v)}</div>`;
  $('#errorGrid').innerHTML = rows.length ? rows.map(e => `
    <div class="card err-card ${e.resolved ? 'resolved' : ''}">
      <div class="err-head"><div><b>${esc(e.subject)}</b><small>${esc(e.topic)} · ${brDate(e.date)}</small></div><span class="badge ${e.resolved ? 'ok' : 'alta'}">${e.resolved ? 'Resolvido' : 'Em aberto'}</span></div>
      <span class="badge violet">${esc(e.category)}</span>
      ${block('Fonte', errSource(e))}
      ${!e.resolved ? '' : e.category === CAT_ATENCAO ? block('Motivo', e.reason) : e.category === CAT_TEORIA ? block('O que estudar', e.study) : block('Pegadinha', e.pitfall) + block('Bizu', e.bizu)}
      <div class="err-actions"><button class="btn sm" data-action="toggle-error" data-id="${e.id}"><i class="fa-solid fa-circle-check"></i> ${e.resolved ? 'Reabrir' : 'Marcar como resolvido'}</button><button class="btn sm danger" data-action="del-error" data-id="${e.id}"><i class="fa-solid fa-trash"></i></button></div>
    </div>`).join('') : `<div class="card empty" style="grid-column:1/-1"><i class="fa-solid fa-shield-check"></i>Nenhum erro encontrado.</div>`;
}

/* ---- Config ---- */
function trText(c) { return c > 0 ? (12 / c).toFixed(1).replace('.', ',') : '—'; }
function renderConfig() {
  renderCfgSubjects();
  $$('.cfg-tab').forEach(b => { const on = b.dataset.cfgtab === UI.cfgTab; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
  $$('.cfg-pane').forEach(p => { p.hidden = p.dataset.pane !== UI.cfgTab; });
  const cm = Auth.meta(), cu = Auth.users()[Auth.user];
  if (cm) { $('#cfgConcurso').innerHTML = `<span class="cfg-ic">${iconHTML(cm)}</span> <b>${esc(cm.name)}</b>`; } if (cu) $('#cfgUser').textContent = cu.nick;
  $('#cfgExam').value = S.settings.examDate; $('#cfgLastCut').value = S.settings.lastCut ?? ''; $('#cfgGoal').value = S.settings.dailyGoal;
  const r = S.rev;
  $('#revEdital').value = r.editalOut ? '1' : '0'; $('#revEditalDate').value = r.editalDate || ''; $('#revStart').value = r.startMonth;
  $('#revCfgBody').innerHTML = SUBJECT_NAMES.map(n => `<tr><td style="text-align:left"><b>${esc(n)}</b></td>
    <td><select data-rc="inc" data-n="${esc(n)}">${optHTML(INC_LEVELS, r.subj[n].inc)}</select></td>
    <td><input type="number" min="0" max="12" step="1" data-rc="c" data-n="${esc(n)}" value="${r.subj[n].contacts}"></td>
    <td class="mono" data-tr="${esc(n)}">${trText(r.subj[n].contacts)}</td></tr>`).join('');
  $('#themesText').value = themesToText(S.themes);
}
/** Lê a tabela de configuração de revisão. Retorna null (e avisa) se houver erro. */
function readRevConfig() {
  const out = {};
  for (const n of SUBJECT_NAMES) {
    const inc = $(`[data-rc="inc"][data-n="${CSS.escape(n)}"]`).value, c = Number($(`[data-rc="c"][data-n="${CSS.escape(n)}"]`).value);
    if (!Number.isInteger(c) || c < 0 || c > 12) { toast(`Contatos de ${n}: use um inteiro de 0 a 12 (máximo 1 ciclo por mês).`, 'err'); return null; }
    out[n] = { inc, c };
  }
  return out;
}
function saveRevConfig(vals) {
  const r = S.rev, out = $('#revEdital').value === '1', date = $('#revEditalDate').value, start = $('#revStart').value;
  if (out && !date) { toast('Informe a data de publicação do edital.', 'err'); return false; }
  if (!start) { toast('Informe o mês de início das revisões.', 'err'); return false; }
  const wasOut = r.editalOut;
  SUBJECT_NAMES.forEach(n => { const s = r.subj[n]; if (!wasOut && out) s.contactsPre = s.contacts; if (!out) s.contactsPre = null; s.inc = vals[n].inc; s.contacts = vals[n].c; });
  r.editalOut = out; r.editalDate = out ? date : ''; r.startMonth = start;
  return true;
}
/* ---- Roteador de renderização ---- */
function renderAll() {
  _revCache = {};
  try {
    const c = calc();
    renderHeader(c);
    ({ overview: () => renderOverview(c), planner: renderPlanner, radar: renderRadar, edital: renderEdital, simulados: renderMocks, revisoes: renderReviews, erros: renderErrors, config: renderConfig })[UI.view]();
  } finally { _revCache = null; }
}
function showView(name) {
  UI.view = name;
  $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  $('#sidebar').classList.remove('open');
  renderAll(); window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* =====================================================================
   13. AÇÕES (delegação de eventos)
   ===================================================================== */
function onAction(e) {
  const el = e.target.closest('[data-action]'); if (!el) return;
  const { action, id } = el.dataset;
  if (action === 'set-status') return; // tratado em 'change'
  switch (action) {
    case 'grid-cell': {
      const r = el.getBoundingClientRect();
      const h = clamp(GRID_START + Math.floor((e.clientY - r.top) / (r.height / GRID_ROWS)), GRID_START, GRID_END - 1);
      formPlan({ date: el.dataset.date, start: `${z2(h)}:00` }); break;
    }
    case 'pick-day': UI.plannerDate = el.dataset.date; renderPlanner(); break;
    case 'view-item': openItem(id, el.dataset.date); break;
    case 'rev-list': UI.revList = +id; renderReviews(); break;
    case 'rev-split-clear': S.rev.split = null; UI.revList = -1; commit(); break;
    case 'month-day': formPlan({ date: el.dataset.date, types: TAG_TYPES }); break;
    case 'ed-open': UI.edital.open[id] = !UI.edital.open[id]; renderEdital(); break;
    case 'ed-check': { const r = edFind(id); if (!r) break; edSetChecked(r.n, el.checked); commit(); break; }
    case 'ed-rename': edRename(id); break;
    case 'ed-add': edAdd(id); break;
    case 'ed-del': edDel(id); break;
    case 'annual-year': UI.annualYear += +el.dataset.dir; renderAnnual(); break;
    case 'annual-month': UI.month = el.dataset.ym; renderMonth(); renderAnnual(); { const g = $('#monthGrid'); if (g) g.scrollIntoView({ behavior: 'smooth', block: 'center' }); } break;
    case 'gantt-year': if (confirm(el.dataset.mode === 'zero' ? `Zerar os ciclos de ${UI.revYear}? Os ciclos desse ano ficam em branco.` : `Repetir em ${UI.revYear} o padrão de ${UI.revYear - 1}? Os ajustes manuais de ${UI.revYear} serão substituídos.`)) ganttYearAction(el.dataset.mode); break;
    case 'go-erros': UI.err = { cat: '', mock: '' }; showView('erros'); break;
    case 'edit-caderno': {
      const it = S.plan.find(x => x.id === id), d = el.dataset.date; if (!it) break;
      const l = S.log.find(x => regIds(it, d).includes(x.id) && x.auto); if (!l) break;
      openForm({ title: 'Tempo do Caderno de Erros', fields: [{ name: 'minutes', label: 'Tempo (min)', type: 'number', min: 1, value: l.minutes, required: true, full: true }],
        onSubmit: f => { l.minutes = +f.minutes; commit(); toast('Tempo atualizado', 'ok'); } });
      break;
    }
    case 'rt-month': {
      const [y, m] = UI.routineMonth.split('-').map(Number), d = new Date(y, m - 1 + (+el.dataset.dir), 1);
      UI.routineMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; renderRoutineTracker(); break;
    }
    case 'toggle-plan': {
      const it = S.plan.find(x => x.id === id); if (!it) break;
      const d = el.dataset.date; it.doneDates = isDone(it, d) ? it.doneDates.filter(x => x !== d) : (it.doneDates || []).concat(d);
      commit(); break;
    }
    case 'subj-toggle': if (!setSubjectActive(el.dataset.n, el.checked)) renderConfig(); break;
    case 'del-topic': S.syllabus = S.syllabus.filter(x => x.id !== id); commit(); break;
    case 'toggle-mock': UI.openMock = UI.openMock === id ? null : id; renderMocks(); break;
    case 'del-mock': if (confirm('Excluir este simulado?')) { S.mocks = S.mocks.filter(x => x.id !== id); if (UI.openMock === id) UI.openMock = null; commit(); } break;
    case 'mock-errors': UI.err = { cat: '', mock: id }; showView('erros'); break;
    case 'reg-study': { const it = S.plan.find(x => x.id === id); if (!it) break; const d = el.dataset.date;
      if (it.type === 'Simulado') formMock({ name: it.title || '', date: d, planId: it.id, planDate: d }); else formStudy(it, d); break; }
    case 'edit-study': { const it = S.plan.find(x => x.id === id); if (it) formStudy(it, el.dataset.date); break; }
    case 'undo-reg': { const it = S.plan.find(x => x.id === id); if (it && confirm(it.type === 'Simulado' ? 'Desfazer a marcação de registrado? (o simulado lançado continua em Simulados)' : 'Desfazer este registro? O tempo e as questões lançados serão removidos.')) undoReg(it, el.dataset.date); break; }
    case 'gantt-cell': openGanttCell(el.dataset.subject, +el.dataset.idx); break;
    case 'rev-done': { const k = el.dataset.key; if (S.rev.done[k]) delete S.rev.done[k]; else S.rev.done[k] = todayStr(); commit(); break; }
    case 'toggle-error': { const er = S.errors.find(x => x.id === id); if (!er) break; if (er.resolved) { er.resolved = false; delete er.resolvedDate; commit(); } else formResolve(er); break; }
    case 'del-error': if (confirm('Excluir este erro?')) { S.errors = S.errors.filter(x => x.id !== id); commit(); } break;
    case 'err-filter': UI.err.cat = el.dataset.cat; renderErrors(); break;
    case 'err-clear-mock': UI.err.mock = ''; renderErrors(); break;
  }
}
/* ---- Arrastar e redimensionar blocos do cronograma (mouse/toque) ---- */
let _drag = null, _justDragged = false;
function dragStart(e) {
  const blk = e.target.closest('.wk-block'); if (!blk || e.button > 0) return;
  const it = S.plan.find(x => x.id === blk.dataset.id); if (!it) return;
  const col = blk.closest('.wk-col'), r = col.getBoundingClientRect(), pxMin = r.height / (GRID_ROWS * 60);
  _drag = { blk, it, occ: blk.dataset.date, resize: !!e.target.closest('[data-resize]'), x0: e.clientX, y0: e.clientY, pxMin, moved: false, s0: toMin(it.start), e0: endMin(it), dur: durMin(it), colTop: r.top };
  blk.setPointerCapture?.(e.pointerId);
}
function dragMove(e) {
  const d = _drag; if (!d) return;
  const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
  if (!d.moved && Math.hypot(dx, dy) < 5) return;
  d.moved = true; d.blk.classList.add('dragging');
  if (d.resize) { const nh = Math.max(15, Math.round((d.e0 - d.s0 + dy / d.pxMin) / 15) * 15); d.newEnd = Math.min(1440, d.s0 + nh); d.blk.style.height = `${(d.newEnd - d.s0) * d.pxMin}px`; }
  else { d.blk.style.transform = `translate(${dx}px, ${dy}px)`; }
}
function dragEnd(e) {
  const d = _drag; _drag = null; if (!d) return;
  d.blk.classList.remove('dragging');
  if (!d.moved) return;
  _justDragged = true; setTimeout(() => { _justDragged = false; }, 0);
  if (d.resize) { if (d.newEnd && d.newEnd !== d.e0) moveItem(d.it, d.occ, d.occ, fromMin(d.s0), fromMin(d.newEnd)); else renderWeek(); return; }
  d.blk.style.transform = ''; d.blk.hidden = true;
  const under = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.classList && x.classList.contains('wk-col'));
  d.blk.hidden = false;
  if (!under) { renderWeek(); return; }
  const newDate = under.dataset.date, r = under.getBoundingClientRect();
  const delta = Math.round(((e.clientY - d.y0) / d.pxMin) / 15) * 15;
  let ns = clamp(d.s0 + delta, GRID_START * 60, Math.max(GRID_START * 60, GRID_END * 60 - d.dur));
  if (newDate === d.occ && ns === d.s0) { renderWeek(); return; }
  moveItem(d.it, d.occ, newDate, fromMin(ns), fromMin(ns + d.dur));
}
function onChange(e) {
  const el = e.target.closest('[data-action="set-status"]'); if (!el) return;
  const it = S.syllabus.find(x => x.id === el.dataset.id); if (!it) return;
  it.status = el.value;
  commit();
}

/* =====================================================================
   14. POMODORO — RESERVADO (preservado exatamente; fora da aba Planner)
   Para reativar: chame mountPomodoro(container) com o elemento onde ele deve aparecer.
   ===================================================================== */
const pomo = { running: false, end: 0, remaining: 25 * 60, total: 25 * 60, timer: null, subject: '' };
function mountPomodoro(container) {
  const tpl = document.getElementById('tpl-pomodoro');
  if (!tpl || !container) return;
  container.appendChild(tpl.content.cloneNode(true));
  $('#pomoSubject').innerHTML = optHTML(SUBJECT_NAMES);
  $('#pomoStart').onclick = pomoStart; $('#pomoPause').onclick = pomoPause; $('#pomoReset').onclick = pomoReset;
  $('#pomoMin').onchange = () => { if (!pomo.running) pomoReset(); };
}
function pomoRender() { const t = $('#pomoTime'); if (!t) return; t.textContent = `${z2(Math.floor(pomo.remaining / 60))}:${z2(Math.floor(pomo.remaining % 60))}`; $('#pomoCard').classList.toggle('running', pomo.running); }
function pomoStart() {
  if (pomo.running) return;
  if (!pomo.timer && pomo.remaining === pomo.total) { pomo.total = pomo.remaining = clamp(+$('#pomoMin').value || 25, 1, 180) * 60; }
  pomo.subject = $('#pomoSubject').value; pomo.running = true; pomo.end = Date.now() + pomo.remaining * 1000;
  pomo.timer = setInterval(() => {
    pomo.remaining = Math.max(0, Math.round((pomo.end - Date.now()) / 1000)); pomoRender();
    if (pomo.remaining <= 0) pomoFinish();
  }, 500);
  pomoRender();
}
function pomoPause() { if (!pomo.running) return; clearInterval(pomo.timer); pomo.timer = null; pomo.running = false; pomo.remaining = Math.max(0, Math.round((pomo.end - Date.now()) / 1000)); pomoRender(); }
function pomoReset() { clearInterval(pomo.timer); pomo.timer = null; pomo.running = false; pomo.total = pomo.remaining = clamp(+$('#pomoMin').value || 25, 1, 180) * 60; pomoRender(); }
function pomoFinish() {
  clearInterval(pomo.timer); pomo.timer = null; pomo.running = false;
  S.log.push({ id: uid(), date: todayStr(), subject: pomo.subject || SUBJECT_NAMES[0], minutes: Math.round(pomo.total / 60), questions: 0, hits: 0 });
  toast(`Bloco de ${Math.round(pomo.total / 60)} min concluído e lançado!`, 'ok');
  pomo.remaining = pomo.total; pomoRender(); commit();
}

/* =====================================================================
   15. IMPORTAÇÃO / EXPORTAÇÃO (SheetJS)
   ===================================================================== */
function exportXlsx() {
  if (typeof XLSX === 'undefined') return toast('SheetJS não carregou (verifique a conexão).', 'err');
  const wb = XLSX.utils.book_new();
  const add = (name, rows) => XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), name);
  add('Simulados', S.mocks.map(m => ({ Nome: m.name, Data: m.date, Banca: m.board, Tipo: m.type, Fonte: m.source || '', Total: m.total, Acertos: m.hits, Erros: m.errors, Brancos: m.blanks, 'Nota (pts)': m.points, 'Aproveitamento (%)': +m.score.toFixed(2), 'Corte (pts)': m.cutoff ?? '', 'Tempo (min)': m.time, 'Redação': m.essay ?? '', 'O que deu errado': m.debriefBad || '', 'O que deu certo': m.debriefGood || '', Debriefing: m.debrief || '' })));
  add('Erros', S.errors.map(e => ({ Data: e.date, 'Matéria': e.subject, Assunto: e.topic, Categoria: e.category, Origem: e.origin, 'Questões': e.questions || '', Motivo: e.reason, 'O que estudar': e.study, Pegadinha: e.pitfall, Bizu: e.bizu, Resolvido: e.resolved ? 'Sim' : 'Não' })));
  add('Questões', S.log.map(l => ({ Data: l.date, 'Matéria': l.subject, 'Minutos': l.minutes, 'Questões': l.questions, Acertos: l.hits, Origem: l.src || '', Assunto: l.topic || '' })));
  add('Radar', S.syllabus.map(x => ({ 'Matéria': x.subject, Assunto: x.topic, 'Incidência': x.incidence, Status: x.status })));
  XLSX.writeFile(wb, `SPOTTER-CODE_${todayStr()}.xlsx`);
  toast('Arquivo XLSX exportado', 'ok');
}
function normDate(v) {
  if (v instanceof Date) return fmtDate(v);
  if (typeof v === 'number' && typeof XLSX !== 'undefined') { const p = XLSX.SSF.parse_date_code(v); return p ? `${p.y}-${z2(p.m)}-${z2(p.d)}` : todayStr(); }
  const s = String(v || '').trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/); if (m) return `${m[3]}-${z2(m[2])}-${z2(m[1])}`;
  return todayStr();
}
function importXlsx(file) {
  if (typeof XLSX === 'undefined') return toast('SheetJS não carregou.', 'err');
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const wb = XLSX.read(ev.target.result, { type: 'array', cellDates: false });
      const sheet = n => wb.Sheets[n] ? XLSX.utils.sheet_to_json(wb.Sheets[n], { defval: '' }) : [];
      let nM = 0, nE = 0, nL = 0, nD = 0;
      // Evita duplicar: compara com o que já existe ANTES da importação
      const kM = new Set(S.mocks.map(m => [m.name, m.date, m.total, m.hits, m.errors, m.blanks].join('|')));
      const kE = new Set(S.errors.map(e => [e.date, e.subject, e.topic, e.category, e.questions || ''].join('|')));
      const kL = new Set(S.log.map(l => [l.date, l.subject, l.minutes, l.questions, l.hits, l.src || '', l.topic || ''].join('|')));
      sheet('Simulados').forEach(r => {
        if (!r.Nome) return;
        const hits = +r.Acertos || 0, errors = +r.Erros || 0, blanks = +r.Brancos || 0, total = +r.Total || (hits + errors + blanks) || 1, board = BOARDS.includes(r.Banca) ? r.Banca : 'Outra';
        if (kM.has([String(r.Nome), normDate(r.Data), total, hits, errors, blanks].join('|'))) { nD++; return; }
        S.mocks.push({ id: uid(), name: String(r.Nome), date: normDate(r.Data), board, type: MOCK_TYPES.includes(r.Tipo) ? r.Tipo : 'Conteúdo', source: String(r.Fonte || ''), total, hits, errors, blanks, points: r['Nota (pts)'] !== undefined && r['Nota (pts)'] !== '' ? +r['Nota (pts)'] : calcPoints(board, hits, errors), score: hits / total * 100, time: +r['Tempo (min)'] || 0, essay: r['Redação'] === '' || r['Redação'] === undefined ? null : +r['Redação'], cutoff: r['Corte (pts)'] === '' || r['Corte (pts)'] === undefined ? null : +r['Corte (pts)'], subj: {}, atp: { atencao: 0, teoria: 0, pulo: 0 }, strategy: null, debrief: String(r.Debriefing || ''), debriefBad: String(r['O que deu errado'] || ''), debriefGood: String(r['O que deu certo'] || '') });
        nM++;
      });
      sheet('Erros').forEach(r => {
        if (!r.Assunto) return;
        const cat = ERR_CATS.includes(r.Categoria) ? r.Categoria : CAT_ATENCAO;
        const subjE = SUBJECT_NAMES.includes(r['Matéria']) ? r['Matéria'] : SUBJECT_NAMES[0];
        if (kE.has([normDate(r.Data), subjE, String(r.Assunto), cat, String(r['Questões'] || '')].join('|'))) { nD++; return; }
        S.errors.push({ id: uid(), date: normDate(r.Data), subject: subjE, topic: String(r.Assunto), category: cat, origin: ERR_ORIGINS.includes(r.Origem) ? r.Origem : 'Tarefa do dia', mockId: '', questions: String(r['Questões'] || ''), reason: String(r.Motivo || ''), study: String(r['O que estudar'] || ''), pitfall: String(r.Pegadinha || ''), bizu: String(r.Bizu || ''), resolved: String(r.Resolvido).toLowerCase() === 'sim' });
        nE++;
      });
      sheet('Questões').forEach(r => {
        if (!r['Matéria']) return;
        const q = +r['Questões'] || 0, subjL = SUBJECT_NAMES.includes(r['Matéria']) ? r['Matéria'] : SUBJECT_NAMES[0];
        const rec = { id: uid(), date: normDate(r.Data), subject: subjL, minutes: +r.Minutos || 0, questions: q, hits: Math.min(+r.Acertos || 0, q), src: String(r.Origem || ''), topic: String(r.Assunto || '') };
        if (kL.has([rec.date, rec.subject, rec.minutes, rec.questions, rec.hits, rec.src, rec.topic].join('|'))) { nD++; return; }
        S.log.push(rec); nL++;
      });
      commit(); toast(`Importado: ${nM} simulados, ${nE} erros, ${nL} sessões` + (nD ? ` · ${nD} duplicados ignorados` : ''), 'ok');
    } catch (err) { console.error(err); toast('Falha ao ler o arquivo. Use o formato exportado pelo sistema.', 'err'); }
  };
  reader.readAsArrayBuffer(file);
}
function exportBackupAll() {
  const blob = new Blob([JSON.stringify(Auth.exportAll())], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `spotter-backup-completo-${todayStr()}.json`; a.click(); URL.revokeObjectURL(a.href);
  toast('Backup completo exportado. Guarde o arquivo só com você.', 'ok');
}
function restoreBackupAll(file) {
  if (file.size > 25 * 1024 * 1024) { toast('Arquivo grande demais para ser um backup.', 'err'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    let obj; try { obj = JSON.parse(reader.result); } catch (e) { toast('Não consegui ler o arquivo (JSON inválido).', 'err'); return; }
    if (!obj || obj.format !== 'spotter-backup') { toast('Este arquivo não é um backup do SPOTTER CODE.', 'err'); return; }
    if (!confirm('Importar o backup? Os dados dos concursos que estão no arquivo vão SUBSTITUIR os atuais.')) return;
    const r = Auth.importAll(obj);
    if (r.ok) { renderAll(); toast(`Backup restaurado (${r.n} concurso${r.n > 1 ? 's' : ''}).`, 'ok'); } else toast(r.error, 'err');
  };
  reader.readAsText(file);
}
function exportJson() {
  const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `spotter-backup-${todayStr()}.json`; a.click(); URL.revokeObjectURL(a.href);
}

/* =====================================================================
   16. EFEITOS — PARTÍCULAS FLUTUANTES
   ===================================================================== */
function initParticles() {
  const cv = $('#particles'), ctx = cv.getContext('2d');
  let w, h, ps = [];
  const resize = () => { w = cv.width = innerWidth; h = cv.height = innerHeight; ps = Array.from({ length: Math.min(55, Math.floor(w * h / 26000)) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.1 + .35, vx: (Math.random() - .5) * .04, vy: -Math.random() * .05 - .01, a: Math.random() * .45 + .12, ph: Math.random() * 6.283, sp: Math.random() * .012 + .004 })); };
  resize(); addEventListener('resize', resize);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ps.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill(); }); return; }
  (function loop() {
    ctx.clearRect(0, 0, w, h);
    if (!document.hidden) ps.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.ph += p.sp; if (p.y < -3) { p.y = h + 3; p.x = Math.random() * w; } if (p.x < -3) p.x = w + 3; if (p.x > w + 3) p.x = -3;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fillStyle = `rgba(255,255,255,${(p.a * (0.55 + 0.45 * Math.sin(p.ph))).toFixed(3)})`; ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
}

/* =====================================================================
   17. INICIALIZAÇÃO
   ===================================================================== */
function bindEvents() {
  // Navegação
  $$('.nav-btn[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
  $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  // Planner — botões
  $('#addTaskBtn').onclick = () => formPlan({ date: UI.plannerDate });
  // Planner — semana
  $('#weekPrev').onclick = () => { UI.weekStart = addDays(UI.weekStart, -7); renderWeek(); };
  $('#weekNext').onclick = () => { UI.weekStart = addDays(UI.weekStart, 7); renderWeek(); };
  $('#weekToday').onclick = () => { UI.weekStart = mondayOf(todayStr()); UI.plannerDate = todayStr(); renderPlanner(); };
  // Planner — dia
  $('#plannerDate').onchange = e => { UI.plannerDate = e.target.value || todayStr(); UI.weekStart = mondayOf(UI.plannerDate); renderPlanner(); };
  $('#datePrev').onclick = () => { UI.plannerDate = addDays(UI.plannerDate, -1); UI.weekStart = mondayOf(UI.plannerDate); renderPlanner(); };
  $('#dateNext').onclick = () => { UI.plannerDate = addDays(UI.plannerDate, 1); UI.weekStart = mondayOf(UI.plannerDate); renderPlanner(); };
  $('#dateToday').onclick = () => { UI.plannerDate = todayStr(); UI.weekStart = mondayOf(UI.plannerDate); renderPlanner(); };
  // Planner — mês
  const shiftMonth = n => { const [y, m] = UI.month.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); UI.month = `${d.getFullYear()}-${z2(d.getMonth() + 1)}`; renderMonth(); };
  $('#monthPrev').onclick = () => shiftMonth(-1); $('#monthNext').onclick = () => shiftMonth(1);
  $('#monthToday').onclick = () => { UI.month = todayStr().slice(0, 7); renderMonth(); };
  $('#monthInput').onchange = e => { if (e.target.value) { UI.month = e.target.value; renderMonth(); } };
  // Radar
  $('#radarSubject').innerHTML = optHTML([{ v: '', l: 'Todas as matérias' }].concat(SUBJECT_NAMES));
  $('#radarInc').innerHTML = optHTML([{ v: '', l: 'Toda incidência' }].concat(INC_LEVELS));
  $('#radarYear').innerHTML = optHTML([{ v: '', l: 'Todos os anos' }].concat(EXAM_YEARS.map(String)));
  $('#radarStatus').innerHTML = optHTML([{ v: '', l: 'Todos os status' }].concat(STATUS));
  const syncRadar = () => { const f = UI.radar; $('#radarSearch').value = f.q; $('#radarSubject').value = f.subject; $('#radarInc').value = f.inc; $('#radarYear').value = f.year; $('#radarStatus').value = f.status; };
  $('#radarSearch').oninput = e => { UI.radar.q = e.target.value; renderRadar(); };
  $('#radarSubject').onchange = e => { UI.radar.subject = e.target.value; renderRadar(); };
  $('#radarInc').onchange = e => { UI.radar.inc = e.target.value; renderRadar(); };
  $('#radarYear').onchange = e => { UI.radar.year = e.target.value; renderRadar(); };
  $('#radarStatus').onchange = e => { UI.radar.status = e.target.value; renderRadar(); };
  $('#radarClear').onclick = () => { UI.radar = { q: '', subject: '', inc: '', year: '', status: '', assunto: '' }; syncRadar(); renderRadar(); };
  $('#radarFocus').onclick = () => { UI.radar = { q: '', subject: '', inc: 'Alta', year: '', status: 'Não Visto', assunto: '' }; syncRadar(); renderRadar(); };
  $('#addTopicBtn').onclick = formTopic;
  $('#radarAssunto').onchange = e => { UI.radar.assunto = e.target.value; renderRadar(); };
  // Edital Verificado
  $('#edSearch').oninput = e => { UI.edital.q = e.target.value; renderEdital(); };
  $('#edExpand').onclick = () => edExpandAll(true); $('#edCollapse').onclick = () => edExpandAll(false);
  $('#edEditBtn').onclick = () => { UI.edital.edit = !UI.edital.edit; renderEdital(); };
  $('#revSplit').onclick = revSplitOpen;
  $('#revSubject').onchange = e => { UI.revSubj = e.target.value; renderReviews(); };
  // Arrastar blocos do cronograma
  const wg = $('#weekGrid');
  wg.addEventListener('pointerdown', dragStart);
  addEventListener('pointermove', dragMove); addEventListener('pointerup', dragEnd);
  addEventListener('click', e => { if (_justDragged) { e.stopPropagation(); e.preventDefault(); } }, true);
  // Demais módulos
  $('#addMockBtn').onclick = () => formMock(); $('#addErrorBtn').onclick = formError;
  // Revisões
  $('#ganttPrev').onclick = () => { UI.revYear--; renderReviews(); };
  $('#ganttNext').onclick = () => { UI.revYear++; renderReviews(); };
  $('#ganttYear').onchange = e => { UI.revYear = +e.target.value; renderReviews(); };
  $('#revPrev').onclick = () => { UI.revIdx = curRevIdx() - 1; renderReviews(); };
  $('#revNext').onclick = () => { UI.revIdx = curRevIdx() + 1; renderReviews(); };
  $('#revToday').onclick = () => { UI.revIdx = null; UI.revYear = new Date().getFullYear(); renderReviews(); };
  // Config — revisão e temas
  $('#revCfgBody').addEventListener('input', e => { const el = e.target.closest('[data-rc="c"]'); if (el) { const t = $(`[data-tr="${CSS.escape(el.dataset.n)}"]`); if (t) t.textContent = trText(Number(el.value)); } });
  $('#revSave').onclick = () => { const v = readRevConfig(); if (v && saveRevConfig(v)) { commit(); toast('Configuração de revisão salva', 'ok'); } };
  $('#revAuto').onclick = () => {
    if (!confirm('Aplicar o cálculo automático? Os contatos de cada matéria serão preenchidos pela incidência (pré-edital: alta 6 · média 4 · baixa 3; pós-edital: alta 12 · média 6 · baixa 4).')) return;
    const v = readRevConfig(); if (!v) return;
    const tab = $('#revEdital').value === '1' ? CONTACTS_POST : CONTACTS_PRE;
    SUBJECT_NAMES.forEach(n => { v[n].c = tab[v[n].inc]; });
    if (saveRevConfig(v)) { commit(); toast('Cálculo automático aplicado', 'ok'); }
  };
  $('#revRestore').onclick = () => { if (confirm('Restaurar a distribuição automática do Gantt? Os ajustes manuais das caixinhas serão descartados (as revisões já marcadas como feitas continuam registradas).')) { SUBJECT_NAMES.forEach(n => { S.rev.subj[n].blocks = {}; }); commit(); toast('Distribuição automática restaurada', 'ok'); } };
  $('#themesSave').onclick = () => { const t = parseThemes($('#themesText').value); if (!t.length) return toast('Use o formato Tema: palavra1, palavra2 (um por linha).', 'err'); S.themes = t; commit(); toast('Temas salvos', 'ok'); };
  $('#themesReset').onclick = () => { if (confirm('Restaurar os temas padrão?')) { S.themes = DEFAULT_THEMES.map(t => ({ name: t.name, words: [...t.words] })); commit(); toast('Temas restaurados', 'ok'); } };
  // Config
  $('#cfgSave').onclick = () => {
    const lc = $('#cfgLastCut').value.trim();
    S.settings = { ...S.settings, examDate: $('#cfgExam').value || S.settings.examDate, lastCut: lc === '' ? null : clamp(+lc || 0, 0, 1000), dailyGoal: clamp(+$('#cfgGoal').value || 4, 0.5, 16) };
    commit(); toast('Parâmetros salvos', 'ok');
  };
  $('#btnDemo').onclick = () => { if (confirm('Substituir os dados atuais pelos dados de exemplo (fictícios)?')) { S = buildDemo(); UI.revIdx = null; UI.plannerDate = todayStr(); UI.weekStart = mondayOf(todayStr()); UI.openMock = null; UI.err = { cat: '', mock: '' }; commit(); toast('Dados de exemplo carregados', 'ok'); } };
  $('#btnReset').onclick = () => { if (confirm('Apagar TODOS os dados? Esta ação não pode ser desfeita.')) { S = defaultState(); UI.revIdx = null; UI.openMock = null; UI.err = { cat: '', mock: '' }; commit(); toast('Dados zerados', 'ok'); } };
  $('#btnExport').onclick = exportXlsx; $('#btnJson').onclick = exportJson;
  $('#btnBackupAll').onclick = exportBackupAll;
  $('#btnRestoreAll').onclick = () => $('#fileRestore').click();
  $('#fileRestore').onchange = e => { if (e.target.files[0]) restoreBackupAll(e.target.files[0]); e.target.value = ''; };
  $('#btnImport').onclick = () => $('#fileImport').click();
  $('#fileImport').onchange = e => { if (e.target.files[0]) importXlsx(e.target.files[0]); e.target.value = ''; };
  // Delegação global + modal
  document.addEventListener('click', onAction);
  document.addEventListener('change', onChange);
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' || e.target.closest('[data-close]')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

document.addEventListener('DOMContentLoaded', () => {
  setupChartDefaults();
  bindEvents();
  bindAuthEvents();
  initParticles();
  $('#authImg').src = ASSETS.soldier;
  Auth.seed();
  Auth.boot();
  registerPwa();
});

/** Registra o service worker (só em http/https; em arquivo local não existe). */
function registerPwa() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').catch(() => { /* sem offline, o app segue funcionando */ });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) toast('Nova versão instalada. Recarregue a página para usar.', 'ok'); });
}
