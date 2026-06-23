import pytest
from httpx import AsyncClient

from app.db.database import get_db
from app.db.init_db import get_db as init_db_get_db
from app.main import app


def test_cloud_routes_use_canonical_database_dependency():
    cloud_routes = [
        route
        for route in app.routes
        if getattr(route, "path", "").startswith("/cloud")
        and getattr(route, "dependant", None)
    ]

    dependency_calls = [
        dependency.call
        for route in cloud_routes
        for dependency in route.dependant.dependencies
    ]

    assert dependency_calls
    assert all(dependency_call is get_db for dependency_call in dependency_calls)


@pytest.mark.asyncio
async def test_upload_backup_returns_summary_without_echoing_payload(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[init_db_get_db] = override_get_db

    payload = {
        "works": [
            {
                "id": "work-1",
                "title": "私密作品",
                "review": "private review",
                "note": "private note",
            }
        ],
        "tags": [{"id": 1, "name": "private tag"}],
        "backupDate": "2026-06-23T00:00:00Z",
        "version": "1.0.0",
        "deviceId": "device-1",
    }

    try:
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post("/cloud/backup", json=payload)
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body == {
        "success": True,
        "message": "備份上傳成功",
        "worksCount": 1,
        "tagsCount": 1,
    }


@pytest.mark.asyncio
async def test_upload_backup_rejects_invalid_backup_date(client):
    response = await client.post(
        "/cloud/backup",
        json={
            "works": [],
            "tags": [],
            "backupDate": "not-a-date",
            "version": "1.0.0",
            "deviceId": "device-1",
        },
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "backupDate 格式無效"}
