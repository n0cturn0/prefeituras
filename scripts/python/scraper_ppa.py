#!/usr/bin/env python3
"""
Scraper de PPA (Plano Plurianual) Externo

Este script extrai dados de PPAs de prefeituras brasileiras via scraping.
Suporta:
- PDFs de PPAs (usando pdfplumber)
- Páginas HTML de portais de transparência (usando BeautifulSoup)

Uso:
    python3 scraper_ppa.py <url> [--dry-run]

Args:
    url: URL do PPA (PDF ou HTML)
    --dry-run: Apenas analisa sem processar

Retorno:
    JSON com dados formatados para o modelo Laravel
"""

import sys
import json
import argparse
import re
from typing import Dict, List, Any, Optional
from urllib.parse import urlparse, urljoin

import requests
from bs4 import BeautifulSoup

# Tentar importar pdfplumber (opcional)
try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

# Headers amigáveis para scraping
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/pdf,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
}


class PpaScraper:
    """
    Classe principal para scraping de PPA.
    
    Detecta o tipo de conteúdo (PDF ou HTML) e delega para o extractor correto.
    """
    
    def __init__(self, url: str, dry_run: bool = False):
        self.url = url
        self.dry_run = dry_run
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        
        # Metadados do scraping
        self.metadata = {
            'url': url,
            'tipo_conteudo': None,
            'municipio': None,
            'programas_count': 0,
            'acoes_count': 0,
            'indicadores_count': 0,
        }
        
        # Dados extraídos
        self.data = {
            'ppa': {},
            'programas': [],
            'acoes': [],
            'indicadores': [],
        }
    
    def scrape(self) -> Dict[str, Any]:
        """
        Executa o scraping completo.
        
        Returns:
            Dict com 'success', 'data' e 'metadata'
        """
        try:
            # 1. Verificar se URL é acessível
            response = self.session.get(self.url, timeout=30, stream=True)
            response.raise_for_status()
            
            content_type = response.headers.get('Content-Type', '').lower()
            
            # 2. Detectar tipo de conteúdo
            if 'pdf' in content_type or self.url.lower().endswith('.pdf'):
                self.metadata['tipo_conteudo'] = 'pdf'
                return self._scrape_pdf(response.content)
            elif 'html' in content_type or 'text/html' in content_type:
                self.metadata['tipo_conteudo'] = 'html'
                return self._scrape_html(response.text)
            else:
                # Tentar detectar pelo conteúdo
                content = response.content[:1000]
                if b'%PDF' in content or b'PDF-' in content:
                    self.metadata['tipo_conteudo'] = 'pdf'
                    return self._scrape_pdf(response.content)
                else:
                    self.metadata['tipo_conteudo'] = 'html'
                    return self._scrape_html(response.text[:50000])
                    
        except requests.exceptions.RequestException as e:
            return self._error(f'Erro ao acessar URL: {str(e)}')
        except Exception as e:
            return self._error(f'Erro inesperado: {str(e)}')
    
    def _scrape_pdf(self, content: bytes) -> Dict[str, Any]:
        """Extrai dados de um PDF de PPA."""
        
        if not PDFPLUMBER_AVAILABLE:
            return self._error(
                'pdfplumber não está instalado. Execute: pip install pdfplumber'
            )
        
        # Salvar PDF temporariamente
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            # Extrair texto do PDF
            texto_completo = ''
            tabelas = []
            
            with pdfplumber.open(tmp_path) as pdf:
                for page in pdf.pages:
                    texto = page.extract_text()
                    if texto:
                        texto_completo += texto + '\n'
                    
                    # Extrair tabelas
                    tables = page.extract_tables()
                    if tables:
                        tabelas.extend(tables)
            
            # Processar texto e tabelas
            self._processar_texto_ppa(texto_completo, tabelas)
            
            return self._success()
            
        finally:
            # Limpar arquivo temporário
            os.unlink(tmp_path)
    
    def _scrape_html(self, html: str) -> Dict[str, Any]:
        """Extrai dados de uma página HTML de PPA."""
        
        soup = BeautifulSoup(html, 'lxml')
        
        # Tentar identificar o município
        municipio = self._extrair_municipio(soup)
        self.metadata['municipio'] = municipio
        
        # Tentar encontrar tabelas de programas
        tabelas = soup.find_all('table')
        
        # Processar cada tabela
        for tabela in tabelas:
            self._processar_tabela_html(tabela)
        
        # Se não encontrou programas em tabelas, tentar extrair de outras formas
        if not self.data['programas']:
            self._processar_texto_html(soup.get_text())
        
        # Tentar extrair informações do PPA (visão, diretrizes, etc)
        self._extrair_info_ppa(soup)
        
        return self._success()
    
    def _processar_texto_ppa(self, texto: str, tabelas: List) -> None:
        """Processa o texto extraído do PDF."""
        
        # Limpar texto
        texto = self._limpar_texto(texto)
        
        # Extrair ano do PPA
        anos = self._extrair_anos_ppa(texto)
        self.data['ppa']['ano_inicio'] = anos[0] if anos else None
        self.data['ppa']['ano_fim'] = anos[1] if len(anos) > 1 else None
        
        # Extrair visão
        visao = self._extrair_visao(texto)
        self.data['ppa']['visao'] = visao
        
        # Extrair diretrizes
        diretrizes = self._extrair_diretrizes(texto)
        self.data['ppa']['diretrizes'] = diretrizes
        
        # Extrair valores
        valores = self._extrair_valores(texto)
        self.data['ppa']['valores'] = valores
        
        # Processar tabelas para programas, ações e indicadores
        self._processar_tabelas_ppa(tabelas)
    
    def _processar_tabelas_ppa(self, tabelas: List) -> None:
        """Processa tabelas extraídas do PDF para encontrar programas, ações e indicadores."""
        
        for tabela in tabelas:
            if not tabela:
                continue
            
            # Converter tabela para formato mais fácil de processar
            linhas = []
            for linha in tabela:
                if linha:
                    celulas = [str(c).strip() if c else '' for c in linha]
                    linhas.append(celulas)
            
            if not linhas:
                continue
            
            # Analisar cabeçalho para determinar tipo de tabela
            cabecalho = ' '.join(linhas[0]).lower() if linhas else ''
            
            if 'programa' in cabecalho:
                self._extrair_programas_tabela(linhas)
            elif 'acao' in cabecalho or 'ação' in cabecalho:
                self._extrair_acoes_tabela(linhas)
            elif 'indicador' in cabecalho:
                self._extrair_indicadores_tabela(linhas)
    
    def _extrair_programas_tabela(self, linhas: List[List[str]]) -> None:
        """Extrai programas de uma tabela."""
        
        # Pular cabeçalho
        for linha in linhas[1:]:
            if not linha or len(linha) < 2:
                continue
            
            # Tentar identificar campos
            codigo = linha[0] if len(linha) > 0 else ''
            nome = linha[1] if len(linha) > 1 else ''
            
            if nome and codigo:
                programa = {
                    'codigo': self._limpar_codigo(codigo),
                    'nome': nome,
                    'objetivo': linha[2] if len(linha) > 2 else '',
                    'funcao': linha[3] if len(linha) > 3 else '',
                    'valor_global': linha[4] if len(linha) > 4 else '',
                }
                self.data['programas'].append(programa)
        
        self.metadata['programas_count'] = len(self.data['programas'])
    
    def _extrair_acoes_tabela(self, linhas: List[List[str]]) -> None:
        """Extrai ações de uma tabela."""
        
        for linha in linhas[1:]:
            if not linha or len(linha) < 2:
                continue
            
            codigo = linha[0] if len(linha) > 0 else ''
            nome = linha[1] if len(linha) > 1 else ''
            
            if nome and codigo:
                acao = {
                    'codigo': self._limpar_codigo(codigo),
                    'nome': nome,
                    'descricao': linha[2] if len(linha) > 2 else '',
                    'produto': linha[3] if len(linha) > 3 else '',
                    'meta_fisica_ano1': linha[4] if len(linha) > 4 else '',
                    'meta_fisica_ano2': linha[5] if len(linha) > 5 else '',
                    'meta_fisica_ano3': linha[6] if len(linha) > 6 else '',
                    'meta_fisica_ano4': linha[7] if len(linha) > 7 else '',
                }
                self.data['acoes'].append(acao)
        
        self.metadata['acoes_count'] = len(self.data['acoes'])
    
    def _extrair_indicadores_tabela(self, linhas: List[List[str]]) -> None:
        """Extrai indicadores de uma tabela."""
        
        for linha in linhas[1:]:
            if not linha or len(linha) < 2:
                continue
            
            nome = linha[0] if len(linha) > 0 else ''
            formula = linha[1] if len(linha) > 1 else ''
            
            if nome:
                indicador = {
                    'nome': nome,
                    'formula': formula,
                    'unidade_medida': linha[2] if len(linha) > 2 else '',
                    'meta_ano1': linha[3] if len(linha) > 3 else '',
                    'meta_ano2': linha[4] if len(linha) > 4 else '',
                    'meta_ano3': linha[5] if len(linha) > 5 else '',
                    'meta_ano4': linha[6] if len(linha) > 6 else '',
                }
                self.data['indicadores'].append(indicador)
        
        self.metadata['indicadores_count'] = len(self.data['indicadores'])
    
    def _processar_tabela_html(self, tabela) -> None:
        """Processa uma tabela HTML para extrair dados."""
        
        linhas = tabela.find_all('tr')
        if not linhas:
            return
        
        # Verificar cabeçalho
        cabeçalho = linhas[0].get_text().lower() if linhas else ''
        
        dados_linhas = []
        for linha in linhas[1:]:
            celulas = linha.find_all(['td', 'th'])
            valores = [c.get_text().strip() for c in celulas]
            if valores:
                dados_linhas.append(valores)
        
        if 'programa' in cabeçalho:
            self._extrair_programas_tabela(dados_linhas)
        elif 'acao' in cabeçalho or 'ação' in cabeçalho:
            self._extrair_acoes_tabela(dados_linhas)
        elif 'indicador' in cabeçalho:
            self._extrair_indicadores_tabela(dados_linhas)
    
    def _processar_texto_html(self, texto: str) -> None:
        """Processa texto HTML quando não há tabelas."""
        
        texto = self._limpar_texto(texto)
        
        # Tentar extrair anos
        anos = self._extrair_anos_ppa(texto)
        if anos:
            self.data['ppa']['ano_inicio'] = anos[0]
            self.data['ppa']['ano_fim'] = anos[1] if len(anos) > 1 else None
        
        # Tentar extrair visão
        visao = self._extrair_visao(texto)
        if visao:
            self.data['ppa']['visao'] = visao
    
    def _extrair_info_ppa(self, soup: BeautifulSoup) -> None:
        """Extrai informações gerais do PPA (visão, diretrizes, etc)."""
        
        texto = soup.get_text()
        texto = self._limpar_texto(texto)
        
        # Visão
        if not self.data['ppa'].get('visao'):
            self.data['ppa']['visao'] = self._extrair_visao(texto)
        
        # Diretrizes
        if not self.data['ppa'].get('diretrizes'):
            self.data['ppa']['diretrizes'] = self._extrair_diretrizes(texto)
        
        # Valores
        if not self.data['ppa'].get('valores'):
            self.data['ppa']['valores'] = self._extrair_valores(texto)
    
    def _extrair_municipio(self, soup: BeautifulSoup) -> Optional[str]:
        """Extrai o nome do município da página."""
        
        # Tentar encontrar em meta tags
        municipio = None
        
        # Meta tags comuns
        meta_tags = [
            ('meta', {'property': 'og:site_name'}),
            ('meta', {'name': 'city'}),
            ('meta', {'name': 'author'}),
        ]
        
        for tag, attrs in meta_tags:
            el = soup.find(tag, attrs)
            if el and el.get('content'):
                municipio = el.get('content')
                break
        
        # Tentar no título da página
        if not municipio:
            title = soup.find('title')
            if title:
                texto = title.get_text()
                # Padrões comuns
                match = re.search(r'(?:Prefeitura de|Prefeitura Municipal de|Portal de Transparência de)\s+(.+?)(?:\s*[-|]|$)', texto, re.IGNORECASE)
                if match:
                    municipio = match.group(1).strip()
        
        # Tentar em headers
        if not municipio:
            for header in soup.find_all(['h1', 'h2', 'header']):
                texto = header.get_text()
                match = re.search(r'(?:Prefeitura de|Prefeitura Municipal de)\s+(.+?)(?:\s*[-|]|$)', texto, re.IGNORECASE)
                if match:
                    municipio = match.group(1).strip()
                    break
        
        return municipio
    
    def _extrair_anos_ppa(self, texto: str) -> List[int]:
        """Extrai os anos do PPA do texto."""
        
        # Padrões comuns: "PPA 2022-2025", "2022 a 2025", "2022/2025"
        padroes = [
            r'PPA\s*(\d{4})\s*[-/]\s*(\d{4})',
            r'(\d{4})\s*a\s*(\d{4})',
            r'Plano Plurianual\s*(\d{4})\s*[-/]\s*(\d{4})',
        ]
        
        for padrao in padroes:
            match = re.search(padrao, texto, re.IGNORECASE)
            if match:
                ano1 = int(match.group(1))
                ano2 = int(match.group(2))
                # Validar que são anos razoáveis
                if 2000 <= ano1 <= 2100 and 2000 <= ano2 <= 2100:
                    return [ano1, ano2]
        
        # Tentar encontrar qualquer referência a anos
        anos_encontrados = re.findall(r'\b(20\d{2})\b', texto)
        if anos_encontrados:
            unicos = sorted(set([int(a) for a in anos_encontrados]))
            if len(unicos) >= 2:
                return [unicos[0], unicos[1]]
            elif len(unicos) == 1:
                return [unicos[0], unicos[0] + 3]
        
        return []
    
    def _extrair_visao(self, texto: str) -> str:
        """Extrai a visão de futuro do PPA."""
        
        padroes = [
            r'Visão(?: de Futuro)?:?\s*(.{10,500}?)(?=\n\n|Diretrizes|Valores|Objetivo|$)',
            r'Visão:?\s*(.{10,500}?)(?=\n\n|Diretrizes|Valores|Objetivo|$)',
        ]
        
        for padrao in padroes:
            match = re.search(padrao, texto, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        
        return ''
    
    def _extrair_diretrizes(self, texto: str) -> str:
        """Extrai as diretrizes do PPA."""
        
        padroes = [
            r'Diretrizes:?\s*(.{10,1000}?)(?=\n\n|Valores|Visão|Objetivo|Eixos|$)',
        ]
        
        for padrao in padroes:
            match = re.search(padrao, texto, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        
        return ''
    
    def _extrair_valores(self, texto: str) -> str:
        """Extrai os valores do PPA."""
        
        padroes = [
            r'Valores:?\s*(.{10,500}?)(?=\n\n|Diretrizes|Visão|Objetivo|Eixos|$)',
        ]
        
        for padrao in padroes:
            match = re.search(padrao, texto, re.IGNORECASE | re.DOTALL)
            if match:
                return match.group(1).strip()
        
        return ''
    
    def _limpar_texto(self, texto: str) -> str:
        """Limpa o texto extraído."""
        
        # Remover espaços extras
        texto = re.sub(r'\s+', ' ', texto)
        
        # Remover caracteres de controle
        texto = re.sub(r'[\x00-\x08\x0b-\x0c\x0e-\x1f\x7f]', '', texto)
        
        return texto.strip()
    
    def _limpar_codigo(self, codigo: str) -> str:
        """Limpa um código (programa, ação, etc)."""
        
        # Remover caracteres não numéricos, exceto ponto e hífen
        codigo = re.sub(r'[^\d.\-]', '', codigo)
        
        return codigo.strip()
    
    def _success(self) -> Dict[str, Any]:
        """Retorna resultado de sucesso."""
        
        return {
            'success': True,
            'partial': len(self.data['programas']) == 0,
            'data': self.data,
            'metadata': self.metadata,
        }
    
    def _error(self, message: str) -> Dict[str, Any]:
        """Retorna resultado de erro."""
        
        return {
            'success': False,
            'error': message,
            'data': self.data,
            'metadata': self.metadata,
        }


def main():
    """Função principal."""
    
    parser = argparse.ArgumentParser(
        description='Scraper de PPA Externo - Extrai dados de PPAs de prefeituras'
    )
    parser.add_argument('url', help='URL do PPA (PDF ou HTML)')
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Apenas analisa sem processar'
    )
    
    args = parser.parse_args()
    
    # Executar scraping
    scraper = PpaScraper(args.url, args.dry_run)
    resultado = scraper.scrape()
    
    # Imprimir resultado como JSON
    print(json.dumps(resultado, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
