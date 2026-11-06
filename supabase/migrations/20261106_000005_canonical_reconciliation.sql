-- ==============================================================================
-- MGA: Memória Geográfica da Aviação
-- Migration 00005: Canonical Occurrence Identity & Cross-Source Reconciliation
-- ==============================================================================

-- 1. ADICIONA COLUNAS DE IDENTIDADE CANÔNICA E CHAVE SIPAER
ALTER TABLE occurrences 
ADD COLUMN IF NOT EXISTS canonical_id UUID DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS sipaer_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_primary_record BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_occurrences_sipaer_code ON occurrences(sipaer_code);
CREATE INDEX IF NOT EXISTS idx_occurrences_canonical_id ON occurrences(canonical_id);

-- 2. TABELA DE PROVENIÊNCIA E CORRELAÇÃO DE FONTES MÚLTIPLAS
CREATE TABLE IF NOT EXISTS occurrence_source_reconciliation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    canonical_id UUID NOT NULL,
    source_slug VARCHAR(50) NOT NULL,
    source_record_id VARCHAR(150) NOT NULL,
    reconciliation_confidence NUMERIC(4,3) DEFAULT 1.000, -- 1.000 = correspondência exata de código
    match_criteria VARCHAR(100) NOT NULL, -- 'EXACT_SIPAER_CODE', 'REGISTRATION_DATE_EXACT', 'MANUAL_AUDIT'
    raw_payload_snippet JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_source_record UNIQUE (source_slug, source_record_id)
);

-- 3. FUNÇÃO DE RECONCILIAÇÃO ANAC x CENIPA
-- Quando a ANAC ou CENIPA importam uma ocorrência, se ambas possuírem o mesmo código
-- oficial SIPAER ou mesma matrícula + data exata, elas compartilham o mesmo canonical_id
CREATE OR REPLACE FUNCTION reconcile_aviation_occurrence(
    p_source_slug VARCHAR,
    p_source_record_id VARCHAR,
    p_sipaer_code VARCHAR,
    p_aircraft_reg VARCHAR,
    p_occurrence_date DATE,
    p_new_occurrence_id UUID
)
RETURNS UUID AS $$
DECLARE
    v_existing_canonical_id UUID;
    v_target_canonical_id UUID;
BEGIN
    -- Critério 1: Busca pelo código SIPAER idêntico já cadastrado por outra fonte
    IF p_sipaer_code IS NOT NULL AND p_sipaer_code != '' THEN
        SELECT canonical_id INTO v_existing_canonical_id
        FROM occurrences
        WHERE sipaer_code = p_sipaer_code AND id != p_new_occurrence_id
        LIMIT 1;
    END IF;

    -- Critério 2: Se não achou por código SIPAER, busca por mesma Matrícula + Mesma Data exata
    IF v_existing_canonical_id IS NULL AND p_aircraft_reg IS NOT NULL AND p_aircraft_reg != 'N/A' THEN
        SELECT o.canonical_id INTO v_existing_canonical_id
        FROM occurrences o
        JOIN aircraft a ON o.aircraft_id = a.id
        WHERE a.registration = p_aircraft_reg 
          AND o.occurrence_date = p_occurrence_date 
          AND o.id != p_new_occurrence_id
        LIMIT 1;
    END IF;

    -- Se já existe um registro canônico unificado
    IF v_existing_canonical_id IS NOT NULL THEN
        v_target_canonical_id := v_existing_canonical_id;
        -- Marca este novo registro como fonte secundária enriquecedora
        UPDATE occurrences 
        SET canonical_id = v_target_canonical_id, 
            is_primary_record = FALSE,
            sipaer_code = COALESCE(sipaer_code, p_sipaer_code)
        WHERE id = p_new_occurrence_id;
        
        -- Registra correlação na tabela de reconciliação
        INSERT INTO occurrence_source_reconciliation (
            canonical_id,
            source_slug,
            source_record_id,
            reconciliation_confidence,
            match_criteria
        ) VALUES (
            v_target_canonical_id,
            p_source_slug,
            p_source_record_id,
            1.000,
            CASE WHEN p_sipaer_code IS NOT NULL THEN 'EXACT_SIPAER_CODE' ELSE 'REGISTRATION_DATE_EXACT' END
        ) ON CONFLICT (source_slug, source_record_id) DO NOTHING;
    ELSE
        -- Primeiro registro detectado: define seu próprio canonical_id
        SELECT canonical_id INTO v_target_canonical_id FROM occurrences WHERE id = p_new_occurrence_id;
        
        INSERT INTO occurrence_source_reconciliation (
            canonical_id,
            source_slug,
            source_record_id,
            reconciliation_confidence,
            match_criteria
        ) VALUES (
            v_target_canonical_id,
            p_source_slug,
            p_source_record_id,
            1.000,
            'CANONICAL_PRIMARY'
        ) ON CONFLICT (source_slug, source_record_id) DO NOTHING;
    END IF;

    RETURN v_target_canonical_id;
END;
$$ LANGUAGE plpgsql;

