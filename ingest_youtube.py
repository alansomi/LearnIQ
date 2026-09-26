import os
import argparse
from googleapiclient.discovery import build
from database import get_session, Resource, new_id

# Initialize the YouTube API client
def get_youtube_client():
    api_key = os.environ.get("YOUTUBE_API_KEY")
    if not api_key:
        raise ValueError("YOUTUBE_API_KEY environment variable is not set. Please add it to your .env file.")
    return build('youtube', 'v3', developerKey=api_key)

def fetch_youtube_videos(query, topic, difficulty="Beginner", max_results=10):
    print(f"Searching YouTube for: '{query}'...")
    youtube = get_youtube_client()
    
    # Search for videos
    request = youtube.search().list(
        part="snippet",
        q=query,
        type="video",
        videoDuration="long", # Prefer longer, course-like videos
        maxResults=max_results
    )
    response = request.execute()

    resources = []
    for item in response.get("items", []):
        video_id = item["id"]["videoId"]
        snippet = item["snippet"]
        
        # We need a quick second call to get the view/like count for a mock 'rating'
        stat_request = youtube.videos().list(
            part="statistics",
            id=video_id
        )
        stat_response = stat_request.execute()
        stats = stat_response["items"][0]["statistics"] if stat_response["items"] else {}
        
        # Calculate a rough rating based on likes (just a simple heuristic for demo purposes)
        like_count = int(stats.get("likeCount", 0))
        view_count = int(stats.get("viewCount", 1))
        rating = min(5.0, max(1.0, 3.0 + (like_count / view_count) * 100)) if view_count > 0 else 4.0

        resource = Resource(
            id=new_id(),
            title=snippet["title"],
            topic=topic,
            type="Video",
            difficulty=difficulty,
            tags=f"{topic.lower()} youtube tutorial course",
            description=snippet["description"][:500], # Keep it reasonable
            url=f"https://www.youtube.com/watch?v={video_id}",
            source="YouTube",
            rating=round(rating, 1)
        )
        resources.append(resource)
        
    return resources

def save_to_db(resources):
    session = get_session()
    count = 0
    for res in resources:
        # Prevent duplicates based on URL
        exists = session.query(Resource).filter_by(url=res.url).first()
        if not exists:
            session.add(res)
            count += 1
    session.commit()
    session.close()
    print(f"Successfully saved {count} new resources to the database!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest YouTube videos into the learning platform.")
    parser.add_argument("--query", type=str, required=True, help="YouTube search query (e.g., 'Python full course')")
    parser.add_argument("--topic", type=str, required=True, help="The topic category (e.g., 'Python')")
    parser.add_argument("--difficulty", type=str, default="Beginner", choices=["Beginner", "Intermediate", "Advanced"])
    parser.add_argument("--limit", type=int, default=5, help="Number of videos to fetch")
    
    args = parser.parse_args()
    
    try:
        new_resources = fetch_youtube_videos(args.query, args.topic, args.difficulty, args.limit)
        save_to_db(new_resources)
    except Exception as e:
        print(f"Error: {e}")
