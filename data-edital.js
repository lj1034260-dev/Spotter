/* =====================================================================
   SPOTTER CODE — EDITAL VERIFICADO (v4.0)
   Base: "Edital Verticalizado PF – Agente" (DSO), segmentado em tema → subtema → tópico → subtópico.
   Os níveis mais finos foram montados a partir de doutrina e programas usuais, no nível de AGENTE
   (noções; sem jurisprudência nem temas de Delegado). A estrutura é editável no próprio app.

   Formato (cada nível = 2 espaços de recuo):
     # Matéria | Bloco | matéria do app (Radar/Revisões)
     Título [~ Assunto do Spotter  ou  ~ Assunto>Tópico]   ← "~" liga o nó à incidência (Radar)
   ===================================================================== */
const EDITAL_DSL = `
# Língua Portuguesa | I | Língua Portuguesa
Compreensão e interpretação de textos de gêneros variados ~ Compreensão e interpretação de texto
  Compreensão global e ideia central ~ Compreensão e interpretação de texto>Inferência e compreensão global
  Inferência e informações implícitas (pressupostos e subentendidos)
  Organização do texto (estrutura, progressão e partes) ~ Compreensão e interpretação de texto>Organização e tipologia do texto
  Posicionamento, argumentação e intenção do autor ~ Compreensão e interpretação de texto>Posicionamento, argumentação e intenção do autor
  Sentido de palavras e expressões no contexto ~ Compreensão e interpretação de texto>Sentido de palavras e expressões no contexto
    Denotação e conotação
    Figuras de linguagem
Reconhecimento de tipos e gêneros textuais ~ Tipologia e gêneros textuais
  Tipos textuais (narração, descrição, dissertação, injunção)
  Gêneros textuais
Domínio da ortografia oficial
  Emprego de letras e grafia das palavras
  Acentuação gráfica
  Emprego do hífen
Domínio dos mecanismos de coesão textual ~ Coesão textual
  Elementos de referenciação, substituição e repetição ~ Coesão textual>Referenciação (pronomes e retomada)
    Referenciação (pronomes e retomada)
    Substituição e repetição (sinônimos, hiperônimos, elipse)
  Conectores e elementos de sequenciação textual ~ Coesão textual>Conectores e relações lógicas
    Conjunções e locuções conjuntivas
    Relações lógicas (causa, consequência, oposição, concessão, condição)
  Emprego de tempos e modos verbais ~ Emprego de tempos e modos verbais
    Modos indicativo, subjuntivo e imperativo
    Correlação entre tempos e modos verbais
    Formas nominais do verbo
Domínio da estrutura morfossintática do período ~ Morfossintaxe do período
  Emprego das classes de palavras
    Substantivo e adjetivo
    Artigo e numeral
    Pronomes
    Verbo
    Advérbio e palavras denotativas
    Preposição
    Conjunção
  Relações de coordenação entre orações e entre termos da oração
    Orações coordenadas assindéticas e sindéticas
    Termos coordenados
  Relações de subordinação entre orações e entre termos da oração
    Termos essenciais, integrantes e acessórios da oração
    Orações subordinadas substantivas
    Orações subordinadas adjetivas
    Orações subordinadas adverbiais
    Orações reduzidas
  Emprego dos sinais de pontuação ~ Pontuação
    Vírgula
    Ponto e vírgula e dois-pontos
    Travessão, parênteses, aspas e reticências
  Concordância verbal e nominal ~ Concordância verbal e nominal
    Concordância verbal
    Concordância nominal
  Regência verbal e nominal ~ Regência verbal e nominal
    Regência verbal
    Regência nominal
  Emprego do sinal indicativo de crase ~ Crase
    Casos obrigatórios
    Casos proibidos
    Casos facultativos
  Colocação dos pronomes átonos
    Próclise
    Ênclise
    Mesóclise
Reescrita de frases e parágrafos do texto ~ Reescrita e significação de palavras
  Significação das palavras
    Sinônimos, antônimos, parônimos e homônimos
    Polissemia e sentido no contexto
  Substituição de palavras ou de trechos de texto ~ Reescrita e significação de palavras>Substituição de palavras e expressões
    Preservação de sentido e correção gramatical ~ Reescrita e significação de palavras>Preservação de sentido e correção gramatical
  Reorganização da estrutura de orações e de períodos do texto ~ Reescrita e significação de palavras>Voz verbal, orações e formas verbais
    Voz verbal (ativa, passiva e reflexiva)
    Deslocamento e inversão de termos
    Transformação de orações (desenvolvidas e reduzidas)
  Reescrita de textos de diferentes gêneros e níveis de formalidade
Correspondência oficial (Manual de Redação da Presidência da República) ~ Correspondência oficial (Manual de Redação)
  Aspectos gerais da redação oficial ~ Correspondência oficial (Manual de Redação)>Qualidades da redação oficial (impessoalidade, clareza…)
    Impessoalidade
    Formalidade e padronização
    Clareza e concisão
    Uso da norma culta
  Finalidade dos expedientes oficiais ~ Correspondência oficial (Manual de Redação)>Modalidades de expediente (ofício, memorando, aviso…)
    Ofício
    Memorando
    Aviso
    Exposição de motivos
    Mensagem
    Telegrama e fax
    E-mail como documento oficial
  Adequação da linguagem ao tipo de documento ~ Correspondência oficial (Manual de Redação)>Pronomes de tratamento, vocativos e fechos
    Pronomes de tratamento
    Vocativos
    Fechos
  Adequação do formato do texto ao gênero ~ Correspondência oficial (Manual de Redação)>Estrutura e formatação (cabeçalho, data, assinatura…)
    Cabeçalho, data, assinatura e endereçamento
    Grafia de datas
    Padrão ofício

# Direito Administrativo | I | Direito Administrativo
Regime jurídico-administrativo ~ Princípios da administração pública
  Conceito
  Princípios expressos e implícitos da Administração Pública
    Legalidade, impessoalidade, moralidade, publicidade e eficiência
    Supremacia e indisponibilidade do interesse público
    Autotutela
    Razoabilidade e proporcionalidade
    Segurança jurídica e motivação
Noções de organização administrativa ~ Organização da administração pública
  Centralização, descentralização, concentração e desconcentração
  Administração direta e indireta
  Autarquias, fundações, empresas públicas e sociedades de economia mista
    Autarquias
    Fundações públicas
    Empresas públicas
    Sociedades de economia mista
Ato administrativo ~ Atos e poderes administrativos
  Conceito e requisitos (competência, finalidade, forma, motivo e objeto)
  Atributos (presunção de legitimidade, imperatividade, autoexecutoriedade e tipicidade)
  Classificação dos atos
  Espécies de atos administrativos
  Extinção do ato (anulação, revogação e convalidação)
Poderes administrativos ~ Atos e poderes administrativos
  Poder hierárquico
  Poder disciplinar
  Poder regulamentar
  Poder de polícia
  Uso e abuso do poder
    Excesso de poder
    Desvio de finalidade
    Omissão
Agentes públicos ~ Agentes públicos e regime dos servidores
  Disposições doutrinárias
    Conceito
    Espécies (agentes políticos, servidores públicos e particulares em colaboração)
    Cargo, emprego e função pública
  Disposições constitucionais aplicáveis (arts. 37 a 41)
    Acesso aos cargos públicos e concurso
    Estabilidade e vitaliciedade
    Acumulação de cargos
  Lei nº 8.112/1990 e suas alterações
    Provimento, vacância e movimentação
    Direitos e vantagens
    Deveres e proibições
    Responsabilidade e penalidades
    Processo administrativo disciplinar
Licitação ~ Licitações e contratos
  Princípios
  Contratação direta (dispensa e inexigibilidade)
  Modalidades
  Tipos (critérios de julgamento)
  Procedimento
Controle da Administração Pública ~ Controle da administração pública
  Controle exercido pela própria Administração
  Controle judicial
  Controle legislativo
Responsabilidade civil do Estado ~ Responsabilidade civil do Estado
  Responsabilidade civil do Estado no direito brasileiro
    Teorias (culpa administrativa, risco administrativo e risco integral)
    Responsabilidade por ato comissivo do Estado
    Responsabilidade por omissão do Estado
  Requisitos para a demonstração da responsabilidade do Estado
  Causas excludentes e atenuantes da responsabilidade do Estado
  Direito de regresso

# Direito Constitucional | I | Direito Constitucional
Direitos e garantias fundamentais ~ Direitos e garantias fundamentais (inclui nacionalidade)
  Teoria geral dos direitos fundamentais
    Conceito e características
    Dimensões (gerações) dos direitos fundamentais
    Destinatários, aplicabilidade e eficácia
  Direitos e deveres individuais e coletivos
    Direito à vida
    Direito à liberdade
      Liberdade de manifestação do pensamento, de consciência e de crença
      Liberdade de locomoção
      Liberdade de reunião e de associação
      Liberdade de informação e liberdade profissional
    Direito à igualdade
    Direito à segurança
      Segurança jurídica (direito adquirido, ato jurídico perfeito e coisa julgada)
      Inviolabilidade de domicílio e sigilo de correspondência e comunicações
      Garantias do processo (devido processo legal, contraditório, ampla defesa e presunção de inocência)
      Direitos do preso e garantias penais
    Direito à propriedade
      Propriedade e função social
      Desapropriação e requisição
  Direitos sociais
    Direitos sociais em geral (art. 6º)
    Direitos dos trabalhadores (art. 7º)
    Direitos coletivos dos trabalhadores (arts. 8º a 11)
  Nacionalidade
    Espécies (primária e secundária)
    Distinções entre brasileiro nato e naturalizado
    Perda da nacionalidade
    Extradição, deportação e expulsão
    Língua oficial e símbolos nacionais
  Cidadania e direitos políticos
    Alistamento eleitoral e direito de sufrágio
    Condições de elegibilidade
    Inelegibilidades
    Perda e suspensão dos direitos políticos
  Partidos políticos
    Princípios e liberdade de criação
    Funcionamento e vedações
  Garantias constitucionais individuais e dos direitos coletivos, sociais e políticos
    Habeas corpus
    Habeas data
    Mandado de segurança (individual e coletivo)
    Mandado de injunção
    Ação popular
Poder Executivo: forma e sistema de governo; chefia de Estado e chefia de governo
  Formas de governo (república e monarquia)
  Sistemas de governo (presidencialismo e parlamentarismo)
  Chefia de Estado e chefia de governo
  Presidente da República (eleição, atribuições e responsabilização)
Defesa do Estado e das instituições democráticas
  Defesa do Estado e das instituições democráticas
    Estado de defesa
    Estado de sítio
    Forças Armadas
  Segurança pública; organização da segurança pública (art. 144) ~ Segurança pública (art. 144)
    Princípios e finalidades da segurança pública
    Polícia Federal
    Polícia Rodoviária Federal e Polícia Ferroviária Federal
    Polícias civis
    Polícias militares e corpos de bombeiros militares
    Polícias penais
    Guardas municipais
Ordem social ~ Ordem social
  Base e objetivos da ordem social
  Seguridade social (saúde, previdência e assistência social)
  Meio ambiente
  Família, criança, adolescente e idoso
  Indígenas

# Direito Penal | I | Direito Penal
Parte geral e lei penal ~ Parte geral e lei penal
  Princípios básicos
    Princípio da legalidade (reserva legal, anterioridade, taxatividade)
    Princípios constitucionais (humanidade, pessoalidade, individualização da pena e culpabilidade)
    Princípios modernos (intervenção mínima, fragmentariedade, lesividade, adequação social e insignificância)
  Aplicação da lei penal
    A lei penal no tempo
      Abolitio criminis e novatio legis (in mellius e in pejus)
      Retroatividade e ultra-atividade
      Leis temporárias e excepcionais
    Tempo e lugar do crime
    Territorialidade e extraterritorialidade da lei penal
      Conceito de território
      Extraterritorialidade condicionada e incondicionada
  Conceito de crime e infração penal
    Crime e contravenção
    Classificação dos crimes
  O fato típico e seus elementos
    Conduta (ação e omissão)
    Resultado e nexo causal
    Tipicidade
    Dolo e culpa
      Espécies de dolo (dolo eventual)
      Espécies de culpa (culpa consciente)
      Erro de tipo
  Crime consumado e tentado
    Iter criminis
    Tentativa
    Desistência voluntária e arrependimento eficaz
    Arrependimento posterior
    Crime impossível
  Ilicitude e causas de exclusão
    Estado de necessidade
    Legítima defesa
    Estrito cumprimento do dever legal
    Exercício regular de direito
  Excesso punível
  Culpabilidade
    Imputabilidade
    Potencial consciência da ilicitude e erro de proibição
    Exigibilidade de conduta diversa
Crimes em espécie ~ Crimes em espécie
  Crimes contra a pessoa ~ Crimes em espécie>Crimes contra a pessoa
    Homicídio (simples, privilegiado, qualificado e culposo)
    Induzimento, instigação ou auxílio a suicídio
    Infanticídio e aborto
    Lesão corporal
    Periclitação da vida e da saúde (omissão de socorro, maus-tratos e abandono de incapaz)
    Rixa
    Crimes contra a honra (calúnia, difamação e injúria)
    Crimes contra a liberdade pessoal (constrangimento ilegal, ameaça, sequestro e cárcere privado)
    Violação de domicílio
  Crimes contra o patrimônio ~ Crimes em espécie>Crimes contra o patrimônio
    Furto (simples, noturno, privilegiado e qualificado)
    Roubo e extorsão
    Dano
    Apropriação indébita
    Estelionato e outras fraudes
    Receptação
    Disposições gerais (imunidades penais)
  Crimes contra a fé pública ~ Crimes em espécie>Crimes contra a fé pública
    Moeda falsa
    Falsificação de documento público e particular
    Falsidade ideológica e uso de documento falso
    Falsa identidade
    Fraudes em certames de interesse público
  Crimes contra a Administração Pública ~ Crimes em espécie>Crimes contra a administração pública
    Crimes praticados por funcionário público contra a Administração
      Conceito de funcionário público
      Peculato
      Concussão e excesso de exação
      Corrupção passiva
      Prevaricação e condescendência criminosa
      Advocacia administrativa
    Crimes praticados por particular contra a Administração
      Resistência, desobediência e desacato
      Corrupção ativa e tráfico de influência
      Contrabando e descaminho ~ Crimes em espécie>Descaminho (art. 334 do CP)
      Sonegação de contribuição previdenciária ~ Crimes em espécie>Crimes previdenciários e tributários
    Crimes contra a administração da Justiça
      Denunciação caluniosa e comunicação falsa de crime
      Falso testemunho ou falsa perícia
      Favorecimento pessoal e real
      Fraude processual
      Exercício arbitrário das próprias razões
    Crimes em licitações e contratos administrativos

# Processo Penal | I | Processo Penal
Inquérito policial ~ Inquérito policial
  Histórico, natureza, conceito e finalidade
  Características
  Fundamento, titularidade, grau de cognição e valor probatório
  Formas de instauração
    Notitia criminis e delatio criminis
    Requisição e requerimento
    Auto de prisão em flagrante
  Procedimentos investigativos (diligências)
  Indiciamento
  Garantias do investigado
  Conclusão do inquérito (prazos, relatório e arquivamento)
Prova ~ Prova e cadeia de custódia
  Teoria geral da prova
    Requisitos e ônus da prova
    Provas ilícitas e provas derivadas
    Nulidade da prova
  Preservação de local de crime
  Cadeia de custódia
  Provas em espécie
    Exame de corpo de delito e perícias
    Interrogatório e confissão
    Declarações do ofendido
    Prova testemunhal
    Reconhecimento de pessoas e coisas
    Acareação
    Documentos de prova
    Indícios
    Busca e apreensão
Restrição de liberdade ~ Prisões e flagrante
  Prisão em flagrante ~ Prisões e flagrante
    Hipóteses de flagrante e espécies
    Auto de prisão em flagrante e comunicação
    Audiência de custódia
  Prisão preventiva
  Prisão temporária
  Medidas cautelares diversas da prisão
  Liberdade provisória e fiança

# Direitos Humanos | I | Direitos Humanos
Direitos humanos na Constituição Federal de 1988 ~ Direitos humanos (tratados e normas)
  Fundamentos e princípios (dignidade da pessoa humana e prevalência dos direitos humanos)
  Direitos e garantias fundamentais e tratados internacionais (art. 5º, §§ 2º e 3º)
  Status dos tratados de direitos humanos e Tribunal Penal Internacional
Sistema internacional de proteção dos direitos humanos
  Teoria geral e evolução histórica (Declaração Universal de 1948 e Pactos de 1966)
  Sistema global (ONU)
  Sistemas regionais de proteção
    Sistema interamericano (Pacto de São José da Costa Rica, Comissão e Corte IDH)
    Sistemas europeu e africano (noções)
Convenção para a Prevenção e Punição do Crime de Genocídio
  Conceito e elementos do genocídio
  Obrigações dos Estados
Convenção Relativa ao Estatuto dos Refugiados e Protocolo de 1967
  Conceito de refugiado
  Princípio do non-refoulement
Convenção sobre a Eliminação de Todas as Formas de Discriminação Racial
Convenção sobre a Eliminação de Todas as Formas de Discriminação contra a Mulher
Convenção contra a Tortura e Outros Tratamentos ou Penas Cruéis, Desumanos ou Degradantes
  Conceito de tortura
  Obrigações dos Estados e mecanismos de monitoramento
Convenção Internacional para a Proteção de Todas as Pessoas contra o Desaparecimento Forçado
Regras mínimas da ONU para o tratamento de pessoas presas
Princípios Básicos sobre o Uso da Força e Armas de Fogo (Havana, 1990)
Lei nº 13.060/2014 (instrumentos de menor potencial ofensivo)
Decreto nº 12.341/2024 (regulamenta a Lei nº 13.060/2014)

# Legislação Especial | I | Legislação Especial
Lei nº 14.967/2024 (Estatuto da Segurança Privada) ~ Segurança privada (Lei 14.967/2024)
  Autorização e fiscalização das atividades de segurança privada
  Vigilantes
  Segurança das instituições financeiras
Lei nº 10.357/2001 (controle e fiscalização de produtos químicos)
  Controle e fiscalização pela Polícia Federal
  Cadastro e licenças
  Infrações administrativas e penais
Lei nº 13.445/2017 (Lei de Migração) ~ Lei de Migração (Lei 13.445/2017)
  Princípios e garantias
  Condição jurídica do migrante e vistos
  Entrada e saída do território nacional
  Residência e autorização de residência
  Medidas de retirada compulsória (repatriação, deportação e expulsão)
  Naturalização
Lei nº 11.343/2006 (Lei de Drogas) ~ Lei de Drogas (Lei 11.343/2006)
  Prevenção, Sisnad e atenção ao usuário
  Usuário e dependente (art. 28)
  Crimes (tráfico, associação, financiamento e demais)
  Causas de aumento e tráfico privilegiado
  Investigação e procedimento penal (aspectos processuais)
  Apreensão, destinação de bens e cooperação
Lei nº 9.455/1997 (Crimes de Tortura) ~ Lei de Tortura (Lei 9.455/1997)
  Conceito e crimes
  Causas de aumento de pena
  Aspectos processuais e efeitos da condenação
Lei nº 8.069/1990 (Estatuto da Criança e do Adolescente) ~ ECA (Lei 8.069/1990)
  Princípios e direitos fundamentais
  Medidas de proteção
  Ato infracional e medidas socioeducativas
  Apreensão de adolescente e garantias processuais
  Crimes e infrações administrativas
Lei nº 10.826/2003 (Estatuto do Desarmamento) ~ Estatuto do Desarmamento (Lei 10.826/2003)
  Sinarm e registro de armas
  Posse e porte de arma de fogo
  Crimes (posse e porte irregulares, disparo, comércio ilegal e tráfico internacional)
  Disposições gerais
Lei nº 9.605/1998 (Crimes Ambientais) ~ Crimes ambientais (Lei 9.605/1998)
  Disposições gerais (responsabilidade penal e penas)
  Crimes contra a fauna
  Crimes contra a flora
  Poluição e outros crimes ambientais
  Infrações administrativas e aspectos processuais
Lei nº 10.446/2002 (infrações de repercussão interestadual ou internacional) ~ Lei 10.446/2002 (repercussão interestadual/internacional)
  Atribuição da Polícia Federal
  Rol de infrações
Lei nº 13.444/2017 (Identificação Civil Nacional)
Lei nº 14.534/2023 (CPF como número de identificação)
Lei nº 7.116/1983 (Carteira de Identidade) e Decreto nº 10.977/2022 ~ Identificação civil (Lei 7.116 e correlatas)
Decreto nº 11.797/2023 (Serviço de Identificação do Cidadão)
Lei nº 9.454/1997 (número único de Registro de Identidade Civil — no DSO consta 9.545/1997)
Decreto nº 11.491/2023 (Convenção sobre o Crime Cibernético)
  Conceitos e crimes cibernéticos
  Medidas processuais (preservação e obtenção de dados)
  Cooperação internacional

# Estatística | I | Estatística
Estatística descritiva e análise exploratória de dados
  Apresentação de dados (tabelas, gráficos e diagramas)
  Medidas de posição
    Média (aritmética, ponderada, geométrica e harmônica)
    Mediana
    Moda
    Medidas separatrizes (quartis, decis e percentis)
  Medidas de dispersão
    Amplitude
    Variância
    Desvio padrão
    Coeficiente de variação
  Assimetria e curtose
Probabilidade
  Definições básicas e axiomas
  Probabilidade condicional e independência
  Teorema da probabilidade total e regra de Bayes
Variáveis aleatórias e distribuições de probabilidade ~ Distribuições de probabilidade
  Variáveis aleatórias discretas e contínuas
    Função de probabilidade (discretas)
    Função densidade de probabilidade (contínuas)
  Esperança e momentos
  Distribuições especiais
    Distribuição uniforme
    Distribuição de Bernoulli ~ Distribuições de probabilidade>Distribuição binomial e Bernoulli
    Distribuição binomial ~ Distribuições de probabilidade>Distribuição binomial e Bernoulli
    Distribuição normal ~ Distribuições de probabilidade>Distribuição normal
      Padronização e uso da tabela normal
      Regra empírica (três sigma)
  Distribuições conjuntas, condicionais e independência ~ Distribuições de probabilidade>Variáveis aleatórias conjuntas
Teoremas limites e amostragem
  Lei dos grandes números
  Teorema central do limite
  Amostras aleatórias e distribuições amostrais
  Técnicas de amostragem (aleatória simples, estratificada, sistemática e por conglomerados)
  Tamanho amostral (conceitos básicos)
Inferência estatística ~ Inferência estatística
  Estimação pontual (propriedades dos estimadores)
  Estimação intervalar (intervalos de confiança)
  Testes de hipóteses
    Hipóteses, nível de significância e potência do teste
    Teste t de Student
    Teste qui-quadrado
Correlação e regressão linear ~ Correlação e regressão
  Coeficiente de correlação de Pearson
  Regressão linear simples (modelo e mínimos quadrados)
  Inferência sobre os parâmetros do modelo
  Análise de variância (ANOVA)
  Análise de resíduos

# Raciocínio Lógico | I | Raciocínio Lógico
Estruturas lógicas
Lógica de argumentação: analogias, inferências, deduções e conclusões ~ Lógica e argumentação>Validade de argumentos e conclusões
  Analogias
  Inferências e deduções ~ Lógica e argumentação>Associação e dedução (situações-problema)
  Argumentos (premissas, conclusão e validade)
Lógica sentencial (ou proposicional) ~ Lógica e argumentação
  Proposições simples e compostas ~ Lógica e argumentação>Condicional e bicondicional
    Conectivos lógicos
    Condicional e bicondicional
  Tabelas-verdade ~ Lógica e argumentação>Tabela-verdade
    Tautologia, contradição e contingência
  Equivalências ~ Lógica e argumentação>Equivalência lógica
  Leis de De Morgan
  Negação de proposições ~ Lógica e argumentação>Negação de proposições
  Diagramas lógicos
Lógica de primeira ordem
  Quantificadores (todo, algum e nenhum)
  Negação de proposições quantificadas
Princípios de contagem e probabilidade
  Princípio fundamental da contagem ~ Análise combinatória
  Permutações, arranjos e combinações ~ Análise combinatória
  Probabilidade ~ Probabilidade
Operações com conjuntos ~ Conjuntos
  União, interseção, diferença e complementar
  Problemas com conjuntos (diagramas de Venn)
Raciocínio lógico envolvendo problemas aritméticos, geométricos e matriciais
  Problemas aritméticos (razão, proporção, porcentagem e regra de três)
  Problemas geométricos (perímetros, áreas e volumes)
  Problemas matriciais (operações básicas com matrizes)

# Informática | II | Informática
Conceito de internet e intranet ~ Internet e intranet
  Internet, intranet e extranet
  Serviços da internet (web, e-mail e transferência de arquivos)
  Arquitetura cliente-servidor
Tecnologias, ferramentas, aplicativos e procedimentos associados à internet e à intranet
  Navegação, correio eletrônico, grupos de discussão, busca, pesquisa e redes sociais
    Navegadores (Chrome, Edge e Firefox) ~ Internet e intranet>Navegadores (Chrome, Edge, Firefox)
      Cookies, histórico, modo anônimo e favoritos
      Certificados e indicadores de conexão segura ~ Internet e intranet>Navegador — indicadores de conexão segura
    Correio eletrônico (webmail e cliente de e-mail)
    Grupos de discussão e redes sociais
    Busca e pesquisa na web ~ Internet e intranet>Busca e pesquisa na web
      Operadores de busca ~ Internet e intranet>Operadores de busca (frase exata e restrição a site…)
  Noções de sistema operacional (ambientes Linux e Windows) ~ Sistemas operacionais
    Windows (arquivos, pastas e recursos) ~ Sistemas operacionais>Windows (arquivos, pastas, recursos)
    Linux (comandos, permissões e distribuições) ~ Sistemas operacionais>Linux (comandos, permissões, distribuições)
  Acesso à distância, transferência de informação e arquivos, aplicativos de áudio, vídeo e multimídia
    Acesso remoto a computadores
    Transferência de informação e arquivos
    Aplicativos de áudio, vídeo e multimídia
  Edição de textos, planilhas e apresentações (Microsoft Office e LibreOffice) ~ Editores de texto, planilhas e apresentações
    Editores de texto (Word e Writer)
    Planilhas (Excel e Calc)
      Fórmulas e funções básicas
      Referências relativas e absolutas
      Gráficos e formatação
    Apresentações (PowerPoint e Impress)

# TI | II | Informática
Redes de computadores ~ Redes de computadores
  Introdução a redes (computação e telecomunicações)
  Camada física, enlace de dados e subcamada de acesso ao meio
  Noções básicas de transmissão de dados
    Tipos de enlace, modos e meios de transmissão ~ Redes de computadores>Transmissão de dados (duplex, banda, bits)
  Redes locais, metropolitanas e de longa distância ~ Redes de computadores>Tipos e topologias de rede (LAN, MAN, WAN…)
    Terminologia e topologias
  Modelos de arquitetura (OSI/ISO e TCP/IP) ~ Redes de computadores>Modelo OSI e TCP/IP (camadas)
    Camadas e funções
  Formação de endereços IPv4 e IPv6 ~ Redes de computadores>Endereçamento e protocolo IP (IPv4/IPv6, NAT)
    Endereços IPv4 (classes, máscara e CIDR)
    Endereços IPv6
    NAT e endereços privados
  Protocolos de comunicação ~ Redes de computadores>Protocolos de aplicação (HTTP, SMTP, DNS, FTP, DHCP…)
    Ethernet, IP, TCP e UDP
    DNS, DHCP e SNMP
    HTTP, HTTPS e protocolos de e-mail
  Interconexão de redes e nível de transporte ~ Redes de computadores>Camada de transporte — UDP e TCP (OSI)
  Protocolos e mecanismos de segurança em redes (VPN e SSL/TLS)
  Redes sem fio (IEEE 802.11, WPA/WPA2, segurança e boas práticas)
Conceitos de proteção e segurança ~ Segurança da informação
  Princípios da segurança (confidencialidade, integridade, disponibilidade e autenticidade)
  Ameaças digitais e malwares ~ Segurança da informação>Malware e códigos maliciosos
    Vírus, worms e trojans
    Ransomware, spyware, rootkits e botnets
    Engenharia social e phishing
  Ferramentas e técnicas de segurança ~ Segurança da informação>Firewall, antivírus e proteção de rede
    Antivírus, firewall e anti-spyware
    Autenticação multifator (MFA)
  Criptografia e proteção de dados ~ Segurança da informação>Criptografia, assinatura e certificado digital
    Criptografia simétrica e assimétrica
    Hash criptográfico (MD5, SHA-1 e SHA-256)
    Assinatura digital e certificado digital
  Controle de acesso e autenticação ~ Segurança da informação>Autenticação e controle de acesso
Computação em nuvem ~ Computação em nuvem
  Definição e características
  Nuvens privadas, públicas e híbridas
  Modelos de serviço (IaaS, PaaS e SaaS)
Sistemas e teoria da informação ~ Sistemas de informação
  Fundamentos da Teoria Geral de Sistemas
    Camadas de aplicação, processos, frontend e backend
  Sistemas de informação
    Fases e etapas de um sistema de informação
    Análise de requisitos e especificação
    Ambientes de teste, homologação, produção e suporte
  Teoria da informação
    Conceitos de informação, dados e conhecimento
    Representação de dados, segurança e inteligência
Banco de dados ~ Banco de dados
  Base de dados, documentação e prototipação
  Modelagem conceitual (modelo entidade-relacionamento)
    Entidades, atributos e relacionamentos
    Abstração e administração de dados
  Dados estruturados e não estruturados
  Banco de dados relacionais
    Conceitos básicos e características
    Chaves e relacionamentos
    Normalização
  Noções de linguagem SQL
  Data Warehouse, DataMart, Data Lake e Data Mesh
  Metadados
Análise de dados, mineração e big data ~ Mineração de dados e aprendizado de máquina
  Noções de mineração de dados
  Noções de Business Intelligence
  Noções de aprendizado de máquina
  Noções de big data (conceito, premissas e aplicação)
  ETL/ELT (Extract, Transform, Load)
Inteligência Artificial
  Conceitos de Machine Learning
  Principais ferramentas de mercado (Copilot, ChatGPT e Meta)
Programação e interoperabilidade ~ Programação e interoperabilidade (Python/R, API)
  Noções de programação em Python
  Noções de programação em R
  Conceito de API
  Formatos de intercâmbio (XML e JSON)
Metadados de arquivos e sistemas biométricos
  Metadados de arquivos
  Formatos de intercâmbio entre sistemas biométricos (NIST, XML e JSON)
  Testes de acurácia do NIST.GOV (falso positivo e falso negativo: FPIR e FNIR)
Colaboração online e acesso remoto (Microsoft Teams)

# Contabilidade | III | Contabilidade
Conceitos, objetivos e finalidades da contabilidade ~ Conceitos, objeto e princípios da contabilidade
  Conceito e objeto da contabilidade
  Objetivos e finalidades
  Usuários da informação contábil
  Princípios e postulados contábeis
Patrimônio: componentes, equação fundamental, situação líquida e representação gráfica ~ Patrimônio, avaliação de ativos e pronunciamentos CPC
  Componentes do patrimônio (bens, direitos e obrigações)
  Equação fundamental do patrimônio ~ Patrimônio, avaliação de ativos e pronunciamentos CPC>Equação e situação patrimonial
  Situação líquida (positiva, nula e negativa)
  Classificação do ativo e do passivo ~ Patrimônio, avaliação de ativos e pronunciamentos CPC>Classificação e composição do ativo/passivo
  Representação gráfica do patrimônio
Atos e fatos administrativos ~ Atos e fatos administrativos
  Atos administrativos e fatos contábeis
  Fatos permutativos
  Fatos modificativos (aumentativos e diminutivos)
  Fatos mistos
Contas ~ Plano de contas e natureza dos saldos
  Conceito de conta
  Contas de débito e contas de crédito
  Saldos (devedor e credor) e natureza dos saldos
  Método das partidas dobradas
Plano de contas ~ Plano de contas e natureza dos saldos
  Conceito e elenco de contas
  Função e funcionamento das contas
Escrituração ~ Escrituração contábil
  Conceitos e lançamentos contábeis (elementos essenciais)
  Fórmulas de lançamento ~ Escrituração contábil>Lançamentos e fórmulas de lançamento (débito/crédito)
  Livros de escrituração ~ Escrituração contábil>Livros contábeis (Diário e Razão)
    Livro Diário
    Livro Razão
  Métodos e processos de escrituração
  Regime de competência e regime de caixa ~ Escrituração contábil>Regime de competência × caixa
Contabilização de operações contábeis diversas ~ Operações contábeis diversas (provisões, depreciação…)
  Juros e descontos
  Tributos e aluguéis
  Variação monetária e cambial
  Folha de pagamento e encargos ~ Escrituração contábil>Folha, encargos e despesas antecipadas
  Compras e vendas de mercadorias ~ Escrituração contábil>Operações com mercadorias, compras e vendas
  Provisões
  Depreciação e baixa de bens ~ Patrimônio, avaliação de ativos e pronunciamentos CPC>Depreciação, valor residual e intangível
Balancete de verificação ~ Balancete de verificação
  Conceito e objetivo
  Modelos e técnicas de elaboração
Balanço patrimonial ~ Demonstrações contábeis (balanço e DRE)
  Conceito e objetivo
  Composição (ativo, passivo e patrimônio líquido)
Demonstração do resultado do exercício ~ Demonstrações contábeis (balanço e DRE)
  Conceito e objetivo
  Composição (receitas, custos, despesas e resultado)
Lei nº 6.404/1976, legislação complementar e pronunciamentos do CPC
  Lei nº 6.404/1976 (grupos de contas e demonstrações financeiras)
  CPC 01 — Redução ao valor recuperável de ativos
  CPC 04 — Ativo intangível
  CPC 25 — Provisões, passivos contingentes e ativos contingentes
Norma Brasileira de Contabilidade NBC TSP — Estrutura Conceitual ~ Estrutura conceitual (NBC TSP / CPC 00)
  Objetivos e usuários da informação contábil
  Características qualitativas
  Elementos das demonstrações contábeis
  Reconhecimento e mensuração (noções)
`;

/** Converte o texto acima em árvore: [{ id, t, subj, block, c:[{ id, t, k?, c:[] }] }]. Ids estáveis por posição. */
function parseEditalDSL(text, prefix = '') {
  const slug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '').slice(0, 14);
  const root = [], stack = [];
  let cur = null, count = {};
  text.split('\n').forEach(line => {
    if (!line.trim()) return;
    if (line.startsWith('# ')) {
      const [t, block, subj] = line.slice(2).split('|').map(x => x.trim());
      cur = { id: prefix + slug(t), t, block, subj, c: [] }; root.push(cur); stack.length = 0; count = {}; return;
    }
    const lead = line.match(/^ */)[0].length / 2;
    let title = line.trim(), k;
    let lk; const lm = title.match(/ @ ([\w.,-]+)$/); if (lm) { lk = lm[1].split(','); title = title.slice(0, lm.index).trim(); }   // " @ ids" = itens equivalentes da PF (progresso compartilhado)
    const i = title.indexOf(' ~ '); if (i > 0) { k = title.slice(i + 3).trim(); title = title.slice(0, i).trim(); }
    const parent = lead === 0 ? cur : stack[lead - 1];
    const idx = parent.c.length;
    const node = { id: `${parent.id}.${idx}`, t: title, c: [] }; if (k) node.k = k; if (lk) node.l = lk;
    parent.c.push(node); stack[lead] = node; stack.length = lead + 1;
  });
  return root;
}
