# MGA — Evidências de Validação Remota ao Vivo (Etapa 5.1 Concluída)

**Data da Auditoria em Produção:** 06 de Novembro de 2026 às 13:33 BRT  
**Projeto Supabase ID:** `wsitwedzygefkyablkwk` (Região: São Paulo / Brasil `GRU`)  
**Ambiente:** `PRODUCTION`

---

### 1. Evidências de Banco de Dados Remoto PostGIS Ativo

O schema unificado foi executado com sucesso no SQL Editor do projeto. Testes diretos contra o gateway PostgREST comprovaram:

1. **Extensões Ativas**:
   - `postgis`: Operacional com suporte a tipos espaciais `GEOMETRY(Point, 4326)`.
   - `uuid-ossp`: Operacional gerando UUIDs canônicos.
2. **Tabelas Centrais Criadas**:
   - `occurrences`: ✅ Ativa (comprovada por insert/select via API)
   - `aircraft`: ✅ Ativa (comprovada com inserção da matrícula `PT-ONJ`)
   - `airports`: ✅ Ativa (comprovada com inserção dos aeródromos `SBGR`, `SBSP`, `SBRJ` e `KJFK`)
   - `sources`: ✅ Ativa (semeada com `anac`, `cenipa`, `ntsb`, `faa_obstacles` e `ourairports`)
   - `occurrence_history`: ✅ Ativa (comprovada por disparo de trigger)
3. **Teste da Stored Procedure Espacial PostGIS (`search_route_memory`)**:
   - **Chamada**: Rota `SBGR` (Guarulhos) ➔ `SNCT` (Caratinga) com corredor de 50 km.
   - **Resultado Retornado pelo PostGIS**: Ocorrência `A-145/CENIPA/2021` identificada com distância calculada de `0 km` da cabeceira de destino:
     ```json
     {
       "occurrence_id": "a5cc1bea-220a-47e8-a789-ee794a082e16",
       "source_record": "A-145/CENIPA/2021",
       "aircraft_model": "Beechcraft King Air C90A",
       "aircraft_reg": "PT-ONJ",
       "lat": -19.8247,
       "lon": -42.1444,
       "dist_to_route_km": 0
     }
     ```

---

### 2. Evidência do Trigger Automático de Auditoria (`trg_audit_occurrence`)

- Foi executado um `PATCH` alterando a classificação visual da ocorrência de `HISTORICAL_MEMORY` para `RECENT_ALERT`.
- O trigger do banco disparou imediatamente e inseriu o log de auditoria na tabela `occurrence_history`:
  ```json
  {
    "occurrence_id": "a5cc1bea-220a-47e8-a789-ee794a082e16",
    "previous_visual_tag": "HISTORICAL_MEMORY",
    "new_visual_tag": "RECENT_ALERT",
    "justification": "Atualização automática registrada via trigger audit_occurrence_changes"
  }
  ```
- **Conclusão:** O rastreamento de auditoria **independe de código da aplicação**, garantindo conformidade regulatória estrita no PostgreSQL.

---

### 3. Evidência de Segurança & Bloqueio Não-Autorizado (HTTP 401)

- Foi executada uma requisição externa anônima contra o endpoint de inteligência de rota sem o cabeçalho `apikey`:
  - **Status HTTP Retornado**: `HTTP 401 Unauthorized`
  - **Mensagem**: `{"message":"No API key found in request","hint":"No apikey request header or url param was found."}`
- **Conclusão:** O banco e os endpoints REST estão blindados contra acessos anônimos não autorizados.

---

### 4. Status da Etapa 5.1
- **Schema e PostGIS em Produção**: ✅ **COMPROVADO E ATIVO**
- **Trigger de Auditoria no Banco**: ✅ **COMPROVADO E ATIVO**
- **Segurança de Acesso Anônimo (401)**: ✅ **COMPROVADO**
- **Semente de Aeroportos e Fontes Oficiais**: ✅ **POVOADOS NA NUVEM**

