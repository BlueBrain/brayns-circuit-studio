import { AmbientLight, DirectionalLight, Group } from "three"

export function makeLight() {
    const group = new Group()
    group.add(makeDirLight(-1, 2, 4), makeDirLight(1, -1, -2))
    group.add(new AmbientLight(0xffff00, 0.25))
    return group
}

function makeDirLight(x: number, y: number, z: number): DirectionalLight {
    const light = new DirectionalLight(0xffffff, 1)
    light.position.set(x, y, z)
    return light
}
