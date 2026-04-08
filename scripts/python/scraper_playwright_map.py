#!/usr/bin/env python3
"""
Scraper simplificado para mapear o portal QualitySistemas
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
        print("Uso: python3 scraper_playwright_map.py <url>")
        sys.exit(1)
    
    url = sys.argv[1]
    print(f"Iniciando: {url}")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Collect network requests
        requests = []
        
        def on_request(req):
            try:
                post_data = req.post_data
                if post_data and isinstance(post_data, bytes):
                    post_data = post_data.decode('utf-8')
                elif post_data:
                    post_data = str(post_data)
                else:
                    post_data = None
            except:
                post_data = str(req.post_data) if req.post_data else None
            
            requests.append({
                'url': req.url,
                'method': req.method,
                'post_data': post_data
            })
            
            # Print interesting requests
            if 'DataFinder' in req.url or 'documento' in req.url.lower() or 'ppa' in req.url.lower():
                print(f"  -> {req.method} {req.url}")
        
        page.on('request', on_request)
        
        try:
            page.goto(url, wait_until='domcontentloaded', timeout=15000)
            print("Página carregada")
        except Exception as e:
            print(f"Erro ao carregar: {e}")
        
        # Wait a bit for any dynamic content
        page.wait_for_timeout(2000)
        
        # Get hidden inputs
        inputs = page.query_selector_all('input[type="hidden"]')
        print(f"\nHidden inputs encontrados: {len(inputs)}")
        
        for inp in inputs[:10]:
            inp_id = inp.get_attribute('id')
            inp_value = inp.get_attribute('value')
            if inp_id and inp_value:
                print(f"  {inp_id} = {inp_value}")
        
        # Get selects
        selects = page.query_selector_all('select')
        print(f"\nSelects encontrados: {len(selects)}")
        
        for sel in selects[:5]:
            sel_id = sel.get_attribute('id')
            sel_name = sel.get_attribute('name')
            sel_class = sel.get_attribute('class')
            print(f"  select: id={sel_id}, name={sel_name}, class={sel_class}")
        
        # Get all network requests
        print(f"\nTotal de requests: {len(requests)}")
        
        browser.close()
        
        # Save results
        with open('/tmp/playwright_results.json', 'w') as f:
            json.dump({'url': url, 'requests': requests[-50:]}, f, indent=2)
        
        print("\nResultados salvos em /tmp/playwright_results.json")


if __name__ == "__main__":
    main()