#!/usr/bin/env python3
"""
Scraper de PPA do Portal QualitySistemas usando Playwright.

Este script usa Playwright para:
1. Abrir o portal no navegador real
2. Interceptar as chamadas de rede (Network API)
3. Mapear os endpoints e parâmetros usados pelo portal
4. Extrair os documentos de PPA

Instalação:
    pip install playwright
    playwright install chromium
"""

import sys
import json
import asyncio
from pathlib import Path
from urllib.parse import urlparse

try:
    from playwright.async_api import async_playwright
except ImportError:
    print("ERRO: Playwright não instalado. Execute: pip install playwright")
    print("Depois: playwright install chromium")
    sys.exit(1)


class QualitySistemasScraper:
    def __init__(self, portal_url: str):
        self.portal_url = portal_url
        self.entity_link = None
        self.base_url = None
        self.network_calls = []
        self.documents = []
        
    async def scrape(self) -> dict:
        """Executa o scraping completo usando Playwright."""
        
        # Parse URL para extrair entity e base
        parsed = urlparse(self.portal_url)
        path_parts = [p for p in parsed.path.split('/') if p]
        
        if path_parts:
            self.entity_link = path_parts[-1]
        
        # Base URL é tudo antes do entity
        self.base_url = f"{parsed.scheme}://{parsed.netloc}/" + '/'.join(path_parts[:-1]) + '/' if len(path_parts) > 1 else f"{parsed.scheme}://{parsed.netloc}/"
        
        print(f"[Playwright] Entity: {self.entity_link}")
        print(f"[Playwright] Base URL: {self.base_url}")
        
        async with async_playwright() as p:
            # Launch browser
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            
            # Interceptar todas as chamadas de rede
            page.on("response", self.handle_response)
            page.on("request", self.handle_request)
            
            print(f"[Playwright] Navegando para: {self.portal_url}")
            
            try:
                # Navigate to the portal
                await page.goto(self.portal_url, wait_until="networkidle", timeout=30000)
                print(f"[Playwright] Página carregada")
                
                # Wait for the page to be fully rendered
                await page.wait_for_timeout(2000)
                
                # Get page content for debugging
                title = await page.title()
                print(f"[Playwright] Title: {title}")
                
                # Check for select elements (document type and period)
                selects = await page.query_selector_all("select")
                print(f"[Playwright] Encontrou {len(selects)} selects na página")
                
                # Try to find and interact with the document type select
                # The portal likely has:
                # - Select for document type (PPA, LDO, LOA, etc.)
                # - Select for period/year
                # - A button or auto-load to fetch data
                
                # Let's try to find the data by looking at network calls
                # First, let's navigate and see what network calls are made
                
                # Try different approaches to get data
                await self.try_fetch_data(page)
                
            except Exception as e:
                print(f"[Playwright] Erro: {e}")
            
            finally:
                await browser.close()
        
        # Process collected network calls to find data
        self.process_network_calls()
        
        return {
            'success': True,
            'documents': self.documents,
            'network_calls': self.network_calls,
            'entity_link': self.entity_link,
            'base_url': self.base_url,
        }
    
    def handle_request(self, request):
        """Handler para interceptar requisições."""
        url = request.url
        method = request.method
        post_data = request.post_data
        
        call_info = {
            'url': url,
            'method': method,
            'post_data': post_data.decode('utf-8') if post_data else None,
        }
        
        self.network_calls.append(call_info)
        
        # Filter for likely data endpoints
        if 'DataFinder' in url or 'documento' in url.lower() or 'ppa' in url.lower():
            print(f"[Network] {method} {url}")
    
    def handle_response(self, response):
        """Handler para interceptar respostas."""
        url = response.url
        status = response.status
        
        if status == 200:
            # Try to get response body for JSON data
            try:
                # We'll check this later
                pass
            except:
                pass
    
    async def try_fetch_data(self, page):
        """Tenta diferentes métodos para obter os dados."""
        
        # Method 1: Look for XHR/fetch calls in the page
        # The QualitySistemas portal likely makes AJAX calls
        
        # Try to find any forms or inputs that might contain the data
        inputs = await page.query_selector_all("input[type='hidden']")
        print(f"[Playwright] Encontrou {len(inputs)} inputs hidden")
        
        for inp in inputs:
            inp_id = await inp.get_attribute("id")
            inp_name = await inp.get_attribute("name")
            inp_value = await inp.get_attribute("value")
            print(f"[Playwright] Hidden input: {inp_id} = {inp_value}")
        
        # Try to find the data table
        tables = await page.query_selector_all("table")
        print(f"[Playwright] Encontrou {len(tables)} tabelas")
        
        # Method 2: Try to make direct API calls based on common patterns
        await self.try_direct_api_calls()
    
    async def try_direct_api_calls(self):
        """Tenta chamar APIs diretamente."""
        import aiohttp
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': self.portal_url,
        }
        
        # Common API patterns for QualitySistemas
        endpoints = [
            f"{self.base_url}EntityDataFinder",
            f"{self.base_url}PpaDataFinder",
            f"{self.base_url}DocumentoDataFinder",
            f"{self.base_url}PlanejamentoDataFinder",
        ]
        
        # Try GET instead of POST
        for endpoint in endpoints:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(endpoint, headers=headers, timeout=5) as resp:
                        print(f"[Direct API] GET {endpoint} -> {resp.status}")
                        
                        if resp.status == 200:
                            try:
                                data = await resp.json()
                                print(f"[Direct API] Dados JSON recebidos: {type(data)}")
                            except:
                                text = await resp.text()
                                print(f"[Direct API] Dados texto: {text[:200]}...")
            except Exception as e:
                print(f"[Direct API] Erro em {endpoint}: {e}")
    
    def process_network_calls(self):
        """Processa as chamadas de rede coletadas."""
        
        # Look for successful JSON responses
        for call in self.network_calls:
            if call['method'] == 'POST' and 'DataFinder' in call['url']:
                # This might be the data endpoint
                print(f"[Process] Found potential data endpoint: {call['url']}")


async def main():
    if len(sys.argv) < 2:
        print("Uso: python3 scraper_playwright.py <url_do_portal>")
        print("Exemplo: python3 scraper_playwright.py https://web.qualitysistemas.com.br/planejamento_orcamentario/prefeitura_municipal_de_corguinho")
        sys.exit(1)
    
    url = sys.argv[1]
    
    print(f"Iniciando scraper Playwright para: {url}")
    
    scraper = QualitySistemasScraper(url)
    result = await scraper.scrape()
    
    print("\n=== RESULTADO ===")
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())