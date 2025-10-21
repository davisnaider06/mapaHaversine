// backend/src/database.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Pega a string de conexão da variável de ambiente
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error('ERRO: Variável de ambiente DATABASE_URL não definida.');
  console.error('Certifique-se de criar um arquivo .env na raiz do backend');
  console.error('com a linha: DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE');
  console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  process.exit(1); // Encerra a aplicação se a URL não estiver configurada
}

// Cria o pool de conexões usando a string de conexão
const pool = new Pool({
  connectionString: connectionString,
});

// Testa a conexão (opcional, mas bom para depuração)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Erro ao conectar ao banco de dados:', err.stack);
  }

  // ---- CORREÇÃO ADICIONADA AQUI ----
  // Verifica se o cliente foi retornado com sucesso
  if (!client) {
    console.error('Erro: Cliente do pool de conexão indefinido, mesmo sem erro.');
    release(); // Libera (mesmo sem cliente, é uma boa prática)
    return;
  }
  // ----------------------------------

  console.log('Conectado ao banco de dados PostgreSQL na nuvem com sucesso!');

  // Agora 'client' está verificado e seguro para usar
  client.query('SELECT NOW()', (err, result) => {
    release(); // Libera o cliente de volta para o pool
    if (err) {
      return console.error('Erro ao executar query de teste:', err.stack);
    }
    // console.log('Query de teste executada:', result.rows);
  });
});

export default pool;