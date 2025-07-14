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
from urllib.parse import urlparse, parse_qs, unquote


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


def extract_real_url(duckduckgo_url: str) -> str:
    """Extract actual URL from DuckDuckGo redirect link."""
    parsed = urlparse(duckduckgo_url)
    qs = parse_qs(parsed.query)
    return unquote(qs.get("uddg", [""])[0]) if "uddg" in qs else duckduckgo_url


def extract_redirect_target(manifest_url: str) -> str:
    """Extract actual target from redirect links like themanifest.com."""
    try:
        parsed = urlparse(manifest_url)
        query = parse_qs(parsed.query)
        if "u" in query and query["u"][0]:
            return unquote(query["u"][0])
    except Exception:
        pass
    return manifest_url  # fallback


def extract_external_links_from_article(url: str, limit: int = 5) -> List[str]:
    """Extract external company links from a blog/article page."""
    driver = get_driver()
    try:
        driver.get(url)
        time.sleep(2)
        soup = BeautifulSoup(driver.page_source, "html.parser")

        base_domain = urlparse(url).netloc
        external_links = set()

        for a in soup.find_all("a", href=True):
            if isinstance(a, Tag):
                href = str(a["href"])
                full_url = urljoin(url, href)

                # 🧼 Clean redirect URLs
                real_url = extract_redirect_target(full_url)

                # Skip if the real URL is empty or still a redirect
                if not real_url or "r.themanifest.com" in real_url:
                    continue

                parsed = urlparse(real_url)
                domain = parsed.netloc.lower()

                if (
                    parsed.scheme in ["http", "https"]
                    and domain != base_domain
                    and not any(bad in domain for bad in ["linkedin.com", "facebook.com", "twitter.com", "youtube.com", "reddit.com", "instagram.com"])
                    and any(domain.endswith(ext) for ext in [".com", ".org", ".net", ".io", ".ai"])
                ):
                    external_links.add(real_url)
                    if len(external_links) >= limit:
                        break

        return list(external_links)

    except Exception as e:
        print(f"Error scraping article: {url}\n{e}")
        return []

    finally:
        driver.quit()



def discover_company_websites(query: str, limit: int = 5) -> List[str]:
    """Discover company websites by querying DuckDuckGo and extracting article links."""
    headers = {"User-Agent": "Mozilla/5.0"}
    search_url = f"https://html.duckduckgo.com/html/?q={quote(query)}"

    try:
        resp = requests.get(search_url, headers=headers, timeout=5)
        print("DuckDuckGo status:", resp.status_code)
        soup = BeautifulSoup(resp.text, "html.parser")

        # Step 1: Get top article URLs from DuckDuckGo
        article_urls = []
        for a in soup.select("a[href*='/l/?uddg=']"):
            raw_href = a.get("href")
            if isinstance(raw_href, str):
                real_url = extract_real_url(raw_href)
                print("🔍 Real URL:", real_url)
                article_urls.append(real_url)
                if len(article_urls) >= limit:
                    break

        # Step 2: Extract external company links from each article
        final_company_urls = []
        for article_url in article_urls:
            external_links = extract_external_links_from_article(article_url, limit=5)
            final_company_urls.extend(external_links)

        print("Discovered:", final_company_urls)
        return final_company_urls[:limit]

    except Exception as e:
        print("DuckDuckGo search failed:", e)
        return []


# Example usage for testing
if __name__ == "__main__":
    query = "AI companies in Europe"
    company_sites = discover_company_websites(query)
    print("\nFinal company websites:")
    for site in company_sites:
        print("🔗", site)

# # Example usage
# if __name__ == "__main__":
#     result = scrape_company_data("https://www.cloudflare.com/")
#     print(result)