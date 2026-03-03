from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import scraper
import logging

app = FastAPI(title="BPS Scraper Service", version="1.0.0")

# Request Model
class SearchCriteria(BaseModel):
    codigo_material: Optional[str] = None
    descricao_catmat: Optional[str] = None
    uf: Optional[str] = None
    municipio: Optional[str] = None
    ano: Optional[str] = None

@app.post("/search-bps")
async def search_bps(criteria: SearchCriteria):
    """
    Endpoint to search BPS (Banco de Preços em Saúde).
    Triggers the Playwright scraper.
    """
    try:
        logging.info(f"Received search request: {criteria}")
        
        # Convert to dict, removing None values
        search_dict = {k: v for k, v in criteria.model_dump().items() if v is not None}
        
        if not search_dict:
            raise HTTPException(status_code=400, detail="At least one filter must be provided.")
            
        results = await scraper.scrape_bps_data(search_dict)
        
        if not results or not results.get("results"):
             return {"message": "Nenhum resultado encontrado", "data": [], "screenshot": results.get("screenshot")}
             
        return {"data": results["results"], "screenshot": results.get("screenshot")}

    except Exception as e:
        logging.error(f"Error in search endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "ok"}
