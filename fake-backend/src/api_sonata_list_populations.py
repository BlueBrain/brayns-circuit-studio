"""Entrypoint: fs-get-root() -> str."""
from entrypoint import EntryPoint
import os
import libsonata

class SonataListPopulationsEntryPoint(EntryPoint):
    """Entrypoint: sonata-list-populations() -> str.

    Input: `{ path: string }`

    Output: `{ populations: Array<{
        name: string
        type: string
    }> }
    """

    def __init__(self, root):
        """Get the list of all available populations names in a SONATA file."""
        self.root = root

    @property
    def name(self):
        """Name of this entrypoint."""
        return "sonata-list-populations"

    async def exec(self, params):
        """Return the list of available populations in a SONATA file."""
        self.ensureDict(params, ["path"])
        path = params["path"]
        if path == None:
            self.fatal(3, "Argument \"path\" is missing!")
        path = os.path.abspath(path)
        self.ensureSandbox(path, self.root)
        if not os.path.isfile(path):
            self.fatal(1, f"This file does not exist: {path}")
        simulation = None
        circuit_path = path
        try:
            simulation = libsonata.SimulationConfig.from_file(path)
            circuit_path = simulation.network
        except:
            # This is not a Simulation.
            print("This circuit has no simulation:", path)
            pass
        circuit = libsonata.CircuitConfig.from_file(circuit_path)
        populations_before_filtering = list(circuit.node_populations)
        populations = []
        for population in populations_before_filtering:
            props = circuit.node_population_properties(population)
            type = props.type
            print("Found population", population, "of type", type)
            if type != "virtual":
                node = circuit.node_population(population)
                print("    Attribute names:", node.attribute_names)
                populations.append({
                    "name": population,
                    "type": type,
                    "size": node.size
                })
        reports = []
        report_names = []
        if simulation != None:
            report_names = simulation.list_report_names
        for report_name in list(report_names):
            report = simulation.report(report_name)
            reports.append({
                "type": stringify_report_type(report.type),
                "name": report_name,
                "start": report.start_time,
                "end": report.end_time,
                "delta": report.dt,
                "unit": report.unit,
                "cells": report.cells
            })
        return { "populations": populations, "reports": reports }

def stringify_report_type(type) -> str:
    Type = libsonata._libsonata.Report.Type
    if type == Type.compartment:
        return "compartment"
    if Type == Type.summation:
        return "summation"
    if Type == Type.synapse:
        return "synapse"
    return str(type)

