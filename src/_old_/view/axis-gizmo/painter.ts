import GenericEvent from "@/_old_/tool/event"
import { Quaternion, Vector3 } from "@/_old_/contract/tool/calc"
import { double, half } from "../../constants"
import VERT from "./painter.vert"
import FRAG from "./painter.frag"
import CalcClass from "@/_old_/tool/calc"

const GLOBAL_SCALE = 0.7
const COLORS = ["#d11", "#1a1", "#11f"]
const LABELS = ["X", "Y", "Z"]
const SIZE = 64

const Calc = new CalcClass()

const TIPS: Array<[string, Vector3]> = [
    ["X+", [GLOBAL_SCALE, 0, 0]],
    ["Y+", [0, GLOBAL_SCALE, 0]],
    ["Z+", [0, 0, GLOBAL_SCALE]],
    ["X-", [-GLOBAL_SCALE, 0, 0]],
    ["Y-", [0, -GLOBAL_SCALE, 0]],
    ["Z-", [0, 0, -GLOBAL_SCALE]],
]

export default class Painter {
    public readonly eventTipClick = new GenericEvent<string>()

    private readonly gl: WebGL2RenderingContext
    private readonly texture: WebGLTexture
    private readonly vao: WebGLVertexArrayObject
    private readonly prg: WebGLProgram
    private readonly camera = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1])
    private readonly uniCamera: WebGLUniformLocation

    constructor(canvas: HTMLCanvasElement) {
        const gl = canvas.getContext("webgl2", {
            alpha: true,
            antialias: true,
        })
        if (!gl) throw Error("Unable to get WebGL context!")

        this.gl = gl
        this.texture = createTexture(gl)
        this.prg = createProgram(gl)
        this.uniCamera = getUniformLocation(gl, this.prg, "uniCamera")
        this.vao = createVAO(gl, this.prg)
        canvas.addEventListener("pointerdown", this.handlePointerDown)
    }

    updateCamera(quaternion: Quaternion) {
        const { x: X, y: Y, z: Z } = Calc.getAxisFromQuaternion(quaternion)
        const [Xx, Xy, Xz] = X
        const [Yx, Yy, Yz] = Y
        const [Zx, Zy, Zz] = Z
        this.camera[0] = Xx
        this.camera[1] = Xy
        this.camera[2] = Xz
        this.camera[3] = Yx
        this.camera[4] = Yy
        this.camera[5] = Yz
        this.camera[6] = Zx
        this.camera[7] = Zy
        this.camera[8] = Zz
    }

    paint() {
        const { gl, prg, vao } = this
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.blendEquation(gl.FUNC_ADD)
        gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ZERO
        )
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.useProgram(prg)
        gl.uniformMatrix3fv(this.uniCamera, true, this.camera)
        gl.bindVertexArray(vao)
        gl.drawArrays(gl.POINTS, 0, 6)
        gl.bindVertexArray(null)
    }

    private readonly handlePointerDown = (evt: PointerEvent) => {
        const { gl } = this
        const radius = 0.2
        const squaredRadius = radius * radius
        const x = double(evt.offsetX / gl.drawingBufferWidth) - 1.0
        const y = 1.0 - double(evt.offsetY / gl.drawingBufferHeight)
        let bestTip: null | string = null
        let bestZ = -1e9
        for (const [tipName, tipPosition] of TIPS) {
            const [xTip, yTip, zTip] = this.projectInCameraSpace(tipPosition)
            const xDist = xTip - x
            const yDist = yTip - y
            const dist = xDist * xDist + yDist * yDist
            if (dist < squaredRadius) {
                if (zTip > bestZ) {
                    bestZ = zTip
                    bestTip = tipName
                }
            }
        }
        if (bestTip) {
            this.eventTipClick.trigger(bestTip)
        }
    }

    private projectInCameraSpace([x, y, z]: Vector3): Vector3 {
        const [Xx, Xy, Xz, Yx, Yy, Yz, Zx, Zy, Zz] = this.camera
        const X = x * Xx + y * Xy + z * Xz
        const Y = x * Yx + y * Yy + z * Yz
        const Z = x * Zx + y * Zy + z * Zz
        return [X, Y, Z]
    }
}

function createVAO(
    gl: WebGL2RenderingContext,
    prg: WebGLProgram
): WebGLVertexArrayObject {
    const buff = gl.createBuffer()
    if (!buff) throw Error("Unable to create a WebGLBuffer!")

    gl.bindBuffer(gl.ARRAY_BUFFER, buff)
    gl.bufferData(gl.ARRAY_BUFFER, makeData(), gl.STATIC_DRAW)
    const vao = gl.createVertexArray()
    if (!vao) throw Error("Unable to create a WebGLVertexArrayObject!")

    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, buff)
    const _attPosition = gl.getAttribLocation(prg, "attPosition")
    gl.enableVertexAttribArray(_attPosition)
    gl.vertexAttribPointer(_attPosition, 3, gl.FLOAT, false, 28, 0)
    gl.vertexAttribDivisor(_attPosition, 0)
    const _attUV = gl.getAttribLocation(prg, "attUV")
    gl.enableVertexAttribArray(_attUV)
    gl.vertexAttribPointer(_attUV, 4, gl.FLOAT, false, 28, 12)
    gl.vertexAttribDivisor(_attUV, 0)
    gl.bindVertexArray(null)
    return vao
}

function makeData(): Float32Array {
    /**
     * For the tips X+, Y+, Z+, X-, Y- and Z-,
     * we store the position in space (x,y,z),
     * then a box where  to find the sprite in
     * the atlas.  This box  is defined by the
     * top/left  corner,  then  the width  and
     * height.
     */
    const x = 1 / 3
    const y = 1 / 2
    const A = GLOBAL_SCALE
    // prettier-ignore
    return new Float32Array([
        +A, 0, 0,    0, 0, x, y,
        0, +A, 0,    x, 0, x, y,
        0, 0, +A,  2*x, 0, x, y,
        -A, 0, 0,    0, y, x, y,
        0, -A, 0,    x, y, x, y,
        0, 0, -A,  2*x, y, x, y,
    ])
}

function createTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const [canvas, ctx] = createCanvas()
    const radius = 0.4 * SIZE
    for (let i = 0; i < COLORS.length; i++) {
        ctx.fillStyle = COLORS[i]
        ctx.globalAlpha = 1
        fillCircle(ctx, (i + 0.5) * SIZE, 0.5 * SIZE, radius, i)
        fillText(ctx, (i + 0.5) * SIZE, 0.5 * SIZE, i)
        ctx.globalAlpha = 0.25
        fillCircle(ctx, (i + 0.5) * SIZE, 1.5 * SIZE, radius, i)
        ctx.globalAlpha = 1
        ctx.stroke()
    }
    const tex = gl.createTexture()
    if (!tex) throw Error("Enable to create a WebGLTexture!")

    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas)
    return tex
}

function createProgram(gl: WebGL2RenderingContext) {
    const prg = gl.createProgram()
    if (!prg) throw Error("Unable to create WebGL Program!")

    const vertShader = gl.createShader(gl.VERTEX_SHADER)
    if (!vertShader) throw Error("Unable to create a Vertex Shader handle!")

    gl.shaderSource(vertShader, VERT)
    gl.compileShader(vertShader)
    gl.attachShader(prg, vertShader)
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fragShader) throw Error("Unable to create a Fragment Shader handle!")

    gl.shaderSource(fragShader, FRAG)
    gl.compileShader(fragShader)
    gl.attachShader(prg, fragShader)
    gl.linkProgram(prg)
    return prg
}

function fillCircle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: number
) {
    ctx.strokeStyle = COLORS[color]
    ctx.fillStyle = COLORS[color]
    ctx.beginPath()
    ctx.ellipse(x, y, radius, radius, 0, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
}

function fillText(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    labelIndex: number
) {
    const label = LABELS[labelIndex]
    ctx.fillStyle = "#fffe"
    const metrics = ctx.measureText(label)
    const TEXT_ADJUST = 1.1
    ctx.fillText(label, x - half(metrics.width), y * TEXT_ADJUST)
}

function createCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const W = SIZE * 3
    const H = SIZE * 2
    const canvas = document.createElement("canvas")
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext("2d")
    if (!ctx) throw Error("Unable to create context 2d!")

    ctx.imageSmoothingQuality = "high"
    ctx.clearRect(0, 0, W, H)
    ctx.lineWidth = SIZE * 0.1
    ctx.font = `bold ${SIZE * 0.5}px sans-serif`
    ctx.textBaseline = "middle"
    return [canvas, ctx]
}

function getUniformLocation(
    gl: WebGL2RenderingContext,
    prg: WebGLProgram,
    name: string
) {
    const loc = gl.getUniformLocation(prg, name)
    if (!loc) throw Error(`Unable to get uniform location for "${name}"!`)

    return loc
}
