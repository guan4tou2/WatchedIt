from httpx import AsyncClient


class TestMainApp:
    """測試主應用程式功能"""

    async def test_read_root(self, client: AsyncClient):
        """測試根路徑"""
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "WatchedIt API"

    async def test_health_check(self, client: AsyncClient):
        """測試健康檢查端點"""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    async def test_cors_headers(self, client: AsyncClient):
        """測試 CORS 標頭"""
        response = await client.options("/")
        assert response.status_code == 200
        assert "access-control-allow-origin" in response.headers
