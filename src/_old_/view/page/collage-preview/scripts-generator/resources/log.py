import sys

def info(*message: str):
    print(*message, flush=True)

def fatal(*message):
    info("#" * 60)
    info(*message)
    info("#" * 60)
    sys.exit(1)

def box(text: str):
    info(f"+{'-' * (len(text) + 2)}+")
    info(f"| {text} |")
    info(f"+{'-' * (len(text) + 2)}+")
