"""Entrypoint: storage-session-set(key: str, value: str)."""
from entrypoint import EntryPoint


class StorageSessionSetEntryPoint(EntryPoint):
    """Entrypoint: storage-session-set(key: str, value: str).

    Store a `value` with name `key`.
    """

    def __init__(self, storage):
        """Set session storage."""
        self.storage = storage

    @property
    def name(self):
        """Name of this entrypoint."""
        return "storage-session-set"

    async def exec(self, params):
        """Store a `value` with name `key`."""
        self.ensureDict(params, ["key", "value"])
        key = params["key"]
        value = params["value"]
        self.storage[key] = value
