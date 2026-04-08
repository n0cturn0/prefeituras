#!/usr/bin/env python3
"""
Script para mapear a interação com o portal QualitySistemas.
- Abre a página
- Seleciona um ano no select
- Captura as chamadas de rede resultantes
"""

import sys
import json

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("ERRO: Playwright não instalado")
    sys.exit(1)


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 scraper_playwright_interact.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    print(f"Iniciando: {url}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        
        requests = []
        responses = []
        
        # Interceptar todas as requisições
        def on_request(req):
            req_info = {
                'url': req.url,
                'method': req.method,
                'post_data': str(req.post_data) if req.post_data else None
            }
            requests.append(req_info)
            
            # Mostrar requisições interessantes
            if 'busca' in req.url.lower() or 'ppa' in req.url.lower():
                print(f"REQUEST: {req.method} {req.url}")
                if req.post_data:
                    print(f"  POST DATA: {req.post_data}")
        
        # Interceptar respostas
        def on_response(resp):
            status = resp.status
            url = resp.url
            
            if 'busca' in url.lower() or 'ppa' in url.lower():
                print(f"RESPONSE: {status} {url}")
                
                # Tentar obter o corpo da resposta
                try:
                    # Vamos capturar isso depois
                    pass
                except:
                    pass
                    
                responses.append({
                    'url': url,
                    'status': status,
                })
        
        page.on('request', on_request)
        page.on('response', on_response)
        
        try:
            # Carregar a página
            page.goto(url, wait_until='domcontentloaded', timeout=15000)
            print("Página carregada")
            
            # Esperar um pouco para a página inicializar
            page.wait_for_timeout(2000)
            
            # Ver os selects disponíveis
            selects = page.query_selector_all('select')
            print(f"\nEncontrou {len(selects)} selects:")
            
            for i, sel in enumerate(selects):
                sel_id = sel.get_attribute('id')
                sel_name = sel.get_attribute('name')
                sel_class = sel.get_attribute('class')
                
                # Ver as opções
                options = sel.query_selector_all('option')
                print(f"  Select {i}: id={sel_id}, name={sel_name}")
                print(f"    Opções: {len(options)}")
                for opt in options[:5]:
                    print(f"      - {opt.get_attribute('value')}: {opt.inner_text()}")
            
            # Tentar selecionar o primeiro ano no select "year"
            print("\n=== Tentando selecionar ano no select 'year' ===")
            
            try:
                # Selecionar o segundo ano (primeiro é vazio)
                page.select_option('#year', '2022')
                print("Selecionou ano 2022")
                
                # Esperar a requisição completar
                page.wait_for_timeout(3000)
                
            except Exception as e:
                print(f"Erro ao selecionar: {e}")
            
            # Também tentar selecionar no select de ano do PPA
            print("\n=== Tentando selecionar no select 'selectAnoPpa' ===")
            try:
                page.select_option('#selectAnoPpa', '2022')
                print("Selecionou ano 2022 no selectAnoPpa")
                page.wait_for_timeout(3000)
            except Exception as e:
                print(f"Erro ao selecionar no selectAnoPpa: {e}")
            
            # Ver o que aconteceu com as chamadas de rede
            print(f"\n=== Total de requisições capturadas: {len(requests)} ===")
            
            # Filtrar requisições interesting
            interesting = [r for r in requests if 'busca' in r['url'].lower() or 'ppa' in r['url'].lower()]
            print(f"Requisições relacionadas a busca: {len(interesting)}")
            
            for r in interesting:
                print(f"  - {r['method']} {r['url']}")
                if r['post_data']:
                    print(f"    POST: {r['post_data']}")
            
        except Exception as e:
            print(f"Erro: {e}")
        
        browser.close()
        
        # Salvar resultados
        result = {
            'url': url,
            'requests': requests[-30:],
            'responses': responses,
        }
        
        with open('/tmp/playwright_interact.json', 'w') as f:
            json.dump(result, f, indent=2)
        
        print("\nResultados salvos em /tmp/playwright_interact.json")


if __name__ == "__main__":
    main()