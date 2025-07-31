from httpx import AsyncClient
from sqlalchemy.orm import Session


class TestTagsAPI:
    """測試標籤相關 API"""

    async def test_create_tag(self, client: AsyncClient, sample_tag_data: dict):
        """測試創建標籤"""
        response = await client.post("/tags/", json=sample_tag_data)
        assert response.status_code == 201
        data = response.json()

        assert data["name"] == sample_tag_data["name"]
        assert data["color"] == sample_tag_data["color"]
        assert "id" in data
        assert "date_created" in data

    async def test_create_tag_invalid_data(self, client: AsyncClient):
        """測試創建標籤時無效數據"""
        invalid_data = {
            "name": "",  # 空名稱
            "color": "#ff0000",
        }
        response = await client.post("/tags/", json=invalid_data)
        assert response.status_code == 422

    async def test_get_tags(self, client: AsyncClient, sample_tag_data: dict):
        """測試獲取標籤列表"""
        # 先創建一個標籤
        await client.post("/tags/", json=sample_tag_data)

        response = await client.get("/tags/")
        assert response.status_code == 200
        data = response.json()

        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == sample_tag_data["name"]

    async def test_get_tag_by_id(self, client: AsyncClient, sample_tag_data: dict):
        """測試根據 ID 獲取標籤"""
        # 先創建一個標籤
        create_response = await client.post("/tags/", json=sample_tag_data)
        tag_id = create_response.json()["id"]

        response = await client.get(f"/tags/{tag_id}")
        assert response.status_code == 200
        data = response.json()

        assert data["id"] == tag_id
        assert data["name"] == sample_tag_data["name"]

    async def test_get_tag_by_id_not_found(self, client: AsyncClient):
        """測試獲取不存在的標籤"""
        response = await client.get("/tags/999")
        assert response.status_code == 404

    async def test_update_tag(self, client: AsyncClient, sample_tag_data: dict):
        """測試更新標籤"""
        # 先創建一個標籤
        create_response = await client.post("/tags/", json=sample_tag_data)
        tag_id = create_response.json()["id"]

        update_data = {"name": "更新後的標籤"}
        response = await client.put(f"/tags/{tag_id}", json=update_data)
        assert response.status_code == 200
        data = response.json()

        assert data["name"] == "更新後的標籤"
        assert data["id"] == tag_id

    async def test_update_tag_not_found(self, client: AsyncClient):
        """測試更新不存在的標籤"""
        update_data = {"name": "更新後的標籤"}
        response = await client.put("/tags/999", json=update_data)
        assert response.status_code == 404

    async def test_delete_tag(self, client: AsyncClient, sample_tag_data: dict):
        """測試刪除標籤"""
        # 先創建一個標籤
        create_response = await client.post("/tags/", json=sample_tag_data)
        tag_id = create_response.json()["id"]

        response = await client.delete(f"/tags/{tag_id}")
        assert response.status_code == 204

        # 確認標籤已被刪除
        get_response = await client.get(f"/tags/{tag_id}")
        assert get_response.status_code == 404

    async def test_delete_tag_not_found(self, client: AsyncClient):
        """測試刪除不存在的標籤"""
        response = await client.delete("/tags/999")
        assert response.status_code == 404


class TestTagsService:
    """測試標籤服務層"""

    def test_create_tag_service(self, db: Session, sample_tag_data: dict):
        """測試服務層創建標籤"""
        from app.services.tag_service import TagService

        tag_service = TagService()
        tag = tag_service.create_tag(db, sample_tag_data)

        assert tag.name == sample_tag_data["name"]
        assert tag.color == sample_tag_data["color"]
        assert tag.id is not None

    def test_get_tags_service(self, db: Session, sample_tag_data: dict):
        """測試服務層獲取標籤列表"""
        from app.services.tag_service import TagService

        tag_service = TagService()

        # 創建標籤
        tag_service.create_tag(db, sample_tag_data)

        # 獲取標籤列表
        tags = tag_service.get_tags(db)
        assert len(tags) >= 1
        assert tags[0].name == sample_tag_data["name"]

    def test_get_tag_by_id_service(self, db: Session, sample_tag_data: dict):
        """測試服務層根據 ID 獲取標籤"""
        from app.services.tag_service import TagService

        tag_service = TagService()

        # 創建標籤
        created_tag = tag_service.create_tag(db, sample_tag_data)

        # 根據 ID 獲取標籤
        tag = tag_service.get_tag_by_id(db, created_tag.id)
        assert tag is not None
        assert tag.name == sample_tag_data["name"]

    def test_update_tag_service(self, db: Session, sample_tag_data: dict):
        """測試服務層更新標籤"""
        from app.services.tag_service import TagService

        tag_service = TagService()

        # 創建標籤
        created_tag = tag_service.create_tag(db, sample_tag_data)

        # 更新標籤
        update_data = {"name": "更新後的標籤"}
        updated_tag = tag_service.update_tag(db, created_tag.id, update_data)

        assert updated_tag.name == "更新後的標籤"

    def test_delete_tag_service(self, db: Session, sample_tag_data: dict):
        """測試服務層刪除標籤"""
        from app.services.tag_service import TagService

        tag_service = TagService()

        # 創建標籤
        created_tag = tag_service.create_tag(db, sample_tag_data)

        # 刪除標籤
        result = tag_service.delete_tag(db, created_tag.id)
        assert result is True

        # 確認標籤已被刪除
        tag = tag_service.get_tag_by_id(db, created_tag.id)
        assert tag is None
