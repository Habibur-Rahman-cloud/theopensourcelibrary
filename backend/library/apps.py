from django.apps import AppConfig


class LibraryConfig(AppConfig):
    name = 'library'

    def ready(self):
        import library.signals  # noqa: F401
        import library.admin  # noqa: F401 — ensure model registrations load for admin / Jazzmin
