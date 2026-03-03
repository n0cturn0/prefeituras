import asyncio
import logging
from playwright.async_api import async_playwright, Page, Response
from typing import List, Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

BPS_URL = "https://infoms.saude.gov.br/extensions/SEIDIGI_DEMAS_BPS/SEIDIGI_DEMAS_BPS.html"

async def intercept_response(response: Response, results: List[Dict]):
    """
    Intercepts JSON responses to capture Qlik data cubes.
    This is a heuristic approach since Qlik responses can be complex.
    """
    try:
        if "json" in response.headers.get("content-type", "") and response.request.method == "POST":
            # Filter for potential data endpoints
            url = response.url
            if "Execute" in url or "GetData" in url or "GetLayout" in url:
                data = await response.json()
                # Generic Qlik Data Extraction Logic (simplified)
                # We look for 'qHyperCube' or 'qDataPages' usually found in these apps
                # This part likely needs refinement based on actual payload
                logger.debug(f"Intercepted JSON from {url}")
                
                # Check for qHyperCube structure
                if isinstance(data, dict):
                     # Recursive search for qMatrix or similar
                    pass 
    except Exception as e:
        pass # Ignore parsing errors for non-json

async def apply_filter(page: Page, filter_name: str, value: str, search_in_mais_filtros_first: bool = False, section_name: str = None):
    """
    Applies a specific filter in the Qlik Sense app using robust text matching.
    args:
        section_name: If provided, looks for the filter INSIDE this specific section (e.g., 'Filtros Obrigatórios').
    """
    if not value: return

    logger.info(f"Applying filter: {filter_name} = {value} (Section: {section_name}, Mais Filtros First: {search_in_mais_filtros_first})")
    
    # Wait for app stability
    await asyncio.sleep(3.0) 

    # STRATEGY 1: Specific Column Header / Filter Pane
    try:
        header = None
        found = False
        
        # SCOPED SEARCH STRATEGY
        if section_name:
            logger.info(f"Looking for section '{section_name}'...")
            # Try to find a container that has this text
            # In Qlik, might be an accordion or group header.
            # We look for an element containing the section name, then search for the filter INSIDE it.
            
            # Generalized container search
            # 1. Find the text element for the section
            section_el = page.get_by_text(section_name, exact=True).first
            if not await section_el.is_visible():
                section_el = page.get_by_text(section_name, exact=False).first
            
            if await section_el.is_visible(timeout=5000):
                logger.info(f"Found section header '{section_name}'. trying to scope search...")
                
                # Attempt to find the filter name near this section
                # Since DOM hierarchy can be tricky, we might just look for the filter name 
                # but EXCLUDING known table-header classes if we fail to scope strictly.
                
                # Try strict scoping first (assuming standard container)
                # This depends heavily on Qlik structure. 
                # Let's try locating the filter text that is NOT a table header.
                
                logger.info(f"Searching for '{filter_name}' avoiding grid headers...")
                
                # Complex Selector: Find element with text 'filter_name' 
                # AND NOT inside a class with 'grid-header' or 'column-header'
                # Playwright doesn't support "not inside" easily in CSS, but has :not() pseudo-class
                # A safer bet might be finding All items with that text and filtering.
                
                candidates = page.get_by_text(filter_name, exact=True)
                count = await candidates.count()
                
                target_header = None
                for i in range(count):
                    el = candidates.nth(i)
                    # Check class attributes of the element and its parents
                    # We want to AVOID ".qv-st-header-cell", ".ui-grid-header-cell", etc.
                    
                    # We can check if it's visible first
                    if not await el.is_visible(): continue
                    
                    # Check if it looks like a filter pane item
                    # Heuristic: Filter pane items are often in lists or specific containers
                    # Table headers are in grids.
                    
                    # Evaluation
                    is_grid = await el.evaluate("el => el.closest('.qv-grid-header') !== null || el.closest('.ui-grid-header-cell') !== null")
                    if is_grid:
                        logger.info(f"Skipping candidate {i}: It is a Table Header.")
                        continue
                        
                    # If we have a section_name, we'd prefer it to be close to that section
                    # But verifying proximity in DOM calls is expensive/hard reliably.
                    # Just avoiding grid headers is a huge win.
                    
                    logger.info(f"Candidate {i} seems valid (not a grid header). Using it.")
                    target_header = el
                    break
                
                if target_header:
                    header = target_header
                    await header.click(force=True)
                    found = True
            else:
                logger.warning(f"Section '{section_name}' not found. Falling back.")

        if not found and not section_name: # Normal flow if no section specified or section failed
            if search_in_mais_filtros_first:
                 logger.info("Forcing search in 'Mais Filtros' first...")
            else:
                # Try to find the filter header by text 
                target_text = filter_name
                # Removed the over-simplification: if "Código" in target_text: target_text = "Código"
                
                logger.info(f"Looking for header with text: '{target_text}'")
                
                # Look for the header - try exact first, then loose
                header = page.get_by_text(target_text, exact=True)
                if await header.count() == 0:
                    header = page.get_by_text(target_text, exact=False)
                
                header = header.first
                
                if await header.is_visible(timeout=5000):
                    logger.info(f"Header '{target_text}' found and visible. Clicking...")
                    await header.click(force=True)
                    found = True
 
        if not found and (section_name or search_in_mais_filtros_first):
            # Try 'Mais Filtros' if main header missing or forced
            # Try 'Mais Filtros' if main header missing
            logger.info("Main header not found or not visible. Trying 'Mais Filtros'...")
            
            # Screenshot for header not found
            await page.screenshot(path=f"debug_no_header_{filter_name}.png")
            
            mais = page.get_by_text("Mais Filtros", exact=False).first
            if await mais.is_visible(timeout=5000):
                await mais.click(force=True)
                await asyncio.sleep(1.0)
                # Now try finding the header inside
                header_inner = page.get_by_text(filter_name, exact=False).first
                if await header_inner.is_visible(timeout=3000):
                    await header_inner.click(force=True)
                    found = True
                else:
                    logger.warning(f"Header '{filter_name}' NOT found inside 'Mais Filtros'.")
                    await page.screenshot(path=f"debug_mais_filtros_{filter_name}.png")
            else:
                logger.warning("'Mais Filtros' button not found.")
        
        if found:
            # Wait for search box in the filter pane
            logger.info("Header clicked. Waiting for search input...")
            
            # Wait for animation
            await asyncio.sleep(2.0)
            
            # Expanded search selectors - Prioritizing user request
            search_in = page.locator("input[placeholder*='Pesquisar na caixa de listagem'], input[placeholder*='Pesquisar'], input[placeholder*='Search'], input[title*='Pesquisar'], div.lui-search__input input").first
            
            if await search_in.count() == 0:
                 # Try finding ANY input that appeared
                 logger.info("Specific search input not found. looking for generic input...")
                 search_in = page.locator(".qv-listbox-popover input, .lui-popover input").first
            
            
            if await search_in.is_visible(timeout=3000):
                # Robust Input Strategy
                # Strip value to avoid literal space matching issues
                clean_val = str(value).strip()
                
                await search_in.click()
                # Use fill for reliability, then trigger event
                await search_in.fill(clean_val)
                await asyncio.sleep(0.5)
                
                # Check if value stuck
                current_val = await search_in.input_value()
                if not current_val:
                    logger.warning("Fill failed, trying type...")
                    await search_in.type(clean_val, delay=100)
                
                logger.info(f"Input value after fill/type: {await search_in.input_value()}")
                
                await asyncio.sleep(3.0) # Wait for reactive filter (Qlik is often reactive)
                
                # ADAPTIVE LOGIC: Check if items appeared WITHOUT pressing Enter
                # Qlik often filters as you type. Pressing Enter might close the list if it auto-selects.
                
                # Try multiple selectors, prioritizing the most specific ones found in the HTML dump
                possible_items = page.locator("[data-testid='listbox.item']")
                count = await possible_items.count()
                
                if count == 0:
                    possible_items = page.locator(".qv-listbox-li")
                    count = await possible_items.count()
                    
                if count == 0:
                    possible_items = page.locator(".qv-listbox-text") 
                    count = await possible_items.count()
                    
                # Also check generic row roles if specific classes fail
                if count == 0:
                    possible_items = page.locator("div[role='row']")
                    count = await possible_items.count()
                
                logger.info(f"Items visible after typing (no Enter yet): {count}")
                
                if count == 0:
                    # If no items yet, TRY pressing Enter to force a search
                    logger.info("No items visible. Pressing Enter to trigger search/fetch...")
                    await search_in.press("Enter")
                    await asyncio.sleep(3.0)
                    
                    # Re-check count with the same priority
                    possible_items = page.locator("[data-testid='listbox.item']")
                    count = await possible_items.count()
                    
                    if count == 0:
                        possible_items = page.locator(".qv-listbox-li")
                        count = await possible_items.count()
                        
                    if count == 0:
                        possible_items = page.locator(".qv-listbox-text") 
                        count = await possible_items.count()
                        
                    if count == 0:
                        possible_items = page.locator("div[role='row']")
                        count = await possible_items.count()

                    logger.info(f"Items visible after Enter: {count}")

                # STEP 1: Select ALL Items
                item_clicked = False
                try:
                    logger.info("Implementing Bulk Selection...")
                    
                    # Ensure input has focus first
                    if await search_in.is_visible():
                        # We only click if we need to refocus, but be careful not to reset
                        # await search_in.click() 
                        
                        # DEBUG: Capture list state
                        await page.screenshot(path="debug_listbox_before_select.png")
                        
                        # DEBUG: Check if we actually typed anything
                        input_val = await search_in.input_value()
                        logger.info(f"DEBUG: Search input value is '{input_val}'. Expected '{clean_val}'.")
                        
                        # ZERO RESULT CHECK with Fallback
                        if count == 0:
                             # CRITICAL FIX: "Enter" might have auto-confirmed the selection (closing the listbox).
                             logger.info("Listbox empty. Checking 'Current Selections' bar for auto-confirmation...")
                             
                             is_auto_confirmed = False
                             try:
                                 # Selector for the selections bar items
                                 # We look for the text of our search value
                                 sel_bar_item = page.locator(f".qv-selection-toolbar .qv-listbox-text:has-text('{clean_val}'), .selected-field-container:has-text('{clean_val}'), .qv-current-selections-bar:has-text('{clean_val}')").first
                                 if await sel_bar_item.count() > 0 and await sel_bar_item.is_visible():
                                     logger.info(f"Filter '{clean_val}' found in Current Selections bar. considered SUCCESS.")
                                     is_auto_confirmed = True
                                     item_clicked = True # Treat as success
                             except Exception as e_sel:
                                 logger.warning(f"Error checking selections bar: {e_sel}")
                             
                             if not is_auto_confirmed:
                                 # Dump HTML for analysis
                                 html_content = await page.content()
                                 with open("debug_zero_results.html", "w") as f:
                                     f.write(html_content)
                                 logger.info("Saved 'debug_zero_results.html' for inspection.")
                                 
                                 logger.warning(f"No results found for '{clean_val}' (Listbox empty & Not in Selections)")
                                 await page.screenshot(path="debug_search_zero_results.png")
                                 # Return early
                                 import base64
                                 with open("debug_search_zero_results.png", "rb") as img_file:
                                     b64_screen = base64.b64encode(img_file.read()).decode('utf-8')
                                 return {"results": [], "screenshot": b64_screen}
                             else:
                                 # If auto-confirmed, we proceed
                                 pass
                        else:
                             # items found, check if already selected
                             first_item = possible_items.first
                             if await first_item.count() > 0:
                                 aria_label = await first_item.get_attribute("aria-label")
                                 logger.info(f"First item aria-label: {aria_label}")
                                 if aria_label and "Selected" in aria_label:
                                     logger.info("First item appears to be already selected.")

                        # EXECUTE CTRL+A (Bulk Select)
                        # Focus list container first
                        # Try finding the container of the found items
                        if count > 0:
                             # If we found items, the container is their parent
                             # [data-testid='listbox.item'] has a parent which is likely the list container
                             # But sticking to broader selectors for the container might be safer
                             list_container = page.locator(".qv-listbox-list, .njs-b447-Grid-root").first
                        else:
                             list_container = page.locator(".qv-listbox-list").first
                             
                        if await list_container.is_visible():
                            # click force to ensure focus
                            await list_container.click(force=True, position={"x": 50, "y": 50})
                            await asyncio.sleep(0.5)
                            await page.keyboard.press("Control+A")
                            logger.info("Pressed Ctrl+A on Listbox.")
                            await asyncio.sleep(0.5)
                            # Confirm
                            await page.keyboard.press("Enter")
                            logger.info("Pressed Enter to confirm selection.")
                            await asyncio.sleep(2.0)
                            item_clicked = True
                        else:
                            # Fallback global
                            logger.info("Listbox container not explicitly found, trying global Ctrl+A...")
                            await search_in.click()
                            await page.keyboard.press("Control+A")
                            await page.keyboard.press("Enter")
                            item_clicked = True

                            
                    else:
                        logger.warning("Search input lost visibility.")

                except Exception as e: 
                    logger.warning(f"Error during Bulk Selection: {e}")

                # End of Selection Block
                await asyncio.sleep(2.0)
                
                # CHECK TOTAL COUNT (User Request)
                # We try to find the KPI that says "Total de compras registradas"
                # Selector is tricky without DOM dump, but usually it's a KPI object.
                # We search by text.
                try:
                    # Look for text "Total de compras registradas"
                    # Then find the number associated (usually sibling or child)
                    # Assuming standard Qlik KPI: Title + Value
                    logger.info("Verifying Total Count...")
                    
                    # Dump page text to log for debugging if we can't find specific element
                    # But let's try to find the number first.
                    # Often it's in a class "qv-kpi-value" or similar.
                    
                    # Let's verify if the text "Total de compras registradas" exists
                    total_label = page.get_by_text("Total de compras registradas", exact=False).first
                    if await total_label.is_visible():
                        # Try to get the parent or adjacent value
                        # This is a guess: usually the value is close.
                        # Let's screenshot to verify if we are filtering correctly.
                        logger.info("Found 'Total de compras registradas' label.")
                    else:
                        logger.warning("Could not find 'Total de compras registradas' label.")

                    # We proceed regardless, but taking a screenshot for verification
                    await page.screenshot(path="debug_selections_verified.png")
                    
                except Exception as e_total:
                    logger.warning(f"Error checking total: {e_total}")
                
                # Check for confirmation button REGARDLESS of item finding
                # Qlik sometimes selects single match automatically on Enter
                logger.info("Checking for 'Confirmar seleção' button status...")
                confirm_btn = page.locator("button[title='Confirmar seleção'], button[title='Confirmar'], .sel-toolbar-confirm, .qv-confirm-selection").first
                
                if await confirm_btn.is_visible(timeout=5000):
                     logger.info("Button 'Confirmar seleção' FOUND. Clicking...")
                     await confirm_btn.click()
                     await asyncio.sleep(1.0)
                     item_clicked = True
                else:
                     # Check if filter is ALREADY applied (Auto-confirmed)
                     # Look for the value in the "Current Selections" bar
                     # Selector based on HTML dump: .selected-field-container ...
                     is_applied = False
                     try:
                         # Check for container with specific ID (e.g. "Código CATMAT") OR just text
                         # We use a broad check for the value in the selection bar
                         sel_bar_item = page.locator(f".selected-field-container:has-text('{value}')").first
                         if await sel_bar_item.count() > 0 and await sel_bar_item.is_visible():
                              logger.info(f"Filter '{value}' found in Current Selections bar. Auto-confirmed!")
                              is_applied = True
                              item_clicked = True # Treat as success
                     except: pass
                     
                     if is_applied:
                         pass # Success
                     elif item_clicked:
                          logger.warning("Item selected via click but Confirm button not found. Assuming success/waiting.")
                     else:
                          logger.warning("Confirm button not found AND item not selected AND not in Selections bar. Filter likely failed.")
                          # Dump page source for debugging
                          with open("debug_page_source.html", "w") as f:
                              f.write(await page.content())

                # STEP 2: Click "Confirmar seleção" Button (Strict)
                if item_clicked:
                    logger.info("Looking for 'Confirmar seleção' button...")
                    
                    # Wait a bit for the button to animate in
                    await asyncio.sleep(1.0)
                    
                    try:
                        # Improved Selectors for Qlik Sense 2024+
                        confirm_btn = page.locator("button[title='Confirmar seleção'], button[title='Confirmar'], .sel-toolbar-confirm, .qv-confirm-selection, span[title='Confirmar selecionados']").first
                        
                        if await confirm_btn.is_visible(timeout=5000):
                            logger.info("Button 'Confirmar seleção' FOUND. Clicking...")
                            await confirm_btn.click()
                            await asyncio.sleep(2.0) # Wait for grid refresh
                        else:
                            logger.warning("Button 'Confirmar seleção' NOT FOUND. Attempting 'Click Outside' to commit...")
                            # Strategy: Click on a safe neutral area (e.g., top-left corner or main container)
                            await page.mouse.click(10, 10)
                            await asyncio.sleep(2.0)
                            
                            # Check if bar is still in "Selection" mode (green/orange) or committed
                    except Exception as e:
                        logger.error(f"Error during confirmation: {e}")
                        # Last ditch: Click outside
                        await page.mouse.click(0, 0)

                else:
                     logger.warning("Skipping confirmation as item selection failed.")
                    
                logger.info(f"Filter {filter_name} process complete.")
                await asyncio.sleep(5.0) # Wait for Qlik to reload data
                return
            else:
                 logger.warning("Search input not found after clicking header.")
                 await page.screenshot(path="debug_search_not_found.png")
                 
                 # FALLBACK: Listbox might be open but without search bar.
                 # Strategy: Click the listbox area -> Type value blindly -> Press Enter
                 # Or: Use Arrow Keys to scroll down
                 
                 logger.info("FALLBACK: Attempting listbox navigation via Keyboard...")
                 
                 # Try to focus the list (usually .qv-listbox-list or similar)
                 listbox = page.locator(".qv-listbox-list, .lui-list, .qv-listbox-content").first
                 if await listbox.is_visible(timeout=3000):
                     await listbox.click()
                 else:
                     # Just click where the mouse was (header) + a bit down? 
                     # Or just blindly type since header was clicked.
                     pass
                     
                 # Type the value (sometimes triggers jump-to)
                 await page.keyboard.press("Escape") # Reset any weird state? No, might close.
                 
                 # Try blind typing
                 logger.info(f"Blind typing value: {value}")
                 await page.keyboard.type(str(value), delay=100)
                 await asyncio.sleep(2.0)
                 
                 # Press Enter to select whatever is highlighted
                 await page.keyboard.press("Enter")
                 logger.info("Pressed Enter after blind typing.")
                 
                 # Also try ArrowDown loop if blind type failed to select
                 # Use a heuristic: if we expected 21 results and got 15k, this failed.
                 
                 # Try confirm here too
                 try:
                    confirm_btn = page.locator(". sel-toolbar-confirm, button[title='Confirmar']").first
                    if await confirm_btn.is_visible(timeout=2000):
                        await confirm_btn.click()
                 except: pass
                 
                 return

    except Exception as e:
        logger.warning(f"Strategy 1 (Header) failed: {e}")
        try:
             await page.screenshot(path=f"debug_filter_fail_{filter_name}.png")
        except: pass

    # STRATEGY 2: Global Search (The Magnifying Glass)
    logger.info("Attempting Strategy 2: Global Search/Direct Typing...")
    try:
        # Click body to ensure focus
        await page.mouse.click(10, 10)
        
        # Look for Search Icon or Button
        # Expanded selectors for Qlik Sense
        search_selectors = [
            ".qui-search-button", 
            "button[title='Pesquisar']", 
            "button[title='Search']",
            ".sel-toolbar-span-icon.lui-icon--search",
            "#qv-toolbar-search-button"
        ]
        
        search_btn = None
        for sel in search_selectors:
            s = page.locator(sel).first
            if await s.is_visible(timeout=1000):
                search_btn = s
                break
        
        if search_btn:
            logger.info("Global search button found. Clicking...")
            await search_btn.click()
            await asyncio.sleep(1.0)
        else:
            logger.warning("Global search button NOT found.")

        # Just try typing the code blindly if we think a search might be open
        # Actually, let's try finding the "Selection Bar"
        sel_bar = page.locator(".qv-selection-toolbar").first
        if await sel_bar.is_visible():
             logger.info("Selection bar visible.")
    except Exception as e:
        logger.warning(f"Strategy 2 error: {e}")
    
    # STRATEGY 3: Final Desperation - Just Type and Enter
    # Sometimes in Qlik if you just type, it searches.
    try:
        await page.keyboard.type(str(value), delay=100)
        await asyncio.sleep(1.0)
        # Try to select the first suggestion
        await page.keyboard.press("ArrowDown") 
        await asyncio.sleep(0.5)
        await page.keyboard.press("Enter")
        logger.info("Attempted blind typing with ArrowDown.")
    except: pass

async def download_bps_data(page: Page, criteria: Dict) -> tuple:
    """
    Faz download dos dados do BPS usando o botão 'Baixar dados'.
    Retorna (success: bool, file_path: str or None, data: list)
    """
    import tempfile
    import os
    import uuid
    import pandas as pd
    
    logger.info("="*80)
    logger.info("INICIANDO DOWNLOAD DE DADOS DO BPS")
    logger.info("="*80)
    
    # Aguardar estabilização após filtros
    logger.info("Aguardando estabilização da página após filtros...")
    await asyncio.sleep(5.0)
    
    # ESTRATÉGIA 1: Procurar o botão usando múltiplos seletores
    download_btn = None
    # ESTRATÉGIA 1: Procurar o botão usando seletores otimizados
    download_btn = None
    
    # Priority selectors based on debugging
    priority_selectors = [
        "a[id*='Tabela'] span.bt-text:has-text('Baixar dados')", # Best match for detailed data
        "a[id*='Table'] span.bt-text:has-text('Baixar dados')",
    ]
    
    # Generic fallbacks
    fallback_selectors = [
        "a.br-button:has(span.bt-text:has-text('Baixar dados'))",
        "span.bt-text:has-text('Baixar dados')",
        "a:has-text('Baixar dados')",
    ]
    
    logger.info("Procurando botão 'Baixar dados' (Priorizando Tabela)...")
    
    # Try priority first
    for selector in priority_selectors:
        try:
             # Get all matching
             btns = page.locator(selector)
             count = await btns.count()
             for i in range(count):
                 btn = btns.nth(i)
                 if await btn.is_visible():
                     download_btn = btn
                     logger.info(f"✓ Botão PRIORITÁRIO encontrado: {selector}")
                     break
             if download_btn: break
        except: pass

    # Try fallbacks if needed
    if not download_btn:
        logger.info("Botão prioritário não encontrado, tentando genéricos...")
        for selector in fallback_selectors:
             try:
                 btn = page.locator(selector).first
                 if await btn.is_visible():
                     download_btn = btn
                     logger.info(f"✓ Botão GENÉRICO encontrado: {selector}")
                     break
             except: pass
             
    if not download_btn:
        # Try finding ANY button even if hidden to force click
        try:
            download_btn = page.locator("a[id*='Tabela']").first
            logger.warning("Botão prioritário oculto selecionado para tentativa de force-click.")
        except:
             logger.error("❌ Botão 'Baixar dados' não encontrado!")
             return False, None, []
    
    # ESTRATÉGIA 2: Se o botão está dentro de um link <a>, clique no PAI
    try:
        # Tenta pegar o elemento pai (o link <a>)
        parent_link = download_btn.locator("xpath=ancestor::a[@class='br-button']").first
        
        if await parent_link.count() > 0:
            logger.info("Botão está dentro de um link <a>, usando o elemento pai...")
            download_btn = parent_link
    except:
        logger.info("Botão não está em um <a> pai, usando elemento direto...")
        pass
    
    # ESTRATÉGIA 3: Scroll até o botão e torná-lo visível
    try:
        await download_btn.scroll_into_view_if_needed(timeout=5000)
        logger.info("✓ Scroll realizado até o botão")
        await asyncio.sleep(1.0)
    except Exception as e:
        logger.warning(f"Não foi possível fazer scroll: {e}")
    
    # ESTRATÉGIA 4: Remover overlays que possam estar bloqueando
    try:
        await page.evaluate("""
            () => {
                // Remove possíveis overlays
                const overlays = document.querySelectorAll('.overlay, .modal-backdrop, [style*="z-index: 9999"]');
                overlays.forEach(el => el.remove());
            }
        """)
        logger.info("✓ Overlays removidos")
    except:
        pass
    
    # ESTRATÉGIA 5: Preparar para capturar o download
    logger.info("Preparando para iniciar download...")
    
    filename = f"bps_{criteria.get('codigo_material', 'export')}_{uuid.uuid4().hex[:8]}.xlsx"
    tmp_dir = tempfile.gettempdir()
    file_path = os.path.join(tmp_dir, filename)
    
    try:
        logger.info(f"Clicando no botão 'Baixar dados'...")
        
        # Configurar expectativa de download ANTES de clicar
        async with page.expect_download(timeout=60000) as download_info:
            # Tentar múltiplas formas de clicar
            try:
                # Método 1: Clique normal
                await download_btn.click(timeout=10000)
                logger.info("✓ Clique normal executado")
            except Exception as e1:
                logger.warning(f"Clique normal falhou: {e1}")
                try:
                    # Método 2: Clique forçado
                    await download_btn.click(force=True, timeout=10000)
                    logger.info("✓ Clique forçado executado")
                except Exception as e2:
                    logger.warning(f"Clique forçado falhou: {e2}")
                    try:
                        # Método 3: Dispatch de evento de clique
                        await download_btn.dispatch_event("click")
                        logger.info("✓ Evento de clique disparado")
                    except Exception as e3:
                        logger.error(f"Todos os métodos de clique falharam!")
                        raise e3
            
            # Aguardar um pouco para processar
            await asyncio.sleep(2.0)
            
            # Às vezes o Qlik demora para gerar o arquivo e só depois mostra o link "Clique aqui para baixar"
            try:
                logger.info("Aguardando possível link de download adicional ('Clique aqui')...")
                # Extended timeout because export can be slow
                additional_link = page.locator("a[download], a:has-text('Clique aqui'), a.download-link, a:has-text('Click here')").first
                if await additional_link.is_visible(timeout=45000):
                    logger.info("Link de download adicional encontrado, clicando...")
                    await additional_link.click(force=True)
            except Exception as e_add:
                logger.info(f"Nenhum link adicional visível ou ocorreu um erro na espera: {e_add}")
        
        # Processar o download
        logger.info("Aguardando conclusão do download...")
        download = await download_info.value
        
        logger.info(f"Download recebido: {download.suggested_filename}")
        await download.save_as(file_path)
        
        # Verificar se o arquivo foi salvo corretamente
        if not os.path.exists(file_path):
            logger.error(f"❌ Arquivo não foi salvo: {file_path}")
            return False, None, []
        
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            logger.error(f"❌ Arquivo salvo está vazio!")
            os.remove(file_path)
            return False, None, []
        
        logger.info(f"✓ Download concluído com sucesso!")
        logger.info(f"  Arquivo: {file_path}")
        logger.info(f"  Tamanho: {file_size:,} bytes")
        
        # ESTRATÉGIA 6: Processar o arquivo Excel
        logger.info("Lendo conteúdo do arquivo Excel...")
        
        try:
            df = pd.read_excel(file_path)
            logger.info(f"✓ Excel carregado: {len(df)} linhas encontradas")
            logger.info(f"DEBUG: Columns found: {df.columns.tolist()}")
            
            # Use 'results' list directly
            data_results = []
            
            for index, row in df.iterrows():
                # Extrair campos com tratamento de None/NaN
                def safe_str(value):
                    if pd.isna(value) or value is None:
                        return ''
                    # Handle Timestamp (Date) objects
                    if hasattr(value, 'strftime'):
                        return value.strftime('%d/%m/%Y')
                    return str(value).strip()
                
                fornecedor = safe_str(row.get('Fornecedor', row.get('Razão Social', '')))
                marca = safe_str(row.get('Marca', ''))
                unidade = safe_str(row.get('Unidade', row.get('Unidade Fornecimento', '')))
                orgao = safe_str(row.get('Nome da instituição', row.get('Instituição', row.get('Órgão', ''))))
                data_homolog = safe_str(row.get('Data Homologação', ''))
                
                # Tratamento especial para preço
                # Fix: Case sensitivity for 'Valor Item Compra'
                preco_raw = row.get('Valor Item Compra', row.get('Preço Unitário Homologado', row.get('Preço Unitário', 0)))
                
                if isinstance(preco_raw, (int, float)):
                    preco_val = str(preco_raw)
                    price_str = f"R$ {preco_raw:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
                else:
                    preco_val = safe_str(preco_raw)
                    price_str = f"R$ {preco_val}"
                
                # Quantidade
                # Fix: Add 'Quantidade Item Compra' as priority
                qtd_raw = row.get('Quantidade Item Compra', row.get('Quantidade Oferta', row.get('Quantidade', 0)))
                qtd = safe_str(qtd_raw)
                
                # Texto formatado para exibição
                formatted_text = (
                    f"{price_str} || "
                    f"Fornecedor: {fornecedor} || "
                    f"Marca: {marca} || "
                    f"Qtd: {qtd} || "
                    f"Data: {data_homolog} || "
                    f"Unidade: {unidade} || "
                    f"Órgão: {orgao}"
                )
                
                # User requested columns mapping
                # Codigo Catmat, descricao Catmat, Unidade Fornecida, Data de homologacao , Modalidade , 
                # CNPJ Comprador, Nome INstituição, UF, nome municipio, valore item Compra, quantidade item compra, valore total Compra
                
                cod_catmat = safe_str(row.get('Código CATMAT', ''))
                desc_catmat = safe_str(row.get('Descrição Catmat', ''))
                modalidade = safe_str(row.get('Modalidade Compra', ''))
                cnpj_comprador = safe_str(row.get('CNPJ Comprador', ''))
                nome_inst = safe_str(row.get('Nome Instituição', row.get('Nome da instituição', '')))
                uf = safe_str(row.get('UF', ''))
                municipio = safe_str(row.get('Nome Município', ''))
                val_total = safe_str(row.get('Valor Total Compra', ''))
                
                # Ensure we have these for the specific display requirements
                data_results.append({
                    "raw_text": formatted_text,
                    "preco": preco_val,
                    "fornecedor": fornecedor,
                    "marca": marca,
                    "quantidade": qtd,
                    "data": data_homolog,
                    "orgao": orgao,
                    "unidade": unidade,
                    # New fields (camelCase for Frontend)
                    "codigoCatmat": cod_catmat,
                    "descricaoCatmat": desc_catmat,
                    "modalidade": modalidade,
                    "cnpjComprador": cnpj_comprador,
                    "nomeInstituicao": nome_inst,
                    "uf": uf,
                    "municipio": municipio,
                    "valorTotalCompra": val_total,
                    "valorItemCompra": preco_val,
                    "quantidadeItemCompra": qtd,
                    "_method": "excel_download"
                })
            
            logger.info(f"✓ Processados {len(data_results)} registros do Excel")
            
            # Limpar arquivo temporário
            try:
                # os.remove(file_path)
                logger.info(f"✓ Arquivo temporário MANTIDO para debug: {file_path}")
            except:
                pass
            
            return True, file_path, data_results
            
        except Exception as e:
            logger.error(f"❌ Erro ao processar Excel: {e}")
            
            # Tenta limpar o arquivo mesmo em caso de erro
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except:
                pass
            
            return False, file_path, []
    
    except Exception as e:
        logger.error(f"❌ Erro durante o download: {e}")
        logger.error(f"   Tipo: {type(e).__name__}")
        logger.error(f"   Detalhes: {str(e)}")
        
        # Salvar screenshot para debug
        try:
            await page.screenshot(path="debug_download_error.png", full_page=True)
            logger.info("Screenshot de erro salvo: debug_download_error.png")
        except:
            pass
        
        return False, None, []
async def scrape_bps_data(criteria: Dict[str, Any]) -> List[Dict]:
    async with async_playwright() as p:
        # Launch browser (headless=True for production)
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1920, 'height': 1080})
        page = await context.new_page()
        
        captured_data = []
        remote_logs = []
        
        def log_step(msg):
            logger.info(msg)
            remote_logs.append(msg)

        # Intercept Logic - Defining a specific listener for this session
        async def handle_response(response):
            if response.status == 200 and "application/json" in response.headers.get("content-type", ""):
                try:
                    # We are looking for the table data. 
                     # In Qlik, this is often a large payload with 'qHyperCube'
                    body = await response.json()
                    captured_data.append(body)
                except:
                    pass
        
        page.on("response", handle_response)

        try:
            logger.info(f"Navigating to {BPS_URL}")
            await page.goto(BPS_URL, timeout=60000)
            
            # Wait for App Load (Qlik spinner or title)
            await page.wait_for_selector("div.qv-object-content-container", timeout=30000)
            logger.info("Page loaded.")
            
            # --- START NEW FLOW: EARLY BUTTON CHECK ---
            # 1. Carregar a pagina, neste momento ja deve existir o botao de download, mas nao clique ainda.
            logger.info("STEP 1: Checking for 'Baixar dados' button presence (Pre-Filter)...")
            try:
                early_btn = page.locator("a.br-button:has-text('Baixar dados'), span.bt-text:has-text('Baixar dados')").first
                if await early_btn.is_visible(timeout=5000):
                    logger.info("✓ Early check passed: Download button is visible.")
                else:
                    logger.warning("! Early check warning: Download button NOT visible yet.")
            except:
                pass
            
            # CLEAR SELECTIONS
            try:
                clear_btn = page.locator(".qv-subtoolbar-button-clear, button[title='Limpar seleções'], button[title='Clear selections']").first
                if await clear_btn.is_visible(timeout=3000):
                    logger.info("Clearing existing selections...")
                    await clear_btn.click()
                    await asyncio.sleep(2.0)
            except: 
                pass
            
            # Apply Filters
            # Mappings from Criteria keys to UI Labels
            # Prioritize 'Filtros Obrigatórios'
            if "codigo_material" in criteria:
                # User request: "Código Material" inside "Filtros Obrigatórios"
                # Using specific section targeting
                await apply_filter(
                    page, 
                    "Código Material", 
                    criteria["codigo_material"], 
                    section_name="Filtros Obrigatórios"
                )
            
            if "descricao_catmat" in criteria:
                # User request: "Descrição CatMat" inside "Filtros Obrigatórios"
                result = await apply_filter(
                    page, 
                    "Descrição CatMat", 
                    criteria["descricao_catmat"], 
                    section_name="Filtros Obrigatórios"
                )
                # Check for Early Exit (0 Results)
                if result and isinstance(result, dict) and "results" in result and len(result["results"]) == 0:
                    logger.warning("Early exit triggered: 0 results found for filters.")
                    return result
            

                
            # 'Mais Filtros'
            if "uf" in criteria:
                await apply_filter(page, "UF", criteria["uf"])
            
            if "municipio" in criteria:
                await apply_filter(page, "Municipio", criteria["municipio"])
                
            if "ano" in criteria:
               await apply_filter(page, "Ano Homologação", str(criteria["ano"]))
            
            # --- START NEW FLOW: INTERMEDIATE STEPS ---
            # 2- Carregue o filtro com o id catmat, ou nome do produto, role a pagina e ou aguarde alguns segundos
            logger.info("STEP 2: Filters applied. Executing Scroll & Wait strategy...")
            
            # Scroll Down
            await page.mouse.wheel(0, 500)
            await asyncio.sleep(1.0)
            await page.mouse.wheel(0, 500)
            
            logger.info("Waited and Scrolled. Now waiting 5s for dynamic update...")
            await asyncio.sleep(5.0) 
            
            # Capture state after filters
            await page.screenshot(path="bps_after_filters.png", full_page=True)
            logger.info("Screenshot 'bps_after_filters.png' captured for visual verification.")
            
            # Log Current Selections
            try:
                sel_bar = page.locator(".qv-selection-toolbar, .qv-current-selections-bar").first
                if await sel_bar.is_visible():
                    sel_text = await sel_bar.inner_text()
                    logger.info(f"CURRENT SELECTIONS: {sel_text.replace(chr(10), ' | ')}")
                else:
                    logger.info("Current selections bar not visible.")
            except Exception as e:
                logger.warning(f"Could not read selections: {e}")
            
            # Data Extraction Strategy 2: DOM Parsing (Fallback)
            # If network interception is too hard without knowing the exact protocol (Qlik Engine API is complex),
            # reading the DOM table is often safer for a generic script.
            
            # Select table rows. Adjust selector based on typical Qlik tables (ui-grid-row, qv-grid-row etc)
            # Inspection needed for exact class. Assuming standard HTML table or div-grid
            # Browser agent reported ".qv-object-content-container" as table container.
            
            # Strategy 2: Download Excel Data (Robust Method)
            results = []
            
            # --- DOWNLOAD DATA ---
            success, file_path_out, data_results = await download_bps_data(page, criteria)
            
            if success and data_results:
                results = data_results
                download_success = True
            else:
                download_success = False
                if not results: # Only fallback if no results yet
                     logger.warning("Download falhou ou sem resultados, usando fallback de screen scraping...")
        

            # Fallback: Virtual Scrolling Check (if download failed)
            if not download_success:
                log_step("Download failed or button missing. Falling back to Screen Scraping...")
                
                # Virtual Scrolling Strategy: Scrape -> Scroll -> Scrape -> Deduplicate
                captured_texts = set()
                
                # Selector Strategy
                # Use a function to find best rows
                row_selector = "div[role='row']"
                if await page.locator(row_selector).count() == 0: row_selector = ".qv-st-data-row"
                if await page.locator(row_selector).count() == 0: row_selector = ".qv-grid-row"
                
                logger.info(f"Using row selector: {row_selector}")
                
                # Ensure focus on grid
                try:
                    grid = page.locator(".qv-grid-body").first
                    if await grid.is_visible():
                        await grid.hover()
                        await grid.click()
                except:
                    pass

                max_items = 200
                no_change_count = 0
                
                for cycle in range(10): # Max 10 scrolls
                    rows = page.locator(row_selector)
                    count = await rows.count()
                    
                    added_in_cycle = 0
                    for i in range(count):
                        try:
                            text = await rows.nth(i).inner_text()
                            # Clean text
                            lines = text.split("\n")
                            clean_text = text.replace("\n", " || ").replace("\t", " || ")
                            
                            if len(clean_text) > 5 and clean_text not in captured_texts:
                                captured_texts.add(clean_text)
                                
                                # Attempt to parse columns from lines
                                item = {"raw_text": clean_text, "_method": "screen_scraping"}
                                
                                # Simple Heuristic
                                import re
                                for line in lines:
                                    if "R$" in line and "preco" not in item:
                                        item["preco"] = line.strip().replace("R$", "").strip()
                                    if re.search(r"\d{2}/\d{2}/\d{4}", line) and "data" not in item:
                                        item["data"] = line.strip()
                                    if line.strip().isdigit() and "quantidade" not in item:
                                        item["quantidade"] = line.strip()
                                
                                nonEmpty = [l for l in lines if l.strip()]
                                if len(nonEmpty) > 0: item["fornecedor"] = nonEmpty[0]
                                if len(nonEmpty) > 4: item["orgao"] = nonEmpty[-1]
                                
                                results.append(item)
                                added_in_cycle += 1
                        except:
                            continue
                    
                    logger.info(f"Cycle {cycle}: Found {count} visible, Added {added_in_cycle} new items. Total: {len(results)}")
                    
                    if len(results) >= max_items:
                        break
                        
                    if added_in_cycle == 0:
                        no_change_count += 1
                        if no_change_count >= 2: 
                            break
                    else:
                        no_change_count = 0
                    
                    # Scroll
                    await page.mouse.wheel(0, 1500)
                    await asyncio.sleep(1.0)


            # Final Fallback
            if not results:
                logger.warning("No rows extracted. Adding fallback item for evidence.")
                results.append({"raw_text": "Dados em Tabela (Ver Comprovante) - Extração Automática BPS"})
            
            # Capture Screenshot for Evidence
            screenshot_bytes = await page.screenshot(full_page=True)
            import base64
            screenshot_b64 = base64.b64encode(screenshot_bytes).decode("utf-8")
            logger.info("Screenshot captured.")
            
            # Cleanup temp file if exists
            if download_success and 'file_path' in locals() and os.path.exists(file_path):
                 os.remove(file_path)

            return {"results": results, "screenshot": screenshot_b64, "remote_logs": remote_logs}

        except Exception as e:
            logger.error(f"Scraping failed: {e}")
            return {"results": [], "screenshot": None, "remote_logs": remote_logs if 'remote_logs' in locals() else [str(e)]}
        finally:
            await browser.close()

if __name__ == "__main__":
    # Batch Processing Configuration
    # Test with Amoxicilina which had 0 results issue
    TEST_CRITERIA = [
        {"descricao_catmat": "amoxicilina"},
        #{"codigo_material": "332849"} 
    ]
    
    all_results = []
    
    for criteria in TEST_CRITERIA:
        # Determine label for logging
        label = criteria.get("codigo_material") or criteria.get("descricao_catmat")
        logger.info(f"--- Starting scraping for: {label} ---")
        
        # Ensure asyncio logic is correct for calling async function
        try:
           data = asyncio.run(scrape_bps_data(criteria))
           
           if data and "results" in data:
               for item in data["results"]:
                   item["source_query"] = label # Track source
                   all_results.append(item)
        except Exception as e:
            logger.error(f"Error executing scraper for {label}: {e}")
        
        logger.info(f"--- Finished scraping for: {label} ---")
        asyncio.run(asyncio.sleep(2.0)) # Be polite between requests

    # Save aggregated results
    import json
    with open("bps_extracted_data_amox.json", "w", encoding="utf-8") as f:
        json.dump(all_results, f, indent=4, ensure_ascii=False)
    
    logger.info(f"Execution finished. Total records extracted: {len(all_results)}")
    logger.info("Data saved to 'bps_extracted_data_amox.json'")
