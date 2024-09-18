"""Application main module."""
from api_version import VersionEntryPoint
from api_fs_exists import FsExistsEntryPoint
from api_fs_get_root import FsGetRootEntryPoint
from api_fs_list_dir import FsListDirEntryPoint
from api_fs_set_content import FsSetContentEntryPoint
from api_brayns_address import BraynsAddressEntryPoint
from api_sonata_list_populations import SonataListPopulationsEntryPoint
from api_storage_session_get import StorageSessionGetEntryPoint
from api_storage_session_set import StorageSessionSetEntryPoint
from api_volume_parse_header import VolumeParseHeader
from backend import Server
from version import __version__
import argparse
import asyncio

def main():
    """Application's main function.

    Display the version and start the WebSocket server.
    """
    print_box(f"Brayns Circuit Studio Backend v{__version__}")
    parser = argparse.ArgumentParser(description='Circuit Studio Backend')
    parser.add_argument(
        "--port", 
        help="the port this WebSocket server will listen to",
        dest="port", 
        action="store",
        required=True,
        type=int
    )
    parser.add_argument(
        "--brayns", 
        help="name of a script that starts Brayns and accepts a PORT number as only argument",
        dest="brayns", 
        action="store",
        required=True,
        type=str
    )
    parser.add_argument(
        "--sandbox", 
        help="root folder inside which we are sandboxed",
        dest="sandbox", 
        action="store",
        required=True,
        type=str
    )
    parser.add_argument(
        "--certificate",
        help="certificate filename",
        dest="certificate",
        action="store",
        required=False,
        type=str,
        default=None
    )
    parser.add_argument(
        "--private-key",
        help="private key filename",
        dest="private_key",
        action="store",
        required=False,
        type=str,
        default=None
    )
    args = parser.parse_args()
    options = { 
        "port": args.port,
        "certificate": args.certificate,
        "private_key": args.private_key
    }
    session_storage = {}
    entrypoints = [
        VersionEntryPoint(__version__),
        FsExistsEntryPoint(args.sandbox),
        FsGetRootEntryPoint(args.sandbox),
        FsListDirEntryPoint(args.sandbox),
        FsSetContentEntryPoint(args.sandbox),
        BraynsAddressEntryPoint(args.port + 1, args.brayns),
        SonataListPopulationsEntryPoint(args.sandbox),
        StorageSessionGetEntryPoint(session_storage),
        StorageSessionSetEntryPoint(session_storage),
        VolumeParseHeader(args.sandbox)
    ]
    server = Server(options, entrypoints)
    loop = asyncio.get_event_loop()
    loop.run_until_complete(server.start())
    loop.run_forever()


def print_box(line: str) -> None:
    """Surround `line` by a box."""
    print(f"+-{'-' * len(line)}-+")
    print(f"| {line} |")
    print(f"+-{'-' * len(line)}-+")


if __name__ == "__main__":
    main()
