from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from loguru import logger
from db.mongo_client import save_to_db
from scraper.selenium_scraper import scrape_company_data, discover_company_websites
from .models import ScrapeRequest

router = APIRouter()



@router.post("/scrape", status_code=202)
async def scrape_companies(req: ScrapeRequest, background_tasks: BackgroundTasks):
    seed_urls = set()

    if req.urls:
        seed_urls.update(str(url) for url in req.urls)

    if req.query:
        discovered = discover_company_websites(req.query, limit=req.limit or 5)
        seed_urls.update(discovered)

    if not seed_urls:
        return {"message": "No URLs to scrape. Provide a query or seed URLs."}

    for url in seed_urls:
        background_tasks.add_task(run_scrape_task, url)

    return {
        "message": "Scraping initiated",
        "total_urls": len(seed_urls),
        "urls": list(seed_urls)
    }


def run_scrape_task(url: str):
    try:
        logger.info(f"Started scraping: {url}")
        result = scrape_company_data(url)
        save_to_db(result)
        logger.info(f"Scraped and saved: {url}")
    except Exception as e:
        logger.error(f"Failed to scrape {url}: {e}")
