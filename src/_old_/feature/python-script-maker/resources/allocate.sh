#!/bin/bash

# This script allocates a node.

rm -f slurm-*.out
rm -f brayns.log

echo
echo "================================================"
echo "Once the allocation is granted, please execute: "
echo "  > sh ./start.sh"
echo "------------------------------------------------"
echo
echo

salloc \
    --job-name="BraynsPython" \
    --account={{ACCOUNT}} \
    --partition=prod \
    --time=1:00:00 \
    -N 1 \
    --exclusive \
    --constraint=cpu \
    --mem 0
