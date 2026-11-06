-- ==============================================================================
-- MEGA: Memória Geográfica da Aviação
-- Migration 00002: Ingestion Tracking, Deduplication, Audit & Route Intelligence
-- ==============================================================================

-- 1. TABELA DE AUDITORIA DE SINCRONIZAÇÃO E JOBS DE IMPORTAÇÃO
CREATE TABLE IF NOT EXISTS source_import_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_slug VARCHAR(50) NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'RUNNING', -- 'RUNNING', 'COMPLETED', 'FAILED'
    records_received INT DEFAULT 0,
    records_inserted INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    records_skipped INT DEFAULT 0,
    error_log TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HISTÓRICO DE AUDITORIA E MUDANÇAS DE ESTADO DAS OCORRÊNCIAS
CREATE TABLE IF NOT EXISTS occurrence_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
    changed_by UUID, -- ID do administrador ou 'SYSTEM_INGEST'
    previous_status verification_status,
    new_status verification_status,
    previous_visual_tag visual_classification,
    new_visual_tag visual_classification,
    justification TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE AEROPORTOS / AERÓDROMOS OFICIAIS MUNDIAIS
CREATE TABLE IF NOT EXISTS airports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ident VARCHAR(20) UNIQUE NOT NULL, -- ICAO ou código local
    icao VARCHAR(4),
    iata VARCHAR(3),
    name VARCHAR(255) NOT NULL,
    airport_type VARCHAR(50),
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    elevation_ft NUMERIC(8,2),
    country_iso VARCHAR(3) NOT NULL,
    municipality VARCHAR(150),
    is_official_ais BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_airports_coordinates ON airports USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_airports_icao ON airports(icao);
CREATE INDEX IF NOT EXISTS idx_airports_iata ON airports(iata);

-- 4. FUNÇÃO DE DEDUPLICAÇÃO & UPSERT ATÔMICO DE OCORRÊNCIAS
CREATE OR REPLACE FUNCTION upsert_occurrence_record(
    p_source_slug VARCHAR,
    p_source_record_id VARCHAR,
    p_occurrence_type occurrence_type,
    p_visual_tag visual_classification,
    p_verification_status verification_status,
    p_occurrence_date DATE,
    p_occurrence_time TIME,
    p_lat FLOAT,
    p_lon FLOAT,
    p_country_iso VARCHAR,
    p_city VARCHAR,
    p_state VARCHAR,
    p_summary TEXT,
    p_aircraft_reg VARCHAR,
    p_aircraft_model VARCHAR,
    p_aircraft_manufacturer VARCHAR,
    p_fatalities INT
)
RETURNS UUID AS $$
DECLARE
    v_source_id UUID;
    v_aircraft_id UUID;
    v_occurrence_id UUID;
BEGIN
    -- Busca ID da fonte oficial
    SELECT id INTO v_source_id FROM sources WHERE slug = p_source_slug;
    IF v_source_id IS NULL THEN
        RAISE EXCEPTION 'Fonte não cadastrada: %', p_source_slug;
    END IF;

    -- Upsert da aeronave
    IF p_aircraft_reg IS NOT NULL AND p_aircraft_reg != '' AND p_aircraft_reg != 'N/A' THEN
        INSERT INTO aircraft (registration, model, manufacturer)
        VALUES (p_aircraft_reg, COALESCE(p_aircraft_model, 'Desconhecido'), p_aircraft_manufacturer)
        ON CONFLICT (registration) DO UPDATE
        SET model = EXCLUDED.model,
            manufacturer = COALESCE(EXCLUDED.manufacturer, aircraft.manufacturer)
        RETURNING id INTO v_aircraft_id;
    END IF;

    -- Upsert da ocorrência com deduplicação atômica pela chave (source_id, source_record_id)
    INSERT INTO occurrences (
        source_id,
        source_record_id,
        occurrence_type,
        visual_tag,
        verification_status,
        occurrence_date,
        occurrence_time,
        coordinates,
        country_iso,
        city,
        state_province,
        summary,
        aircraft_id,
        fatalities_total,
        updated_at
    )
    VALUES (
        v_source_id,
        p_source_record_id,
        p_occurrence_type,
        p_visual_tag,
        p_verification_status,
        p_occurrence_date,
        p_occurrence_time,
        ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326),
        p_country_iso,
        p_city,
        p_state,
        p_summary,
        v_aircraft_id,
        COALESCE(p_fatalities, 0),
        NOW()
    )
    ON CONFLICT (source_id, source_record_id) DO UPDATE
    SET visual_tag = EXCLUDED.visual_tag,
        verification_status = EXCLUDED.verification_status,
        coordinates = EXCLUDED.coordinates,
        summary = EXCLUDED.summary,
        fatalities_total = EXCLUDED.fatalities_total,
        updated_at = NOW()
    RETURNING id INTO v_occurrence_id;

    RETURN v_occurrence_id;
END;
$$ LANGUAGE plpgsql;

