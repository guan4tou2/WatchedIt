from httpx import AsyncClient
from sqlalchemy.orm import Session


class TestWorksAPI:
    """測試作品相關 API"""

    async def test_create_work(self, client: AsyncClient, sample_work_data: dict):
        """測試創建作品"""
        response = await client.post("/works/", json=sample_work_data)
        assert response.status_code == 201
        data = response.json()

        assert data["title"] == sample_work_data["title"]
        assert data["type"] == sample_work_data["type"]
        assert data["status"] == sample_work_data["status"]
        assert "id" in data
        assert "date_created" in data

    async def test_create_work_invalid_data(self, client: AsyncClient):
        """測試創建作品時無效數據"""
        invalid_data = {
            "title": "",  # 空標題
            "type": "動畫",
            "status": "進行中",
        }
        response = await client.post("/works/", json=invalid_data)
        assert response.status_code == 422

    async def test_get_works(self, client: AsyncClient, sample_work_data: dict):
        """測試獲取作品列表"""
        # 先創建一個作品
        await client.post("/works/", json=sample_work_data)

        response = await client.get("/works/")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["title"] == sample_work_data["title"]

    async def test_get_work_by_id(self, client: AsyncClient, sample_work_data: dict):
        """測試根據 ID 獲取作品"""
        # 先創建一個作品
        create_response = await client.post("/works/", json=sample_work_data)
        work_id = create_response.json()["id"]

        response = await client.get(f"/works/{work_id}")
        assert response.status_code == 200
        data = response.json()

        assert data["id"] == work_id
        assert data["title"] == sample_work_data["title"]

    async def test_get_work_by_id_not_found(self, client: AsyncClient):
        """測試獲取不存在的作品"""
        response = await client.get("/works/999")
        assert response.status_code == 404

    async def test_update_work(self, client: AsyncClient, sample_work_data: dict):
        """測試更新作品"""
        # 先創建一個作品
        create_response = await client.post("/works/", json=sample_work_data)
        work_id = create_response.json()["id"]

        update_data = {"title": "更新後的標題"}
        response = await client.put(f"/works/{work_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()

        assert data["title"] == "更新後的標題"
        assert data["id"] == work_id

    async def test_update_work_not_found(self, client: AsyncClient):
        """測試更新不存在的作品"""
        update_data = {"title": "更新後的標題"}
        response = await client.put("/works/999", json=update_data)
        assert response.status_code == 404

    async def test_delete_work(self, client: AsyncClient, sample_work_data: dict):
        """測試刪除作品"""
        # 先創建一個作品
        create_response = await client.post("/works/", json=sample_work_data)
        work_id = create_response.json()["id"]

        response = await client.delete(f"/works/{work_id}")
        assert response.status_code == 204

        # 確認作品已被刪除
        get_response = await client.get(f"/works/{work_id}")
        assert get_response.status_code == 404

    async def test_delete_work_not_found(self, client: AsyncClient):
        """測試刪除不存在的作品"""
        response = await client.delete("/works/999")
        assert response.status_code == 404

    async def test_get_works_stats(self, client: AsyncClient, sample_work_data: dict):
        """測試獲取作品統計"""
        # 先創建一些作品
        await client.post("/works/", json=sample_work_data)
        await client.post("/works/", json={**sample_work_data, "title": "作品2"})

        response = await client.get("/works/stats")
        assert response.status_code == 200
        data = response.json()

        assert "total_works" in data
        assert "type_stats" in data
        assert "status_stats" in data
        assert data["total_works"] >= 2


class TestWorksService:
    """測試作品服務層"""

    def test_create_work_service(self, db: Session, sample_work_data: dict):
        """測試服務層創建作品"""
        from app.services.work_service import WorkService

        work_service = WorkService()
        work = work_service.create_work(db, sample_work_data)

        assert work.title == sample_work_data["title"]
        assert work.type == sample_work_data["type"]
        assert work.status == sample_work_data["status"]
        assert work.id is not None

    def test_get_works_service(self, db: Session, sample_work_data: dict):
        """測試服務層獲取作品列表"""
        from app.services.work_service import WorkService

        work_service = WorkService()

        # 創建作品
        work_service.create_work(db, sample_work_data)

        # 獲取作品列表
        works = work_service.get_works(db)
        assert len(works) >= 1
        assert works[0].title == sample_work_data["title"]

    def test_get_work_by_id_service(self, db: Session, sample_work_data: dict):
        """測試服務層根據 ID 獲取作品"""
        from app.services.work_service import WorkService

        work_service = WorkService()

        # 創建作品
        created_work = work_service.create_work(db, sample_work_data)

        # 根據 ID 獲取作品
        work = work_service.get_work_by_id(db, created_work.id)
        assert work is not None
        assert work.title == sample_work_data["title"]

    def test_update_work_service(self, db: Session, sample_work_data: dict):
        """測試服務層更新作品"""
        from app.services.work_service import WorkService

        work_service = WorkService()

        # 創建作品
        created_work = work_service.create_work(db, sample_work_data)

        # 更新作品
        update_data = {"title": "更新後的標題"}
        updated_work = work_service.update_work(db, created_work.id, update_data)

        assert updated_work.title == "更新後的標題"

    def test_delete_work_service(self, db: Session, sample_work_data: dict):
        """測試服務層刪除作品"""
        from app.services.work_service import WorkService

        work_service = WorkService()

        # 創建作品
        created_work = work_service.create_work(db, sample_work_data)

        # 刪除作品
        result = work_service.delete_work(db, created_work.id)
        assert result is True

        # 確認作品已被刪除
        work = work_service.get_work_by_id(db, created_work.id)
        assert work is None

    def test_get_stats_service(self, db: Session, sample_work_data: dict):
        """測試服務層獲取統計"""
        from app.services.work_service import WorkService

        work_service = WorkService()

        # 創建一些作品
        work_service.create_work(db, sample_work_data)
        work_service.create_work(db, {**sample_work_data, "title": "作品2"})

        # 獲取統計
        stats = work_service.get_stats(db)

        assert stats["total_works"] >= 2
        assert "type_stats" in stats
        assert "status_stats" in stats
