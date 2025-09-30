import { FullConfig } from '@playwright/test';
import { DatabaseService } from '../src/lib/database';
import fs from 'fs/promises';
import path from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Iniciando limpeza global dos testes...');
  
  // Limpar dados de teste do banco
  await cleanupTestDatabase();
  
  // Limpar arquivos temporários
  await cleanupTempFiles();
  
  // Gerar relatório de cobertura
  await generateCoverageReport();
  
  // Arquivar resultados dos testes
  await archiveTestResults();
  
  console.log('✅ Limpeza global concluída!');
}

async function cleanupTestDatabase() {
  console.log('🗑️ Limpando dados de teste do banco...');
  
  try {
    const db = new DatabaseService();
    
    // Remover itens de pedidos de teste
    await db.query(`
      DELETE FROM order_items WHERE order_id IN (
        SELECT id FROM orders WHERE user_id IN (
          SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%@powerchip.com.br'
        )
      )
    `);
    
    // Remover pedidos de teste
    await db.query(`
      DELETE FROM orders WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%@powerchip.com.br'
      )
    `);
    
    // Remover itens do carrinho de teste
    await db.query(`
      DELETE FROM cart_items WHERE user_id IN (
        SELECT id FROM users WHERE email LIKE '%test%' OR email LIKE '%@powerchip.com.br'
      )
    `);
    
    // Remover usuários de teste
    await db.query(`
      DELETE FROM users WHERE email LIKE '%test%' OR email LIKE '%@powerchip.com.br'
    `);
    
    // Remover produtos de teste
    await db.query(`
      DELETE FROM products WHERE name LIKE '%Teste%'
    `);
    
    console.log('✅ Dados de teste removidos do banco');
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
    // Não falhar o teardown por erro de limpeza
  }
}

async function cleanupTempFiles() {
  console.log('📁 Limpando arquivos temporários...');
  
  try {
    const tempDirs = [
      'temp',
      'tmp',
      '.next/cache',
      'node_modules/.cache'
    ];
    
    for (const dir of tempDirs) {
      try {
        const fullPath = path.resolve(dir);
        await fs.access(fullPath);
        
        // Remover apenas arquivos de teste
        const files = await fs.readdir(fullPath);
        for (const file of files) {
          if (file.includes('test') || file.includes('spec')) {
            await fs.unlink(path.join(fullPath, file));
          }
        }
      } catch {
        // Diretório não existe, ignorar
      }
    }
    
    console.log('✅ Arquivos temporários limpos');
  } catch (error) {
    console.error('❌ Erro ao limpar arquivos temporários:', error);
  }
}

async function generateCoverageReport() {
  console.log('📊 Gerando relatório de cobertura...');
  
  try {
    const coverageDir = 'coverage';
    const reportPath = path.join(coverageDir, 'summary.json');
    
    // Verificar se existe relatório de cobertura
    try {
      await fs.access(reportPath);
      
      const coverage = JSON.parse(await fs.readFile(reportPath, 'utf-8'));
      
      console.log('📈 Resumo da Cobertura:');
      console.log(`   Linhas: ${coverage.total?.lines?.pct || 0}%`);
      console.log(`   Funções: ${coverage.total?.functions?.pct || 0}%`);
      console.log(`   Branches: ${coverage.total?.branches?.pct || 0}%`);
      console.log(`   Statements: ${coverage.total?.statements?.pct || 0}%`);
      
    } catch {
      console.log('ℹ️ Relatório de cobertura não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao gerar relatório de cobertura:', error);
  }
}

async function archiveTestResults() {
  console.log('📦 Arquivando resultados dos testes...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const archiveDir = path.join('test-archives', timestamp);
    
    // Criar diretório de arquivo
    await fs.mkdir(archiveDir, { recursive: true });
    
    // Arquivos para arquivar
    const filesToArchive = [
      'test-results/results.json',
      'test-results/results.xml',
      'playwright-report/index.html',
      'coverage/lcov-report/index.html'
    ];
    
    for (const file of filesToArchive) {
      try {
        await fs.access(file);
        const fileName = path.basename(file);
        await fs.copyFile(file, path.join(archiveDir, fileName));
      } catch {
        // Arquivo não existe, ignorar
      }
    }
    
    // Criar resumo do teste
    const summary = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'test',
      baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
      browser: 'chromium, firefox, webkit',
      testFiles: await getTestFilesList(),
      duration: process.env.TEST_DURATION || 'unknown'
    };
    
    await fs.writeFile(
      path.join(archiveDir, 'summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`✅ Resultados arquivados em: ${archiveDir}`);
    
    // Limpar arquivos antigos (manter apenas os últimos 10)
    await cleanupOldArchives();
    
  } catch (error) {
    console.error('❌ Erro ao arquivar resultados:', error);
  }
}

async function getTestFilesList(): Promise<string[]> {
  try {
    const testDir = 'tests/e2e';
    const files = await fs.readdir(testDir);
    return files.filter(file => file.endsWith('.spec.ts') || file.endsWith('.test.ts'));
  } catch {
    return [];
  }
}

async function cleanupOldArchives() {
  try {
    const archiveDir = 'test-archives';
    const archives = await fs.readdir(archiveDir);
    
    // Ordenar por data (mais recente primeiro)
    archives.sort().reverse();
    
    // Manter apenas os 10 mais recentes
    const toDelete = archives.slice(10);
    
    for (const archive of toDelete) {
      const archivePath = path.join(archiveDir, archive);
      await fs.rmdir(archivePath, { recursive: true });
    }
    
    if (toDelete.length > 0) {
      console.log(`🗑️ Removidos ${toDelete.length} arquivos antigos`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar arquivos antigos:', error);
  }
}

export default globalTeardown;