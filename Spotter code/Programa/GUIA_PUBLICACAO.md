# Publicar o SPOTTER CODE no GitHub Pages (passo a passo)

O GitHub só **hospeda o programa** (os arquivos). Seus estudos ficam no navegador de cada aparelho e nunca vão para o GitHub.

## Antes de começar — regras de privacidade
- Suba **somente** os arquivos do programa (lista abaixo). **Nunca** suba arquivos de backup (`spotter-backup-*.json`), planilhas suas ou prints.
- O repositório precisa ser **público** para o Pages gratuito. Isso é seguro porque o programa não contém dados pessoais nem senhas.
- O programa publicado **não tem conta de teste**: cada pessoa cria a própria conta (usuário + senha) no próprio aparelho.

## Arquivos que vão para o repositório
index.html · script.js · style.css · data-incidencia.js · data-edital.js · data-edital-prf.js · data-assets.js · manifest.webmanifest · sw.js · pasta `icons/` (4 PNGs).
(A pasta `tests/` e os arquivos .md são opcionais; pode deixar de fora.)

## Passos
1. Crie conta em github.com (ou entre).
2. Canto superior direito: **+ → New repository**. Nome: por exemplo `spotter-code`. Marque **Public**. Clique **Create repository**.
3. Na página do repositório vazio, clique em **uploading an existing file**.
4. Arraste os arquivos da lista (e a pasta `icons`). Se o navegador não aceitar a pasta, crie-a: **Add file → Create new file**, digite `icons/x` e depois suba os PNGs dentro dela; ou arraste a pasta inteira (Chrome aceita).
5. Role até o fim e clique **Commit changes**.
6. Vá em **Settings → Pages**. Em *Build and deployment → Source*, escolha **Deploy from a branch**; *Branch*: `main` e pasta `/ (root)`; **Save**.
7. Aguarde 1–2 minutos. O endereço aparece na mesma tela: `https://SEU-USUARIO.github.io/spotter-code/`.
8. Abra o endereço **com internet**, uma vez, e deixe carregar (isso guarda o programa e as bibliotecas para uso offline).

## Instalar
- **Android (Chrome):** menu ⋮ → **Instalar app** / **Adicionar à tela inicial**.
- **Windows (Chrome ou Edge):** ícone de instalar na barra de endereço → **Instalar**.

## Testar o offline
Abra o app instalado, ligue o modo avião e abra de novo. Deve abrir normalmente (se os gráficos não aparecerem, abra uma vez online e tente de novo).

## Levar seus dados do computador atual para o endereço novo
O navegador guarda dados **por endereço**, então o endereço novo começa vazio.
1. No programa antigo (arquivo local): **Configurações → Dados → Exportar tudo**.
2. No endereço novo: crie sua conta, entre no concurso e vá em **Configurações → Dados → Importar tudo**, escolhendo o arquivo. Depois **apague o arquivo de backup** ou guarde-o só com você.

## Atualizar o programa depois
Substitua os arquivos no repositório (**Add file → Upload files**, mesmo nome sobrescreve). Em `sw.js`, aumente o número de `VERSION` (ex.: `spotter-v5.0.1`) para os aparelhos receberem a versão nova; o app avisa para recarregar.
