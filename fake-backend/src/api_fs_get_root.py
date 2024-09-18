"""Entrypoint: fs-get-root() -> str."""
from entrypoint import EntryPoint


class FsGetRootEntryPoint(EntryPoint):
    """Entrypoint: fs-get-root() -> str.

    No input. Return the root folder inside which we are sandboxed.
    """

    def __init__(self, root):
        """Set sandbox root folder."""
        self.root = root

    @property
    def name(self):
        """Name of this entrypoint."""
        return "fs-get-root"

    async def exec(self, params):
        """Return the root folder inside which we are sandboxed."""
        del params  # Unused
        return self.root
