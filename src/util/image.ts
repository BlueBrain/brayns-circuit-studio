export function imageLoad(url: string): Promise<HTMLImageElement | null> {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => {
            console.error("Unable to load image:", url)
            resolve(null)
        }
        img.src = url
    })
}
