# +Acessibilidade

Plataforma de acessibilidade para a sala de aula presencial, desenvolvida para o Sebrae Supernova com a UNICRUZ como piloto.

Este repositório é um site estático (HTML, CSS e JavaScript, sem build) com:

- demonstração do app do estudante: legenda ao vivo, descrição de slides, escrever e falar, avisos ao professor;
- painel do professor (simulação);
- widget **VLibras** (tradução em Libras, gratuito, do Governo Federal);
- seção que lê dados do repositório pela API pública do GitHub.

Os dados da demonstração são de exemplo e nada é enviado a servidor.

## Rodar localmente

```bash
python3 -m http.server 8000
```

Abra http://localhost:8000. Abrir o `index.html` direto no navegador também funciona, mas alguns navegadores bloqueiam recursos externos nesse modo.

## Conectar ao seu GitHub

1. Crie um repositório vazio no GitHub, por exemplo `projectAcessibility`.
2. Edite `js/config.js` com seu usuário e o nome do repositório.
3. Envie o código:

```bash
git init -b main
git add .
git commit -m "Primeira versão do +Acessibilidade"
git remote add origin https://github.com/MariaEduardaslv/projectAcessibility.git
git push -u origin main
```

4. No GitHub, em **Settings → Pages**, escolha **Source: GitHub Actions**. O workflow em `.github/workflows/pages.yml` publica o site a cada push na branch `main`.

O site fica em `https://mariaeduardaslv.github.io/projectAcessibility/`.

A seção "Projeto no GitHub" só mostra dados de repositórios **públicos**.

## VLibras

O widget é carregado do serviço oficial (`vlibras.gov.br`) e é gratuito. O trecho está no fim do `index.html`. Confira o código atualizado na página do VLibras em gov.br/governodigital, porque o governo pode alterá-lo.

## Estrutura

```
index.html
css/styles.css
js/config.js   # usuário e repositório do GitHub
js/app.js      # demonstração do app e do painel
js/github.js   # leitura da API do GitHub
.github/workflows/pages.yml
```
