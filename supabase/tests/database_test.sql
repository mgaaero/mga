-- ==============================================================================
-- MGA — Testes Automatizados de Aceite em Banco de Dados (pgTAP / PostGIS)
-- Executa verificações formais de schema, extensões, triggers e permissões RLS
-- ==============================================================================

BEGIN;

-- 1. Verifica extensões indispensáveis
SELECT plan(10);

SELECT has_extension('postgis', 'PostGIS deve estar ativado para consultas espaciais WGS84');
SELECT has_extension('uuid-ossp', 'UUID-OSSP deve estar ativado para chaves primárias');

-- 2. Verifica existência das tabelas centrais
SELECT has_table('occurrences', 'Tabela occurrences deve existir');
SELECT has_table('aircraft', 'Tabela aircraft deve existir');
SELECT has_table('airports', 'Tabela airports deve existir');
SELECT has_table('hazards', 'Tabela hazards deve existir');
SELECT has_table('occurrence_history', 'Tabela occurrence_history de auditoria deve existir');
SELECT has_table('source_import_jobs', 'Tabela source_import_jobs de monitoramento deve existir');

-- 3. Verifica se RLS está habilitado em ocorrências
SELECT tests.rls_enabled('public', 'occurrences');

-- 4. Verifica existência do trigger de auditoria
SELECT has_trigger('public', 'occurrences', 'trg_audit_occurrence', 'Trigger de auditoria trg_audit_occurrence deve estar ativo');

SELECT * FROM finish();

ROLLBACK;

