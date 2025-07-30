from typing import Any, Dict, List

import httpx
from sqlalchemy.orm import Session


class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.anilist_url = "https://graphql.anilist.co"

    async def search_anime(self, query: str) -> List[Dict[str, Any]]:
        """搜尋動畫（使用 AniList API）"""
        # GraphQL 查詢
        graphql_query = """
        query ($search: String) {
          Page (page: 1, perPage: 10) {
            media (search: $search, type: ANIME) {
              id
              title {
                romaji
                english
                native
              }
              type
              format
              episodes
              duration
              season
              seasonYear
              status
              description
              coverImage {
                large
                medium
              }
              genres
              averageScore
            }
          }
        }
        """

        variables = {"search": query}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.anilist_url,
                    json={"query": graphql_query, "variables": variables},
                    headers={"Content-Type": "application/json"},
                )

                if response.status_code == 200:
                    data = response.json()
                    media_list = data.get("data", {}).get("Page", {}).get("media", [])

                    results = []
                    for media in media_list:
                        title = (
                            media["title"].get("english")
                            or media["title"].get("romaji")
                            or media["title"].get("native")
                        )

                        result = {
                            "id": media["id"],
                            "title": title,
                            "type": "動畫",
                            "year": media.get("seasonYear"),
                            "episodes": media.get("episodes"),
                            "status": media.get("status"),
                            "description": media.get("description"),
                            "cover_image": media.get("coverImage", {}).get("large"),
                            "genres": media.get("genres", []),
                            "rating": media.get("averageScore"),
                            "source": "AniList",
                        }
                        results.append(result)

                    return results
                else:
                    return []

        except Exception as e:
            print(f"搜尋動畫時發生錯誤: {e}")
            return []

    def get_suggestions(self, query: str) -> List[str]:
        """取得搜尋建議"""
        # 從本地資料庫搜尋現有作品標題
        from ..models.work import Work

        works = (
            self.db.query(Work.title)
            .filter(Work.title.ilike(f"%{query}%"))
            .limit(10)
            .all()
        )

        suggestions = [work.title for work in works]

        # 預設標籤建議
        default_tags = [
            "冒險",
            "奇幻",
            "科幻",
            "愛情",
            "喜劇",
            "動作",
            "懸疑",
            "恐怖",
            "日常",
            "校園",
            "職場",
            "音樂",
            "運動",
            "戰爭",
            "歷史",
            "推理",
        ]

        # 加入符合查詢的預設標籤
        for tag in default_tags:
            if query.lower() in tag.lower() and tag not in suggestions:
                suggestions.append(tag)

        return suggestions[:10]  # 限制回傳數量
