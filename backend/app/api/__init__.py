from .search import router as search_router
from .tags import router as tags_router
from .works import router as works_router

__all__ = ["works_router", "tags_router", "search_router"]
