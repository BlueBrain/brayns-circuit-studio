"""Entrypoint: storage-session-get(key: str) -> str."""
from entrypoint import EntryPoint


class StorageSessionGetEntryPoint(EntryPoint):
    """Entrypoint: storage-session-get(key: str) -> str.

    Return the value of the given session variable,
    or an empty string if not found.
    """

    def __init__(self, storage):
        """Set session storage."""
        self.storage = storage

    @property
    def name(self):
        """Name of this entrypoint."""
        return "storage-session-get"

    async def exec(self, params):
        """
        Return the value of the given session variable,
        or an empty string if not found.
        """
        self.ensureDict(params, ["key"])
        key = params["key"]
        if key in self.storage:
            return self.storage[key]
        return ""
