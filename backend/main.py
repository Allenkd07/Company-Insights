from fastapi import FastAPI
from api.routes import router

app = FastAPI(title="Company Scraper")
app.include_router(router, prefix="/api")
