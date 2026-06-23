from httpx import AsyncClient

from app.services.search_service import SearchService


class TestSearchAPI:
    async def test_search_anime_awaits_service_and_returns_results(
        self, client: AsyncClient, monkeypatch
    ):
        captured = {}

        async def fake_search_anime(self, query: str, page: int, per_page: int):
            captured.update({"query": query, "page": page, "per_page": per_page})
            return [
                {
                    "id": 1,
                    "title": "測試動畫",
                    "type": "動畫",
                    "year": 2024,
                    "episodes": 12,
                    "status": "FINISHED",
                    "description": "完整描述",
                    "cover_image": "https://example.com/cover.jpg",
                    "genres": ["Action"],
                    "rating": 85,
                    "source": "AniList",
                }
            ]

        monkeypatch.setattr(SearchService, "search_anime", fake_search_anime)

        response = await client.get("/search/anime?query=test&page=2&per_page=24")

        assert response.status_code == 200
        assert response.json()[0]["title"] == "測試動畫"
        assert captured == {"query": "test", "page": 2, "per_page": 24}

    async def test_get_anime_by_id_awaits_service(
        self, client: AsyncClient, monkeypatch
    ):
        async def fake_get_anime_by_id(self, anime_id: int):
            return {
                "id": anime_id,
                "title": "完整動畫",
                "type": "動畫",
                "year": 2024,
                "episodes": 12,
                "status": "FINISHED",
                "description": "完整描述",
                "cover_image": "https://example.com/cover.jpg",
                "genres": ["Action"],
                "rating": 85,
                "source": "AniList",
            }

        monkeypatch.setattr(SearchService, "get_anime_by_id", fake_get_anime_by_id)

        response = await client.get("/search/anime/123")

        assert response.status_code == 200
        assert response.json()["id"] == 123
        assert response.json()["description"] == "完整描述"
