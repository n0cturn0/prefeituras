#!/usr/bin/env python3
"""
Scraper para Extrair Metas e Prioridades da LDO via Playwright

Este script extrai os dados de "Execução de Metas e Prioridades" da LDO
do portal QualitySistemas, retornando informações como:
- Função, SubFunção, Código, Descrição
- Valores Empenhado, Liquidado, Pago

Estrutura do portal identificada:
- Select #law com options: 1=PPA, 2=LDO
- Select #year para ano
- Tabela de resultados: #ldo-result

Uso:
    python3 scraper_ldo_metas.py <url> <ano>

Args:
    url: URL do portal de transparência QualitySistemas
    ano: Ano de referência da LDO (ex: 2024)

Retorno:
    JSON com array de metas e prioridades
"""

import sys
import json
import asyncio
from playwright.async_api import async_playwright


async def scrape_ldo_metas(url: str, ano: int) -> list:
    """Extrai metas e prioridades do relatório de execução da LDO."""
    
    print(f"[Scraper] Iniciando scrape para {url}, Ano: {ano}", flush=True)
    
    metas = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print(f"[Scraper] Navegando para {url}", flush=True)
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(3000)
            
            print(f"[Scraper] Página carregada, selecionando tipo LDO...", flush=True)
            
            # 1. Selecionar tipo LDO (value="2") - usar force porque pode estar oculto por bootstrap-select
            await page.select_option("#law", "2", force=True)
            await page.wait_for_timeout(2000)
            print(f"[Scraper] Tipo LDO selecionado", flush=True)
            
            # 2. Verificar se há opções de ano no select #year
            year_options = await page.query_selector_all("#year option")
            print(f"[Scraper] Opções de ano encontradas: {len(year_options)}", flush=True)
            
            # 3. Selecionar o ano no select #year
            try:
                await page.select_option("#year", str(ano), force=True)
                await page.wait_for_timeout(3000)
                print(f"[Scraper] Ano {ano} selecionado no #year", flush=True)
            except Exception as e:
                print(f"[Scraper] Erro ao selecionar ano: {e}", flush=True)
                # Tentar clicar no select e selecionar
                await page.click("#year")
                await page.wait_for_timeout(1000)
                # Procurar a opção no dropdown
                await page.click(f"#year option[value='{ano}']")
                await page.wait_for_timeout(3000)
            
            # 4. Esperar dados carregarem na tabela #tableBodyLDO (Execução de Metas e Prioridades da LDO)
            print(f"[Scraper] Esperando dados da LDO...", flush=True)
            
            # Tentar múltiplos seletores de tabela - PRIORIZAR tableBodyLDO
            table_selectors = [
                "#tableBodyLDO tr",
                "#tableRelatorioLdo tbody tr",
                "#ldo-result tr",
                "#containerLDO table tr",
            ]
            
            rows = []
            tabela_encontrada = False
            
            for selector in table_selectors:
                try:
                    print(f"[Scraper] Tentando selector: {selector}", flush=True)
                    await page.wait_for_selector(selector, timeout=5000)
                    rows = await page.query_selector_all(selector)
                    if len(rows) > 0:
                        tabela_encontrada = True
                        print(f"[Scraper] Tabela encontrada: {selector}, linhas: {len(rows)}", flush=True)
                        break
                except:
                    continue
            
            # Se não encontrou, tentar esperar mais tempo
            if not tabela_encontrada:
                print(f"[Scraper] Esperando mais 3 segundos...", flush=True)
                await page.wait_for_timeout(3000)
                rows = await page.query_selector_all("#ldo-result tr")
                if len(rows) > 0:
                    tabela_encontrada = True
                    print(f"[Scraper] Tabela encontrada após espera: {len(rows)} linhas", flush=True)
            
            # 5. Processar linhas da tabela
            if tabela_encontrada and len(rows) > 0:
                print(f"[Scraper] Processando {len(rows)} linhas...", flush=True)
                
                for i, row in enumerate(rows):
                    cells = await row.query_selector_all("td, th")
                    
                    if len(cells) < 2:
                        continue
                    
                    # Extrair texto de cada célula
                    valores = []
                    for cell in cells:
                        texto = await cell.text_content()
                        valores.append(texto.strip() if texto else "")
                    
                    # Pular linhas de cabeçalho
                    primeiro_valor = valores[0] if valores else ""
                    if primeiro_valor in ["FUNÇÃO", "SUB FUNÇÃO", "PROJETO / ATIVIDADE / OP. ESPECIAIS", "CÓDIGO", "DESCRIÇÃO"]:
                        print(f"[DEBUG] Pulando linha cabeçalho: {primeiro_valor}", flush=True)
                        continue
                    
                    # Se a primeira célula é numérica (função) E a segunda é numérica (subfunção)
                    if len(valores) >= 3 and primeiro_valor.isdigit() and len(primeiro_valor) <= 3:
                        funcao = primeiro_valor
                        subfuncao = valores[1] if valores[1].isdigit() and len(valores[1]) <= 4 else ""
                        
                        # A descrição pode estar na posição 2 ou mesclada na posição 3
                        descricao = ""
                        codigo = ""
                        
                        # A linha parece ter: [funcao, subfuncao, descricao_codigo, valor_empenhado, valor_liquidado, valor_pago]
                        # Ou: [codigo, descricao, valor_empenhado, valor_liquidado, valor_pago]
                        
                        if len(valores) > 2:
                            # Se a posição 2 contém código+descrição mesclados
                            if valores[2] and any(c.isdigit() for c in valores[2][:4]):
                                # Extrai código do início e descrição do resto
                                texto_completo = valores[2]
                                # Encontrar onde começa o número do código
                                for j in range(len(texto_completo)):
                                    if texto_completo[j:j+4].isdigit():
                                        codigo = texto_completo[j:j+10].strip()
                                        descricao = texto_completo[j+len(codigo):].strip()
                                        break
                            
                            if not descricao and len(valores) > 2:
                                descricao = valores[2]
                        
                        # Extrair valores das últimas colunas
                        valor_empenhado = 0
                        valor_liquidado = 0
                        valor_pago = 0
                        
                        for v in valores:
                            if v and ("R$" in v or "," in v):
                                val = parse_valor(v)
                                if valor_empenhado == 0:
                                    valor_empenhado = val
                                elif valor_liquidado == 0:
                                    valor_liquidado = val
                                elif valor_pago == 0:
                                    valor_pago = val
                        
                        # Se não encontrou código, usar primeiro código encontrado na descrição
                        if not codigo and descricao:
                            import re
                            match = re.search(r'(\d{3,6})', descricao)
                            if match:
                                codigo = match.group(1)
                        
                        # Filtrar linhas válidas
                        if descricao:
                            meta = {
                                'funcao_codigo': funcao[:2] if funcao else None,
                                'subfuncao_codigo': subfuncao[:3] if subfuncao else None,
                                'acao_codigo': codigo[:10] if codigo else f"AUTO-{i}",
                                'descricao': descricao[:500],
                                'valor_financeiro_previsto': valor_empenhado,
                                'valor_empenhado': valor_empenhado,
                                'valor_liquidado': valor_liquidado,
                                'valor_pago': valor_pago,
                                'ano_referencia': ano,
                            }
                            metas.append(meta)
                            print(f"[DEBUG] Meta: {funcao}/{subfuncao} - {codigo} - {descricao[:30]}... R${valor_empenhado}", flush=True)
            
            # 6. Se não encontrou dados na tabela, tentar clicar no botão de busca
            if len(metas) == 0:
                print(f"[Scraper] Tentando clicar no botão de busca...", flush=True)
                
                # Procurar botão de busca na página
                botoes = await page.query_selector_all("button, input[type='button'], input[type='submit']")
                for btn in botoes:
                    try:
                        texto = await btn.text_content()
                        if texto and ("buscar" in texto.lower() or "pesquisar" in texto.lower() or "filtrar" in texto.lower()):
                            await btn.click()
                            await page.wait_for_timeout(3000)
                            print(f"[Scraper] Clicou no botão: {texto}", flush=True)
                            break
                    except:
                        continue
                
                # Tentar buscar novamente na tabela
                rows = await page.query_selector_all("#ldo-result tr")
                print(f"[Scraper] Tentativa 2 - Linhas encontradas: {len(rows)}", flush=True)
                
                # Processar novamente
                for i, row in enumerate(rows):
                    cells = await row.query_selector_all("td")
                    if len(cells) >= 2:
                        valores = []
                        for cell in cells:
                            texto = await cell.text_content()
                            valores.append(texto.strip() if texto else "")
                        
                        if len(valores) >= 3:
                            funcao = valores[0] if len(valores) > 0 else ""
                            subfuncao = valores[1] if len(valores) > 1 else ""
                            codigo = valores[2] if len(valores) > 2 else ""
                            descricao = valores[3] if len(valores) > 3 else ""
                            valor_empenhado = parse_valor(valores[4]) if len(valores) > 4 else 0
                            
                            if codigo and len(codigo) <= 15 and descricao:
                                metas.append({
                                    'funcao_codigo': funcao[:2] if funcao and funcao.isdigit() else None,
                                    'subfuncao_codigo': subfuncao[:3] if subfuncao and subfuncao.isdigit() else None,
                                    'acao_codigo': codigo[:10],
                                    'descricao': descricao[:500],
                                    'valor_financeiro_previsto': valor_empenhado,
                                    'valor_empenhado': valor_empenhado,
                                    'valor_liquidado': 0,
                                    'valor_pago': 0,
                                    'ano_referencia': ano,
                                })
            
            print(f"[Scraper] Total metas extraídas: {len(metas)}", flush=True)
            
        except Exception as e:
            print(f"[Scraper] Erro: {str(e)}", flush=True)
            import traceback
            traceback.print_exc()
            
        finally:
            await browser.close()
    
    return metas


def parse_valor(valor_str: str) -> float:
    """Converte string de valor para float."""
    if not valor_str:
        return 0.0
    
    # Remover símbolos de moeda e espaços
    valor_str = valor_str.replace('R$', '').replace('$', '')
    valor_str = valor_str.strip()
    
    # Tratar formato brasileiro: 1.234.567,89
    if ',' in valor_str and '.' in valor_str:
        valor_str = valor_str.replace('.', '').replace(',', '.')
    elif ',' in valor_str:
        valor_str = valor_str.replace(',', '.')
    elif valor_str.count('.') > 1:
        valor_str = valor_str.replace('.', '')
    
    try:
        return float(valor_str)
    except ValueError:
        return 0.0


def main():
    if len(sys.argv) < 3:
        print(json.dumps({
            'success': False,
            'error': 'Uso: python3 scraper_ldo_metas.py <url> <ano>'
        }, ensure_ascii=False))
        sys.exit(1)
    
    url = sys.argv[1]
    ano = int(sys.argv[2])
    
    # Only print important messages, not debug
    print(f"[Main] Iniciando scraper LDO Metas para {url}, ano {ano}", flush=True)
    
    metas = asyncio.run(scrape_ldo_metas(url, ano))
    
    # Final output - ONLY JSON (no additional print statements after this)
    result = {
        'success': True,
        'metas': metas,
        'count': len(metas),
        'ano_importado': ano,
    }
    
    print(json.dumps(result, ensure_ascii=False))
    sys.exit(0)


if __name__ == '__main__':
    main()