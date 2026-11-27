/* SPOTTER CODE — nuvem (Supabase): login por e-mail e sincronização (v6.0).
   Princípios:
   - O navegador continua sendo a cópia de trabalho (funciona offline). A nuvem é a cópia compartilhada entre aparelhos.
   - Cada concurso é uma linha: cid = 'pf' | 'prf' (fixos, iguais em todos os aparelhos) ou o id do concurso antigo ("legacy").
   - `version` (controlada pelo banco) detecta conflito: nada é sobrescrito em silêncio.
   - Só roda quando Auth.mode === 'cloud'. Em conta local (versão antiga/testes) tudo aqui é ignorado. */
const Cloud = (() => {
  let hold = false, deferred = new Set(), client = null, timer = null, busy = false, bound = false, recovering = false, lastOk = 0, lastErr = '', state = 'off', lastPull = 0;
  const NO_LIB = 'Sem conexão com o serviço de contas. Conecte-se à internet e recarregue a página.';
  const cfg = () => (typeof window !== 'undefined' && window.SPOTTER_CLOUD) || null;
  const lib = () => (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) || null;
  const active = () => !!(Auth.user && Auth.mode === 'cloud');
  const online = () => navigator.onLine !== false;
  const syncKey = () => `spotter-u:${Auth.user}:sync`;
  const bakKey = cid => `spotter-u:${Auth.user}:bak:${cid}`;
  const getInfo = () => lsGet(syncKey(), {});
  const setInfo = o => lsSet(syncKey(), o);
  const cidOf = m => (m.kind === 'pf' || m.kind === 'prf' ? m.kind : m.id);
  const metaByCid = cid => Auth.concursos().find(m => cidOf(m) === cid) || null;
  const hasLocal = m => { try { return localStorage.getItem(Auth.dataKey(Auth.user, m.id)) != null; } catch (e) { return false; } };
  const anyDirty = () => Object.values(getInfo()).some(i => i && i.dirty);

  const TR = [
    [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
    [/email not confirmed/i, 'Confirme seu e-mail antes de entrar (veja a caixa de entrada e o spam).'],
    [/already registered|already been registered/i, 'Este e-mail já tem cadastro. Use "Entrar" ou "Esqueci a senha".'],
    [/rate limit|too many|over_email_send_rate_limit|security purposes/i, 'Muitas tentativas ou e-mails enviados. Aguarde alguns minutos e tente de novo.'],
    [/password should be at least|weak password/i, 'Senha fraca: use pelo menos 8 caracteres.'],
    [/invalid.*email|unable to validate email/i, 'E-mail inválido.'],
    [/same password|different from the old/i, 'A nova senha deve ser diferente da atual.'],
    [/failed to fetch|network|fetch/i, 'Sem internet. Tente de novo quando estiver conectado.'],
    [/invalid api key|apikey/i, 'Chave do serviço inválida (avise o administrador do programa).']
  ];
  const tr = e => { const m = String((e && e.message) || e || ''); const h = TR.find(([re]) => re.test(m)); return h ? h[1] : 'Não foi possível concluir. Verifique a internet e tente de novo.'; };

  function getClient() {
    if (client) return client;
    const c = cfg(), L = lib(); if (!c || !L) return null;
    client = L(c.url, c.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'spotter-sb-auth' } });
    client.auth.onAuthStateChange(ev => { if (ev === 'PASSWORD_RECOVERY') { recovering = true; showRecovery(); } });
    return client;
  }
  const redirect = () => location.origin + location.pathname;

  /* ---------- Conta ---------- */
  async function signUp(email, pw) {
    const c = getClient(); if (!c) return { ok: false, error: NO_LIB };
    try {
      const r = await c.auth.signUp({ email, password: pw, options: { emailRedirectTo: redirect() } });
      if (r.error) return { ok: false, error: tr(r.error) };
      const u = r.data && r.data.user;
      if (u && Array.isArray(u.identities) && u.identities.length === 0) return { ok: false, error: tr('already registered') };
      if (!r.data.session) return { ok: true, confirm: true };
      return { ok: true, user: u };
    } catch (e) { return { ok: false, error: tr(e) }; }
  }
  async function signIn(email, pw) {
    const c = getClient(); if (!c) return { ok: false, error: NO_LIB };
    try { const r = await c.auth.signInWithPassword({ email, password: pw }); return r.error ? { ok: false, error: tr(r.error) } : { ok: true, user: r.data.user }; }
    catch (e) { return { ok: false, error: tr(e) }; }
  }
  async function resetPassword(email) {
    const c = getClient(); if (!c) return { ok: false, error: NO_LIB };
    try { const r = await c.auth.resetPasswordForEmail(email, { redirectTo: redirect() }); return r.error ? { ok: false, error: tr(r.error) } : { ok: true }; }
    catch (e) { return { ok: false, error: tr(e) }; }
  }
  async function updatePassword(pw) {
    const c = getClient(); if (!c) return { ok: false, error: NO_LIB };
    try { const r = await c.auth.updateUser({ password: pw }); return r.error ? { ok: false, error: tr(r.error) } : { ok: true }; }
    catch (e) { return { ok: false, error: tr(e) }; }
  }
  /** Ao abrir o programa sem sessão local: aproveita uma sessão já existente (ex.: depois de clicar no link de confirmação do e-mail). */
  async function resume() {
    const c = getClient(); if (!c) return;
    try {
      const r = await c.auth.getSession(); const s = r && r.data && r.data.session;
      if (s && s.user && !recovering) { Auth.cloudEnter(s.user); await pull(); start(); showAuth('profiles'); }
    } catch (e) { /* segue na tela de login */ }
  }
  function showRecovery() {
    openForm({
      title: 'Nova senha',
      fields: [{ name: 'nw', label: 'Nova senha (mín. 8 caracteres)', type: 'password', required: true, full: true }, { name: 'nw2', label: 'Confirmar nova senha', type: 'password', required: true, full: true }],
      validate: d => (d.nw.length < 8 ? 'A senha deve ter pelo menos 8 caracteres.' : d.nw !== d.nw2 ? 'As senhas não conferem.' : ''),
      onSubmit: async d => {
        const r = await updatePassword(d.nw);
        if (!r.ok) { toast(r.error, 'err'); return; }
        recovering = false; toast('Senha alterada. Você já está dentro.', 'ok');
        const c = getClient(), s = c && (await c.auth.getSession()).data.session;
        if (s && s.user) { Auth.cloudEnter(s.user); await pull(); start(); showAuth('profiles'); }
      }
    });
  }

  /* ---------- Marcação de alterações ---------- */
  function markDirty(meta) {
    if (!active() || !meta) return;
    const cid = cidOf(meta), all = getInfo(), i = all[cid] || {};
    i.dirty = true; i.rev = (i.rev || 0) + 1; all[cid] = i; setInfo(all); schedule(); paint();
  }
  const touch = () => markDirty(Auth.meta());
  function schedule() { if (!active()) return; clearTimeout(timer); timer = setTimeout(() => syncNow(), 2500); }

  /* ---------- Aplicar linha da nuvem neste aparelho ---------- */
  function applyRow(meta, row) {
    const key = Auth.dataKey(Auth.user, meta.id), cid = cidOf(meta);
    try { const old = localStorage.getItem(key); if (old) localStorage.setItem(bakKey(cid), old); } catch (e) { /* sem espaço para a cópia */ }
    if (!lsSet(key, row.state)) { toast('Sem espaço no navegador para baixar os dados da nuvem.', 'err'); return false; }
    if (meta.kind === 'pf' || meta.kind === 'prf') Auth.updateConcurso(meta.id, { icon: row.icon || null });
    const all = getInfo(); all[cid] = { v: row.version, dirty: false, rev: (all[cid] && all[cid].rev) || 0, at: Date.now() }; setInfo(all);
    if (Auth.cid === meta.id) { S = loadState(); pullShared(); renderAll(); renderBrand(); }
    return true;
  }
  function ensureMetaFor(row) {
    if (row.kind === 'pf' || row.kind === 'prf') return Auth.fixed().find(c => c.kind === row.kind) || null;
    let m = Auth.concursos().find(c => c.id === row.cid);
    if (!m) { m = { id: row.cid, name: String(row.name || 'Concurso antigo'), icon: row.icon || null, kind: 'legacy', created: todayStr() }; Auth.setConcursos([...Auth.concursos(), m]); }
    return m;
  }
  function askConflict(meta, row) {
    return new Promise(res => {
      let done = false; const fin = v => { if (!done) { done = true; clearInterval(iv); res(v); } };
      const when = row.updated_at ? new Date(row.updated_at).toLocaleString('pt-BR') : 'data desconhecida';
      choiceModal({
        title: `Dados diferentes — ${meta.name}`,
        text: `Este aparelho e a nuvem têm versões diferentes deste concurso (nuvem alterada em ${when}). Qual você quer manter? A outra fica guardada como cópia de segurança neste aparelho.`,
        options: [{ label: 'Usar a nuvem', value: 'cloud' }, { label: 'Manter este aparelho', value: 'local', cls: 'primary' }], onPick: fin
      });
      const iv = setInterval(() => { if (!$('#modal').classList.contains('open')) fin('later'); }, 300);
    });
  }

  /* ---------- Baixar ---------- */
  async function pull() {
    const c = getClient(); if (!c || !active()) return false;
    const r = await c.from('concursos').select('cid,kind,name,icon,state,version,updated_at');
    if (r.error) throw r.error;
    lastPull = Date.now();
    const rows = r.data || [], seen = new Set(); deferred = new Set();
    for (const row of rows) {
      if (!row || !row.state || typeof row.state !== 'object') continue;
      const meta = ensureMetaFor(row); if (!meta) continue;
      const cid = cidOf(meta), all = getInfo(), i = all[cid] || {}; seen.add(cid);
      if (i.v == null) {
        if (!hasLocal(meta)) applyRow(meta, row);
        else { const a = await askConflict(meta, row); if (a === 'cloud') applyRow(meta, row); else if (a === 'local') { try { localStorage.setItem(bakKey(cid), JSON.stringify(row.state)); } catch (e) { /* ok */ } const x = getInfo(); x[cid] = { v: row.version, dirty: true, rev: (i.rev || 0) + 1 }; setInfo(x); } }
      } else if (row.version > i.v) {
        if (!i.dirty) applyRow(meta, row);
        else { const a = await askConflict(meta, row); if (a === 'cloud') applyRow(meta, row); else if (a === 'local') { try { localStorage.setItem(bakKey(cid), JSON.stringify(row.state)); } catch (e) { /* ok */ } const x = getInfo(); x[cid] = { ...i, v: row.version, dirty: true, rev: (i.rev || 0) + 1 }; setInfo(x); } else { deferred.add(cid); state = 'conflict'; hold = true; } }
      }
    }
    // concursos só deste aparelho (ou removidos da nuvem): precisam subir
    const all = getInfo(); let ch = false;
    Auth.concursos().forEach(m => { const cid = cidOf(m); if (!seen.has(cid) && hasLocal(m)) { const i = all[cid] || {}; if (i.v != null || !i.dirty) { all[cid] = { v: null, dirty: true, rev: (i.rev || 0) + 1 }; ch = true; } } });
    if (ch) setInfo(all);
    return true;
  }

  /* ---------- Subir ---------- */
  async function pushOne(meta) {
    const c = getClient(), cid = cidOf(meta), all0 = getInfo(), i0 = all0[cid] || {}, rev0 = i0.rev || 0;
    let state0; try { const raw = localStorage.getItem(Auth.dataKey(Auth.user, meta.id)); if (!raw) { const a = getInfo(); a[cid] = { ...i0, dirty: false }; setInfo(a); return 'ok'; } state0 = JSON.parse(raw); } catch (e) { return 'error'; }
    const icon = typeof meta.icon === 'string' && /^data:image\//.test(meta.icon) && meta.icon.length <= 200000 ? meta.icon : null;
    const row = { kind: meta.kind, name: String(meta.name || '').slice(0, 80), icon, state: state0 };
    let version;
    if (i0.v == null) {
      const r = await c.from('concursos').insert({ user_id: Auth.user, cid, ...row }).select('version').single();
      if (r.error) return r.error.code === '23505' ? 'conflict' : (lastErr = tr(r.error), 'error');
      version = r.data.version;
    } else {
      const r = await c.from('concursos').update(row).eq('user_id', Auth.user).eq('cid', cid).eq('version', i0.v).select('version');
      if (r.error) return (lastErr = tr(r.error), 'error');
      if (!r.data || !r.data.length) return 'conflict';
      version = r.data[0].version;
    }
    const all = getInfo(), i = all[cid] || {};
    all[cid] = { v: version, dirty: (i.rev || 0) !== rev0, rev: i.rev || 0, at: Date.now() }; setInfo(all);
    return 'ok';
  }

  async function syncNow(manual) {
    if (!active() || busy) return;
    if (manual) hold = false; else if (hold) { state = 'conflict'; paint(); return; }
    const c = getClient();
    if (!c) { state = 'nolib'; paint(); return; }
    if (!online()) { state = anyDirty() ? 'offline' : 'ok'; paint(); if (manual) toast('Sem internet: as alterações ficam guardadas e sobem quando voltar.', 'err'); return; }
    busy = true; state = 'syncing'; paint();
    try {
      const s = (await c.auth.getSession()).data.session;
      if (!s || !s.user || s.user.id !== Auth.user) { busy = false; Auth.sessionLost(); return; }
      await pull();
      for (const m of Auth.concursos()) {
        const i = getInfo()[cidOf(m)];
        if (!i || !i.dirty) continue;
        if (deferred.has(cidOf(m))) continue;
        let r = await pushOne(m);
        if (r === 'conflict') { await pull(); if (deferred.has(cidOf(m))) continue; const j = getInfo()[cidOf(m)]; if (j && j.dirty) r = await pushOne(m); }
        if (r === 'error') throw new Error(lastErr || 'erro');
      }
      state = deferred.size ? 'conflict' : anyDirty() ? 'pending' : 'ok'; lastOk = Date.now(); lastErr = '';
      if (manual) toast(anyDirty() ? 'Ainda há alterações pendentes.' : 'Tudo sincronizado.', anyDirty() ? 'err' : 'ok');
    } catch (e) {
      state = 'error'; lastErr = lastErr || tr(e); if (manual) toast(lastErr, 'err');
    } finally { busy = false; paint(); if (anyDirty() && state !== 'conflict' && !hold) { clearTimeout(timer); timer = setTimeout(() => syncNow(), 30000); } }
  }

  /* ---------- Versões de segurança ---------- */
  async function versions(meta) {
    const c = getClient(); if (!c || !online()) return { ok: false, error: 'Precisa de internet para ver as versões.' };
    const r = await c.from('concursos_versoes').select('id,state,created_at').eq('user_id', Auth.user).eq('cid', cidOf(meta)).order('created_at', { ascending: false });
    return r.error ? { ok: false, error: tr(r.error) } : { ok: true, rows: r.data || [] };
  }
  function restoreVersion(meta, row) {
    const key = Auth.dataKey(Auth.user, meta.id), cid = cidOf(meta);
    try { const old = localStorage.getItem(key); if (old) localStorage.setItem(bakKey(cid), old); } catch (e) { /* ok */ }
    if (!lsSet(key, row.state)) return false;
    if (Auth.cid === meta.id) { S = loadState(); pullShared(); renderAll(); }
    markDirty(meta); return true;
  }

  /* ---------- Sair ---------- */
  async function logout() {
    if (active() && online() && anyDirty()) { try { await Promise.race([syncNow(), new Promise(r => setTimeout(r, 5000))]); } catch (e) { /* segue */ } }
    const dirty = active() && anyDirty(), uid = Auth.user, c = getClient();
    try { if (c) await c.auth.signOut({ scope: 'local' }); } catch (e) { /* ok */ }
    if (!dirty && uid) { try { Object.keys(localStorage).filter(k => k.startsWith(`spotter-u:${uid}:`)).forEach(k => localStorage.removeItem(k)); } catch (e) { /* ok */ } }   // aparelho limpo; a nuvem tem tudo
    else if (dirty) toast('Há alterações que ainda não subiram. Elas ficam neste aparelho até você entrar de novo.', 'err');
    Auth.afterLogout();
  }

  /* ---------- Estado na tela ---------- */
  const SHORT = { off: 'Sem nuvem', nolib: 'Sem conexão', offline: 'Offline · pendente', pending: 'Pendente', syncing: 'Sincronizando…', ok: 'Sincronizado', error: 'Erro ao sincronizar', conflict: 'Conflito', nosession: 'Sessão expirada' };
  const LONG = { off: 'Conta local deste aparelho: não há sincronização. Use “Exportar tudo” e importe numa conta com e-mail.', nolib: 'Sem conexão com o serviço de contas. Os dados ficam neste aparelho e sobem depois.', offline: 'Sem internet. As alterações estão guardadas aqui e sobem quando a conexão voltar.', pending: 'Há alterações que ainda não subiram para a nuvem.', syncing: 'Sincronizando…', ok: 'Tudo sincronizado.', error: 'Não foi possível sincronizar agora. Tentaremos de novo.', conflict: 'Há dados diferentes entre este aparelho e a nuvem. Clique em “Sincronizar agora” para escolher.', nosession: 'Sua sessão expirou. Entre de novo.' };
  function status() { return active() ? state : 'off'; }
  function paint() {
    const st = status(), line = $('#syncLine'), card = $('#cloudStatus');
    if (line) { line.dataset.state = st; line.hidden = !Auth.user; line.innerHTML = `<i class="sync-dot"></i><span class="nav-t">${SHORT[st] || ''}</span>`; line.title = LONG[st] || ''; }
    if (card) card.textContent = (LONG[st] || '') + (st === 'ok' && lastOk ? ` Última: ${new Date(lastOk).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.` : '') + (lastErr && st === 'error' ? ` (${lastErr})` : '');
  }

  function start() {
    if (!active()) { state = 'off'; paint(); return; }
    if (!bound) {
      bound = true;
      window.addEventListener('online', () => syncNow());
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - lastPull > 30000) syncNow(); else if (document.visibilityState === 'hidden' && anyDirty()) syncNow(); });
      setInterval(() => { if (active() && (anyDirty() || Date.now() - lastPull > 120000)) syncNow(); }, 30000);
    }
    state = anyDirty() ? 'pending' : 'ok'; paint(); syncNow();
  }
  return { signUp, signIn, resetPassword, updatePassword, resume, markDirty, touch, syncNow, start, logout, versions, restoreVersion, paint, status, busy: () => busy, available: () => !!(cfg() && lib()), getClient, _info: getInfo };
})();
