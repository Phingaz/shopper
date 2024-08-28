# Serviço de Leitura de Imagens da Shopper

Esta aplicação fornece um serviço de backend para gerenciar leituras individuais de consumo de água e gás. Ela usa IA (API do Google Gemini) para extrair medições de imagens de medidores.

## Funcionalidades

- Upload de imagens de medidores de água ou gás
- Extração de leituras de medidores potencializada por IA
- Confirmação ou correção de leituras extraídas por IA
- Listagem de leituras para clientes específicos

## Stack Tecnológica

- Node.js com TypeScript
- MongoDB para armazenamento de dados
- Docker e Docker Compose para containerização
- API do Google Gemini para análise de imagens potencializada por IA

## Pré-requisitos

- Docker e Docker Compose instalados no seu sistema
- Chave da API do Google Gemini

## Configuração

1. Clone este repositório:
   ```
   git clone https://github.com/Phingaz/shopper
   cd shopper
   ```

2. Crie um arquivo `.env` no diretório raiz com sua chave da API do Google Gemini:
   ```
   GEMINI_API_KEY=sua_chave_api_aqui
   ```

3. Construa e inicie os contêineres:
   ```
   docker-compose up --build -d
   ```

A aplicação estará disponível em `http://localhost:3001`.

## Endpoints da API

### POST /upload

Faz o upload de uma imagem de leitura de medidor.

### PATCH /confirm

Confirma ou corrige uma leitura de medidor.

### GET /<codigo_cliente>/list

Lista as leituras para um cliente específico.

## Desenvolvimento

Para executar a aplicação em modo de desenvolvimento:

1. Instale as dependências:
   ```
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```
   npm run dev
   ```

## Implantação

A aplicação está totalmente dockerizada. Para implantar:

1. Certifique-se de que você tem Docker e Docker Compose instalados no seu ambiente de implantação.
2. Configure as variáveis de ambiente necessárias.
3. Execute `docker-compose up -d` para iniciar a aplicação em modo desanexado.
