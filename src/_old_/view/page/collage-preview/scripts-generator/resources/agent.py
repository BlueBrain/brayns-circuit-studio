import os
import sys
import json
import asyncio
import traceback

import log
import cells
from brayns import BraynsService
from calc import get_axis_from_quaternion, add_vector, scale_vector

# Turn "debug" to True to get more verbose output for debugging purpose.
debug = True

def usage():
    print()
    print("Usage: python {} <hostname> [<instance>] [--dont-wait]".format(sys.argv[0]))
    print()    
    print("  * hostname: hostname and port of Brayns service (for instance \"r1i5n29.bbp.epfl.ch:5000\")")
    print("  * instance: index of the current instance for parallel work. (for instance \"0/3\")")
    print("       It's made of two numbers separated by a slash. The first one is a zero-based index")
    print("       of the instance, and the second one is the number of instances.")
    print("  * --dont-wait: Don't wait for Brayns to be started because we know it is already running.")
    print()
    print("For example to render the movie on 2 nodes, you can use these command lines:")
    print("  > python {} \"r1i5n29.bbp.epfl.ch:5000\" 0/2".format(sys.argv[0]))
    print("  > python {} \"r1i7n12.bbp.epfl.ch:5000\" 1/2".format(sys.argv[0]))
    print()
    print("  The first instance will generate all the frames whose index modulo 2 is equal 0 (the even ones),")
    print("  and the second instance will generate all the frames whose index modulo 2 is equal 1 (the odd ones).")
    print()
    sys.exit(1)
    
def cancel_allocation():
    [instance_index] = sys.argv[2].split("/")
    os.system(f'scancel --name="BraynsAgent{instance_index}"')

def read_arguments():
    if len(sys.argv) < 2:
        usage()
    brayns_hostname = sys.argv[1]
    if len(sys.argv) < 3:
        return [brayns_hostname, 0, 1]
    [instance_index, instances_count] = sys.argv[2].split("/")
    instance_index = int(instance_index)
    instances_count = int(instances_count)
    options = []
    for arg in sys.argv[2:]:
        if arg[:2] == "--":
            options.append(arg[2:])

    return [brayns_hostname, instance_index, instances_count, options]

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

async def wait_for_brayns_to_be_ready(instance_index):
    log.info("Waiting for Brayns to be ready...")
    filename = os.path.abspath(f"./output/logs/brayns-{instance_index}.log")
    log.info(filename)
    while True:
        await asyncio.sleep(1)
        lines = read_file_content(filename)
        ready = grep(lines, "Server started on '0.0.0.0:5000'.")
        if len(ready) > 0:
            return

def get_models(models):
    for model in models:
        path = model["loader"]["path"]
        props = model["loader"]["properties"]
        if "targets" in props:
            targets = props["targets"]
        else:
            targets = []
        log.info("Listing cells from:", path)
        model["cells"] = cells.list(path, targets)
    return models

#########################################################################################

async def start():
    try:
        [brayns_hostname, instance_index, instances_count, options] = read_arguments()
        log.box(f"Brayns Morphology Collage: instance {instance_index + 1}/{instances_count}")
        config = load_config()
        models = get_models(config["models"])
        if "dont-wait" in options:
            log.info("Don't wait for Brayns to be ready.")
        else:
            await wait_for_brayns_to_be_ready(instance_index)
        service = BraynsService(brayns_hostname, debug)
        exec = service.exec
        slices = config["slices"]
        if len(slices) == 0:
            log.info("Nothing to do.")
            return
        version = await exec("get-version")
        log.info(f"Connected to Brayns Service version {version['major']}.{version['minor']}.{version['patch']} ({version['revision']})")
        log.info("Setting renderer...")
        await exec("set-renderer-interactive", {
            "ao_samples": 8,
            "enable_shadows": False,
            "max_ray_bounces": 3,
            "samples_per_pixel": 8,
        })
        await exec("clear-lights")
        await exec("add-light-ambient", {
            "color": [1, 1, 1],
            "intensity": 0.8
        })
        for slice_index in range(len(slices)):
            if slice_index % instances_count != instance_index:
                continue
            slice = slices[slice_index]
            log.info(f"Slice #{slice_index}: {json.dumps(slice)}")
            [axisX, axisY, axisZ] = get_axis_from_quaternion(slice["orientation"])
            center = slice["center"]
            width = slice["width"]
            height = slice["height"]
            depth = slice["depth"]
            log.info("Setting camera...")
            await exec("set-camera-view", {
                "position": add_vector(
                    center,
                    scale_vector(axisZ, 2*depth)
                ),
                "target": center,
                "up": axisY
            })
            await exec("set-camera-orthographic", {
                "height": slice["height"]
            })
            await exec("clear-models")
            await exec("clear-clip-planes")
            for model in models:
                path = model["loader"]["path"]
                log.info("Loading model from", path)
                loader_name = model["loader"]["name"]
                loader_props = model["loader"]["properties"]
                if loader_name == "BBP loader":
                    gids = cells.clip_gids(
                        model["cells"],
                        center,
                        [axisX, axisY, axisZ],
                        [width, height, depth],
                        config["cellsPerSlice"]
                    )
                    log.info("We keep", len(gids), "cells on a total of", len(model["cells"]))
                    loader_props["gids"] = gids
                    loader_props["percentage"] = 1
                    log.info(f"GIDS: {gids}")
                data = await exec("add-model", {
                    "loader_name": loader_name,
                    "loader_properties": loader_props,
                    "path": path
                })
                if "transferFunction" in model:
                    log.info("Applying transfer function...")
                    transfer_func = model["transferFunction"]
                    await exec("set-color-ramp", {
                        "id": data[0]["model_id"],
                        "color_ramp": {
                            "colors": transfer_func["colors"],
                            "range": [
                                transfer_func["range"]["min"],
                                transfer_func["range"]["max"]
                            ]
                        }
                    })
            log.info("Data loaded successfuly.")
            path = os.path.abspath(f"./output/final/{pad(slice_index)}")
            log.info(f"Taking snapshot: {path}")
            await exec("snapshot", {
                "image_settings": {
                    "size": config["resolution"],
                    "format": "png",
                    "quality": 100
                },
                "file_path": path
            })
        log.info("Done.")
    except Exception as ex:
        if debug:
            traceback.log_exc()
        log.fatal(ex)
    finally:
        await exec("quit")


if __name__ == "__main__":
    asyncio.run(start())
    log.info("Done.")
    cancel_allocation()
