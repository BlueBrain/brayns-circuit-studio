from threading import Thread
from queue import Queue, Empty


class NonBlockingStream:
    def __init__(self, stream, log: str = None):
        """Read a stream in a thread."""
        self.queue = Queue()

        def _read_stream(stream, queue: Queue, log: str = None):
            """Read lines from the stream and add them to the queue."""
            while True:
                line = stream.readline()
                if not line:
                    break
                if log:
                    print(f"[{log}]", line.decode(), end="")
                queue.put(line)

        task = Thread(
            target =_read_stream,
            args = (stream, self.queue, log)
        )
        task.daemon = True
        task.start()

    def is_empty(self):
        return self.queue.qsize() == 0

    def read(self):
        return self.queue.get(False).decode()
