#!/usr/bin/env python3
"""
Scraper de LDO (Lei de Diretrizes Orçamentárias) Externo

Este script extrai dados de LDOs de prefeituras brasileiras via scraping.
Suporta:
- PDFs de LDOs (usando pdfplumber)
- Páginas HTML de portais de transparência (usando BeautifulSoup)

Uso:
    python3 scraper_ldo.py <url> [--dry-run]

Args:
    url: URL da LDO (PDF ou HTML)
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

try:
    import pdfplumber
    PDFPLUMBER_AVAILABLE = True
except ImportError:
    PDFPLUMBER_AVAILABLE = False

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/pdf,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
}


class LdoScraper:
    """
    Classe principal para scraping de LDO.
    
    Detecta o tipo de conteúdo (PDF ou HTML) e delega para o extractor correto.
    """
    
    def __init__(self, url: str, dry_run: bool = False):
        self.url = url
        self.dry_run = dry_run
        self.session = requests.Session()
        self.session.headers.update(HEADERS)
        
        self.metadata = {
            'url': url,
            'tipo_conteudo': None,
            'municipio': None,
            'metas_count': 0,
            'prioridades_count': 0,
        }
        
        self.data = {
            'ldo': {},
            'metas': [],
            'prioridades': [],
        }
    
    def scrape(self) -> Dict[str, Any]:
        """
        Executa o scraping completo.
        
        Returns:
            Dict com 'success', 'data' e 'metadata'
        """
        try:
            response = self.session.get(self.url, timeout=30, stream=True)
            response.raise_for_status()
            
            content_type = response.headers.get('Content-Type', '').lower()
            
            if 'pdf' in content_type or self.url.lower().endswith('.pdf'):
                self.metadata['tipo_conteudo'] = 'pdf'
                return self._scrape_pdf(response.content)
            elif 'html' in content_type or 'text/html' in content_type:
                self.metadata['tipo_conteudo'] = 'html'
                return self._scrape_html(response.text)
            else:
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
        """Extrai dados de um PDF de LDO."""
        
        if not PDFPLUMBER_AVAILABLE:
            return self._error(
                'pdfplumber não está instalado. Execute: pip install pdfplumber'
            )
        
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            texto_completo = ''
            tabelas = []
            
            with pdfplumber.open(tmp_path) as pdf:
                for page in pdf.pages:
                    texto = page.extract_text()
                    if texto:
                        texto_completo += texto + '\n'
                    
                    tables = page.extract_tables()
                    if tables:
                        tabelas.extend(tables)
            
            self._processar_texto_ldo(texto_completo, tabelas)
            
            return self._success()

        finally:
            os.unlink(tmp_path)
    
    def _scrape_html(self, html: str) -> Dict[str, Any]:
        """Extrai dados de uma página HTML de LDO."""
        
        soup = BeautifulSoup(html, 'html.parser')
        
        texto_completo = soup.get_text(separator='\n', strip=True)
        
        self._processar_texto_ldo(texto_completo, [])
        
        return self._success()
    
    def _processar_texto_ldo(self, texto: str, tabelas: List) -> None:
        """Processa o texto extraído e extrai dados da LDO."""
        
        # Extrair ano da LDO
        ano = self._extrair_ano(texto)
        if ano:
            self.data['ldo']['ano'] = ano
        
        # Extrair ementa
        self.data['ldo']['ementa'] = self._extrair_ementa(texto)
        
        # Extrair município
        self.metadata['municipio'] = self._extrair_municipio(texto)
        
        # Processar tabelas para metas e prioridades
        self._processar_tabelas(tabelas)
    
    def _extrair_ano(self, texto: str) -> Optional[int]:
        """Extrai o ano de referência da LDO do texto."""
        
        patterns = [
            r'LDO\s*(?:DE\s*)?(?:1\s*)?(?:9\s*)?(\d{4})',
            r'exerc[íi]cio\s*(?:financeiro\s*)?(\d{4})',
            r'Diretrizes\s*Orçamentárias\s*(?:de\s*)?(?:1\s*)?(?:9\s*)?(\d{4})',
            r'Ano\s*de\s*Referência[:\s]*(\d{4})',
            r'(20\d{2})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, texto, re.IGNORECASE)
            if match:
                ano = int(match.group(1))
                if 2000 <= ano <= 2100:
                    return ano
        
        return None
    
    def _extrair_ementa(self, texto: str) -> str:
        """Extrai a ementa da LDO."""
        
        patterns = [
            r'EMENTA[:\s]*(.+?)(?=\n\n|\.\s+[A-Z]|$)',
            r'Dispõe\s+sobre\s+(.+?)(?=\n\n|\.\s+[A-Z]|$)',
            r'A\s+Lei\s+(?:de\s+)?(?:Diretrizes\s+Orçamentárias\s+)?(?:n[º°]\s+\d+[/\.]?\s*)?(?:de\s+)?(.+?)(?=\n\n|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, texto, re.IGNORECASE | re.DOTALL)
            if match:
                ementa = match.group(1).strip()
                if len(ementa) > 20:
                    return ementa[:500]
        
        return ''
    
    def _extrair_municipio(self, texto: str) -> Optional[str]:
        """Extrai o nome do município do texto."""
        
        patterns = [
            r'PREFEITURA\s+(?:MUNICIPAL\s+DE\s+)?(.+?)(?:\n|$)',
            r'Prefeitura\s+(?:Municipal\s+de\s+)?(.+?)(?:\n|$)',
            r'MUNICÍPIO\s+DE\s+(.+?)(?:\n|$)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, texto, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        return None
    
    def _processar_tabelas(self, tabelas: List) -> None:
        """Processa tabelas para extrair metas e prioridades."""
        
        for tabela in tabelas:
            if not tabela or len(tabela) < 2:
                continue
            
            for row in tabela:
                if not row or len(row) < 2:
                    continue
                
                # Detectar linha de meta ou prioridade
                texto_linha = ' '.join([str(cell) for cell in row if cell])
                
                if any(keyword in texto_linha.lower() for keyword in ['meta', 'prioridade', 'objetivo', 'ação']):
                    # Extrair dados da linha
                    meta = self._extrair_meta_da_linha(row)
                    if meta:
                        if 'prioridade' in texto_linha.lower():
                            self.data['prioridades'].append(meta)
                        else:
                            self.data['metas'].append(meta)
        
        self.metadata['metas_count'] = len(self.data['metas'])
        self.metadata['prioridades_count'] = len(self.data['prioridades'])
    
    def _extrair_meta_da_linha(self, row: List) -> Optional[Dict]:
        """Extrai dados de uma meta ou prioridade de uma linha de tabela."""
        
        if len(row) < 2:
            return None
        
        descricao = str(row[0]).strip() if row[0] else ''
        valor_str = str(row[1]).strip() if len(row) > 1 and row[1] else ''
        
        if not descricao or len(descricao) < 3:
            return None
        
        meta = {
            'descricao': descricao[:500],
            'valor_financeiro_previsto': self._parse_money(valor_str),
        }
        
        # Tentar extrair meta física se houver mais colunas
        if len(row) > 2 and row[2]:
            meta['meta_fisica_prevista'] = self._parse_number(str(row[2]))
        
        if len(row) > 3 and row[3]:
            meta['unidade_medida'] = str(row[3]).strip()
        
        return meta
    
    def _parse_money(self, valor_str: str) -> float:
        """Converte string de valor monetário para float."""
        if not valor_str:
            return 0.0
        
        valor_str = re.sub(r'[R$\s]', '', valor_str)
        valor_str = valor_str.replace('.', '')
        valor_str = valor_str.replace(',', '.')
        
        try:
            return float(valor_str)
        except ValueError:
            return 0.0
    
    def _parse_number(self, num_str: str) -> Optional[float]:
        """Converte string numérica para float."""
        if not num_str:
            return None
        
        num_str = re.sub(r'[^\d.,\-]', '', num_str)
        num_str = num_str.replace(',', '.')
        
        try:
            return float(num_str)
        except ValueError:
            return None
    
    def _success(self) -> Dict[str, Any]:
        """Retorna resultado de sucesso."""
        
        return {
            'success': True,
            'partial': False,
            'data': self.data,
            'metadata': self.metadata,
        }
    
    def _error(self, message: str) -> Dict[str, Any]:
        """Retorna resultado de erro."""
        
        return {
            'success': False,
            'partial': False,
            'error': message,
            'metadata': self.metadata,
        }


def main():
    parser = argparse.ArgumentParser(
        description='Scraper de LDO (Lei de Diretrizes Orçamentárias)'
    )
    parser.add_argument('url', help='URL do PDF ou página HTML da LDO')
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Apenas analisa sem processar'
    )
    
    args = parser.parse_args()
    
    scraper = LdoScraper(args.url, dry_run=args.dry_run)
    result = scraper.scrape()
    
    print(json.dumps(result, ensure_ascii=False, indent=2))
    
    return 0 if result.get('success') else 1


if __name__ == '__main__':
    sys.exit(main())