#!/bin/bash

# This script should be executed in an allocated node.

echo "Starting Brayns..."
module purge
module load unstable
module load brayns/{{BRAYNS_VERSION}}
module load unstable python ffmpeg

braynsService \
    --uri 0.0.0.0:5000 \
    --log-level debug \
    --plugin braynsCircuitExplorer > ./brayns.log 2>&1 &

if [[ ! -f ./.brayns-venv/bin/activate ]]
then
    echo "Creating virtual environment..."
    export PYTHONPATH=
    echo "Python version" `python --version`
    python -m venv ./.brayns-venv --clear
    . ./.brayns-venv/bin/activate
    python -m ensurepip --upgrade
    pip3 install -r requirements.txt
    pip3 list
    deactivate
else
    echo "Using existing virtual environment..."
fi

source ./.brayns-venv/bin/activate
python script.py
deactivate