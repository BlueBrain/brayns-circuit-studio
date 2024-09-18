import { BACKEND_VERSION, BRAYNS_VERSION } from "@/_old_/constants"

const MODULE_BRAYNS = `unstable brayns/${BRAYNS_VERSION}`
const MODULE_BACKEND = `py-bcsb/${BACKEND_VERSION}`

export const NODE_STARTUP_SCRIPT = `
#!/bin/bash

source /etc/profile.d/bb5.sh
source /etc/profile.d/modules.sh

export BACKEND_PORT=8000
export BRAYNS_PORT=5000
export LOG_LEVEL=DEBUG
export UNICORE_HOSTNAME=$(hostname -f)
export UNICORE_CERT_FILEPATH=\${TMPDIR}/\${UNICORE_HOSTNAME}.crt
export UNICORE_PRIVATE_KEY_FILEPATH=\${TMPDIR}/\${UNICORE_HOSTNAME}.key

echo Brayns Circuit Studio startup script
echo ----------------------
echo "HOSTNAME=$(hostname -f)"
echo UNICORE_HOSTNAME=$UNICORE_HOSTNAME
echo UNICORE_CERT_FILEPATH=$UNICORE_CERT_FILEPATH
echo UNICORE_PRIVATE_KEY_FILEPATH=$UNICORE_PRIVATE_KEY_FILEPATH
echo TMPDIR=$TMPDIR
echo BACKEND_PORT=$BACKEND_PORT
echo BRAYNS_PORT=$BRAYNS_PORT
echo ----------------------

# Load modules for Brayns service
echo Loading ${MODULE_BRAYNS} ${MODULE_BACKEND}...
module purge
module load ${MODULE_BRAYNS}
# module load ${MODULE_BACKEND}

# This functions monitors whether both Brayns and Backend are running - it will exit the script if one of them is not available
monitor_processes() {
  local pid1=$1
  local pid2=$2

  while true; do
    
    if ! kill -0 "$pid1" 2>/dev/null || ! kill -0 "$pid2" 2>/dev/null; then
      echo "One of the processes has been killed. Exiting."
      exit 1
    fi

    sleep 1
    
  done
}

start_brayns_command="braynsService \\
    --uri 0.0.0.0:$BRAYNS_PORT \\
    --log-level debug \\
    --secure true \\
    --certificate-file $UNICORE_CERT_FILEPATH \\
    --private-key-file $UNICORE_PRIVATE_KEY_FILEPATH \\
    --plugin braynsCircuitExplorer \\
    --plugin braynsAtlasExplorer"
    
start_backend_command="bcsb \
    --host 0.0.0.0 \
    --port $BACKEND_PORT \
    --secure true \
    --certificate $UNICORE_CERT_FILEPATH \
    --key $UNICORE_PRIVATE_KEY_FILEPATH \
    --log_level DEBUG \
    --base_directory /gpfs/bbp.cscs.ch"
    

# Start the processes

cd /gpfs/bbp.cscs.ch/project/proj3/software/BraynsCircuitStudio/braynscircuitstudiobackend
source venv/bin/activate

$start_brayns_command &
pid1=$!

$start_backend_command &
pid2=$!

# Start monitoring the processes
monitor_processes "$pid1" "$pid2"

`
