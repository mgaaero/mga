# MGA — Memória Geográfica da Aviação
### AVIATION INTELLIGENCE
> **A história de cada lugar. A informação para o próximo voo.**  
> *Conhecimento aeronáutico conectado à geografia, à história e à inteligência.*

O **MGA** (Memória Geográfica da Aviação) é uma plataforma global de inteligência geográfica aeronáutica (*Aviation Intelligence*) dedicada a registrar, relacionar e consultar dados de segurança operacional, investigações históricas, obstáculos territoriais e auxílios à navegação ao longo de rotas aéreas e corredores de voo.

---

### 🏛️ Pilares Estratégicos Oficiais

```text
       MGA — AVIATION INTELLIGENCE
  HISTÓRIA · GEOGRAFIA · INTELIGÊNCIA AERONÁUTICA
                     │
 ┌───────────────────┼───────────────────┐
 ▼                   ▼                   ▼
MGA Memory          MGA Map             MGA Routes
(Memória Histórica  (Inteligência       (Inteligência
 e Investigações)    Geográfica PostGIS) de Rotas e Preflight)
```

1. **Memória**: Preservação perene de registros aeronáuticos oficiais documentados (acidentes históricos nunca expiram).
2. **Geografia**: Modelagem precisa baseada no elipsoide **WGS84 Karney (GeographicLib)** e análise de proximidade no PostGIS.
3. **Inteligência**: Síntese analítica baseada estritamente em evidências e relatórios finais (CENIPA, NTSB, ANAC, FAA).
4. **Tecnologia**: Arquitetura monorepo moderna em TypeScript com Supabase PostGIS, Deno Edge Functions e interface Cockpit EFB.
5. **Confiabilidade & Rastreabilidade**: Cada ocorrência traz seu identificador de processo oficial, agência de investigação e URL do relatório.

---

### ⚠️ Princípios Fundamentais & Não-Objetivos

1. **Não é rastreamento em tempo real**: O MGA não rastreia voos civis nem substitui sistemas ADS-B.
2. **Não substitui sistemas oficiais**: O MGA é uma camada complementar de inteligência e **não substitui NOTAMs, cartas aeronáuticas IFR/VFR, AIS ou despacho oficial homologado**.
3. **Classificação visual de 4 estados**:
   - 🔴 **`RECENT_ALERT`**: Ocorrência recente (< 90 dias) ou perigo ativo em validação preliminar.
   - 🟠 **`IDENTIFIED_HAZARD`**: Obstáculos (torres, antenas, linhas de transmissão) que exigem atenção.
   - ⚪ **`HISTORICAL_MEMORY`**: Acidentes históricos preservados para consulta perpétua.
   - 🟢 **`MITIGATED_REMOVED`**: Riscos documentadamente eliminados ou mitigados pelo órgão competente.

---

### 📦 Estrutura do Monorepo (`mga-aviation`)

```text
mga-aviation/
├── apps/
│   ├── web/          # Aplicação Web Cockpit EFB (Vite React + Leaflet Dark)
│   ├── admin/        # Console de Auditoria e Ingestão
│   └── portal/       # Portal do Piloto e Assinaturas Geográficas
├── packages/
│   ├── types/        # Contratos canônicos TypeScript (@mga/types)
│   ├── shared/       # Lógica compartilhada, seed e RouteIntelligenceService
│   ├── geospatial/   # Motor WGS84 Karney (GeographicLib) + Turf.js
│   └── ui/           # Componentes do Cockpit EFB
├── data-pipeline/    # Conectores ANAC, CENIPA, NTSB, FAA e OurAirports
├── supabase/         # Migrations PostGIS, Edge Functions e Triggers
└── docs/             # Arquitetura e especificações do sistema
```
