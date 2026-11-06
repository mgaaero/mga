-- ==============================================================================
-- MEGA: Memória Geográfica da Aviação
-- Migration 00004: Supabase Cron Scheduling & Automation Pipeline
-- ==============================================================================

-- Habilita extensão pg_cron e pg_net para disparo de Webhooks / Edge Functions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. CONFIGURAÇÃO DE FREQUÊNCIA DE SINCRONIZAÇÃO POR FONTE OFICIAL

-- ANAC Brasil: Atualização Diária às 03:00 UTC (00:00 Brasília)
-- Cron: 0 3 * * *
SELECT cron.schedule(
    'sync-anac-daily',
    '0 3 * * *',
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_functions_url', true) || '/ingest-anac',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', current_setting('app.settings.cron_secret', true)
        )
    );
    $$
);

-- OurAirports / AIS: Atualização Semanal aos domingos às 04:00 UTC
-- Cron: 0 4 * * 0
SELECT cron.schedule(
    'sync-ourairports-weekly',
    '0 4 * * 0',
    $$
    SELECT net.http_post(
        url := current_setting('app.settings.supabase_functions_url', true) || '/ingest-ourairports',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-cron-secret', current_setting('app.settings.cron_secret', true)
        )
    );
    $$
);

-- 2. TABELA DE MONITORAMENTO DE SAÚDE DAS FONTES (OBSERVABILIDADE)
CREATE TABLE IF NOT EXISTS source_health_metrics (
    source_slug VARCHAR(50) PRIMARY KEY,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    consecutive_failures INT DEFAULT 0,
    average_processing_time_ms INT,
    last_error_message TEXT,
    is_paused BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Semente inicial de observabilidade
INSERT INTO source_health_metrics (source_slug) VALUES 
('anac'),
('cenipa'),
('ntsb'),
('faa_obstacles'),
('ourairports')
ON CONFLICT (source_slug) DO NOTHING;

