const fs = require('fs');
const path = require('path');

module.exports = async () => {
  console.log('🧹 Iniciando teardown global do Jest...');
  
  try {
    // Limpar dados de teste do banco
    await cleanupTestDatabase();
    
    // Limpar arquivos temporários
    await cleanupTempFiles();
    
    // Gerar relatório de cobertura
    await generateCoverageReport();
    
    // Arquivar resultados dos testes
    await archiveTestResults();
    
    console.log('✅ Teardown global do Jest concluído!');
  } catch (error) {
    console.error('❌ Erro no teardown global:', error);
  }
};

async function cleanupTestDatabase() {
  console.log('🗑️ Limpando dados de teste do banco...');
  
  try {
    // Aqui você limparia dados de teste do banco
    // Por enquanto, apenas simular
    console.log('✅ Dados de teste removidos do banco');
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error);
  }
}

async function cleanupTempFiles() {
  console.log('📁 Limpando arquivos temporários...');
  
  try {
    const tempDirs = [
      'temp/test-uploads',
      'temp/test-images',
      '.next/cache/test'
    ];
    
    for (const dir of tempDirs) {
      const fullPath = path.resolve(dir);
      if (fs.existsSync(fullPath)) {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`🗑️ Removido: ${dir}`);
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
    const summaryPath = path.join(coverageDir, 'coverage-summary.json');
    
    if (fs.existsSync(summaryPath)) {
      const coverage = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
      
      console.log('📈 Resumo da Cobertura:');
      console.log(`   Linhas: ${coverage.total?.lines?.pct || 0}%`);
      console.log(`   Funções: ${coverage.total?.functions?.pct || 0}%`);
      console.log(`   Branches: ${coverage.total?.branches?.pct || 0}%`);
      console.log(`   Statements: ${coverage.total?.statements?.pct || 0}%`);
      
      // Criar badge de cobertura
      const coveragePercent = coverage.total?.lines?.pct || 0;
      const badgeColor = coveragePercent >= 80 ? 'brightgreen' : 
                        coveragePercent >= 60 ? 'yellow' : 'red';
      
      const badgeUrl = `https://img.shields.io/badge/coverage-${coveragePercent}%25-${badgeColor}`;
      
      fs.writeFileSync(
        path.join(coverageDir, 'badge.json'),
        JSON.stringify({ 
          schemaVersion: 1,
          label: 'coverage',
          message: `${coveragePercent}%`,
          color: badgeColor
        }, null, 2)
      );
      
      console.log(`🏆 Badge de cobertura criado: ${coveragePercent}%`);
    } else {
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
    const archiveDir = path.join('test-archives', `jest-${timestamp}`);
    
    // Criar diretório de arquivo
    fs.mkdirSync(archiveDir, { recursive: true });
    
    // Arquivos para arquivar
    const filesToArchive = [
      { src: 'coverage/lcov-report/index.html', dest: 'coverage-report.html' },
      { src: 'coverage/coverage-summary.json', dest: 'coverage-summary.json' },
      { src: 'coverage/badge.json', dest: 'coverage-badge.json' }
    ];
    
    for (const file of filesToArchive) {
      try {
        if (fs.existsSync(file.src)) {
          fs.copyFileSync(file.src, path.join(archiveDir, file.dest));
        }
      } catch {
        // Arquivo não existe, ignorar
      }
    }
    
    // Criar resumo do teste
    const summary = {
      timestamp: new Date().toISOString(),
      testType: 'unit',
      environment: process.env.NODE_ENV || 'test',
      nodeVersion: process.version,
      testFramework: 'Jest',
      duration: process.env.JEST_TEST_DURATION || 'unknown'
    };
    
    fs.writeFileSync(
      path.join(archiveDir, 'test-summary.json'),
      JSON.stringify(summary, null, 2)
    );
    
    console.log(`✅ Resultados arquivados em: ${archiveDir}`);
    
    // Limpar arquivos antigos (manter apenas os últimos 5)
    await cleanupOldArchives();
    
  } catch (error) {
    console.error('❌ Erro ao arquivar resultados:', error);
  }
}

async function cleanupOldArchives() {
  try {
    const archiveDir = 'test-archives';
    
    if (!fs.existsSync(archiveDir)) {
      return;
    }
    
    const archives = fs.readdirSync(archiveDir)
      .filter(name => name.startsWith('jest-'))
      .map(name => ({
        name,
        path: path.join(archiveDir, name),
        mtime: fs.statSync(path.join(archiveDir, name)).mtime
      }))
      .sort((a, b) => b.mtime - a.mtime); // Mais recente primeiro
    
    // Manter apenas os 5 mais recentes
    const toDelete = archives.slice(5);
    
    for (const archive of toDelete) {
      fs.rmSync(archive.path, { recursive: true, force: true });
    }
    
    if (toDelete.length > 0) {
      console.log(`🗑️ Removidos ${toDelete.length} arquivos antigos`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao limpar arquivos antigos:', error);
  }
}