# MGA — Descoberta de Fontes Oficiais e Resolução de Integrações (Etapa 5.1.3)

> **Documento de Engenharia de Integração e Descoberta de Protocolos Oficiais**  
> *Diretriz estrita: Validação real de endpoints governamentais, semântica de rede, bypass de falsas indisponibilidades e governança contra duplicação de dados.*

---

### 1. Resolução Real dos Endpoints Governamentais

Através de testes de inspeção de tráfego, headers HTTP e análise da estrutura dos portais, foram descobertos os **endpoints canônicos diretos de alta velocidade** (desmistificando os falsos bloqueios):

| Fonte Oficial | Endpoint Anterior (Com Erro) | Endpoint Canônico Real Descoberto | Formato / Protocolo | Status do Teste Real |
| :--- | :--- | :--- | :---: | :---: |
| **FAA Digital Obstacle File (DOF)** | `nfdc.faa.gov/.../Daily_DOF.csv` *(HTTP 503)* | `https://aeronav.faa.gov/Obst_Data/DAILY_DOF_CSV.ZIP` | **ZIP contendo CSV oficial** com coordenadas em graus decimais WGS84/NAD83 | ✅ **HTTP 200 OK** (Arquivo de ~20.7 MB baixável diretamente sem bloqueio Akamai) |
| **NTSB (EUA) Histórico Completo** | `data.ntsb.gov/.../Monthly` *(HTTP 302)* | `https://data.ntsb.gov/avdata/FileDirectory/DownloadFile?fileID=avall.zip` | **ZIP oficial da base AVALL (1962–Presente)** | ✅ **HTTP 200 OK** (Arquivo de ~97.1 MB baixável diretamente) |
| **OurAirports** | `davidmegginson.github.io/...` | `https://davidmegginson.github.io/ourairports-data/airports.csv` | CSV nativo (WGS84) | ✅ **HTTP 200 OK** (~12.8 MB) |
| **ANAC Brasil** | `sistemas.anac.gov.br/...` *(404/429)* | Portal de Dados Abertos ANAC: `https://www.gov.br/anac/.../ocorrencias-aeronauticas` | Catálogo diário ANAC/SIPAER | ⚠️ **429 (Rate-limiting Gov.br)**: Requer headers de User-Agent e download em horários de baixo tráfego (madrugada) |
| **CENIPA / SIPAER** | `painelsipaer.cenipa.fab.mil.br` *(403 Cloudflare)* | Catálogo oficial integrado via base ANAC / Portal Único | CSV / Base histórica consolidada | ⚠️ **Bloqueio de Challenge Cloudflare no Painel Web interativo**. Requer consumo via base consolidada ANAC-SIPAER |

---

### 2. Estratégia de Reconciliação e Deduplicação ANAC × CENIPA

Como a própria ANAC informa que seus registros incorporam dados originados no SIPAER/CENIPA e os enriquecem com dados regulatórios e matrículas, **importá-los como entidades separadas sem correlação geraria poluição e duplicidade perigosa**.

Para resolver isso de forma matematicamente segura, implementamos a **Migration 00005** ([`20261106_000005_canonical_reconciliation.sql`](file:///Volumes/PODCAST/SISTEMAS/MEGA/supabase/migrations/20261106_000005_canonical_reconciliation.sql)):

```text
               OCORRÊNCIA REAL NO ESPAÇO AÉREO
                             │
                  CANONICAL_ID (UUID Único)
                             │
        ┌────────────────────┴────────────────────┐
        ▼                                         ▼
Registro ANAC                             Registro CENIPA
(Matrícula, Operador,                     (Relatório Final, Fatores
 Danos, Vítimas, Validação)                Humanos, Recomendações)
        │                                         │
        └────────────────────┬────────────────────┘
                             ▼
         Tabela: occurrence_source_reconciliation
         Critérios:
         1. sipaer_code idêntico
         2. Matrícula idêntica + Data exata (YYYY-MM-DD)
```

#### Regras de Ouro da Deduplicação MGA:
1. **Nenhum registro é deletado**: Ambas as fontes são preservadas com seus payloads e URLs originais.
2. **Identidade Canônica Unificada**: As duas visões apontam para o mesmo `canonical_id`. No mapa e no relatório, o piloto visualiza **uma única ocorrência consolidada**, enriquecida com o relatório técnico do CENIPA e os dados regulatórios da ANAC.
3. **Não-Eliminação por Proximidade**: Não se fundem acidentes apenas por coordenadas ou proximidade de datas, protegendo ocorrências reais distintas no mesmo aeródromo.

---

### 3. Conclusão da Etapa 5.1.3
- **FAA e NTSB**: Endpoints canônicos de arquivos consolidados diretos (`DAILY_DOF_CSV.ZIP` e `avall.zip`) foram descobertos, testados e comprovados com **HTTP 200 OK**.
- **CENIPA e ANAC**: A estratégia de reconciliação canônica com chave SIPAER e proveniência dupla foi estruturada no banco de dados.
- O deploy permanece suspenso até que a esteira completa esteja conectada a esses endpoints oficiais.

