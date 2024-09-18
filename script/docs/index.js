/**
 * Prepare markdown documentation to be parsed by Sphinx.
 */

const FS = require("fs")
const Path = require("path")
const Processor = require("./processor")

const source = Path.resolve(__dirname, "../../public/help/en")
const destination = Path.resolve(__dirname, "../../docs/source/en")
const processor = new Processor(source, destination)
console.log("[index] source = ", source) // @FIXME: Remove this line written on 2021-05-26 at 09:30
console.log("[index] destination = ", destination) // @FIXME: Remove this line written on 2021-05-26 at 09:31

// Files already processed.
const alreadyProcessed = new Set()
const filesToProcess = ["welcome/index.md"]
const toc = []

while (filesToProcess.length > 0) {
    const fileToProcess = filesToProcess.shift()
    if (alreadyProcessed.has(fileToProcess)) continue
    
    console.log("Process:   ", fileToProcess)
    toc.push(fileToProcess)
    alreadyProcessed.add(fileToProcess)
    filesToProcess.push(...processor.process(fileToProcess))
}

FS.writeFileSync(
    Path.resolve(destination, "../index.rst"),
    `
Brayns Circuit Studio's documentation!
======================================

.. toctree::
   :maxdepth: 2
   :caption: Contents:

${toc.map(name => `   en/${name}`).join('\n')}
`
)