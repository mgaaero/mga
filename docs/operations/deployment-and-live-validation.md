# MGA — Guia de Homologação, Implantação e Validação em Nuvem (Etapa 5.1)

Este guia documenta o procedimento estrito para conectar o código do monorepo MGA à infraestrutura gerenciada do Supabase em nuvem.

---

### 1. Autenticação e Associação de Projeto Supabase
Para vincular o repositório local ao projeto Supabase de produção ou homologação:

```bash
# 1. Login na CLI com o Personal Access Token da sua conta
supabase login

# 2. Listar projetos existentes na organização
supabase projects list

# 3. Associar o projeto MGA (substituir pelo Project Reference ID real)
supabase link --project-ref <SEU_PROJECT_REF>
```

---

### 2. Execução das Migrations PostGIS (00001 a 00004)
Todas as migrations de banco de dados foram escritas com idempotência (`IF NOT EXISTS` / `CREATE OR REPLACE`):

```bash
# Aplica todas as migrações no banco remoto PostGIS
supabase db push
```

**Verificação no SQL Editor do Supabase:**
```sql
-- Verificar se as 4 tabelas centrais e as extensões estão ativas:
SELECT extname FROM pg_extension WHERE extname IN ('postgis', 'uuid-ossp', 'pg_cron', 'pg_net');
SELECT COUNT(*) FROM occurrences;
SELECT COUNT(*) FROM airports;
SELECT COUNT(*) FROM source_health_metrics;
```

---

### 3. Configuração de Variáveis de Ambiente & Segredos do Vault
Os segredos **nunca** são inseridos no frontend. Configure-os na nuvem via CLI:

```bash
# Define o segredo do Cron compartilhado entre pg_cron e as Edge Functions
supabase secrets set CRON_SECRET="mga_cron_secret_prod_secure_token"
```

---

### 4. Deploy das Edge Functions
Implantar as duas funções da Etapa 5 com Deno runtime:

```bash
# 1. Ingestão oficial diária ANAC
supabase functions deploy ingest-anac --no-verify-jwt

# 2. Ingestão oficial semanal OurAirports
supabase functions deploy ingest-ourairports --no-verify-jwt
```

---

### 5. Roteiro de Testes de Segurança & Abuso (Smoke Tests)

```bash
# Teste A: Requisição Anônima (Deve retornar HTTP 401 Unauthorized)
curl -i -X POST https://<PROJECT_REF>.supabase.co/functions/v1/ingest-anac

# Teste B: Requisição com Segredo Válido do Cron (Deve iniciar o Job com sucesso HTTP 200)
curl -i -X POST https://<PROJECT_REF>.supabase.co/functions/v1/ingest-anac \
  -H "x-cron-secret: mga_cron_secret_prod_secure_token"

# Teste C: Verificar se o Job foi registrado em source_import_jobs
# SELECT * FROM source_import_jobs ORDER BY started_at DESC LIMIT 5;
```

