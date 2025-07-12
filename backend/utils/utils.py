import requests
from urllib.parse import quote, urlparse
from bs4 import BeautifulSoup

def discover_urls_from_query(query: str, limit: int = 5) -> list[str]:
    headers = {"User-Agent": "Mozilla/5.0"}
    search_url = f"https://www.bing.com/search?q={quote(query)}"
    blacklist = ["reddit", "quora", "youtube", "twitter", "linkedin"]
    allowed = [".com", ".org", ".io", ".net"]

    try:
        resp = requests.get(search_url, headers=headers, timeout=10)
        soup = BeautifulSoup(resp.text, "html.parser")
        urls: list[str] = []

        for a in soup.select("li.b_algo h2 a"):
            href_raw = a.get("href")
            if not isinstance(href_raw, str) or not href_raw.startswith("http"):
                continue

            domain = urlparse(href_raw).netloc
            if any(b in domain for b in blacklist):
                continue
            if not any(domain.endswith(ext) for ext in allowed):
                continue

            urls.append(href_raw)
            if len(urls) >= limit:
                break

        return urls
    except Exception as e:
        print(f"[ERROR] URL discovery failed: {e}")
        return []
