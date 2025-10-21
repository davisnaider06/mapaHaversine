# Backend - API de Cálculo de Distância PostGIS

Este é o servidor backend desenvolvido com Node.js, Express e TypeScript. Ele fornece um endpoint para calcular a distância geodésica entre dois pontos usando PostGIS.

## Funcionalidades

* **Endpoint `/api/calculate-distance` (POST):**
    * Recebe um JSON com `{ origin: {lat, lng}, destination: {lat, lng} }`.
    * Consulta o banco de dados PostgreSQL (com PostGIS) para calcular a distância geodésica (`ST_Distance`) entre os pontos geográficos.
    * Retorna um JSON com `{ distance: number }` (distância em metros).

## Configuração

1.  **Banco de Dados:**
    * Certifique-se de ter o PostgreSQL instalado com a extensão PostGIS habilitada.
    * Crie um banco de dados (ex: `geolocalizacao`).
    * Conecte-se ao banco criado via `psql` ou outra ferramenta e ative a extensão PostGIS, caso ainda não esteja ativa: `CREATE EXTENSION IF NOT EXISTS postgis;`.
    * Ajuste as credenciais de conexão (usuário, senha, nome do banco, host, porta) no arquivo `src/database.ts`.

2.  **Instalar Dependências:**
    ```bash
    npm install
    ```

## Execução

Para iniciar o servidor em modo de desenvolvimento (com recarregamento automático ao salvar arquivos):

```bash
npm run dev