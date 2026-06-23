import pytest
from httpx import AsyncClient


pytestmark = pytest.mark.asyncio


def valid_work_data(**overrides):
    data = {
        "title": "測試作品",
        "type": "動畫",
        "status": "進行中",
        "year": 2024,
        "rating": 8.5,
        "review": "測試評論",
        "note": "測試備註",
        "source": "測試",
    }
    data.update(overrides)
    return data


async def test_create_work_accepts_frontend_ten_point_rating(client: AsyncClient):
    response = await client.post("/works/", json=valid_work_data(rating=8.5))

    assert response.status_code == 201
    assert response.json()["rating"] == 8.5


async def test_create_work_rejects_unknown_tag_ids(client: AsyncClient):
    response = await client.post("/works/", json=valid_work_data(tag_ids=[999]))

    assert response.status_code == 404
    assert response.json()["detail"] == "Tag with ID 999 not found"


async def test_update_work_rejects_unknown_tag_ids(client: AsyncClient):
    create_response = await client.post("/works/", json=valid_work_data())
    work_id = create_response.json()["id"]

    response = await client.put(f"/works/{work_id}", json={"tag_ids": [999]})

    assert response.status_code == 404
    assert response.json()["detail"] == "Tag with ID 999 not found"
