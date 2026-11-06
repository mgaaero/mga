-- ==============================================================================
-- MEGA: Memória Geográfica da Aviação
-- Migration 00001: Schema Fundamental com PostGIS, Ocorrências, Aeronaves e Perigos
-- ==============================================================================

-- Habilita extensão PostGIS para consultas espaciais e geodésicas
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TIPOS ENUMERADOS
CREATE TYPE occurrence_type AS ENUM ('ACCIDENT', 'SERIOUS_INCIDENT', 'INCIDENT', 'AIR_PROXIMITY', 'HAZARD_ALERT');
CREATE TYPE occurrence_severity AS ENUM ('CATASTROPHIC', 'CRITICAL', 'MAJOR', 'MINOR', 'NONE', 'UNKNOWN');
CREATE TYPE verification_status AS ENUM ('PRELIMINARY', 'INVESTIGATION_ONGOING', 'FINAL_REPORT_CONFIRMED', 'UNVERIFIED');
CREATE TYPE visual_classification AS ENUM ('RECENT_ALERT', 'IDENTIFIED_HAZARD', 'HISTORICAL_MEMORY', 'MITIGATED_REMOVED');
CREATE TYPE hazard_type AS ENUM ('TRANSMISSION_LINE', 'COMMUNICATION_TOWER', 'ANTENNA', 'WIND_TURBINE', 'TERRAIN_OBSTACLE', 'BUILDING', 'CABLE_SUSPENDED', 'OTHER');
CREATE TYPE hazard_status AS ENUM ('ACTIVE_EXISTING', 'REMOVED_DEMOLISHED', 'TEMPORARY', 'UNCONFIRMED');

-- 2. OPERADORES E EMPRESAS AÉREAS
CREATE TABLE IF NOT EXISTS operators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    country_iso VARCHAR(3),
    icao_code VARCHAR(4),
    iata_code VARCHAR(3),
    operation_type VARCHAR(100), -- Comercial Regular, Táxi Aéreo, Privada, Carga
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AERONAVES ENVOLVIDAS
CREATE TABLE IF NOT EXISTS aircraft (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration VARCHAR(20) NOT NULL, -- Matrícula (ex: PT-XXX, N12345)
    serial_number VARCHAR(100),
    model VARCHAR(150) NOT NULL,       -- ex: B737-800, PA-34 Seneca
    manufacturer VARCHAR(150),        -- ex: Boeing, Embraer, Piper
    aircraft_category VARCHAR(50),    -- Avião, Helicóptero, Planador
    engine_type VARCHAR(50),          -- Pistão, Turboélice, Turbofan
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_aircraft_registration ON aircraft(registration);

-- 4. FONTES OFICIAIS DE DADOS
CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL, -- 'cenipa', 'anac', 'ntsb', 'faa_obstacles', 'icao'
    name VARCHAR(255) NOT NULL,
    official_agency VARCHAR(255) NOT NULL,
    country_iso VARCHAR(3) NOT NULL,
    base_url TEXT,
    license_type TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. OCORRÊNCIAS HISTÓRICAS E GEOGRÁFICAS
CREATE TABLE IF NOT EXISTS occurrences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES sources(id),
    source_record_id VARCHAR(150) NOT NULL, -- Número oficial no CENIPA ou NTSB
    occurrence_type occurrence_type NOT NULL,
    severity occurrence_severity DEFAULT 'UNKNOWN',
    visual_tag visual_classification NOT NULL DEFAULT 'HISTORICAL_MEMORY',
    verification_status verification_status DEFAULT 'PRELIMINARY',
    
    occurrence_date DATE NOT NULL,
    occurrence_time TIME,
    
    -- Localização Geográfica (PostGIS)
    location_description TEXT,
    city VARCHAR(150),
    state_province VARCHAR(100),
    country_iso VARCHAR(3) NOT NULL,
    coordinates GEOMETRY(Point, 4326) NOT NULL, -- WGS84 EPSG:4326
    elevation_ft NUMERIC(8,2),
    
    -- Dados da Aeronave e Voo
    aircraft_id UUID REFERENCES aircraft(id),
    operator_id UUID REFERENCES operators(id),
    flight_phase VARCHAR(100), -- Decolagem, Cruzeiro, Aproximação, Pouso
    flight_nature VARCHAR(100), -- Comercial, Instrução, Privada, Carga
    flight_number VARCHAR(50),
    
    -- Danos e Vítimas
    aircraft_damage VARCHAR(50),
    fatalities_total INT DEFAULT 0,
    serious_injuries_total INT DEFAULT 0,
    minor_injuries_total INT DEFAULT 0,
    uninjured_total INT DEFAULT 0,
    
    -- Narrativa e Relatório Oficial
    summary TEXT,
    investigation_findings TEXT,
    official_report_url TEXT,
    official_report_published_date DATE,
    has_public_figures BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_source_occurrence UNIQUE (source_id, source_record_id)
);

-- Índice Espacial GiST para consultas por raio e rota de altíssima performance
CREATE INDEX idx_occurrences_coordinates ON occurrences USING GIST(coordinates);
CREATE INDEX idx_occurrences_date ON occurrences(occurrence_date DESC);
CREATE INDEX idx_occurrences_visual_tag ON occurrences(visual_tag);

-- 6. PESSOAS PUBLICAMENTE IDENTIFICADAS EM REGISTROS OFICIAIS
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    occurrence_id UUID REFERENCES occurrences(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(100), -- Piloto, Copiloto, Passageiro, Figura Pública
    public_significance TEXT, -- Notoriedade pública documentada
    source_reference TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_people_occurrence ON people(occurrence_id);

-- 7. OBSTÁCULOS E PERIGOS REAIS
CREATE TABLE IF NOT EXISTS hazards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES sources(id),
    source_hazard_id VARCHAR(150),
    hazard_type hazard_type NOT NULL,
    status hazard_status DEFAULT 'ACTIVE_EXISTING',
    description TEXT,
    
    coordinates GEOMETRY(Point, 4326) NOT NULL,
    height_agl_ft NUMERIC(8,2), -- Altura acima do solo
    height_amsl_ft NUMERIC(8,2), -- Altitude acima do nível médio do mar
    lighting_type VARCHAR(100),
    marking_type VARCHAR(100),
    
    city VARCHAR(150),
    state_province VARCHAR(100),
    country_iso VARCHAR(3) NOT NULL,
    
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_hazards_coordinates ON hazards USING GIST(coordinates);
CREATE INDEX idx_hazards_status ON hazards(status);

-- 8. CONSULTAS PRÉ-VOO REALIZADAS POR PILOTOS (CACHE & AUDITORIA)
CREATE TABLE IF NOT EXISTS route_queries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Opcional caso consulta anônima pública
    origin_icao VARCHAR(4),
    origin_name VARCHAR(150),
    destination_icao VARCHAR(4),
    destination_name VARCHAR(150),
    corridor_buffer_km NUMERIC(6,2) DEFAULT 40.0, -- Corredor lateral em km
    route_geometry GEOMETRY(LineString, 4326),
    occurrences_found INT DEFAULT 0,
    hazards_found INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_route_queries_geometry ON route_queries USING GIST(route_geometry);

-- 9. FUNÇÃO POSTGIS: BUSCA DE MEMÓRIA EM CORREDOR DE ROTA (PRE-FLIGHT INTELLIGENCE)
CREATE OR REPLACE FUNCTION search_route_memory(
    origin_lat FLOAT,
    origin_lon FLOAT,
    dest_lat FLOAT,
    dest_lon FLOAT,
    corridor_km FLOAT DEFAULT 40.0
)
RETURNS TABLE (
    occurrence_id UUID,
    occurrence_date DATE,
    source_record VARCHAR,
    occurrence_type occurrence_type,
    visual_tag visual_classification,
    aircraft_model VARCHAR,
    aircraft_reg VARCHAR,
    location_desc TEXT,
    lat FLOAT,
    lon FLOAT,
    dist_to_route_km FLOAT,
    fatalities INT,
    summary TEXT
) AS $$
DECLARE
    route_line GEOMETRY;
BEGIN
    -- Constrói a linha Great Circle / Linha Reta entre origem e destino
    route_line := ST_SetSRID(ST_MakeLine(ST_MakePoint(origin_lon, origin_lat), ST_MakePoint(dest_lon, dest_lat)), 4326);

    RETURN QUERY
    SELECT 
        o.id AS occurrence_id,
        o.occurrence_date,
        o.source_record_id AS source_record,
        o.occurrence_type,
        o.visual_tag,
        a.model AS aircraft_model,
        a.registration AS aircraft_reg,
        o.location_description AS location_desc,
        ST_Y(o.coordinates::geometry) AS lat,
        ST_X(o.coordinates::geometry) AS lon,
        (ST_Distance(o.coordinates::geography, route_line::geography) / 1000.0)::FLOAT AS dist_to_route_km,
        o.fatalities_total AS fatalities,
        o.summary
    FROM occurrences o
    LEFT JOIN aircraft a ON o.aircraft_id = a.id
    WHERE ST_DWithin(o.coordinates::geography, route_line::geography, corridor_km * 1000.0)
    ORDER BY dist_to_route_km ASC, o.occurrence_date DESC;
END;
$$ LANGUAGE plpgsql STABLE;

