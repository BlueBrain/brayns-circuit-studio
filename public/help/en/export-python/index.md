# Export Python

This button will generate a bunch of files to use to create a snapshot of the scene in batch mode.

* **`allocate.sh`**: Allocate a node on BB5 with all the options needed by Brayns.
* **`start.sh`**: Script to launch to generate the snapshot in `output.jpg` file. The first time it starts, it create a Python virtual environment and install the needed dependencies.
* **`brayns.py`**: This file is used by `script.py` and provides a class (`BraynsService`) to access Brayns service.
* **`requirements.txt`**: Minimal set of needed dependencies to access Brayns through Python.
* **`script.py`**: `start.sh` will activate the virtual environment and start this python script to generate the snapshot of the current scene. **This is the file you may want to customize for your needs**.

----

[Back](../welcome)
