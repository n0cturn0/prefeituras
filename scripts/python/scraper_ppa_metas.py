#!/usr/bin/env python3
"""
Scraper para Extrair Programas do PPA via Playwright
Agrupa ações em programas baseado no TOTAL DO PROGRAMA
"""

import sys
import json
import asyncio
from playwright.async_api import async_playwright


async def scrape_ppa_metas_financeiras(url: str, ano: int) -> list:
    """Extrai programas do relatório de metas financeiras do PPA."""
    
    print(f"[Scraper] Iniciando scrape para {url}, Ano: {ano}", flush=True)
    
    programas = []
    contador = 1
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print(f"[Scraper] Navegando para {url}", flush=True)
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)
            
            # Selecionar o ano
            await page.select_option("#selectAnoPpa", str(ano))
            await page.wait_for_timeout(3000)
            
            # Extrair dados linha por linha
            rows = await page.query_selector_all("#bodyRelatorioPpa tr")
            print(f"[Scraper] Linhas encontradas: {len(rows)}", flush=True)
            
            acoes_atuais = []
            
            for i, row in enumerate(rows):
                cells = await row.query_selector_all("td")
                if len(cells) >= 2:
                    codigo = (await cells[0].text_content()) if len(cells) > 0 else ""
                    nome = (await cells[1].text_content()) if len(cells) > 1 else ""
                    
                    codigo = codigo.strip() if codigo else ""
                    nome = nome.strip() if nome else ""
                    
                    # Se é "TOTAL DO PROGRAMA", finalize o programa atual
                    if codigo == "TOTAL DO PROGRAMA":
                        valor = parse_valor(nome)
                        
                        if acoes_atuais:
                            # Código sequencial único para cada programa
                            codigo_programa = str(contador).zfill(4)
                            contador += 1
                            
                            nome_programa = acoes_atuais[0]['nome']
                            
                            programas.append({
                                'codigo_programa': codigo_programa,
                                'descricao_programa': nome_programa,
                                'valor_global': valor,
                                'meta_financeira_total': valor
                            })
                            
                            print(f"[DEBUG] Programa: {codigo_programa} - {nome_programa[:30]}... = R$ {valor}", flush=True)
                            
                            acoes_atuais = []
                        continue
                    
                    # Se tem 4 dígitos, é uma ação - adicionar à lista
                    if codigo and len(codigo) == 4 and codigo.isdigit():
                        acoes_atuais.append({
                            'codigo': codigo,
                            'nome': nome
                        })
            
            print(f"[Scraper] Total programas extraídos: {len(programas)}", flush=True)
            
        except Exception as e:
            print(f"[Scraper] Erro: {str(e)}", flush=True)
            import traceback
            traceback.print_exc()
            
        finally:
            await browser.close()
    
    return programas


def parse_valor(valor_str: str) -> float:
    """Converte string de valor para float."""
    if not valor_str:
        return 0.0
    
    valor_str = valor_str.replace('R$', '').strip()
    valor_str = valor_str.replace('.', '')
    valor_str = valor_str.replace(',', '.')
    
    try:
        return float(valor_str)
    except:
        return 0.0


def process_programas(programas_raw: list, ano: int) -> list:
    """Processa os dados brutos para formato do Laravel."""
    
    programas = []
    
    for prog in programas_raw:
        codigo = prog.get('codigo_programa', '')
        nome = prog.get('descricao_programa', '')
        
        if not codigo or not nome:
            continue
        
        valor = prog.get('valor_global', 0)
        executado = prog.get('meta_financeira_total', 0)
        
        programas.append({
            'codigo': str(codigo),
            'nome': str(nome),
            'objetivo': '',
            'valor_global': valor,
            'meta_financeira_total': executado,
            'ano_referencia': ano
        })
    
    return programas


def main():
    if len(sys.argv) < 3:
        print("Uso: python3 scraper_ppa_metas.py <URL> <ANO>")
        sys.exit(1)
    
    url = sys.argv[1]
    ano = int(sys.argv[2])
    
    print(f"Iniciando scraper para {url}, ano {ano}", flush=True)
    
    try:
        programas_raw = asyncio.run(scrape_ppa_metas_financeiras(url, ano))
        programas = process_programas(programas_raw, ano)
        
        print(json.dumps({
            'success': True,
            'programas': programas,
            'count': len(programas)
        }))
        
    except Exception as e:
        print(json.dumps({
            'success': False,
            'error': str(e)
        }))
        sys.exit(1)


if __name__ == "__main__":
    main()