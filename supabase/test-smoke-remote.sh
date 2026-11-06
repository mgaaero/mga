#!/usr/bin/env bash
# ==============================================================================
# MGA — Script de Teste Automatizado de Smoke Test Remoto
# Uso: ./supabase/test-smoke-remote.sh <PROJECT_REF> <CRON_SECRET>
# ==============================================================================

set -e

PROJECT_REF="$1"
CRON_SECRET="$2"

if [ -z "$PROJECT_REF" ] || [ -z "$CRON_SECRET" ]; then
    echo "Uso: $0 <PROJECT_REF> <CRON_SECRET>"
    exit 1
fi

BASE_URL="https://${PROJECT_REF}.supabase.co/functions/v1"

echo "=== [TESTE 1] Teste de Segurança: Chamada Anônima sem Autenticação ==="
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/ingest-anac")
echo "HTTP Status Retornado: $HTTP_CODE"
if [ "$HTTP_CODE" -eq 401 ]; then
    echo "✅ SUCESSO: Endpoint protegido retornou HTTP 401 Unauthorized."
else
    echo "❌ FALHA: Endpoint exposto publicamente sem autenticação!"
    exit 1
fi

echo ""
echo "=== [TESTE 2] Teste de Execução com Segredo Autorizado do Cron ==="
RES=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "${BASE_URL}/ingest-anac" \
    -H "Content-Type: application/json" \
    -H "x-cron-secret: ${CRON_SECRET}")

HTTP_STATUS=$(echo "$RES" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$RES" | grep -v "HTTP_STATUS:")

echo "HTTP Status Retornado: $HTTP_STATUS"
echo "Resposta: $BODY"

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo "✅ SUCESSO: Ingestão autorizada executada e registrada com sucesso."
else
    echo "⚠️ Resposta com erro ou status inesperado: $HTTP_STATUS"
fi

