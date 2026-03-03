import asyncio
import scraper
import logging
import sys

# Configure logging to stdout
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

async def main():
    print("----------------------------------------------------------------")
    print("STARTING REPRODUCTION SCRIPT: Search for 'amoxicilina'")
    print("----------------------------------------------------------------")
    
    criteria = {"descricao_catmat": "amoxicilina"}
    
    try:
        result = await scraper.scrape_bps_data(criteria)
        print("\n\nFINAL RESULT PAYLOAD:")
        print(result)
        
    except Exception as e:
        print(f"\n\nEXCEPTION CAUGHT: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
