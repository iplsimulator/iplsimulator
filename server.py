from __future__ import annotations

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent


class CricketSimHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 8000), CricketSimHandler)
    print("CricketSim static server running at http://127.0.0.1:8000")
    server.serve_forever()


if __name__ == "__main__":
    main()
