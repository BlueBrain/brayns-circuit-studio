import asyncio
import pathlib
from brayns import log, wait_for_brayns_to_be_ready, BraynsService

# Image size.
WIDTH = {{WIDTH}}
HEIGHT = {{HEIGHT}}

# Quality.
HIGH_QUALITY = False

# Background color.
BACKGROUND = {{BACKGROUND}}

PATH = pathlib.Path(__file__).parent.resolve()

async def start():
    await wait_for_brayns_to_be_ready()
    service = BraynsService("127.0.0.1:5000")
    await service.connect()
    exec = service.exec
    version = await exec("get-version")
    log(
        f"Connected to Brayns Service version {version['major']}.{version['minor']}.{version['patch']} ({version['revision']})"
    )
    log("Setting background color and ambient light...")
    if HIGH_QUALITY:
        await exec(
            "set-renderer-production",
            {
                "max_ray_bounces": 3,
                "samples_per_pixel": 128,
                "background_color": BACKGROUND
            },
        )
    else:
        await exec(
            "set-renderer-interactive",
            {
                "ao_samples": 8,
                "enable_shadows": False,
                "max_ray_bounces": 3,
                "samples_per_pixel": 1,
                "background_color": BACKGROUND
            },
        )
    await exec("clear-lights")
    await exec("add-light-ambient", {"color": [1, 1, 1], "intensity": 1.5})

{{CODE}}

    log("Rendering image...")
    await exec(
        "snapshot",
        {
            "image_settings": {"size": [WIDTH, HEIGHT], "quality": 100},
            "file_path": "./output.jpg",
        },
    )
    log("An image has been generated: output.jpg")

if __name__ == "__main__":
    asyncio.run(start())
    log("Done.")

