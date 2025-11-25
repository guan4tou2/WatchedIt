"""Custom exceptions for WatchedIt backend."""


class WatchedItException(Exception):
    """Base exception for WatchedIt application."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class WorkNotFoundException(WatchedItException):
    """Exception raised when a work is not found."""

    def __init__(self, work_id: str):
        super().__init__(
            message=f"Work with ID '{work_id}' not found", status_code=404
        )


class TagNotFoundException(WatchedItException):
    """Exception raised when a tag is not found."""

    def __init__(self, tag_id: int):
        super().__init__(message=f"Tag with ID {tag_id} not found", status_code=404)


class ValidationException(WatchedItException):
    """Exception raised for validation errors."""

    def __init__(self, message: str):
        super().__init__(message=message, status_code=400)


class DatabaseException(WatchedItException):
    """Exception raised for database operation errors."""

    def __init__(self, message: str):
        super().__init__(message=f"Database error: {message}", status_code=500)


class DuplicateWorkException(WatchedItException):
    """Exception raised when attempting to create a duplicate work."""

    def __init__(self, title: str):
        super().__init__(
            message=f"Work with title '{title}' already exists", status_code=409
        )
