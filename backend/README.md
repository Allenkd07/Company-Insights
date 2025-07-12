```markdown
# 🌐 Company Insight Scraper – Backend

This project is a **backend web scraping service** that accepts either:

- A list of **company websites**  
- A **search query** (e.g., _"cloud computing startups in Europe"_)

...and extracts the following company details using **Selenium**:

- ✅ Company name (from homepage or contact/about page)
- 📧 Email addresses
- ☎️ Phone numbers
- 🔗 Contact/About page URL

All results are saved to a **MongoDB** collection (`scraper_db > companies`).

---

## 🛠 Features

- 🔍 **Query-based Discovery**  
  Automatically discovers company websites from a search query using Bing.

- 🕷️ **Selenium-based Contact Scraping**  
  Navigates company websites to intelligently find `Contact` or `About` pages and scrape key info.

- 🧠 **Smart Extraction**  
  Uses regex and BeautifulSoup to extract emails and phone numbers.

- 📦 **MongoDB Integration**  
  Stores each company's full metadata in a MongoDB collection.

---

## 📁 Project Structure

```

company-insights/
├── main.py                 # FastAPI app
├── api/
│   └── routes.py           # API endpoints
├── scraper/
│   └── selenium\_scraper.py # Core scraping logic
├── utils/
│   └── search.py           # Query-to-URLs logic using Bing
├── db/
│   └── mongo\_client.py     # MongoDB connection + save logic
├── .env                    # MongoDB URI (MONGO\_URI=...)
└── requirements.txt        # Python dependencies

````

---

## 🚀 How to Run

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/company-insights.git
cd company-insights
````

### 2. Setup Python Environment

```bash
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 3. Setup `.env`

Create a `.env` file in the root with your MongoDB URI:

```
MONGO_URI=mongodb://localhost:27017
```

### 4. Run the Server

```bash
uvicorn main:app --reload
```

---

## 🧪 Sample API Usage

### ➤ Search Query Endpoint

```bash
curl -X POST http://127.0.0.1:8000/api/scrape-query \
  -H 'Content-Type: application/json' \
  -d '{"query": "five cloud computing companies in Europe"}'
```

### ➤ Direct URL List (for future use)

```bash
curl -X POST http://127.0.0.1:8000/api/scrape-urls \
  -H 'Content-Type: application/json' \
  -d '{"urls": ["https://example.com", "https://another.com"]}'
```

---

## 📥 MongoDB Output Example

```json
{
  "_id": "ObjectId(...)",
  "name": "OneLab Ventures",
  "url": "https://www.onelabventures.com/",
  "contact_page": "https://www.onelabventures.com/about-us",
  "emails": ["contact@onelabventures.com", "jdutta@onelabventures.com"],
  "phones": ["+91 882 713 5321", "+1 978 464 1930"]
}
```

---

## 🧾 Notes

* Frontend is **not implemented** yet – only backend is available.
* Headless mode is off in Selenium for easier debugging. It can be enabled later for production.
* Avoid scraping too frequently to respect website rate limits.

---

## 📌 TODO (Upcoming)

* [ ] Frontend React interface for entering queries & displaying results
* [ ] Async scraping status page
* [ ] Domain filtering and deduplication
* [ ] Proxy/rotating user agents

---

## 👨‍💻 Author

**Karthik Dileep**
*Developed as part of a backend engineering assessment*

---

## 📄 License

This project is for educational and demonstration purposes only.

```
