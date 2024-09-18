"""Entrypoint: fs-get-root() -> str."""
from entrypoint import EntryPoint
import os
import base64

class FsSetContentEntryPoint(EntryPoint):
    """Entrypoint: fs-set-content() -> str.

    Input: `{ path: string, base64: boolean, content: string }`

    Output: None
    """

    def __init__(self, root):
        """Set sandbox root folder."""
        self.root = root

    @property
    def name(self):
        """Name of this entrypoint."""
        return "fs-set-content"

    async def exec(self, params):
        """Store a content on a file."""
        self.ensureDict(params, ["path", "base64", "content"])        
        path = params["path"]
        path = os.path.abspath(path)
        self.ensureSandbox(path, self.root)
        content = params["content"]
        print()
        if params["base64"]:
            with open(path, 'wb') as fd:
                fd.write(base64.b64decode(content))
        else:
            with open(path, 'w') as fd:
                fd.write(content)
        return {}
