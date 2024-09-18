"""Entrypoint: fs-list-dir() -> str."""
from entrypoint import EntryPoint
from typing import List
import json
import os
from stat import S_IXUSR


class FsListDirEntryPoint(EntryPoint):
    """Entrypoint: fs-list-dir(path: str) -> str.

    Input: `{ path: str }`

    * path: the folder you want to get the content of.

    Output: `{ dirs: str[], files: { names: str[], sizes: int[] } }`

    * dirs: list of contained folders' names.
    * files.names: list of contained files' names.
    * files.sizes: list of files' sizes in bytes.

    Error:

    * 1: out of sandbox
    * 2: permission denied
    * 3: unexpected error
    * 4: path is not a directory
    """

    def __init__(self, root):
        """Set sandbox root folder.
        
        Make sure it does not end with a "/".
        """
        if root[-1] == "/":
            self.root = root[:-1]
        else:
            self.root = root

    @property
    def name(self):
        """Name of this entrypoint."""
        return "fs-list-dir"

    async def exec(self, params):
        """Return the content of a folder."""
        self.ensureDict(params, ["path"])
        path = params["path"]
        if path == None:
            self.fatal(3, "Argument \"path\" is missing!")
        path = os.path.abspath(path)
        sandbox = self.root
        if path[:len(sandbox)] != sandbox:
            self.fatal(1, f"Path \"{path}\" is out of sandbox: \"{sandbox}\"!")
        if not os.path.isdir(path):
            self.fatal(4, f"Path not found, or not a directory: \"{path}\"")
        try:
            dirs: List(str) = []
            file_names: List(str) = []
            file_sizes: List(int) = []
            with os.scandir(path) as entries:
                for entry in entries:
                    if entry.is_dir():
                        if useful_dir(os.path.join(path, entry.name)):
                            dirs.append(entry.name)
                    else:
                        stat = entry.stat(follow_symlinks=False)
                        file_names.append(entry.name)
                        file_sizes.append(stat.st_size)
            return {
                "dirs": dirs,
                "files": {
                    "names": file_names,
                    "sizes": file_sizes
                }
            }
        except Exception as ex:
            self.fatal(3, str(ex))

def useful_dir(dir: str) -> bool:
    """Should we return this directory to the user?
    
    We want to skip folders if:
     - the user has no permission on them
    """
    try:
        content = os.listdir(dir)
        return True
    except:
        return False