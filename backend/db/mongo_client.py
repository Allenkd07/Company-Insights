from pymongo import MongoClient
import os
from dotenv import load_dotenv
from loguru import logger

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client["scraper_db"]
collection = db["companies"]

def save_to_db(data: dict):
    result = collection.insert_one(data)
    logger.info(f"Inserted document with _id: {result.inserted_id}")
