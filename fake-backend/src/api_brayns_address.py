"""Entrypoint: brayns-address() -> str."""
from entrypoint import EntryPoint
from typing import List
from time import sleep
from subprocess import Popen, PIPE
from non_blocking_stream import NonBlockingStream

class BraynsAddressEntryPoint(EntryPoint):
    """Entrypoint: brayns-address() -> { port: int }.

    Return the port of Brayns Service.

    Input: `{ version?: number }`

    Output: `{ port: int }`
    """

    def __init__(self, port: int, command: str):
        """Define command to start Brayns and the port number.
        
        Args:
            port: port number on which Brayns will listen
            command: the command to execute without any argument.
                     This will be called with `port` as only
                     argument.

        Error:
            1: Brayns failed to start.
        """
        self.port = port
        self.command = command
        self.error = None
        self.started = False

    @property
    def name(self):
        """Name of this entrypoint."""
        return "brayns-address"

    async def exec(self, params):
        """Return the port on which Brayns will listen."""
        if not self.started:
            self.error = None
            version = None
            if params != None:
                version = params["version"]
            await self.start(version)
            self.started = True
        if self.error:
            self.fatal(1, self.error)
        return { "port": self.port }

    async def start(self, version):
        """Start Brayns and make sure it succeeded."""
        if version is None:
            print("Using default Brayns version: 1!")
            version = 1
        print(">", self.command, self.port, version)
        # with open('./start.tmp.sh', 'w') as f:
        #     f.write('#!/usr/bin/bash\n{self.command} {self.port}\n')
        task = Popen([self.command, str(self.port), str(version)],
            stdout=PIPE,
            stderr=PIPE
        )
        stdout = NonBlockingStream(task.stdout, "Brayns")
        stderr = NonBlockingStream(task.stderr, "Brayns-ERROR")
        # We expect that the worst failure will occure during
        # the first seconds.
        sleep(3)
        if not stderr.is_empty():
            error = ""
            lines = stderr.read().split("\n")
            for line in lines:
                if line.startswith("Autoloading "):
                    # Ignore this line since it's not an actual error.
                    continue
                print("ERR>", line)
                error = error + line
            if len(error) > 0:
                self.error = error + "\n\n" + stdout.read()
            else:
                self.error = None
            