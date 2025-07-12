from pydantic import BaseModel, HttpUrl
from typing import Optional, List


class ScrapeRequest(BaseModel):
    query: Optional[str] = None
    urls: Optional[List[HttpUrl]] = None
    limit: Optional[int] = 5