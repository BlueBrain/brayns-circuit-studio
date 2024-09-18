import {
    TgdContextInterface,
    TgdDataset,
    TgdPainter,
    TgdProgram,
    TgdTexture2D,
    TgdVertexArray,
} from "@tolokoban/tgd"

import VERT from "./simul.vert"
import FRAG from "./simul.frag"
import { State } from "@/state"

export class PainterSimulation extends TgdPainter {
    /** Number of cells. */
    public readonly numberOfCells: number
    public readonly numberOfSteps: number

    private _step: number = -1
    private readonly texColorramp: TgdTexture2D
    private readonly prg: TgdProgram
    private readonly vao: TgdVertexArray

    constructor(
        private readonly context: TgdContextInterface,
        dataCoords: Float32Array,
        private readonly dataReport: Float32Array
    ) {
        super()
        this.numberOfCells = Math.floor(dataCoords.length / 3)
        this.numberOfSteps = Math.floor(dataReport.length / this.numberOfCells)
        const tex = context.textures2D.create(
            {
                magFilter: "LINEAR",
                minFilter: "LINEAR",
                wrapR: "CLAMP_TO_EDGE",
                wrapS: "CLAMP_TO_EDGE",
                wrapT: "CLAMP_TO_EDGE",
            },
            "colorramp"
        )
        tex.makePalette(["#222", "#11a", "#c11", "#d61", "#ee1", "#fff"])
        this.texColorramp = tex
        const prg = context.programs.create({
            vert: VERT,
            frag: FRAG,
        })
        this.prg = prg
        const datasetCoords = new TgdDataset({
            attPosition: "vec3",
        })
        datasetCoords.set("attPosition", dataCoords)
        const datasetReport = new TgdDataset({
            attVoltage: "float",
        })
        datasetReport.set("attVoltage", new Float32Array(this.numberOfCells))
        this.vao = context.createVAO(prg, [datasetCoords, datasetReport])
        this.step = 0
    }

    get step() {
        return this._step
    }

    set step(value: number) {
        if (this._step === value) return

        this._step = Math.min(Math.max(value, 0), this.numberOfSteps - 1)
        const buffer = this.vao.getBuffer(1)
        if (!buffer) return

        const s = this._step
        const n = this.numberOfCells
        const data = this.dataReport.slice(s * n, (s + 1) * n)
        buffer.bufferData(data)
        this.context.paint()
    }

    delete(): void {
        this.context.textures2D.delete(this.texColorramp)
    }

    paint(time: number, delay: number): void {
        const { context, prg, vao, texColorramp } = this
        const { gl, camera } = context
        prg.use()
        texColorramp.activate(prg, "uniTexture")
        prg.uniform1f(
            "uniRadius",
            context.gl.drawingBufferHeight * State.beta.radius.value
        )
        prg.uniformMatrix4fv("uniModelViewMatrix", camera.matrixModelView)
        prg.uniformMatrix4fv("uniProjectionMatrix", camera.matrixProjection)
        vao.bind()
        gl.drawArrays(gl.POINTS, 0, this.numberOfCells)

        if (
            context.inputs.keyboard.isDown("-") ||
            context.inputs.keyboard.isDown("PageDown")
        ) {
            State.beta.radius.value = Math.max(
                1,
                State.beta.radius.value - delay * 0.01
            )
        }
        if (
            context.inputs.keyboard.isDown("+") ||
            context.inputs.keyboard.isDown("PageUp")
        ) {
            console.log("Add", delay)
            State.beta.radius.value += delay * 0.01
        }
        if (context.inputs.keyboard.isDown("0")) {
            State.beta.radius.value = 100
        }
    }
}
