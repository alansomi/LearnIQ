import urllib.request
import json
import argparse
from database import get_session, Resource, new_id

def fetch_devto_articles(tag, topic, difficulty="Intermediate", limit=20):
    print(f"Fetching articles for tag '{tag}'...")
    url = f"https://dev.to/api/articles?tag={tag}&per_page={limit}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    try:
        res = urllib.request.urlopen(req)
        data = json.loads(res.read())
    except Exception as e:
        print(f"Error fetching from dev.to: {e}")
        return []

    resources = []
    for item in data:
        # Dev.to articles have positive_reactions_count which we can use for rating
        reactions = item.get("public_reactions_count", 0)
        rating = min(5.0, max(1.0, 3.5 + (reactions / 100)))

        resource = Resource(
            id=new_id(),
            title=item["title"],
            topic=topic,
            type="Article",
            difficulty=difficulty,
            tags=f"{tag} {topic.lower()} dev.to article tutorial",
            description=item.get("description", "A detailed technical article.")[:500],
            url=item["url"],
            source="Dev.to",
            rating=round(rating, 1)
        )
        resources.append(resource)
        
    return resources

def save_to_db(resources):
    session = get_session()
    count = 0
    for res in resources:
        exists = session.query(Resource).filter_by(url=res.url).first()
        if not exists:
            session.add(res)
            count += 1
    session.commit()
    session.close()
    print(f"Successfully saved {count} new articles to the database!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Dev.to articles.")
    parser.add_argument("--tag", type=str, required=True, help="Dev.to tag (e.g., 'machinelearning')")
    parser.add_argument("--topic", type=str, required=True, help="The topic category (e.g., 'Machine Learning')")
    parser.add_argument("--difficulty", type=str, default="Intermediate")
    parser.add_argument("--limit", type=int, default=20)
    
    args = parser.parse_args()
    new_resources = fetch_devto_articles(args.tag, args.topic, args.difficulty, args.limit)
    save_to_db(new_resources)
