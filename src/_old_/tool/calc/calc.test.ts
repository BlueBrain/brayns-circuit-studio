import Calc from "./calc"
import {
    Axis,
    EulerAngles,
    Quaternion,
    SizeAndPos,
    Vector3,
    Vector4,
} from "@/contract/tool/calc"

const success = (msg: string) => ({
    pass: true,
    message: () => msg,
})
const failure = (msg: string) => ({
    pass: false,
    message: () => msg,
})
expect.extend({
    toBeCloseVector3(received: Vector3, expected: Vector3) {
        const EPSILON = 1e-6
        const [x1, y1, z1] = received
        const [x2, y2, z2] = expected
        if (
            Math.abs(x1 - x2) > EPSILON ||
            Math.abs(y1 - y2) > EPSILON ||
            Math.abs(z1 - z2) > EPSILON
        ) {
            return failure(
                `Expected\n${received}\nto be close to\n${expected}!`
            )
        }
        return success(
            `Expected\n${received}\nNOT to be close to\n${expected}!`
        )
    },
    toBeCloseVector4(received: Vector4, expected: Vector4) {
        const EPSILON = 1e-9
        const [x1, y1, z1, w1] = received
        const [x2, y2, z2, w2] = expected
        if (
            Math.abs(x1 - x2) > EPSILON ||
            Math.abs(y1 - y2) > EPSILON ||
            Math.abs(z1 - z2) > EPSILON ||
            Math.abs(w1 - w2) > EPSILON
        ) {
            return failure(
                `Expected\n${received}\nto be close to\n${expected}!`
            )
        }
        return success(
            `Expected\n${received}\nNOT to be close to\n${expected}!`
        )
    },
    toEqualSizeAndPos(received: any, expected: SizeAndPos) {
        if (typeof received !== "object") {
            return failure("Expected an object { x, y, width, height }!")
        }
        const { x, y, width, height } = received
        if (typeof x !== "number") {
            return failure("Expected obj.x to be a number!")
        }
        if (typeof y !== "number") {
            return failure("Expected obj.y to be a number!")
        }
        if (typeof width !== "number") {
            return failure("Expected obj.width to be a number!")
        }
        if (typeof height !== "number") {
            return failure("Expected obj.height to be a number!")
        }
        const EPSILON = 0.1
        if (Math.abs(x - expected.x) > EPSILON) {
            return failure(`Expected obj.x to be close to ${expected.x}!`)
        }
        if (Math.abs(y - expected.y) > EPSILON) {
            return failure(`Expected obj.y to be close to ${expected.y}!`)
        }
        if (Math.abs(width - expected.width) > EPSILON) {
            return failure(
                `Expected obj.width to be close to ${expected.width}!`
            )
        }
        if (Math.abs(height - expected.height) > EPSILON) {
            return failure(
                `Expected obj.height to be close to ${expected.height}!`
            )
        }
        return success(
            `Expected ${JSON.stringify(received)} not to be a valid SizeAndPos!`
        )
    },
})

describe("common/calc.ts", () => {
    const calc = new Calc()
    describe("Geometry.fitToCover()", () => {
        it("should fit identical sizes", () => {
            expect(
                calc.fitToCover(
                    { width: 640, height: 480 },
                    { width: 640, height: 480 },
                    0.27
                )
            ).toEqualSizeAndPos({
                x: 0,
                y: 0,
                width: 640,
                height: 480,
            })
        })
        it("should fit same ratio but smaller size", () => {
            expect(
                calc.fitToCover(
                    { width: 320, height: 240 },
                    { width: 640, height: 480 },
                    0.27
                )
            ).toEqualSizeAndPos({
                x: 0,
                y: 0,
                width: 640,
                height: 480,
            })
        })
        it("should fit same ratio but bigger size", () => {
            expect(
                calc.fitToCover(
                    { width: 3200, height: 2400 },
                    { width: 640, height: 480 },
                    0.27
                )
            ).toEqualSizeAndPos({
                x: 0,
                y: 0,
                width: 640,
                height: 480,
            })
        })
        it("should fit big square ratio in landscape", () => {
            expect(
                calc.fitToCover(
                    { width: 1000, height: 1000 },
                    { width: 640, height: 480 },
                    0.5
                )
            ).toEqualSizeAndPos({
                x: 0,
                y: -80,
                width: 640,
                height: 640,
            })
        })
        it("should fit small square ratio in landscape", () => {
            expect(
                calc.fitToCover(
                    { width: 100, height: 100 },
                    { width: 640, height: 480 },
                    0.5
                )
            ).toEqualSizeAndPos({
                x: 0,
                y: -80,
                width: 640,
                height: 640,
            })
        })
        it("should fit big square ratio in portrait", () => {
            expect(
                calc.fitToCover(
                    { width: 1000, height: 1000 },
                    { width: 480, height: 640 },
                    0.5
                )
            ).toEqualSizeAndPos({
                x: -80,
                y: 0,
                width: 640,
                height: 640,
            })
        })
        it("should fit small square ratio in portrait", () => {
            expect(
                calc.fitToCover(
                    { width: 100, height: 100 },
                    { width: 480, height: 640 },
                    0.5
                )
            ).toEqualSizeAndPos({
                x: -80,
                y: 0,
                width: 640,
                height: 640,
            })
        })
    })
    describe(`Geometry.addVectors`, () => {
        const cases: Array<[vectors: Vector3[], expected: Vector3]> = [
            [[[3, 4, -1]], [3, 4, -1]],
            [
                [
                    [1, 0, 0],
                    [0, 1, 0],
                    [0, 0, 1],
                ],
                [1, 1, 1],
            ],
        ]
        cases.forEach(([vectors, expected]) => {
            it(`should add ${vectors.map((v) =>
                JSON.stringify(v)
            )} and get ${JSON.stringify(expected)}`, () => {
                const [first, ...rest] = vectors
                const result = calc.addVectors(first, ...rest)
                expect(result).toBeCloseVector3(expected)
            })
        })
    })
    describe(`Geometry.multiplyQuaternions`, () => {
        const cases: Array<[input: Quaternion[], expected: Quaternion]> = [
            [[[1, 3.5, 2, 9]], [1, 3.5, 2, 9]],
        ]
        cases.forEach(([input, expected]) => {
            it(`${input
                .map((quat) => JSON.stringify(quat))
                .join("*")} should be close to ${JSON.stringify(
                expected
            )}`, () => {
                const result = calc.multiplyQuaternions(...input)
                expect(result).toBeCloseVector4(expected)
            })
        })
    })
    describe(`Geometry.getQuaternionFromAxis`, () => {
        const cases: Array<[axis: Axis, expected: Quaternion]> = [
            [{ x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, [0, 0, 0, 1]],
            [
                { x: [0, 0, -1], y: [0, 1, 0], z: [1, 0, 0] },
                [0, 0.7071067811865476, 0, 0.7071067811865476],
            ],
            [
                {
                    x: [0.7071067811865476, 0.7071067811865476, 0],
                    y: [-0.6124, 0.6124, -0.5],
                    z: [-0.3536, 0.3536, 0.866],
                },
                [
                    -0.23912880808559892, -0.09905804421165391,
                    0.36964864555530025, 0.8923927363328631,
                ],
            ],
            [
                {
                    x: [
                        0.6524216524216524, 0.7464387464387465,
                        -0.13105413105413105,
                    ],
                    y: [
                        0.757834757834758, -0.6438746438746439,
                        0.10541310541310542,
                    ],
                    z: [
                        -0.005698005698005701, -0.1680911680911681,
                        -0.9857549857549857,
                    ],
                },
                [
                    0.9058216273156766, 0.4151682458530185,
                    -0.03774256780481986, 0.07548513560963972,
                ],
            ],
        ]
        cases.forEach(([axis, quat]) => {
            it(`should get a quaternion from ${JSON.stringify(axis)}`, () => {
                const result = calc.getQuaternionFromAxis(axis)
                expect(result).toBeCloseVector4(quat)
            })
        })
    })
    describe(`Geometry.getAxisFromQuaternion`, () => {
        const cases: Array<[axis: Axis, quaternion: Quaternion]> = [
            [{ x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }, [0, 0, 0, 1]],
            [
                { x: [0, 0, -1], y: [0, 1, 0], z: [1, 0, 0] },
                [0, 0.7071067811865476, 0, 0.7071067811865476],
            ],
            [
                {
                    x: [1, 0, 0],
                    y: [0, -1, 0],
                    z: [0, 0, -1],
                },
                [1, 0, 0, 0],
            ],
            [
                {
                    x: [
                        0.6524216524216524, 0.7464387464387465,
                        -0.13105413105413105,
                    ],
                    y: [
                        0.757834757834758, -0.6438746438746439,
                        0.10541310541310542,
                    ],
                    z: [
                        -0.005698005698005701, -0.1680911680911681,
                        -0.9857549857549857,
                    ],
                },
                [
                    0.9058216273156766, 0.4151682458530185,
                    -0.03774256780481986, 0.07548513560963972,
                ],
            ],
        ]
        cases.forEach(([axis, quat]) => {
            const result = calc.getAxisFromQuaternion(quat)
            it(`should get X axis from ${quat}`, () => {
                expect(result.x).toBeCloseVector3(axis.x)
            })
            it(`should get Y axis from ${quat}`, () => {
                expect(result.y).toBeCloseVector3(axis.y)
            })
            it(`should get Z axis from ${quat}`, () => {
                expect(result.z).toBeCloseVector3(axis.z)
            })
        })
    })
    describe(`Geometry.scaleVector`, () => {
        const cases: Array<
            [vector: Vector3, scale: number, expected: Vector3]
        > = [
            [[3, 4, -1], 0, [0, 0, 0]],
            [[3, 4, -1], -1, [-3, -4, 1]],
        ]
        cases.forEach(([vector, scale, expected]) => {
            it(`should scale ${vector} with a factor of ${scale}`, () => {
                const result = calc.scaleVector(vector, scale)
                expect(result).toBeCloseVector3(expected)
            })
        })
    })
    describe(`Geometry.crossProduct`, () => {
        const cases: Array<[v1: Vector3, v2: Vector3, expected: Vector3]> = [
            [
                [1, 2, 3],
                [2, -1, 0],
                [3, 6, -5],
            ],
            [
                [-1, 7, 1],
                [1, 1, -5],
                [-36, -4, -8],
            ],
            [
                [1, 2, 3],
                [0, 0, 1],
                [2, -1, 0],
            ],
        ]
        cases.forEach(([v1, v2, expected]) => {
            it(`should find ${expected} for ${v1} cross ${v2}`, () => {
                const result = calc.crossProduct(v1, v2)
                expect(result).toBeCloseVector3(expected)
            })
        })
    })
    describe(`Geometry.dotProduct`, () => {
        const cases: Array<[v1: Vector3, v2: Vector3, expected: number]> = [
            [[1, 2, 3], [2, -1, 0], 0],
            [[-1, 7, 1], [1, 1, -5], 1],
        ]
        cases.forEach(([v1, v2, expected]) => {
            it(`should find ${expected} for ${v1} dot ${v2}`, () => {
                const result = calc.dotProduct(v1, v2)
                expect(result).toBeCloseTo(expected, 9)
            })
        })
    })
    describe(`Geometry.rotateVectorAroundVector`, () => {
        const cases: Array<
            [vector: Vector3, axis: Vector3, angle: number, expected: Vector3]
        > = [
            [[1, 2, 3], [-2, 5, 1], 1, [2.200392, 2.9988, 0.406785]],
            [[1, 2, 3], [0, 0, 1], 0, [1, 2, 3]],
            [[1, 2, 3], [1, 2, 3], 1.618, [1, 2, 3]],
            [[1, 2, 3], [0, 0, 1], Math.PI / 2, [-2, 1, 3]],
            [[1, 2, 3], [2, -3, 0], 2.777, [-3.014638, -0.676425, -2.110547]],
            [[-5, 3, 4], [0, -2, -7], -2.5, [2.937034, -2.969756, 5.705645]],
        ]
        cases.forEach(([vector, axis, angle, expected]) => {
            it(`should rotate ${vector} around ${axis} of ${angle} radians and get ${expected}`, () => {
                const result = calc.rotateVectorAroundVector(
                    vector,
                    axis,
                    angle
                )
                expect(result).toBeCloseVector3(expected)
            })
        })
    })
    describe(`Geometry quaternion axis stability`, () => {
        const cases: Quaternion[] = [
            [0, 0, 0, 1],
            [0, 0.7071067811865476, 0, 0.7071067811865476],
            [-0.2296419406163076, 0, 0.16221618762886128, 0.9596616526574012],
        ]
        cases.forEach((quat) => {
            it(`${quat} should be stable by axis transfo and back`, () => {
                const axis = calc.getAxisFromQuaternion(quat)
                const newQuat = calc.getQuaternionFromAxis(axis)
                expect(newQuat).toBeCloseVector4(quat)
            })
        })
    })
    describe("Consistence between Quaternion and Axis", () => {
        const cases: Quaternion[] = [
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1],
        ]
        for (const quaternion of cases) {
            it("should be consistent between quaternion and axis", () => {
                const axis = calc.getAxisFromQuaternion(quaternion)
                const got = calc.getQuaternionFromAxis(axis)
                const exp = quaternion
                expect(got).toEqual(exp)
            })
        }
    })
})
