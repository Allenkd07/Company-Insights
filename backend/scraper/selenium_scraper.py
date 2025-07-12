# # backend\scraper\selenium_scraper.py
import re
import time
from urllib.parse import urljoin, urlparse, quote
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
from bs4.element import Tag
import requests
from typing import List



def extract_emails_and_phones(text: str):
    emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    phones = re.findall(r"\+?\d[\d\s().-]{7,}", text)
    return list(set(emails)), list(set(phones))


def get_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument(f"user-agent={UserAgent().random}")
    return webdriver.Chrome(options=options)

def extract_company_name(driver, url):
    try:
        # 1. Check Open Graph site name
        og_site = driver.find_element("xpath", "//meta[@property='og:site_name']")
        content = og_site.get_attribute("content")
        if content and len(content.strip()) > 3:
            return content.strip()
    except Exception:
        pass

    try:
        # 2. Fallback to <title>
        title = driver.title
        if title and len(title.strip()) > 3:
            return title.strip()
    except Exception:
        pass

    try:
        # 3. Fallback to domain
        return urlparse(url).netloc.replace("www.", "")
    except Exception:
        return "Unknown"


def find_contact_or_about_page(base_url: str, soup: BeautifulSoup) -> str:
    for a in soup.find_all("a", href=True):
        if not isinstance(a, Tag):  # 🛡️ Ensures .get() is safe
            continue

        href = a.get("href")
        if not isinstance(href, str):  # 🛡️ Ensures .lower() is safe
            continue

        href_lc = href.lower()
        text = a.get_text(strip=True).lower()

        if any(x in href_lc or x in text for x in ["contact", "about", "support"]):
            return urljoin(base_url, href)

    return base_url


def scrape_company_data(url: str):
    driver = get_driver()
    try:
        driver.get(url)
        time.sleep(3)

        soup = BeautifulSoup(driver.page_source, "html.parser")

        # Try to detect company name
        company_name = extract_company_name(driver, url)

        # Try to find a better page
        contact_url = find_contact_or_about_page(url, soup)

        # Visit contact/about page if not same as home
        if contact_url != url:
            driver.get(contact_url)
            time.sleep(3)
            soup = BeautifulSoup(driver.page_source, "html.parser")

        text = soup.get_text(separator="\n", strip=True)
        emails, phones = extract_emails_and_phones(text)

        return {
            "name": company_name,
            "url": url,
            "contact_page": contact_url,
            "emails": emails,
            "phones": phones
        }

    finally:
        driver.quit()


def discover_company_websites(query: str, limit: int = 5) -> List[str]:
    headers = {"User-Agent": "Mozilla/5.0"}
    search_url = f"https://www.bing.com/search?q={quote(query)}"
    blacklist = ["linkedin.com", "twitter.com", "youtube.com", "facebook.com", "reddit.com", "medium.com"]
    allowed_exts = [".com", ".org", ".net", ".io", ".ai"]

    try:
        resp = requests.get(search_url, headers=headers, timeout=5)
        soup = BeautifulSoup(resp.text, "html.parser")
        urls = []

        for a in soup.select("li.b_algo h2 a"):
            href = a.get("href")
            if not isinstance(href, str) or not href.startswith("http"):
                continue
            domain = urlparse(href).netloc.lower()
            if any(bad in domain for bad in blacklist):
                continue
            if not any(domain.endswith(ext) for ext in allowed_exts):
                continue
            if href not in urls:
                urls.append(href)
            if len(urls) >= limit:
                break
        return urls

    except Exception as e:
        print("Search failed:", e)
        return []
    

# Example usage
if __name__ == "__main__":
    result = scrape_company_data("https://www.cloudflare.com/")
    print(result)
