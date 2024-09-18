"""Entrypoint: fs-get-root() -> str."""
from entrypoint import EntryPoint
import os

class FsExistsEntryPoint(EntryPoint):
    """Entrypoint: fs-exists() -> str.

    Input: `{ path: string }`

    Output: `{ type: "none" | "file" | "directory" }
    """

    def __init__(self, root):
        """Set sandbox root folder."""
        self.root = root

    @property
    def name(self):
        """Name of this entrypoint."""
        return "fs-exists"

    async def exec(self, params):
        """Check if a file/dir exists and return its type."""
        self.ensureDict(params, ["path"])
        path = params["path"]
        if path == None:
            self.fatal(3, "Argument \"path\" is missing!")
        path = os.path.abspath(path)
        self.ensureSandbox(path, self.root)
        if os.path.isdir(path):
            return { "type": "directory" }
        if os.path.isfile(path):
            return { "type": "file" }
        return { "type": "none" }
