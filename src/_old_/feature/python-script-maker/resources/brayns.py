import os
import json
import asyncio
import traceback
import websockets

debug = False

def log(*message: str):
    print(*message, flush=True)

class BraynsService:
    running = True
    host_and_port: str
    connection: websockets.WebSocketClientProtocol = None
    counter = 0
    pending_queries = dict()

    def __init__(self, host_and_port: str) -> None:
        self.host_and_port = host_and_port
        self.connection = None

    async def exec(self, entrypoint: str, params=None):
        await self.connect()
        if debug:
            log(">>>", f"{entrypoint}({json.dumps(params, indent=4)})")
        id = self.next_id()
        future = asyncio.Future()
        self.pending_queries[id] = future
        if params is None:
            await self.connection.send(
                json.dumps({"jsonrpc": "2.0", "id": id, "method": entrypoint})
            )
        else:
            await self.connection.send(
                json.dumps(
                    {"jsonrpc": "2.0", "id": id, "method": entrypoint, "params": params}
                )
            )
        response = await future
        if debug:
            log("<<<", json.dumps(response, indent=4))
        if "result" in response:
            return response["result"]
        raise Exception(
            f"""Error while calling entrypoint "{entrypoint}"!
Params: {json.dumps(params, indent=4)}
Result: {json.dumps(response, indent=4)}
------------------------------------------------------------
{self.get_error_message(response)}
"""
        )

    def get_error_message(self, response):
        if "error" not in response:
            return "Unknown error!"
        error = response["error"]
        if "message" not in error:
            return "Invalid error format!"
        return error["message"]

    async def close(self):
        log("Closing connection...")
        self.running = False
        await self.connection.close()

    def next_id(self):
        self.counter = self.counter + 1
        return f"ID-{self.counter}"

    async def process_responses(self):
        while self.running:
            try:
                message = await self.connection.recv()
                data = json.loads(message)
                if "id" not in data:
                    if "params" in data and debug:
                        params = data["params"]
                        percent = 100 * float(params["amount"])
                        label = params["operation"]
                        log(f"Progress {percent:.1f}% - {label}")
                    continue
                id = data["id"]
                future = self.pending_queries[id]
                if future is not None:
                    future.set_result(data)
                else:
                    log(json.dumps(data, indent=4))
            except UnicodeDecodeError:
                # Just ignore binary messages.
                # They are JPEG images of the current scene.
                pass
            except websockets.exceptions.ConnectionClosedError as ex:
                msg = str(ex)
                if "1000 (OK)" not in msg:
                    # If the connection is closed with a 1000 (OK)
                    # message, that's normal.
                    fatal("We lost the connection:", msg)
            except Exception as ex:
                fatal(type(ex).__name__, ex)

    async def connect(self):
        if self.connection is not None:
            return
        log(f'Connecting Websocket to "{self.host_and_port}"...')
        self.connection = await websockets.connect(
            f"ws://{self.host_and_port}", ping_interval=None
        )
        asyncio.create_task(self.process_responses())

def read_file_content(filename: str):
    if os.path.exists(filename) == False:
        return ""
    with open(filename, "r") as fd:
        return fd.readlines()


def grep(lines: list[str], search_text: str):
    return [line for line in lines if search_text in line]


async def wait_for_brayns_to_be_ready():
    log("Waiting for Brayns to be ready...")
    filename = os.path.abspath(f"./brayns.log")
    log(filename)
    while True:
        await asyncio.sleep(1)
        lines = read_file_content(filename)
        ready = grep(lines, "Server started on '0.0.0.0:5000'.")
        if len(ready) > 0:
            log("Brayns started on '127.0.0.1:5000'.")
            return
