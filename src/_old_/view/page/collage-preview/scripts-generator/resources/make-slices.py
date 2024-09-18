import os
import sys
import json
import asyncio
import traceback
import log

# Turn "debug" to True to get more verbose output for debugging purpose.
debug = True

# Snapshot frames names are 6-zero-padded numbers.
def pad(num, size=6):
    txt= str(num)
    while len(txt) < size:
        txt = f"0{txt}"
    return txt

def load_config():
    try:
        with open("./config.json", "r") as fd:
            return json.load(fd)
    except Exception as ex:
        raise Exception(f"""Unable to load file "config.json"!

{ex}
""")

def read_file_content(filename: str):
    if os.path.exists(filename) == False:
        return ""
    with open(filename, "r") as fd:
        return fd.readlines()

def grep(lines: list[str], search_text: str):
    return [line for line in lines if search_text in line]

async def wait_for_brayns_images(config):
    nodes_count = int(sys.argv[1])
    path = os.path.abspath("./output/final")
    frames_count = len(config["slices"])
    count = 0
    previous_count = -1
    while count < frames_count:
        await asyncio.sleep(1)
        count = 0
        with os.scandir(path) as entries:
            for entry in entries:
                if not entry.is_dir():
                    if entry.name[-4:] == ".png":
                        count += 1
        if count != previous_count:
            print(f"Brayns has generated {count}/{frames_count} images...")
            previous_count = count
        # Check for errors.
        for node_index in range(nodes_count):
            lines = read_file_content(f"./output/logs/agent-{node_index}.log")
            search_result = grep(lines, "#" * 60)
            if len(search_result) > 0:
                print("===============================================")
                print(f"Agent #{node_index} encountered a fatal error!")
                print()
                error_lines = []
                waiting_for_error = True
                for line in lines:
                    if ("#" * 60) in line:
                        waiting_for_error = not waiting_for_error
                    if not waiting_for_error:
                        error_lines.append(line)
                print("".join(error_lines))
                print("-----------------------------------------------")
                print("All the logs are in ./output/logs folder.")
                print("Try to fix the issue and restart the process.")
                print("The images already generated will be kept.")
                print()
                sys.exit(1)

async def wait_for_allocations():
    nodes_count = int(sys.argv[1])
    print(f"Waiting for {nodes_count} nodes to be allocated...")
    previous_count = -1
    nodes_ready = 0
    while nodes_ready != nodes_count:
        await asyncio.sleep(1)
        nodes_ready = 0
        for node_index in range(nodes_count):
            search_result = grep(
                read_file_content(f"./output/logs/brayns-{node_index}.log"),
                "Server started on '0.0.0.0:5000'."
            )
            if len(search_result) > 0:
                nodes_ready += 1
        if previous_count != nodes_ready:
            previous_count = nodes_ready
            log.info(f"Allocated nodes: {nodes_ready}/{nodes_count}...")            

#########################################################################################

async def start():
    try:        
        log.box(f"Brayns Morphology Collage")
        config = load_config()
        await wait_for_allocations()
        log.info("Loading data will take some time before the actual rendering can start.")
        await wait_for_brayns_images(config)
        log.info("Done!")
    except Exception as ex:
        if debug:
            traceback.print_exc()
        log.fatal(ex)

if __name__ == "__main__":
    asyncio.run(start())
