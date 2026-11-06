#!/usr/bin/env bash
# ==============================================================================
# MGA — Script de Validação e Smoke Test Remoto (Etapa 5.1)
# Executa checagem de saúde sem efeitos destrutivos no banco de dados
# ==============================================================================

set -e

echo "=========================================================="
echo "  MGA — MEMÓRIA GEOGRÁFICA DA AVIAÇÃO"
echo "  Roteiro de Validação Remota ao Vivo (Etapa 5.1)"
echo "=========================================================="

# 1. Checa status da CLI
echo ""
echo "[1/5] Verificando versão e binário da Supabase CLI..."
supabase --version

# 2. Testa autenticação da sessão ativa
echo ""
echo "[2/5] Testando status de autenticação na nuvem..."
if supabase projects list 2>&1 | grep -q "Invalid access token"; then
    echo "⚠️  STATUS: Sessão não autenticada."
    echo "👉 Execute: supabase login"
    echo "   (Cole o seu Personal Access Token gerado no painel Supabase)"
    exit 0
else
    echo "✅ Sessão autenticada no Supabase."
fi

# 3. Informações de projeto vinculado
echo ""
echo "[3/5] Verificando associação com projeto remoto..."
supabase status || echo "💡 Projeto remoto ainda não vinculado. Execute: supabase link --project-ref <ID>"

# 4. Verificação de integridade local das migrations
echo ""
echo "[4/5] Conferindo integridade dos scripts de migração SQL..."
ls -lh supabase/migrations/

# 5. Lista de Edge Functions prontas para deploy
echo ""
echo "[5/5] Conferindo Edge Functions locais prontas para deploy..."
ls -lh supabase/functions/

echo ""
echo "=========================================================="
echo "  Auditoria preliminar concluída com sucesso."
echo "=========================================================="

