/* =====================================================================
   SPOTTER CODE — DADOS DE INCIDÊNCIA (v4.0)
   Fonte principal: "SPOTTER · Incidência Agente PF 2009–2025" (6 edições Cebraspe:
   2009, 2012, 2014, 2018, 2021, 2025 · 675 questões válidas · 45 anuladas fora dos %).
   Fonte complementar: Estratégia Concursos, "Raio-X Estratégico PF Agente 2025"
   (% das questões Cebraspe 2021–2025; Informática 2020–2024).
   Os dois conjuntos NÃO são somados nem misturados: cada dado leva a sua fonte.
   ===================================================================== */

const EXAM_YEARS = [2009, 2012, 2014, 2018, 2021, 2025];

/** Questões válidas por disciplina em cada edição (Spotter, slides 8–13). */
const YEAR_DISC = {
  2009: { 'Língua Portuguesa': 26, 'Informática': 13, 'Contabilidade': 9, 'Processo Penal': 9, 'Raciocínio Lógico': 8, 'Direito Penal': 7, 'Direito Administrativo': 5, 'Direito Constitucional': 4, 'Legislação Especial': 4, 'Economia': 9, 'Atualidades': 8, 'Orçamento': 7, 'Administração': 2 },
  2012: { 'Língua Portuguesa': 26, 'Informática': 13, 'Contabilidade': 9, 'Raciocínio Lógico': 9, 'Direito Penal': 8, 'Processo Penal': 8, 'Direito Constitucional': 5, 'Legislação Especial': 5, 'Direito Administrativo': 4, 'Atualidades': 9, 'Economia': 8, 'Administração': 4, 'Orçamento': 4 },
  2014: { 'Língua Portuguesa': 29, 'Informática': 17, 'Raciocínio Lógico': 12, 'Contabilidade': 9, 'Processo Penal': 7, 'Direito Penal': 4, 'Legislação Especial': 4, 'Direito Administrativo': 3, 'Direito Constitucional': 1, 'Economia': 10, 'Atualidades': 8, 'Administração': 6, 'Ética': 2, 'Orçamento': 1 },
  2018: { 'Informática': 34, 'Língua Portuguesa': 24, 'Contabilidade': 23, 'Estatística': 10, 'Raciocínio Lógico': 9, 'Direito Administrativo': 4, 'Processo Penal': 3, 'Legislação Especial': 3, 'Direito Constitucional': 2, 'Direito Penal': 2 },
  2021: { 'Informática': 35, 'Língua Portuguesa': 24, 'Contabilidade': 21, 'Estatística': 12, 'Raciocínio Lógico': 12, 'Direito Administrativo': 3, 'Legislação Especial': 3, 'Direito Constitucional': 2, 'Processo Penal': 2, 'Direito Penal': 1 },
  2025: { 'Informática': 31, 'Contabilidade': 21, 'Língua Portuguesa': 10, 'Legislação Especial': 9, 'Raciocínio Lógico': 8, 'Estatística': 7, 'Direito Administrativo': 6, 'Direito Constitucional': 6, 'Direitos Humanos': 6, 'Direito Penal': 4, 'Processo Penal': 2 }
};
const OUT_OF_SYLLABUS = ['Economia', 'Atualidades', 'Administração', 'Orçamento', 'Ética'];   // disciplinas que não constam do edital 2025
const VALID_TOTAL = 675;

/** Matriz de disciplinas (Spotter, slide 45): importância, momento recomendado e faixa de esforço sugerida (referência, não regra de horas). */
const MATRIZ = {
  'Informática': { imp: 'Muito alta', mom: 'Desenvolvimento progressivo (intensificar perto da prova)', esf: '29% – 30%' },
  'Contabilidade': { imp: 'Muito alta', mom: 'Começar agora', esf: '19% – 20%' },
  'Língua Portuguesa': { imp: 'Muito alta', mom: 'Começar agora', esf: '8% – 17%' },
  'Estatística': { imp: 'Alta', mom: 'Começar agora', esf: '7% – 9%' },
  'Raciocínio Lógico': { imp: 'Alta', mom: 'Começar agora', esf: '7% – 9%' },
  'Legislação Especial': { imp: 'Alta', mom: 'Desenvolvimento progressivo (intensificar perto da prova)', esf: '4% – 8%' },
  'Direito Administrativo': { imp: 'Alta', mom: 'Começar agora', esf: '4% – 5%' },
  'Direito Constitucional': { imp: 'Alta', mom: 'Começar agora', esf: '3% – 5%' },
  'Direito Penal': { imp: 'Média', mom: 'Desenvolvimento progressivo', esf: '2% – 3%' },
  'Processo Penal': { imp: 'Média', mom: 'Desenvolvimento progressivo', esf: '2% – 2%' },
  'Direitos Humanos': { imp: 'Alta', mom: 'Começar agora', esf: '2% – 5%' }
};

/** Assuntos por disciplina (Spotter, slides 15–26): [assunto, válidas 2009–2025, [tópicos (slides 28–42, quando analisados)]].
 *  "rest" = assuntos menores agrupados como "Demais" no PDF (sem nome). */
const SEM_TOP = 'Sem tópico identificado';
const INC_SPOTTER = {
  'Língua Portuguesa': { rest: 2, items: [
    ['Compreensão e interpretação de texto', 37, [['Inferência e compreensão global', 14], ['Organização e tipologia do texto', 5], ['Posicionamento, argumentação e intenção do autor', 5], ['Sentido de palavras e expressões no contexto', 3], [SEM_TOP, 10]]],
    ['Correspondência oficial (Manual de Redação)', 31, [['Pronomes de tratamento, vocativos e fechos', 7], ['Modalidades de expediente (ofício, memorando, aviso…)', 6], ['Qualidades da redação oficial (impessoalidade, clareza…)', 3], ['Estrutura e formatação (cabeçalho, data, assinatura…)', 2], ['E-mail como documento oficial', 1], ['Endereçamento e pronomes de tratamento', 1], ['Exposição de motivos', 1], ['Grafia de datas', 1], ['Padrão ofício — cabeçalho', 1], ['Vocativos', 1], [SEM_TOP, 7]]],
    ['Reescrita e significação de palavras', 16, [['Voz verbal, orações e formas verbais', 7], ['Preservação de sentido e correção gramatical', 5], ['Substituição de palavras e expressões', 4]]],
    ['Coesão textual', 15, [['Referenciação (pronomes e retomada)', 10], ['Conectores e relações lógicas', 4], [SEM_TOP, 1]]],
    ['Pontuação', 13], ['Morfossintaxe do período', 8], ['Concordância verbal e nominal', 5], ['Crase', 4], ['Emprego de tempos e modos verbais', 4], ['Regência verbal e nominal', 2], ['Tipologia e gêneros textuais', 2]
  ] },
  'Raciocínio Lógico': { rest: 0, items: [
    ['Lógica e argumentação', 32, [['Condicional e bicondicional', 10], ['Associação e dedução (situações-problema)', 6], ['Negação de proposições', 3], ['Equivalência lógica', 2], ['Validade de argumentos e conclusões', 2], ['Equivalência (De Morgan/negação do conectivo)', 1], ['Equivalência (P2 × inversa)', 1], ['Negação de condicional', 1], ['Tabela-verdade', 1], ['Tabela-verdade (nº de linhas, 3 proposições)', 1], ['Validade de argumento', 1], ['Validade de argumento — verdade da conclusão', 1], [SEM_TOP, 2]]],
    ['Análise combinatória', 11], ['Conjuntos', 10], ['Probabilidade', 5]
  ] },
  'Informática': { rest: 13, items: [
    ['Redes de computadores', 22, [['Endereçamento e protocolo IP (IPv4/IPv6, NAT)', 4], ['Protocolos de aplicação (HTTP, SMTP, DNS, FTP, DHCP…)', 3], ['Modelo OSI e TCP/IP (camadas)', 2], ['Tipos e topologias de rede (LAN, MAN, WAN…)', 2], ['Camada de rede — roteadores (OSI)', 1], ['Camada de transporte — UDP e TCP (OSI)', 1], ['Enlace × transporte — quadros (OSI)', 1], ['Pilha TCP/IP × modelo OSI (camadas em comum)', 1], ['Protocolo IP (formato de pacotes)', 1], ['Protocolo SMTP (aplicação) × serviço confiável', 1], ['Tipos de rede — LAN', 1], ['Transmissão de dados (duplex, banda, bits)', 1], [SEM_TOP, 3]]],
    ['Segurança da informação', 17, [['Malware e códigos maliciosos', 7], ['Firewall, antivírus e proteção de rede', 4], ['Autenticação e controle de acesso', 2], ['Criptografia, assinatura e certificado digital', 2], [SEM_TOP, 2]]],
    ['Internet e intranet', 14, [['Navegadores (Chrome, Edge, Firefox)', 4], ['Busca e pesquisa na web', 2], ['Google Chrome — recurso de verificação de credenciais', 1], ['Internet × intranet e serviços web', 1], ['Navegador — indicadores de conexão segura', 1], ['Operadores de busca (frase exata e restrição a site…)', 1], [SEM_TOP, 4]]],
    ['Sistemas operacionais', 14, [['Windows (arquivos, pastas, recursos)', 8], ['Linux (comandos, permissões, distribuições)', 5], [SEM_TOP, 1]]],
    ['Banco de dados', 13], ['Editores de texto, planilhas e apresentações', 12], ['Computação em nuvem', 10], ['Programação e interoperabilidade (Python/R, API)', 10], ['Mineração de dados e aprendizado de máquina', 9], ['Sistemas de informação', 5], ['Hardware e periféricos', 4]
  ] },
  'Direito Constitucional': { rest: 0, items: [['Direitos e garantias fundamentais (inclui nacionalidade)', 8], ['Segurança pública (art. 144)', 7], ['Ordem social', 3], ['Organização do Estado e dos Poderes', 2]] },
  'Direito Administrativo': { rest: 0, items: [['Organização da administração pública', 7], ['Atos e poderes administrativos', 6], ['Agentes públicos e regime dos servidores', 4], ['Controle da administração pública', 3], ['Responsabilidade civil do Estado', 2], ['Improbidade administrativa', 1], ['Licitações e contratos', 1], ['Princípios da administração pública', 1]] },
  'Direito Penal': { rest: 0, items: [
    ['Crimes em espécie', 15, [['Crimes contra o patrimônio', 6], ['Crimes contra a administração pública', 4], ['Crimes contra a fé pública', 1], ['Crimes contra a pessoa', 1], ['Crimes previdenciários e tributários', 1], ['Descaminho (art. 334 do CP)', 1], [SEM_TOP, 1]]],
    ['Parte geral e lei penal', 11]
  ] },
  'Processo Penal': { rest: 0, items: [['Prisões e flagrante', 12], ['Inquérito policial', 11], ['Prova e cadeia de custódia', 5], ['Competência e disposições gerais', 3]] },
  'Legislação Especial': { rest: 0, items: [['Crimes ambientais (Lei 9.605/1998)', 6], ['Lei de Drogas (Lei 11.343/2006)', 6], ['ECA (Lei 8.069/1990)', 3], ['Lei de Migração (Lei 13.445/2017)', 3], ['Estatuto do Desarmamento (Lei 10.826/2003)', 2], ['Identificação civil (Lei 7.116 e correlatas)', 2], ['Legislação especial — lei não identificada no rótulo', 2], ['Lei de Tortura (Lei 9.455/1997)', 2], ['Lei 10.446/2002 (repercussão interestadual/internacional)', 1], ['Segurança privada (Lei 14.967/2024)', 1]] },
  'Direitos Humanos': { rest: 0, items: [['Direitos humanos (tratados e normas)', 6]] },
  'Contabilidade': { rest: 0, items: [
    ['Escrituração contábil', 23, [['Lançamentos e fórmulas de lançamento (débito/crédito)', 8], ['Regime de competência × caixa', 4], ['Livros contábeis (Diário e Razão)', 2], ['Operações com mercadorias, compras e vendas', 2], ['Contas e natureza de saldo', 1], ['Folha, encargos e despesas antecipadas', 1], ['Fórmulas de lançamento (3ª fórmula)', 1], ['Livro Razão', 1], ['Regime de competência — receita financeira', 1], [SEM_TOP, 2]]],
    ['Patrimônio, avaliação de ativos e pronunciamentos CPC', 17, [['Classificação e composição do ativo/passivo', 2], ['Depreciação, valor residual e intangível', 2], ['Equação e situação patrimonial', 2], ['Amortização de intangível com vida útil definida', 1], ['Avaliação de imóveis: custo de aquisição menos depreciação…', 1], ['Disponibilidades a partir da tabela', 1], ['Receitas/ganhos e despesas/perdas na equação do patrimônio', 1], ['Situação líquida (PL) a partir de elementos patrimoniais', 1], ['Total do ativo e recursos aplicados', 1], [SEM_TOP, 5]]],
    ['Demonstrações contábeis (balanço e DRE)', 13], ['Estrutura conceitual (NBC TSP / CPC 00)', 9], ['Balancete de verificação', 8], ['Atos e fatos administrativos', 6], ['Plano de contas e natureza dos saldos', 6], ['Conceitos, objeto e princípios da contabilidade', 5], ['Operações contábeis diversas (provisões, depreciação…)', 5]
  ] },
  'Estatística': { rest: 0, items: [
    ['Distribuições de probabilidade', 15, [['Distribuição normal', 6], ['Variáveis aleatórias contínuas e densidade', 5], ['Distribuição binomial e Bernoulli', 2], ['Variáveis aleatórias conjuntas', 1], [SEM_TOP, 1]]],
    ['Correlação e regressão', 8], ['Inferência estatística', 6]
  ] }
};

/** Histórico do que não consta do edital 2025 (Spotter, slide 26) — preservado só para consulta. */
const OUT_ITEMS = [['Atualidades — Atualidades gerais', 25], ['Economia — Microeconomia, consumidor e regulação de mercados', 17], ['Administração — Administração geral e pública', 12], ['Orçamento — Orçamento e administração financeira', 12], ['Economia — Economia do setor público', 10], ['Ética — Ética no serviço público', 2]];

/** Assuntos de maior prioridade (Spotter, slide 46): incidência recente 2018–2025, importância Muito alta/Alta. [assunto, disciplina, válidas] */
const TOP_PRIORITY = [
  ['Redes de computadores', 'Informática', 19], ['Compreensão e interpretação de texto', 'Língua Portuguesa', 18], ['Lógica e argumentação', 'Raciocínio Lógico', 16],
  ['Escrituração contábil', 'Contabilidade', 15], ['Distribuições de probabilidade', 'Estatística', 15], ['Banco de dados', 'Informática', 13],
  ['Segurança da informação', 'Informática', 11], ['Correspondência oficial (Manual de Redação)', 'Língua Portuguesa', 11],
  ['Patrimônio, avaliação de ativos e pronunciamentos CPC', 'Contabilidade', 10], ['Programação e interoperabilidade (Python/R, API)', 'Informática', 10],
  ['Estrutura conceitual (NBC TSP / CPC 00)', 'Contabilidade', 9], ['Mineração de dados e aprendizado de máquina', 'Informática', 9],
  ['Correlação e regressão', 'Estatística', 8], ['Computação em nuvem', 'Informática', 8], ['Internet e intranet', 'Informática', 8]
];

/** Estratégia Concursos — Raio-X Estratégico PF Agente 2025: % das questões por item do edital. */
const INC_EST = {
  'Língua Portuguesa': { meta: '259 questões · Cebraspe 2021–2025', items: [['Compreensão e interpretação de textos; tipos e gêneros textuais', 36.29], ['Coesão textual; significação das palavras; substituição de palavras ou trechos', 26.25], ['Correspondência oficial (Manual de Redação)', 8.11], ['Emprego dos sinais de pontuação', 6.56], ['Estrutura morfossintática: coordenação e subordinação', 6.18], ['Classes de palavras: preposições e conjunções', 5.79], ['Classes de palavras: pronomes átonos, substantivos, adjetivos etc.', 3.47], ['Concordância verbal e nominal', 2.32], ['Regência verbal e nominal; crase', 2.32], ['Classes de palavras: verbos (tempos e modos)', 1.93], ['Ortografia oficial', 0.77]] },
  'Raciocínio Lógico': { meta: '119 questões · Cebraspe 2021–2025', items: [['Probabilidade', 19.33], ['Análise combinatória', 17.65], ['Equivalências e negações lógicas', 15.13], ['Estruturas lógicas', 13.45], ['Teoria dos conjuntos', 11.76], ['Problemas aritméticos', 8.40], ['Lógica de argumentação', 5.88], ['Argumentos: estrutura básica e classificação', 3.36], ['Diagramas lógicos', 2.52], ['Problemas geométricos', 2.52], ['Lógica de primeira ordem', 0], ['Problemas matriciais', 0]] },
  'Informática': { meta: '150 questões · Cebraspe 2020–2024', items: [['Conceito de internet e intranet; protocolos e VPN', 15.20], ['Noções de sistema operacional (Windows)', 8.19], ['Conceitos de proteção e segurança; criptografia', 7.89], ['Computação na nuvem', 7.60], ['Ameaças digitais e malwares', 6.73], ['MS-Word', 6.14], ['Noções de programação e interoperabilidade (Python, API)', 4.97], ['MS-Excel', 4.39], ['Noções de linguagem SQL', 4.09], ['Modelos de arquitetura (OSI/ISO e TCP/IP) e protocolos', 3.80], ['Modelagem conceitual (entidade-relacionamento)', 3.80], ['Banco de dados relacionais; chaves e relacionamentos', 2.92], ['Redes de comunicação', 2.63], ['Ferramentas e aplicativos de navegação', 2.63], ['Teoria geral de sistemas; teoria da informação', 2.34], ['Ferramentas de busca e pesquisa', 1.75], ['Ferramentas de correio eletrônico; grupos de discussão', 1.46], ['Business Intelligence', 1.46], ['Noções de sistema operacional (Linux)', 1.46], ['Aprendizado de máquina; inteligência artificial', 1.17], ['Big data', 1.17], ['Banco de dados: base de dados, documentação e prototipação', 1.17], ['Aplicativos para segurança (antivírus, firewall etc.)', 1.17], ['LibreOffice Writer', 1.17], ['Formatos de intercâmbio biométricos (NIST, XML, JSON)', 1.17], ['MS-PowerPoint', 0.88], ['Normalização', 0.88], ['Análise e mineração de dados', 0.88], ['Sistemas de informação', 0.29], ['LibreOffice Calc', 0.29], ['Programação R', 0.29], ['Redes sociais; áudio, vídeo e acesso à distância; Teams; LibreOffice Impress', 0]] },
  'Direito Constitucional': { meta: '121 questões · Cebraspe 2021–2025', items: [['Direitos e deveres individuais e coletivos', 41.32], ['Defesa do Estado e das instituições democráticas; segurança pública', 19.83], ['Ordem social', 8.26], ['Direitos sociais', 7.44], ['Cidadania e direitos políticos', 6.61], ['Teoria geral dos direitos fundamentais', 5.79], ['Nacionalidade', 5.79], ['Poder Executivo: forma e sistema de governo', 3.31], ['Partidos políticos', 1.65]] },
  'Direito Administrativo': { meta: '118 questões · Cebraspe 2021–2025', items: [['Poderes administrativos', 18.64], ['Licitação (princípios, modalidades, tipos)', 16.95], ['Noções de organização administrativa', 15.25], ['Regime jurídico dos servidores (Lei 8.112/1990)', 12.71], ['Responsabilidade civil do Estado', 10.17], ['Regime jurídico-administrativo; princípios', 8.47], ['Ato administrativo', 6.78], ['Controle da Administração Pública', 5.93], ['Agentes públicos: conceito e espécies', 5.08]] },
  'Direito Penal': { meta: '115 questões · Cebraspe 2021–2025', items: [['Crimes contra a pessoa', 30.43], ['Crimes contra o patrimônio', 21.74], ['Aplicação da lei penal; infração penal', 13.04], ['Crimes contra a administração pública (parte 1)', 10.43], ['Crimes contra a fé pública', 6.96], ['Crimes contra a administração pública (parte 2)', 5.22], ['Crimes contra a administração pública (parte 3)', 5.22], ['Fato típico; ilicitude', 4.35], ['Princípios do Direito Penal', 2.61], ['Crimes contra a administração pública (parte 4: licitações e contratos)', 0]] },
  'Processo Penal': { meta: '100 questões · Cebraspe 2021–2025', items: [['Inquérito policial', 37], ['Provas (parte II): provas em espécie', 35], ['Prisão em flagrante', 17], ['Provas (parte I): teoria geral', 11]] },
  'Direitos Humanos': { meta: '77 questões · Cebraspe 2021–2025', items: [['Sistema internacional de proteção dos direitos humanos', 44.16], ['Direitos humanos na Constituição Federal de 1988', 33.77], ['Convenções: discriminação racial, discriminação contra a mulher e tortura', 12.99], ['Convenção sobre genocídio; Estatuto dos Refugiados', 5.19], ['Convenção sobre desaparecimento forçado; Regras mínimas da ONU para presos', 2.60], ['Lei 13.060/2014 e Decreto 12.341/2024 (menor potencial ofensivo)', 1.30], ['Princípios Básicos sobre o Uso da Força e Armas de Fogo', 0]] },
  'Contabilidade': { meta: '123 questões · Cebraspe 2021–2025', items: [['Conceitos, objetivos e finalidades da contabilidade', 16.26], ['Atos e fatos administrativos; plano de contas; escrituração', 13.01], ['Livros de escrituração; balancete de verificação', 13.01], ['Ativo circulante e não circulante; Lei 6.404/1976 e CPCs', 13.01], ['Patrimônio: componentes e equação fundamental', 9.76], ['Depreciações e baixa de bens; ativo imobilizado', 8.94], ['Contas: débitos, créditos e saldos', 4.07], ['Operações contábeis diversas (juros, tributos, aluguéis, provisões)', 4.07], ['CPC 00 (R2) — Estrutura Conceitual', 4.07], ['Folha de pagamento; passivo', 3.25], ['Regime de competência e regime de caixa', 2.44], ['Estoques', 1.63], ['CPC 01 (R1) — Redução ao valor recuperável', 1.63], ['CPC 04 (R1) — Ativo intangível', 1.63], ['CPC 25 — Provisões, passivos e ativos contingentes', 1.63], ['Patrimônio líquido', 0.81], ['Demonstração do resultado do exercício', 0.81]] },
  'Estatística': { meta: '112 questões · Cebraspe 2021–2025', items: [['Probabilidade', 20.54], ['Análise combinatória', 18.75], ['Correlação e regressão linear simples', 11.61], ['Teoria da amostragem', 8.04], ['Medidas de variabilidade ou dispersão', 7.14], ['Distribuições aleatórias contínuas', 5.36], ['Testes de hipóteses', 5.36], ['Estimação pontual e intervalar', 4.46], ['Médias', 3.57], ['Variáveis aleatórias contínuas', 3.57], ['Distribuições conjuntas e momentos', 2.68], ['Análise de variância (ANOVA)', 2.68], ['Variáveis aleatórias discretas', 1.79], ['Medidas separatrizes (quantis)', 0.89], ['Moda', 0.89], ['Assimetria e curtose', 0.89], ['Distribuições discretas de probabilidade', 0.89], ['Regressão linear múltipla', 0.89], ['Apresentação de dados; lei dos grandes números', 0]] }
};

/* ---- Funções de apoio (puras) ---- */
const sumArr = a => a.reduce((x, y) => x + y, 0);
/** Total de válidas de uma disciplina em 2009–2025 (ou nos anos informados). */
function discTotal(name, years = EXAM_YEARS) { return sumArr(years.map(y => (YEAR_DISC[y] || {})[name] || 0)); }
/** Soma de assuntos + "demais" da disciplina no Spotter. */
function spotterTotal(name) { const d = INC_SPOTTER[name]; return d ? sumArr(d.items.map(i => i[1])) + d.rest : 0; }
/** Nível de incidência do assunto pelo nº de válidas em 2009–2025: Alta ≥ 10 · Média 4–9 · Baixa ≤ 3. */
const incLevelOf = n => (n >= 10 ? 'Alta' : n >= 4 ? 'Média' : 'Baixa');
/** Busca a contagem de um assunto (ou de "Assunto>Tópico") no Spotter. Retorna null se não houver. */
function incLookup(subject, key) {
  const d = INC_SPOTTER[subject]; if (!d || !key) return null;
  const [a, t] = key.split('>');
  const it = d.items.find(i => i[0] === a); if (!it) return null;
  if (!t) return it[1];
  const tp = (it[2] || []).find(x => x[0] === t); return tp ? tp[1] : null;
}
