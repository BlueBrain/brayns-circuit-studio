import TimerMock from "../../mock/timer-mock"
import AsyncTools from "./async-tools"

describe("common/async-tools/async-tools.ts", () => {
    beforeEach(() => {
        TimerMock.reset()
        TimerMock.activated = true
    })
    afterEach(() => {
        TimerMock.activated = false
    })
    describe("AsyncTools.Squash class", () => {
        const sleepAndTrace = async (id: string, trace: string[]) => {
            await AsyncTools.sleep(900)
            trace.push(id)
        }
        it(`should work with a single job`, async () => {
            const trace: string[] = []
            const exec = AsyncTools.squash(sleepAndTrace)
            exec("A", trace)
            await TimerMock.run(10000)
            expect(trace.join("")).toBe("A")
        })
        it(`should squash job B`, async () => {
            const trace: string[] = []
            const exec = AsyncTools.squash(sleepAndTrace)
            exec("A", trace)
            await TimerMock.run(100)
            exec("B", trace)
            await TimerMock.run(200)
            exec("C", trace)
            await TimerMock.run(1000)
            await TimerMock.run(10000)
            expect(trace.join("")).toBe("AC")
        })
    })
    describe("AsyncTools.sleep()", () => {
        it("should wait 3000 ms", async () => {
            let hasResolved = false
            AsyncTools.sleep(3000).then(() => (hasResolved = true))
            await TimerMock.run(2999)
            expect(hasResolved).toEqual(false)
        })
        it("should resolve after 3000 ms", async () => {
            let hasResolved = false
            AsyncTools.sleep(3000).then(() => (hasResolved = true))
            await TimerMock.run(3000)
            expect(hasResolved).toEqual(true)
        })
    })
    describe(`"AsyncTools.debounce()`, () => {
        it(`should debounce when called twice withint delay`, async () => {
            let path: string[] = ["START"]
            const push = AsyncTools.debounce(
                (step: string) => path.push(step),
                100
            )
            push("A")
            await TimerMock.run(50)
            push("B")
            await TimerMock.run(200)
            expect(path).toEqual(["START", "B"])
        })
    })
    describe(`"AsyncTools.throttle()`, () => {
        it(`should throttle every 100 ms`, async () => {
            let path: number[] = []
            const push = AsyncTools.throttle((step) => path.push(step), 100)
            push(1)
            await TimerMock.run(30)
            push(2)
            await TimerMock.run(60)
            push(3)
            await TimerMock.run(90)
            push(4)
            await TimerMock.run(120)
            push(5)
            await TimerMock.run(150)
            push(6)
            await TimerMock.run(180)
            push(7)
            await TimerMock.run(210)
            push(8)
            await TimerMock.run(240)
            push(9)
            expect(path).toEqual([1, 4, 8])
        })
    })
})
