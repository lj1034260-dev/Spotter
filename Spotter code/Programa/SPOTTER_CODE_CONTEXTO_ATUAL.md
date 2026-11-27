# SPOTTER CODE — CONTEXTO ATUAL (v5.0)

## Estado
**v4.1 (Atualização 5)**: 83/83 testes. Backup da v4.0: `spotter-v2-backup-v4.0/`. Mudanças da v4.1:
- Planner: lateral (tarefas/lembretes) ≈ +11% (`3.5fr / 1fr`); bloco **Teoria** mostra a matéria (nome curto) em destaque + “Teoria” pequeno; demais tipos só o tipo; conteúdo centralizado (H e V). Tarefas do dia: checkbox à direita. Calendário mensal já filtra só Revisão/Compromisso/Simulado/Prova (teste novo garante).
- Edital Verificado: só o chip “Progresso geral”; sem selo de bloco e de incidência (chaves `k` mantidas nos dados para religar depois); ícone do menu `fa-sitemap`.
- Revisões: espaçamento entre Gantt e “Revisões do mês”; botão **Listas intercaladas** (modal pede nº de listas; `interleaveSplit` intercala matérias e reparte em listas de tamanho ±1; `S.rev.split={idx,k,lists}`; abas Lista n / Todas; desfazer divisão). Só pendentes do mês (respeita filtro de matéria).
- Configurações: “Meta de acerto por matéria” → **Nota de corte da última prova (pontos)** = `settings.lastCut`. `cutOf(m)`: a global tem prioridade; vazia → corte do próprio simulado. Alimenta gráfico da Visão Geral, “vs. corte” e competitividade. `settings.cutoff` (meta % por matéria) continua interno (70) sem campo na tela.
- Menu: “Configurações & Dados” foi para o rodapé da barra lateral; “Sistema online / Dados salvos localmente” foi para o topo da aba Configurações.

Atualização 4 (partes 1 e 2) implementada e testada: **72/72** na regressão em navegador real (Playwright; gráficos validados com um `Chart` simulado que captura as configurações). Aguardando testes do usuário → bugs/ajustes. Cores e fontes NÃO alteradas. Backups: `spotter-v2-backup-v3.0/`, `spotter-v2-backup-v2.0/`.

## Arquitetura (preservada)
HTML/CSS/JS puro, Chart.js 4.4.1, SheetJS, Font Awesome, localStorage (`spotter-code-v2`, `schema: 4`, `migrate()` automático e idempotente). Estado único `S`; `commit()`; delegação `data-action`. Modais `openForm` (retorno `'keep'` mantém o modal aberto), `openInfo`, `choiceModal`.
Novos arquivos de dados (carregados antes do script.js, só funções puras): `data-incidencia.js`, `data-edital.js`.

## Modelo de dados (mudanças v4)
- `plan[]`: `{id,type,date,start,end,subjects[],title,desc,reminder,repeat:[0–6],skip:[datas],until,doneDates[],regs}`. `fixed` foi REMOVIDO (migração: fixed→repeat no dia da semana). `occurrences(data)`: `skip` primeiro; data inicial sempre incluída; série = `data>it.date`, `<=until`, dia da semana em `repeat`. Sem dias marcados = só aquela data. Novo tipo **Caderno de Erros** (= Questões: multi-matéria, registra questões/acertos).
- `S.edital = {v, tree, checks:{idFolha:true}}`. Árvore tema→subtema→tópico→subtópico (689 nós, 514 folhas, 12 seções); ids estáveis; `k` (`~` no DSL) liga o item à incidência Spotter. % de cada nó vem das folhas; marcar pai marca todas as folhas. Independente de Radar/Revisões. Editável no app (renomear/adicionar/excluir). Informática e TI só se separam na árvore (ambas `subj:'Informática'`); Penal e Processo Penal separados.
- `SUBJECTS` agora só tem short/block; assuntos do Radar vêm de `INC_SPOTTER` com nível por nº de válidas (Alta ≥10, Média 4–9, Baixa ≤3).

## Regras principais (v4)
- **Cabeçalho**: “Dashboard” só na Visão Geral (topbar só aparece no mobile para o menu).
- **Visão Geral**: gráfico simulados × corte em pontos (acertos−erros), linhas retas, sem linha onde não há corte. Incidência da banca no gráfico = válidas 2018–2025 (Spotter).
- **Planner**: grade 0h–24h (`--hh:36px`), cronograma ≈4× a lateral; bloco mostra só o tipo; cor por matéria (`SUBJ_PALETTE`; 1ª matéria = cor, faixa lateral para as demais); Rotina cinza; Compromisso/Simulado/Prova/Caderno de Erros com cor fixa. Tarefas do dia: “Registrado” + duração em verde (`fmtDur`), sem “N matéria(s)”, sem horários, sem ícone “fixo”. Checkbox de Compromisso/Prova/Simulado sincroniza com Lembretes (lembrete esmaece). Repetição estilo alarme (seg–dom). Arrastar bloco (mantém duração), redimensionar pela borda inferior; série pergunta “só esta data / esta e as próximas”; excluir série: só este dia / este e os próximos / toda a série. Clicar num dia do calendário mensal abre “Nova tarefa” com a data. **Bug do hover corrigido**: causa = `scale` no hover + overflow criando barra de rolagem; agora só brilho/sombra e `overflow-y:hidden` (teste mede layout antes/depois do hover).
- **Radar**: base = análise Spotter (6 provas 2009/12/14/18/21/25; 675 válidas = 597 no edital atual + 78 fora). Estratégia Raio-X (2021–2025) em bloco separado, nunca somada. Sem matéria: rosca/ranking por matéria (filtro de ano), linhas retas por ano, “Assuntos prioritários 2018–2025”, “Fora do edital 2025” (Economia, Atualidades, Administração, Orçamento, Ética). Uma matéria: rosca = assuntos, barras = tópicos (filtro por assunto), matriz de disciplinas, tabela Estratégia. Dados por ano só no nível da matéria. Dados fictícios removidos.
- **Simulados**: estratégia × tempo médio em horas; estratégia × pontos totais (nº de simulados no rótulo); veredito por pontos totais (empate → menor tempo; ≥2 estratégias com ≥2 simulados); “Precisão” removida do detalhe.
- **Revisões**: chips logo após o título (antes do Gantt); filtro “Todas as matérias” na lista do mês.
- Demais regras da v3 (ciclos, método B, registrar estudo, erros, importação XLSX) inalteradas.

## Arquivos
index.html, style.css, script.js, data-incidencia.js, data-edital.js, SPOTTER_CODE_CONTEXTO_ATUAL.md, tests/regression.js, tests/smoke.js.

## Testes — atualização 4
`cd tests && NODE_PATH=$(npm root -g) node regression.js` → **72/72 OK**. 46 testes antigos (6 adaptados: série `repeat`, grade 0–24h, schema 4, veredito por pontos, Radar sem dados fictícios) + 26 novos: cabeçalho, gráfico de pontos, hover sem salto de layout, proporção 80/20, blocos só tipo/cores/faixa, duração verde, Caderno de Erros, lembretes sincronizados, clique no dia, repetição, excluir série (3 modos), arrastar, redimensionar, arrastar série, Radar (rosca/barras/anos/níveis/fora do edital), Edital (estrutura, marcação, %, independência, selos, busca, edição, folha→pai), Simulados, Revisões, migração v3→v4, console limpo.
**Bugs achados na própria implementação**: patch duplicou o arquivo (marcador de seção repetido) → restaurado e reaplicado; formulário de Rotina exige título (teste); contagem de nós (689 com as 12 raízes).
**Não verificável offline**: aparência com fontes/ícones reais, Chart.js real, celular real.

## Pendências / atenção
- Artigos do blog da Estratégia não acessíveis; usado o e-book (dados por % de itens). Incidência por ano/assunto só no nível da matéria.
- DSO cita “Lei 9.545/1997” em Leg. Especial (provável erro de digitação de 9.454/1997); a árvore sinaliza o item.
- `DEFAULT_INC` das Revisões não foi sincronizado com a matriz Spotter (oferecer).
- Níveis finos do Edital montados por doutrina usual para Agente (noções, sem jurisprudência/Delegado); o usuário editará.
- Atrasadas: só o último ciclo passado não marcado “carrega”. Questões/Flashcards/Revisão não alimentam o Gantt. Excluir tarefa mantém os estudos no log. Pomodoro dormente.
- Próximo: bugs/ajustes do usuário.


## Atualização 6 (v4.2) — 2026-11-21
- **Visão Geral:** cobertura (KPI, tabela, gráfico por bloco) = progresso do Edital Verificado (`edCoverage()`; raiz "TI" soma em Informática). Gráfico de incidência removido; **Rotina Tracker** (`routineTracker/renderRoutineTracker`, `UI.routineMonth`): linhas = títulos de Rotina do Planner, colunas = dias; ponto cheio = feito, vazado = não feito (passado), tracejado = pendente.
- **Planner:** bloco Rotina mostra título + "Rotina" pequeno; rotinas com treino/academia/jiu… (`TRAIN_RE`) usam `TRAIN_COLOR`; tarefas do dia agrupadas ("Blocos de estudo" incl. Simulado → "Tarefas"); clique no dia do mês só oferece `TAG_TYPES` (`formPlan({types})`); **Programação anual** (`annualCounts/renderAnnual`, `UI.annualYear`): contagem por ocorrência de Prova/Compromisso/Simulado/Revisão do Planner (não usa aba Revisões); clique no mês abre o calendário mensal.
- **Registrar estudo:** botão "Vincular ao edital" (árvore inline por matéria); logs guardam `edIds` e `edNew` (folhas marcadas por aquele registro; desfazer/editar reverte só elas); texto livre continua válido.
- **Caderno de Erros:** sem matérias nem "Registrar"; botão "Ir para o caderno"; `syncCaderno()` (em `commit` e no load) marca Feito quando ≥1 erro com `resolvedDate`=hoje e nenhum aberto; cria log `auto` (subject '', minutos = duração do bloco, editável) → conta no tempo total, não por matéria. "N matérias" = matérias dos erros resolvidos no dia.
- **Revisões:** Gantt em **ano civil** (1º bloco do C0 até dezembro; cada janeiro reinicia em C1; blocos `{s,e,limit}`); C0 ignora estudos anteriores a `S.rev.startMonth`; botões "Zerar ano" / "Repetir ano anterior" (`ganttYearAction`) no cabeçalho do Gantt. Ajustes manuais antigos de blocos rolantes (chave ≠ início do ano) ficam órfãos/ignorados.
- **Configurações:** "Configuração de revisão" e "Temas dos debriefings" em `<details class="acc">` (fechadas); campos de Parâmetros alinhados (`align-items:end`).
- **Testes:** 95/95 (relógio fixado em 2026-11-20 via `page.clock`). Testes antigos de C0/blocos reescritos para o modelo civil.
- **Pendências/atenção:** validar no uso real o fluxo do Caderno de Erros e o vínculo com o edital; botões do Gantt ficaram no cabeçalho do Gantt (não em Configurações).


## Atualização 7 (v4.3) — 2026-11-21
**Entregue:** login/cadastro, seleção de concurso (perfis), concursos isolados, menu flutuante retrátil, ajustes da Visão Geral. **Testes: 112/112** (`cd tests && NODE_PATH=$(npm root -g) node regression.js`; `fresh()` agora faz login automático).

### Arquivos (6 devem ficar juntos): index.html, script.js, style.css, data-incidencia.js, data-edital.js, **data-assets.js** (novo: `ASSETS.soldier` JPEG e `ASSETS.pf` PNG em data URI; banner de erro verifica `ASSETS`).

### Contas e concursos (script.js, seção 3b: `Auth`)
- Armazenamento (localStorage): `spotter-users-v1` (usuários: nick, sal, hash), `spotter-session-v1` ({user,cid}), `spotter-u:<usuário>:idx` (lista de concursos {id,name,icon,created}), `spotter-u:<usuário>:c:<id>` (estado completo do concurso, mesmo formato de `S`), `spotter-menu-collapsed`.
- `STORE_KEY` agora é variável: definida em `Auth.enter(id)`; `save()` ignora se nulo. `S = loadState()` a cada entrada; `UI` é reiniciado.
- Senha: sal + SHA-256 (JS puro, validado com vetores) iterado 4000×. Mín. 8 caracteres; usuário 3–24 (letras/números/._-), sem distinção de maiúsculas. Sem "esqueci a senha". Alterar senha em Configurações > Concurso e conta. **Segurança é apenas local** (não protege contra quem acessa o navegador); servidor (Supabase) é etapa futura.
- Usuário de teste criado na 1ª abertura (`Auth.seed`): `spotter` / `Spotter@2026` (não aparece na tela); recebe um concurso "Polícia Federal" (ícone `builtin:pf`) com os dados da versão antiga (`spotter-code-v2`), se existirem (migração).
- Fluxo: sem sessão → login (card com 3 pontos + foto do soldado) → seleção de concurso (cartões ícone+nome, "+" adiciona; "Gerenciar concursos" edita) → app. Menu: "Trocar de concurso" e "Sair". Editar/excluir concurso (com confirmação) em Configurações e na tela de seleção.
- Ícone: padrão = escudo; upload PNG/JPG reduzido a 256 px (data URI).
- **Importar de outro concurso** (só ao criar): copia APENAS o progresso do Edital Verificado (árvore + checks) e status dos assuntos das matérias escolhidas, uma vez. Não copia planner, simulados, erros, horas, revisões.
- Limitação: lista de matérias (`SUBJECT_NAMES`) é global; matérias por concurso = futuro.

### Interface
- Menu flutuante (bordas arredondadas), topo com símbolo + nome do concurso centralizado, sem "PF CMD"; recolhível (só ícones, preferência salva); corrigida a barra de rolagem ao passar o mouse (removido translateX no hover + overflow-x oculto); removida a linha acima de Configurações.
- Visão Geral: gráfico "Incidência da Banca vs. Seus Acertos" restaurado ao lado de Consistência Semanal; Rotina Tracker abaixo, com bolinhas vazadas em todos os dias e preenchidas com a cor individual da rotina quando feita (`S.routineColors`, só no tracker); sem texto "feitos"; Quadro por matéria com colunas centralizadas.

### Pendências / próximos passos
Servidor (Supabase) e executável/PWA (estrutura pronta: dados já separados por usuário/concurso); matérias por concurso; backup/exportação por concurso.

## Atualização 8 (v4.4) — 2026-11-23
**Login:** sem título "Entrar"/"Criar conta"; wordmark SPOTTER centralizado em UnifrakturCook (Google Fonts, só online por ora; embutir quando virar app); rótulos 11px cinza.
**Tema neutro (referência Flux):** `--accent:#f1f3f6` (branco), botão primário branco com texto escuro, sem ciano/azul neon, sem grade azul; estrelas brancas (≤55, lentas, cintilação suave). Inter + IBM Plex Mono; gótico só na marca. Cores de gráficos por matéria/tipo/Gantt/incidência e verde/vermelho preservadas.
**Bug "encostando" (logo × nome):** causa raiz = `img` com altura em % dentro de grid de linha auto vazava do quadro de 64px. Correção: caixas de imagem `position:relative;overflow:hidden` + `img{position:absolute;inset:0;object-fit:contain}` (brand, prof, cfg, cn-prev); `.brand{gap:12px}`.
**REGRA PERMANENTE:** todo bug de elementos encostando/sobrepostos vira caso fixo do teste "NADA SE ENCOSTA" (folga mínima 3px entre irmãos; imagem nunca vaza do quadro; desktop 1440 e mobile 390; nome curto e muito longo; sem ícone e com PNG grande 1200×300; telas perfis, app e config).
**Matérias por concurso:** `S.subjects={active:[...],custom:[{name,short,block,root}]}`; `SUBJECT_CATALOG` (11 da PF, fixo) × `SUBJECT_NAMES` (ativas do concurso, mutada in-place por `applySubjects`). `migrate` aplica as matérias antes de `defaultState` (estado antigo sem o campo = 11). `buildEditalTree` filtra raízes; matéria própria = raiz vazia (`root:true`, não conta como item, sem checkbox). `edRoots()` filtra Edital/cobertura; Radar filtra `S.syllabus` por ativas; `subjColor` estável por catálogo/próprias. Criação: `newConcursoState({from,subjects,customs})` (importa só edital+status das matérias escolhidas); form exige ≥1 matéria (ou própria), "Começar do zero" = nenhuma marcada, escolher origem pré-marca as dela. Config: cartão "Matérias do concurso" (liga/desliga sem apagar dados; mínimo 1) + "Nova matéria" (nome único, bloco). Demo pode citar matérias inativas (guardas ?? aplicadas).
**Testes:** 121/121 (9 novos: login, paleta, NADA SE ENCOSTA, matérias por concurso ×6, compatibilidade).
**Pendências:** cor própria de matéria (não incluída); app instalável/PWA/banco/offline/usuários só após aprovação do design; embutir fonte gótica.

## Atualização 9 (v4.5) — 2026-11-24
**Títulos:** só `h2`, sem subtítulo (Dashboard · Planner Diário · Radar de Incidência · Edital Verificado · Simulados e Desempenho · Revisões · Caderno de Erros · Configurações). Radar: nota informa "Base de incidência: provas da PF (análise Spotter…)" — a base é sempre da PF, mesmo em outro concurso.
**Configurações em abas** (`UI.cfgTab`, `.cfg-tab`/`.cfg-pane`): Concurso e conta (com **Parâmetros**; sem a descrição longa) · Matérias · Revisão (formulário + card "Como funciona" em 5 passos) · Temas dos debriefings (mantém descrição) · Dados (demo, zerar, XLSX, JSON). "Sistema online" removido. Menu: "Configurações".
**Cronograma:** faixa visível padrão 5h–24h; `updateGridRange()` amplia para incluir qualquer tarefa de qualquer semana (início antes / fim depois) e volta ao padrão se ela for apagada. `GRID_START/END/ROWS` agora são `let`. Arrastar limita ao intervalo visível.
**Programação anual:** fundo mais escuro; só aparecem tipos com itens (bolinha+nome+quantidade); mês vazio mostra só o nome.
**Testes: 123/123** (novos: títulos, abas, faixa do cronograma, anual; ajustados: grade, arrastar/redimensionar, menu, config de revisão, matérias).
**Pendências / próximos passos (só após aprovação):** PWA instalável + offline → login por e-mail e sincronização (Supabase; checar limites do plano gratuito) → design celular/tablet → segurança (sem câmera/microfone, CSP, escape de texto, RLS; sem autodestruição) → importação de edital via arquivo gerado pelo Claude (modelo de pedido + JSON).

## Atualização 10 (v4.6) — 2026-11-25
**Novo concurso do zero + matérias base + edital em branco.** Testes: 129/129 (`node tests/regression.js`).
- **Formulário "Novo concurso"**: nome, ícone, 7 matérias base (todas marcadas), "Outras matérias" (uma por linha, edital em branco) e caixinha "Aproveitar meu progresso de outros concursos" (ligada; só aparece se há outros concursos). Sem select de importação.
- **BASE_SUBJECTS**: Língua Portuguesa, Informática (SEM raiz `ti` da PF), Direito Constitucional, Direito Administrativo (catálogo PF → árvore PF como ponto de partida); **Matemática e Raciocínio Lógico** (custom com `seed:'Raciocínio Lógico'`: copia a árvore da PF com os MESMOS ids dos itens); Atualidades e Redação (em branco).
- **Compartilhar progresso** (`newConcursoState({base,customs,share})`): cópia única (snapshot) dos itens marcados (`edital.checks`, por id de item) de todos os outros concursos para os ids iguais da nova árvore; depois cada concurso é independente. Nada além do edital é copiado.
- **Radar**: só a PF tem base de incidência. Flag `S.hasInc` (global `CUR_INC` durante migrate/defaultState). Concurso sem flag: `true` se o escudo é `builtin:pf`, senão `false` (concursos de teste antigos ficam com Radar em branco: "Para este concurso não há base de incidência"). Sem hasInc: `syllabus=[]`, sem raiz `ti`, índice de incidência do gráfico = 0.
- **S.subjects = {pool, active, custom}**: `pool` = matérias que pertencem ao concurso; `active` = visíveis; custom pode ter `seed`. Estado antigo sem `pool` = catálogo + custom.
- **Config > Matérias**: ocultar (caixinha), renomear (`renameSubject`: migra log, erros, planner, simulados, estratégias, syllabus, revisões, edital), excluir de vez (`deleteSubject`: apaga dados da matéria; mínimo 1 matéria). Renomear matéria padrão a transforma em própria (mantém o id da raiz). Nome padrão da PF não pode ser usado como renome; "Nova matéria" com nome de matéria padrão/base (`addSubject`) traz a padrão de volta (PF como ponto de partida; sem TI fora da PF).
- **Edital Verificado**: raiz em branco mostra botão "Criar edital verificado" (`edCreate`): "Montar à mão" (modo edição + novo subitem) ou "Colar texto" (`parseIndentTree`: recuo/tabulação, marcadores `- * •`, numeração `1)`/`1.`).
- **Arquivos alterados**: script.js, index.html (Radar `#radarMain/#radarEmpty/#radarTools`, `#cfgSubjList.subj-list`), style.css (`.subj-row/.subj-tools`), tests/regression.js.
- **Atenção**: renomear matéria da PF mantém os assuntos do Radar mas os gráficos de incidência usam o nome original; excluir matéria apaga a quebra por matéria nos simulados (totais ficam). Demo em concurso não-PF usa nomes de matérias da PF (pode ignorar matérias ausentes).
- **Próximo**: v5.0 PWA (manifest, service worker, ícones, offline, Exportar/Importar tudo, remover usuário de teste `spotter` antes de publicar, GitHub Pages) — só após o usuário testar a v4.6.

## Atualização 11 (v4.7) — 2026-11-26
**Só 2 concursos (PF e PRF), sem "adicionar concurso"; edital da PRF; progresso compartilhado; correção do Radar sumido na PF.** Testes: 125/125.
- **Concursos fixos**: `Auth.ensureFixed()` (roda no login/boot) garante `kind:'pf'` e `kind:'prf'` na lista do usuário (`Auth.fixed()` = [PF, PRF]). Perfil só mostra esses 2 (botão "Trocar ícones"); só o ícone é editável (`formConcurso(meta)` = troca de ícone; "Usar brasão padrão" → `icon:null` → `iconSrc` usa `builtin:<kind>`). Removidos: adicionar/excluir/renomear concurso, `BASE_SUBJECTS`, `newConcursoState`, nova/renomear/excluir matéria, "Criar edital verificado", `parseIndentTree`. Mantido: Config > Matérias só liga/desliga (esconde).
- **Migração**: concursos antigos sem `kind` → o de maior pontuação (estado com `syllabus` > ícone `builtin:pf` > nome "Polícia Federal") vira PF (nome fixado); os demais viram `kind:'legacy'` (ocultos, dados preservados no localStorage). PRF nova criada se faltar.
- **BUG Radar sumido (causa)**: v4.6 decidia `hasInc` pelo ícone (`builtin:pf`); PF com ícone trocado (ou estado salvo com `hasInc:false`) perdia o Radar. Agora `S.kind` (`'pf'|'prf'`) manda: `hasInc = KINDS[kind].inc` (PF true, PRF false); `loadState` força o `kind` pela meta do concurso. Dados da PF (syllabus, erros etc.) são preservados.
- **Estado**: `S.kind`; globais `CUR_KIND`/`CUR_INC`; `freshState(kind)`; `edSourceRoots()` (PF → `EDITAL_DSL`; PRF → `EDITAL_PRF_DSL`); blocos das matérias reagrupados na PRF (`prfBlock()`, I/II/III do edital dela).
- **PRF**: `data-edital-prf.js` (`EDITAL_PRF_DSL`, transcrito do "Edital Verticalizado PRF | Pré-edital": 14 matérias, 223 itens-folha; ids com prefixo `prf-`). Matérias em comum usam o nome da PF (Raciocínio Lógico, Processo Penal…); exclusivas viram `custom` com `prf:true` (Noções de Física, Ética no Serviço Público, Geopolítica Brasileira, Língua Estrangeira, Legislação de Trânsito). Sem Radar ("O Radar de Incidência da PRF ainda não está disponível."). Brasão padrão da PRF = `ASSETS.prf` (extraído do PDF, baixa resolução; o usuário pode subir outro).
- **Progresso compartilhado PF ⇄ PRF** (`sharedLinks/pushShared/pullShared`): cada item-folha da PRF pode ter `" @ ids"` no DSL (itens equivalentes da PF; `node.l`) ou casar por título idêntico (3+ palavras). `save()` leva ao outro concurso as marcações alteradas: marcou na PRF → marca os itens da PF; marcou/desmarcou na PF → item da PRF fica marcado só se TODOS os itens PF ligados estão marcados. Ao entrar, `pullShared` une o que já estava marcado (só marca). Itens só da PRF não vazam para a PF. ~70+ itens ligados; ligações são conservadoras (itens da PRF mais estreitos que o da PF só ligam quando equivalentes).
- **Arquivos**: script.js, index.html, data-edital.js (`parseEditalDSL(text,prefix)` + `@`), data-edital-prf.js (novo), data-assets.js (`prf`), tests/regression.js.
- **Pendências / atenção**: Radar da PRF (usuário adicionará depois); ícone da PRF em baixa resolução; usuário de teste `spotter` ainda no código (remover antes de publicar); demo na PRF usa matérias da PF em comum (as ausentes são ignoradas).
- **Próximo**: v5.0 PWA — só após o usuário testar a v4.7.


## Atualização 12 (v5.0) — 2026-11-27
**PWA: app instalável e offline; backup completo; sem usuário de teste no código.** Testes: 129/129 (app) + 7/7 (`tests/pwa.js`).
- **Novos arquivos**: `manifest.webmanifest` (standalone, `start_url`/`scope` relativos `./` → funciona em subpasta do GitHub Pages), `sw.js` (service worker), `icons/` (192, 512, maskable 512, apple-touch 180 — "S" serifado DejaVu sobre retícula; **provisório**, o gótico não existia no ambiente), `GUIA_PUBLICACAO.md` (passo a passo GitHub Pages).
- **Service worker** (`VERSION='spotter-v5.0.0'`): pré-guarda o programa (HTML/CSS/JS/dados/ícones) e tenta pré-guardar as bibliotecas externas (Chart.js 4.4.1, SheetJS 0.18.5, Font Awesome 6.5.1, CSS das fontes Google); fontes (.woff2) entram no cache no primeiro uso. Estratégia: usa o guardado e atualiza em segundo plano (stale-while-revalidate); só atende GET de mesma origem e dos 4 hosts de CDN; **nunca** guarda dados do usuário (ficam só no localStorage). Nova versão → trocar `VERSION` e o app avisa "Nova versão instalada. Recarregue" (`registerPwa()` em script.js; só em http/https, não em `file://`). **Ao mudar qualquer arquivo do programa, subir o número de VERSION em sw.js e conferir a lista SHELL.**
- **Backup completo** (Config > Dados > card "Backup completo"): `Auth.exportAll()` / `Auth.importAll(obj)`; JSON `{format:'spotter-backup', version:1, concursos:[{meta,state}]}`; sem senha/hash. Importar substitui PF/PRF pelo do arquivo (mapeia por `kind`), concursos antigos entram como `legacy`; ícone só aceito se `data:image/(png|jpeg|webp)` ou `builtin:*`; arquivo >25 MB ou inválido é recusado. Serve para trocar de aparelho/endereço (o localStorage é por endereço do site).
- **Usuário de teste removido do código**: `Auth.seed()` só cria conta se `window.SPOTTER_DEV={nick,pw}` existir (os testes injetam via `addInitScript`). Programa publicado não tem conta pré-criada. Contas já existentes no navegador do usuário continuam (localStorage).
- **Testes**: regression.js (+4: backup ida e volta sem senha, arquivos inválidos, ícone malicioso, botões); `tests/pwa.js` (manifest, SW ativo, cache do programa, sem conta pré-criada, cache sem dados de usuário, abre offline, sem erros).
- **Pendências / atenção**: cache das bibliotecas externas e fontes **não pôde ser testado no ambiente (sem internet)** — validar no aparelho real (abrir 1x online, depois modo avião); ícone provisório; instalação no Android/Windows depende de estar em https (GitHub Pages); dados NÃO sincronizam entre aparelhos até a fase Supabase; backup é manual.
- **Próximo**: usuário publica (GUIA_PUBLICACAO.md) e testa instalação/offline; depois login por e-mail + sincronização (Supabase; pesquisar limites do plano gratuito), design celular/tablet, segurança (CSP, escape de texto, RLS), importação de edital via Claude.
