import { isString } from "@/_old_/tool/validator"

const RX_RANGE_VALIDATION = /^[0-9]+(?:-[0-9]+)?(?:[, ]+[0-9]+(?:-[0-9]+)?)*$/gu

export function isRange(data: unknown): boolean {
    if (!isString(data)) return false

    RX_RANGE_VALIDATION.lastIndex = -1
    return RX_RANGE_VALIDATION.test(data)
}
