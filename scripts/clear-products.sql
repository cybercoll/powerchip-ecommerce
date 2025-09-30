-- Script para limpar todos os produtos do banco de dados
-- Execute este script no Supabase SQL Editor ou via linha de comando

-- Primeiro, remover todos os itens do carrinho que referenciam produtos
DELETE FROM cart_items;

-- Remover todos os itens de pedidos que referenciam produtos
DELETE FROM order_items;

-- Remover todos os produtos
DELETE FROM products;

-- Remover todas as categorias (opcional, mas vamos limpar tudo)
DELETE FROM categories;

-- Verificar se a limpeza foi bem-sucedida
SELECT 'Produtos restantes:' as info, COUNT(*) as count FROM products
UNION ALL
SELECT 'Categorias restantes:' as info, COUNT(*) as count FROM categories
UNION ALL
SELECT 'Itens do carrinho restantes:' as info, COUNT(*) as count FROM cart_items
UNION ALL
SELECT 'Itens de pedidos restantes:' as info, COUNT(*) as count FROM order_items;

SELECT 'Limpeza concluída!' as status;