import { SizeAndPos, Vector3, Vector4 } from "@/_old_/contract/tool/calc"
/* eslint-disable @typescript-eslint/no-empty-interface */

interface CustomMatchers<R = unknown> {
    toEqualSizeAndPos(expected: SizeAndPos): R
    toBeCloseVector3(expected: Vector3): R
    toBeCloseVector4(expected: Vector4): R
}

declare global {
    namespace jest {
        interface Expect extends CustomMatchers {}
        interface Matchers<R> extends CustomMatchers<R> {}
        interface InverseAsymmetricMatchers extends CustomMatchers {}
    }
}
