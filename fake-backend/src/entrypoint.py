"""EntryPoint abstract class and related exception."""
from abc import abstractmethod
from typing import Any, Awaitable, Callable, List
import traceback
import os

UNKNOWN_ERROR = -9
PARAMS_ERROR = -8
OUT_OF_SANDBOX = -7

class EntryPoint:
    """Abstract class to define entry points.

    To create a new entry point, you should inherit this abstract class
    and implement the `name` property and the `exec` method.
    """

    @abstractmethod
    async def exec(self, params: Any) -> Awaitable:
        """Asynchronous execution of this entry point.

        Given some `params`, this function will compute the result.
        It can throw an `EntryPointException` to return an error to the client.
        """

    @property
    @abstractmethod
    def name(self) -> str:
        """Name of this entrypoint."""

    async def initialize(self):
        """Override this method if the entrypoint needs some initialization."""
        pass

    async def callback(
        self,
        query_id: str,
        params: Any,
        success: Callable[[str, Any], Awaitable],
        failure: Callable[[str, int, str], Awaitable],
    ):
        """Send back the result of this entry point given some params."""
        try:
            result = await self.exec(params)
            await success(query_id, result)
        except EntryPointException as ex:
            await failure(query_id, ex.code, ex.message)
        except Exception as ex:  # pylint: disable=broad-except
            print()
            print("#" * 80)
            traceback.print_exc()
            print("=" * 80)
            print()
            await failure(query_id, UNKNOWN_ERROR, str(ex))

    def fatal(self, code: int, message: str):
        """Raise an exception than will be returned back to the client."""
        raise EntryPointException(code, message)

    def ensureDict(self, data: Any, properties: List[str]):
        if data == None or not isinstance(data, dict):
            self.fatal(PARAMS_ERROR, "We were expecting a dictionary!")
        for property in properties:
            if property not in data:
                self.fatal(PARAMS_ERROR, f"Missing property \"{property}\"!")

    def ensureSandbox(self, path: str, sandbox: str):
        abspath = os.path.abspath(path)
        if sandbox[-1] == "/" and abspath == sandbox[:-1]:
            return
        if path[:len(sandbox)] != sandbox:
            self.fatal(OUT_OF_SANDBOX, f"Path \"{abspath}\" is out of sandbox: \"{sandbox}\"!")

class EntryPointException(BaseException):
    """Exception for the client."""

    code = 0
    message = ""

    def __init__(self, code: int, message: str) -> None:
        """Entrypoint Exception constructor.

        Args:
            code: error number
            message: error description
        """
        super().__init__(code, message)
        self.code = code
        self.message = message
