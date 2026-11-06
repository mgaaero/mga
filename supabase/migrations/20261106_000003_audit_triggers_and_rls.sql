-- ==============================================================================
-- MEGA: Memória Geográfica da Aviação
-- Migration 00003: Trigger de Auditoria Automática & Row Level Security (RLS)
-- ==============================================================================

-- 1. TRIGGER AUTOMÁTICO DE AUDITORIA DE HISTÓRICO
-- Garante que QUALQUER alteração no banco (seja via ingestão, painel ou SQL direto)
-- seja registrada obrigatoriamente na tabela occurrence_history
CREATE OR REPLACE FUNCTION audit_occurrence_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.visual_tag IS DISTINCT FROM NEW.visual_tag) OR 
       (OLD.verification_status IS DISTINCT FROM NEW.verification_status) THEN
        INSERT INTO occurrence_history (
            occurrence_id,
            changed_by,
            previous_status,
            new_status,
            previous_visual_tag,
            new_visual_tag,
            justification
        )
        VALUES (
            NEW.id,
            auth.uid(),
            OLD.verification_status,
            NEW.verification_status,
            OLD.visual_tag,
            NEW.visual_tag,
            'Atualização automática registrada via trigger audit_occurrence_changes'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_occurrence ON occurrences;
CREATE TRIGGER trg_audit_occurrence
AFTER UPDATE ON occurrences
FOR EACH ROW
EXECUTE FUNCTION audit_occurrence_changes();

-- 2. HABILITAÇÃO E POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazards ENABLE ROW LEVEL SECURITY;
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE occurrence_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_import_jobs ENABLE ROW LEVEL SECURITY;

-- Consultas Públicas: Qualquer usuário ou piloto pode ler dados oficiais
CREATE POLICY "Public Read Occurrences" ON occurrences FOR SELECT USING (true);
CREATE POLICY "Public Read Aircraft" ON aircraft FOR SELECT USING (true);
CREATE POLICY "Public Read Hazards" ON hazards FOR SELECT USING (true);
CREATE POLICY "Public Read Airports" ON airports FOR SELECT USING (true);
CREATE POLICY "Public Read Sources" ON sources FOR SELECT USING (true);

-- Modificações e Auditoria: Somente usuários autenticados com role 'admin' ou Service Role
CREATE POLICY "Admin Modify Occurrences" ON occurrences 
FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin Read History" ON occurrence_history 
FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin Read Import Jobs" ON source_import_jobs 
FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'role' = 'admin');

