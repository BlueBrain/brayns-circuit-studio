#!/bin/bash -l

#SBATCH --account={{ACCOUNT}}
#SBATCH -p prod
#SBATCH -t 8:00:00
#SBATCH --exclusive
#SBATCH --constraint=cpu
#SBATCH -c 80
#SBATCH --mem 0
#SBATCH -N 1

echo "Starting Brayns..."
module purge
module load unstable
module load brayns/{{BRAYNS_VERSION}}

braynsService \
    --uri 0.0.0.0:5000 \
    --log-level debug \
    --plugin braynsCircuitExplorer > ./output/logs/brayns-$1.log 2>&1 &

echo "Activating Python virtual environment..."
. ./.brayns-venv/bin/activate
echo "Starting agent $1/$2..."
python agent.py 127.0.0.1:5000 $1/$2 > ./output/logs/agent-$1.log 2>&1
deactivate

echo "Terminating the current job..."
scancel --name="BraynsAgent$1"

