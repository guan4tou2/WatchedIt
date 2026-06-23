from app.db.database import engine, get_connect_args, get_database_url


def test_database_sql_echo_is_disabled_by_default():
    assert engine.echo is False


def test_database_url_can_be_configured_from_environment(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://db.example.test/watchedit")

    assert get_database_url() == "postgresql://db.example.test/watchedit"


def test_database_connect_args_are_sqlite_specific():
    assert get_connect_args("sqlite:///./watchedit.db") == {
        "check_same_thread": False
    }
    assert get_connect_args("postgresql://db.example.test/watchedit") == {}
