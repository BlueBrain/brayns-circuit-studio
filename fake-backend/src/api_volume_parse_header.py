"""Entrypoint: fs-get-root() -> str."""
from entrypoint import EntryPoint
import os
import re
import base64

class VolumeParseHeader(EntryPoint):
    """Entrypoint: volume-parse-header() -> str.

    Input: `{ path: string }`

    Output: `{ [key: string]: string }`
    """

    def __init__(self, root):
        """Set sandbox root folder."""
        self.root = root
        self.RX_END_OF_HEADER = re.compile(r"(\n\n)|(\r\n\r\n)|(\r\r)")
        self.RX_END_OF_LINE = re.compile(r"[\n\r]+")

    @property
    def name(self):
        """Name of this entrypoint."""
        return "volume-parse-header"

    async def exec(self, params):
        """Store a content on a file."""
        self.ensureDict(params, ["path"])
        path = params["path"]
        path = os.path.abspath(path)
        self.ensureSandbox(path, self.root)
        header = ""
        with open(path, 'rb') as fd:
            chunk = fd.read(1024)
            text = convert_into_string(chunk)
            print(text)
            match = self.RX_END_OF_HEADER.search(text)
            if match == None:
                header = text
            else:
                header = text[:match.start]
        data = {}
        lines = self.RX_END_OF_LINE.split(header)
        for line in lines:
            if is_comment(line):
                continue
            if line[:4] == "NRRD":
                data["NRRD version"] = line[4:]
                continue
            (key, value) = parse_field(line)
            data[key] = value.strip()
        return data

def is_comment(line):
    return line[0] == "#"

def parse_field(line):
    index = line.find(":")
    return (line[:index], line[index+1:])

def convert_into_string(chunk):
    mode = ""
    R = ord("\r")
    N = ord("\n")
    for i in range(len(chunk)):
        v = chunk[i]
        if mode == "":
            if v == R:
                mode = "r"
            elif v == N:
                mode = "n"
        elif mode == "r":
            if v == R:
                i -= 2
                break
            if v == N:
                mode = "rn"
            else:
                mode = ""
        elif mode == "n":
            if v == N:
                i -= 2
                break
            mode = ""
        elif mode == "rn":
            if v == R:
                mode = "rnr"
            else:
                mode = ""
        elif mode == "rnr":
            if mode == N:
                i -= 4
                break
            mode = ""
    return chunk[:i+1].decode("utf-8")
