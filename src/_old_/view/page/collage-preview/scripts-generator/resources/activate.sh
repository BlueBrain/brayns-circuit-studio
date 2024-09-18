#!/bin/bash

# This is the main script.
# Start it with the number of nodes to allocate as its sole argument.

if [ "$#" -lt 1 ]; then
    echo "Usage: $0 <Number_of_Nodes_to_allocate>"
    exit
fi

if [[ ! -f ./.brayns-venv/bin/activate ]]
then
    echo "Creating virtual environment..."
    export PYTHONPATH=
    module purge
    module load unstable python ffmpeg
    python -m venv ./.brayns-venv --clear
    . ./.brayns-venv/bin/activate
    python -m ensurepip --upgrade
    pip3 install -r requirements.txt
    pip3 list
    deactivate
else
    echo "Using existing virtual environment..."
fi

rm -f slurm-*.out
mkdir -p ./output/final
rm -rf ./output/logs
mkdir -p ./output/logs

FARM_COUNT=$1

for (( i=0;i<$FARM_COUNT;i++ ))
do
    FARM_INDEX=$i
    scancel --name="BraynsAgent$i"
    sbatch --job-name="BraynsAgent$i" ./start.sh "${FARM_INDEX}" "${FARM_COUNT}"
done

. ./.brayns-venv/bin/activate
python make-slices.py $FARM_COUNT
deactivate
