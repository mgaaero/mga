# MGA — Auditoria de Qualidade e Confiabilidade das Fontes Oficiais (Etapa 5.1.2)

> **Documento Normativo de Governança de Dados Aeronáuticos**  
> *Critério: Nenhuma fonte é considerada operacionalmente confiável sem validação real de endpoint, semântica de campos, datum e integridade temporal.*

---

### 1. Matriz de Auditoria e Confiabilidade das Fontes

| Fonte Oficial | URL Oficial Auditada | Status Conexão HTTP | Formato Real | Datum / Coordenadas | Semântica de Atualização / Descarte | Status MGA |
| :--- | :--- | :---: | :---: | :---: | :--- | :---: |
| **ANAC Brasil** | `sistemas.anac.gov.br/...` | ⚠️ **404 Not Found** (Requer rota atualizada portal ANAC Dados Abertos) | CSV (ponto e vírgula `;`, vírgula decimal) | SIRGAS2000 / WGS84 graus decimais | Atualização diária pelo catálogo. Campo `Numero_da_Ocorrencia` é estável. | **REPROVADO / PENDENTE URL ATIVA** |
| **OurAirports** | `davidmegginson.github.io/ourairports-data/airports.csv` | ✅ **HTTP 200 OK** (Atualizado diariamente) | CSV (vírgula `,`, aspas duplas) | WGS84 puro (lat/lon graus) + Elevação MSL (ft) | Base comunitária com links Wikipedia/Gov. Requer conferência com AIS oficial. | **APROVADO (COM RESSALVA NÃO-OFICIAL)** |
| **CENIPA / SIPAER** | `dados.gov.br` / Catalogo CENIPA | ⚠️ **Redirect / Endpoint dinâmico** | CSV / JSON | SIRGAS2000 / WGS84 | Relatórios finais SIPAER. Campo `codigo_ocorrencia` estável. | **PENDENTE DE URL FIXA DADOS.GOV.BR** |
| **FAA DOF** | `nfdc.faa.gov/.../Daily_DOF.csv` | ⚠️ **HTTP 503 / Akamai Block** (Requer User-Agent oficial ou ciclo 56 dias) | CSV / Formato colunar fixo DOF | NAD83 / WGS84 compatível | Ação `Action`: `'A'` (Added), `'C'` (Changed), `'D'` (Dismantled). **Atenção:** `'D'` exige conferência com NOTAM de remoção. | **PENDENTE DE PROXY / USER-AGENT HOMOLOGADO** |
| **NTSB CAROL** | `data.ntsb.gov/carol-rep-public/...` | ⚠️ **HTTP 302 Redirect** (Requer endpoint de exportação estático CAROL) | JSON / OData | WGS84 | Investigações americanas desde 1962. Campo `NtsbNo` ou `ev_id` único. | **PENDENTE DE ENDPOINT DE EXPORTAÇÃO COMPLETA** |

---

### 2. Análise Detalhada dos Pontos Críticos

#### 2.1. Ocorrência Histórica vs. Perigo Operacional Atual
- **Regra Fundamental**: A ocorrência de um acidente no passado em determinada coordenada **jamais é tratada como perigo ativo contínuo**.
- Ela é arquivada como `HISTORICAL_MEMORY` (⚪), exibindo o relatório da investigação final, as causas contribuintes e as recomendações de segurança emitidas na época.
- Somente perigos físicos permanentes (ex: a linha de transmissão de energia não balizada ou antena estaiada) são classificados como `IDENTIFIED_HAZARD` (🟠), desde que cadastrados nos arquivos de obstáculos.

#### 2.2. Semântica da Ação FAA (`Action = 'D'`)
- Nos arquivos *Digital Obstacle File* da FAA, a letra `'D'` indica *Dismantled* (desmontado/demolido).
- **Diretriz MGA**: O obstáculo é marcado como `REMOVED_DEMOLISHED` (🟢) para fins de rastreabilidade histórica, mas **removido dos cálculos de ameaça ativa de voo**. Ele nunca é excluído silenciosamente da base.

#### 2.3. Resoluções Verticais e Datums
- **Altimetria**: Elevações de aeródromos e pistas provêm de levantamentos geodésicos oficiais (AMSL / Mean Sea Level).
- **Obstáculos**: Alturas de estruturas são registradas em dois campos separados:
  1. `height_agl_ft`: Altura Acima do Nível do Solo (*Above Ground Level*).
  2. `height_amsl_ft`: Altitude Acima do Nível Médio do Mar (*Above Mean Sea Level*).
  *Nunca somar ou confundir AGL com AMSL nos perfis de voo.*

---

### 3. Veredito da Etapa 5.1.2: Qualidade de Fontes
- **Apenas o conector OurAirports está ativo e respondendo diretamente (HTTP 200)**.
- Os endpoints públicos da **ANAC, FAA, CENIPA e NTSB** sofreram alterações de URL em seus respectivos portais governamentais nos últimos ciclos e necessitam do mapeamento dos links estáveis de dados abertos antes de qualquer deploy em produção.
- **Conclusão:** O deploy de produção permanece **suspenso** até que os links de ingestão direta das agências sejam revalidados em homologação.

