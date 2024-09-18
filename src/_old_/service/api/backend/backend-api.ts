interface JsonRpcService {
    exec(entryPointName: string, param?: unknown): Promise<unknown>
}

interface ApiTask {
    entrypoint: string
    params: unknown
    resolves: Array<(result: unknown) => void>
    rejects: Array<(ex: unknown) => void>
}

export class RendererApi {
    readonly #service: JsonRpcService
    readonly #collapsables: string[]
    #tasks: ApiTask[] = []
    #processing = false

    constructor(options: { service: JsonRpcService; collapsables?: string[] }) {
        this.#service = options.service
        this.#collapsables = options.collapsables ?? []
    }

    #exec(entrypoint: string, params: unknown): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const resolves = [resolve]
            const rejects = [reject]
            if (this.#collapsables.includes(entrypoint)) {
                this.#tasks = this.#tasks.filter((task) => {
                    if (task.entrypoint !== entrypoint) return true

                    resolves.push(...task.resolves)
                    rejects.push(...task.rejects)
                    return false
                })
            }
            this.#tasks.push({
                entrypoint,
                params,
                resolves,
                rejects,
            })
            void this.#process()
        })
    }

    async #process() {
        if (this.#processing) return

        this.#processing = true
        try {
            while (this.#tasks.length > 0) {
                const task = this.#tasks.shift()
                if (!task) return

                try {
                    const result = await this.#service.exec(
                        task.entrypoint,
                        task.params
                    )
                    task.resolves.forEach((resolve) => resolve(result))
                } catch (ex) {
                    task.rejects.forEach((reject) => reject(ex))
                }
            }
        } catch (ex) {
            console.error(ex)
        } finally {
            this.#processing = false
        }
    }

    /**
     * Adds a list of axis-aligned bound limited planes
     *
     * Entrypoint **"add-bounded-planes"**
     */
    public async addBoundedPlanes(
        params: RendererApiAddBoundedPlanesParams
    ): Promise<RendererApiAddBoundedPlanesResult> {
        const result = await this.#exec("add-bounded-planes", params)
        return result as RendererApiAddBoundedPlanesResult
    }

    /**
     * Adds a list of boxes to the scene
     *
     * Entrypoint **"add-boxes"**
     */
    public async addBoxes(
        params: RendererApiAddBoxesParams
    ): Promise<RendererApiAddBoxesResult> {
        const result = await this.#exec("add-boxes", params)
        return result as RendererApiAddBoxesResult
    }

    /**
     * Adds a list of capsules to the scene
     *
     * Entrypoint **"add-capsules"**
     */
    public async addCapsules(
        params: RendererApiAddCapsulesParams
    ): Promise<RendererApiAddCapsulesResult> {
        const result = await this.#exec("add-capsules", params)
        return result as RendererApiAddCapsulesResult
    }

    /**
     * Old way of adding clip plane, use 'add-clipping-planes' instead
     *
     * Entrypoint **"add-clip-plane"**
     */
    public async addClipPlane(
        params: RendererApiAddClipPlaneParams
    ): Promise<RendererApiAddClipPlaneResult> {
        const result = await this.#exec("add-clip-plane", params)
        return result as RendererApiAddClipPlaneResult
    }

    /**
     * Add a list of axis-aligned bound limited clipping planes
     *
     * Entrypoint **"add-clipping-bounded-planes"**
     */
    public async addClippingBoundedPlanes(
        params: RendererApiAddClippingBoundedPlanesParams
    ): Promise<RendererApiAddClippingBoundedPlanesResult> {
        const result = await this.#exec("add-clipping-bounded-planes", params)
        return result as RendererApiAddClippingBoundedPlanesResult
    }

    /**
     * Add a list of clipping boxes to the scene
     *
     * Entrypoint **"add-clipping-boxes"**
     */
    public async addClippingBoxes(
        params: RendererApiAddClippingBoxesParams
    ): Promise<RendererApiAddClippingBoxesResult> {
        const result = await this.#exec("add-clipping-boxes", params)
        return result as RendererApiAddClippingBoxesResult
    }

    /**
     * Add a list of clipping capsules to the scene
     *
     * Entrypoint **"add-clipping-capsules"**
     */
    public async addClippingCapsules(
        params: RendererApiAddClippingCapsulesParams
    ): Promise<RendererApiAddClippingCapsulesResult> {
        const result = await this.#exec("add-clipping-capsules", params)
        return result as RendererApiAddClippingCapsulesResult
    }

    /**
     * Add a list of clipping planes to the scene
     *
     * Entrypoint **"add-clipping-planes"**
     */
    public async addClippingPlanes(
        params: RendererApiAddClippingPlanesParams
    ): Promise<RendererApiAddClippingPlanesResult> {
        const result = await this.#exec("add-clipping-planes", params)
        return result as RendererApiAddClippingPlanesResult
    }

    /**
     * Add a list of clipping spheres to the scene
     *
     * Entrypoint **"add-clipping-spheres"**
     */
    public async addClippingSpheres(
        params: RendererApiAddClippingSpheresParams
    ): Promise<RendererApiAddClippingSpheresResult> {
        const result = await this.#exec("add-clipping-spheres", params)
        return result as RendererApiAddClippingSpheresResult
    }

    /**
     * Adds an ambient light which iluminates the scene from all directions
     *
     * Entrypoint **"add-light-ambient"**
     */
    public async addLightAmbient(
        params: RendererApiAddLightAmbientParams
    ): Promise<RendererApiAddLightAmbientResult> {
        const result = await this.#exec("add-light-ambient", params)
        return result as RendererApiAddLightAmbientResult
    }

    /**
     * Adds a directional light which iluminates the scene from a given direction
     *
     * Entrypoint **"add-light-directional"**
     */
    public async addLightDirectional(
        params: RendererApiAddLightDirectionalParams
    ): Promise<RendererApiAddLightDirectionalResult> {
        const result = await this.#exec("add-light-directional", params)
        return result as RendererApiAddLightDirectionalResult
    }

    /**
     * Add a quad light which iluminates the scene on a specific area
     *
     * Entrypoint **"add-light-quad"**
     */
    public async addLightQuad(
        params: RendererApiAddLightQuadParams
    ): Promise<RendererApiAddLightQuadResult> {
        const result = await this.#exec("add-light-quad", params)
        return result as RendererApiAddLightQuadResult
    }

    /**
     * Add model from path and return model descriptor on success
     *
     * Entrypoint **"add-model"**
     */
    public async addModel(
        params: RendererApiAddModelParams
    ): Promise<RendererApiAddModelResult> {
        const result = await this.#exec("add-model", params)
        return result as RendererApiAddModelResult
    }

    /**
     * Adds a list of planes to the scene
     *
     * Entrypoint **"add-planes"**
     */
    public async addPlanes(
        params: RendererApiAddPlanesParams
    ): Promise<RendererApiAddPlanesResult> {
        const result = await this.#exec("add-planes", params)
        return result as RendererApiAddPlanesResult
    }

    /**
     * Adds a list of spheres to the scene
     *
     * Entrypoint **"add-spheres"**
     */
    public async addSpheres(
        params: RendererApiAddSpheresParams
    ): Promise<RendererApiAddSpheresResult> {
        const result = await this.#exec("add-spheres", params)
        return result as RendererApiAddSpheresResult
    }

    /**
     * Cancel the task started by the request with the given ID
     *
     * Entrypoint **"cancel"**
     */
    public async cancel(
        params: RendererApiCancelParams
    ): Promise<RendererApiCancelResult> {
        const result = await this.#exec("cancel", params)
        return result as RendererApiCancelResult
    }

    /**
     * Old clear for clipping geometries, use 'clear-clipping-geometries' instead
     *
     * Entrypoint **"clear-clip-planes"**
     */
    public async clearClipPlanes(
        params: RendererApiClearClipPlanesParams
    ): Promise<RendererApiClearClipPlanesResult> {
        const result = await this.#exec("clear-clip-planes", params)
        return result as RendererApiClearClipPlanesResult
    }

    /**
     * Clear all clipping geometries in the scene
     *
     * Entrypoint **"clear-clipping-geometries"**
     */
    public async clearClippingGeometries(
        params: RendererApiClearClippingGeometriesParams
    ): Promise<RendererApiClearClippingGeometriesResult> {
        const result = await this.#exec("clear-clipping-geometries", params)
        return result as RendererApiClearClippingGeometriesResult
    }

    /**
     * Clear all lights in the scene
     *
     * Entrypoint **"clear-lights"**
     */
    public async clearLights(
        params: RendererApiClearLightsParams
    ): Promise<RendererApiClearLightsResult> {
        const result = await this.#exec("clear-lights", params)
        return result as RendererApiClearLightsResult
    }

    /**
     * Clear all models in the scene
     *
     * Entrypoint **"clear-models"**
     */
    public async clearModels(
        params: RendererApiClearModelsParams
    ): Promise<RendererApiClearModelsResult> {
        const result = await this.#exec("clear-models", params)
        return result as RendererApiClearModelsResult
    }

    /**
     * Clear all renderable models in the scene
     *
     * Entrypoint **"clear-renderables"**
     */
    public async clearRenderables(
        params: RendererApiClearRenderablesParams
    ): Promise<RendererApiClearRenderablesResult> {
        const result = await this.#exec("clear-renderables", params)
        return result as RendererApiClearRenderablesResult
    }

    /**
     * Applies the specified color method to the model with the given color input
     *
     * Entrypoint **"color-model"**
     */
    public async colorModel(
        params: RendererApiColorModelParams
    ): Promise<RendererApiColorModelResult> {
        const result = await this.#exec("color-model", params)
        return result as RendererApiColorModelResult
    }

    /**
     * A switch to enable or disable simulation on a model
     *
     * Entrypoint **"enable-simulation"**
     */
    public async enableSimulation(
        params: RendererApiEnableSimulationParams
    ): Promise<RendererApiEnableSimulationResult> {
        const result = await this.#exec("enable-simulation", params)
        return result as RendererApiEnableSimulationResult
    }

    /**
     * Renders and returns (or saves to disk) the Framebuffer G-Buffers
     *
     * Entrypoint **"export-gbuffers"**
     */
    public async exportGbuffers(
        params: RendererApiExportGbuffersParams
    ): Promise<RendererApiExportGbuffersResult> {
        const result = await this.#exec("export-gbuffers", params)
        return result as RendererApiExportGbuffersResult
    }

    /**
     * Get the current state of the application parameters
     *
     * Entrypoint **"get-application-parameters"**
     */
    public async getApplicationParameters(
        params: RendererApiGetApplicationParametersParams
    ): Promise<RendererApiGetApplicationParametersResult> {
        const result = await this.#exec("get-application-parameters", params)
        return result as RendererApiGetApplicationParametersResult
    }

    /**
     * Returns a list of available atlas visualization usecases for the given model
     *
     * Entrypoint **"get-available-atlas-usecases"**
     */
    public async getAvailableAtlasUsecases(
        params: RendererApiGetAvailableAtlasUsecasesParams
    ): Promise<RendererApiGetAvailableAtlasUsecasesResult> {
        const result = await this.#exec("get-available-atlas-usecases", params)
        return result as RendererApiGetAvailableAtlasUsecasesResult
    }

    /**
     * Returns the current camera as orthographic
     *
     * Entrypoint **"get-camera-orthographic"**
     */
    public async getCameraOrthographic(
        params: RendererApiGetCameraOrthographicParams
    ): Promise<RendererApiGetCameraOrthographicResult> {
        const result = await this.#exec("get-camera-orthographic", params)
        return result as RendererApiGetCameraOrthographicResult
    }

    /**
     * Returns the current camera as perspective
     *
     * Entrypoint **"get-camera-perspective"**
     */
    public async getCameraPerspective(
        params: RendererApiGetCameraPerspectiveParams
    ): Promise<RendererApiGetCameraPerspectiveResult> {
        const result = await this.#exec("get-camera-perspective", params)
        return result as RendererApiGetCameraPerspectiveResult
    }

    /**
     * Returns the type of the current camera
     *
     * Entrypoint **"get-camera-type"**
     */
    public async getCameraType(
        params: RendererApiGetCameraTypeParams
    ): Promise<RendererApiGetCameraTypeResult> {
        const result = await this.#exec("get-camera-type", params)
        return result as RendererApiGetCameraTypeResult
    }

    /**
     * Returns the camera view settings
     *
     * Entrypoint **"get-camera-view"**
     */
    public async getCameraView(
        params: RendererApiGetCameraViewParams
    ): Promise<RendererApiGetCameraViewResult> {
        const result = await this.#exec("get-camera-view", params)
        return result as RendererApiGetCameraViewResult
    }

    /**
     * For neuron/astrocyte/vasculature models, return the list of ids loaded
     *
     * Entrypoint **"get-circuit-ids"**
     */
    public async getCircuitIds(
        params: RendererApiGetCircuitIdsParams
    ): Promise<RendererApiGetCircuitIdsResult> {
        const result = await this.#exec("get-circuit-ids", params)
        return result as RendererApiGetCircuitIdsResult
    }

    /**
     * Returns a list of available coloring methods for the model
     *
     * Entrypoint **"get-color-methods"**
     */
    public async getColorMethods(
        params: RendererApiGetColorMethodsParams
    ): Promise<RendererApiGetColorMethodsResult> {
        const result = await this.#exec("get-color-methods", params)
        return result as RendererApiGetColorMethodsResult
    }

    /**
     * Get the color ramp of the given model
     *
     * Entrypoint **"get-color-ramp"**
     */
    public async getColorRamp(
        params: RendererApiGetColorRampParams
    ): Promise<RendererApiGetColorRampResult> {
        const result = await this.#exec("get-color-ramp", params)
        return result as RendererApiGetColorRampResult
    }

    /**
     * Returns a list of input variables for a given model and color method
     *
     * Entrypoint **"get-color-values"**
     */
    public async getColorValues(
        params: RendererApiGetColorValuesParams
    ): Promise<RendererApiGetColorValuesResult> {
        const result = await this.#exec("get-color-values", params)
        return result as RendererApiGetColorValuesResult
    }

    /**
     * Get all loaders
     *
     * Entrypoint **"get-loaders"**
     */
    public async getLoaders(
        params: RendererApiGetLoadersParams
    ): Promise<RendererApiGetLoadersResult> {
        const result = await this.#exec("get-loaders", params)
        return result as RendererApiGetLoadersResult
    }

    /**
     * Returns the material of the given model as a car paint material, if possible
     *
     * Entrypoint **"get-material-carpaint"**
     */
    public async getMaterialCarpaint(
        params: RendererApiGetMaterialCarpaintParams
    ): Promise<RendererApiGetMaterialCarpaintResult> {
        const result = await this.#exec("get-material-carpaint", params)
        return result as RendererApiGetMaterialCarpaintResult
    }

    /**
     * Returns the material of the given model as a emissive material, if possible
     *
     * Entrypoint **"get-material-emissive"**
     */
    public async getMaterialEmissive(
        params: RendererApiGetMaterialEmissiveParams
    ): Promise<RendererApiGetMaterialEmissiveResult> {
        const result = await this.#exec("get-material-emissive", params)
        return result as RendererApiGetMaterialEmissiveResult
    }

    /**
     * Returns the material of the given model as a ghost material, if possible
     *
     * Entrypoint **"get-material-ghost"**
     */
    public async getMaterialGhost(
        params: RendererApiGetMaterialGhostParams
    ): Promise<RendererApiGetMaterialGhostResult> {
        const result = await this.#exec("get-material-ghost", params)
        return result as RendererApiGetMaterialGhostResult
    }

    /**
     * Returns the material of the given model as a glass material, if possible
     *
     * Entrypoint **"get-material-glass"**
     */
    public async getMaterialGlass(
        params: RendererApiGetMaterialGlassParams
    ): Promise<RendererApiGetMaterialGlassResult> {
        const result = await this.#exec("get-material-glass", params)
        return result as RendererApiGetMaterialGlassResult
    }

    /**
     * Returns the material of the given model as a matte material, if possible
     *
     * Entrypoint **"get-material-matte"**
     */
    public async getMaterialMatte(
        params: RendererApiGetMaterialMatteParams
    ): Promise<RendererApiGetMaterialMatteResult> {
        const result = await this.#exec("get-material-matte", params)
        return result as RendererApiGetMaterialMatteResult
    }

    /**
     * Returns the material of the given model as a metal material, if possible
     *
     * Entrypoint **"get-material-metal"**
     */
    public async getMaterialMetal(
        params: RendererApiGetMaterialMetalParams
    ): Promise<RendererApiGetMaterialMetalResult> {
        const result = await this.#exec("get-material-metal", params)
        return result as RendererApiGetMaterialMetalResult
    }

    /**
     * Returns the material of the given model as a phong material, if possible
     *
     * Entrypoint **"get-material-phong"**
     */
    public async getMaterialPhong(
        params: RendererApiGetMaterialPhongParams
    ): Promise<RendererApiGetMaterialPhongResult> {
        const result = await this.#exec("get-material-phong", params)
        return result as RendererApiGetMaterialPhongResult
    }

    /**
     * Returns the material of the given model as a plastic material, if possible
     *
     * Entrypoint **"get-material-plastic"**
     */
    public async getMaterialPlastic(
        params: RendererApiGetMaterialPlasticParams
    ): Promise<RendererApiGetMaterialPlasticResult> {
        const result = await this.#exec("get-material-plastic", params)
        return result as RendererApiGetMaterialPlasticResult
    }

    /**
     * Returns the material of the given model as a principled material, if possible
     *
     * Entrypoint **"get-material-principled"**
     */
    public async getMaterialPrincipled(
        params: RendererApiGetMaterialPrincipledParams
    ): Promise<RendererApiGetMaterialPrincipledResult> {
        const result = await this.#exec("get-material-principled", params)
        return result as RendererApiGetMaterialPrincipledResult
    }

    /**
     * Returns the type of the material of a given model, if any
     *
     * Entrypoint **"get-material-type"**
     */
    public async getMaterialType(
        params: RendererApiGetMaterialTypeParams
    ): Promise<RendererApiGetMaterialTypeResult> {
        const result = await this.#exec("get-material-type", params)
        return result as RendererApiGetMaterialTypeResult
    }

    /**
     * Get all the information of the given model
     *
     * Entrypoint **"get-model"**
     */
    public async getModel(
        params: RendererApiGetModelParams
    ): Promise<RendererApiGetModelResult> {
        const result = await this.#exec("get-model", params)
        return result as RendererApiGetModelResult
    }

    /**
     * Returns the current renderer as interactive renderer, if possible
     *
     * Entrypoint **"get-renderer-interactive"**
     */
    public async getRendererInteractive(
        params: RendererApiGetRendererInteractiveParams
    ): Promise<RendererApiGetRendererInteractiveResult> {
        const result = await this.#exec("get-renderer-interactive", params)
        return result as RendererApiGetRendererInteractiveResult
    }

    /**
     * Returns the current renderer as production renderer, if possible
     *
     * Entrypoint **"get-renderer-production"**
     */
    public async getRendererProduction(
        params: RendererApiGetRendererProductionParams
    ): Promise<RendererApiGetRendererProductionResult> {
        const result = await this.#exec("get-renderer-production", params)
        return result as RendererApiGetRendererProductionResult
    }

    /**
     * Returns the type of the renderer currently being used
     *
     * Entrypoint **"get-renderer-type"**
     */
    public async getRendererType(
        params: RendererApiGetRendererTypeParams
    ): Promise<RendererApiGetRendererTypeResult> {
        const result = await this.#exec("get-renderer-type", params)
        return result as RendererApiGetRendererTypeResult
    }

    /**
     * Get the current state of the scene
     *
     * Entrypoint **"get-scene"**
     */
    public async getScene(
        params: RendererApiGetSceneParams
    ): Promise<RendererApiGetSceneResult> {
        const result = await this.#exec("get-scene", params)
        return result as RendererApiGetSceneResult
    }

    /**
     * Get the current state of the simulation parameters
     *
     * Entrypoint **"get-simulation-parameters"**
     */
    public async getSimulationParameters(
        params: RendererApiGetSimulationParametersParams
    ): Promise<RendererApiGetSimulationParametersResult> {
        const result = await this.#exec("get-simulation-parameters", params)
        return result as RendererApiGetSimulationParametersResult
    }

    /**
     * Get Brayns instance version
     *
     * Entrypoint **"get-version"**
     */
    public async getVersion(
        params: RendererApiGetVersionParams
    ): Promise<RendererApiGetVersionResult> {
        const result = await this.#exec("get-version", params)
        return result as RendererApiGetVersionResult
    }

    /**
     * Inspect the scene at x-y position
     *
     * Entrypoint **"inspect"**
     */
    public async inspect(
        params: RendererApiInspectParams
    ): Promise<RendererApiInspectResult> {
        const result = await this.#exec("inspect", params)
        return result as RendererApiInspectResult
    }

    /**
     * Creates new instances of the given model. The underneath data is shared across all instances
     *
     * Entrypoint **"instantiate-model"**
     */
    public async instantiateModel(
        params: RendererApiInstantiateModelParams
    ): Promise<RendererApiInstantiateModelResult> {
        const result = await this.#exec("instantiate-model", params)
        return result as RendererApiInstantiateModelResult
    }

    /**
     * Quit the application
     *
     * Entrypoint **"quit"**
     */
    public async quit(
        params: RendererApiQuitParams
    ): Promise<RendererApiQuitResult> {
        const result = await this.#exec("quit", params)
        return result as RendererApiQuitResult
    }

    /**
     * Retreive the names of all registered entrypoints
     *
     * Entrypoint **"registry"**
     */
    public async registry(
        params: RendererApiRegistryParams
    ): Promise<RendererApiRegistryResult> {
        const result = await this.#exec("registry", params)
        return result as RendererApiRegistryResult
    }

    /**
     * Remove the model(s) from the ID list from the scene
     *
     * Entrypoint **"remove-model"**
     */
    public async removeModel(
        params: RendererApiRemoveModelParams
    ): Promise<RendererApiRemoveModelResult> {
        const result = await this.#exec("remove-model", params)
        return result as RendererApiRemoveModelResult
    }

    /**
     * Render an image of the current context and retreive it according to given params
     *
     * Entrypoint **"render-image"**
     */
    public async renderImage(
        params: RendererApiRenderImageParams
    ): Promise<RendererApiRenderImageResult> {
        const result = await this.#exec("render-image", params)
        return result as RendererApiRenderImageResult
    }

    /**
     * Get the JSON schema of the given entrypoint
     *
     * Entrypoint **"schema"**
     */
    public async schema(
        params: RendererApiSchemaParams
    ): Promise<RendererApiSchemaResult> {
        const result = await this.#exec("schema", params)
        return result as RendererApiSchemaResult
    }

    /**
     * Set the current state of the application parameters
     *
     * Entrypoint **"set-application-parameters"**
     */
    public async setApplicationParameters(
        params: RendererApiSetApplicationParametersParams
    ): Promise<RendererApiSetApplicationParametersResult> {
        const result = await this.#exec("set-application-parameters", params)
        return result as RendererApiSetApplicationParametersResult
    }

    /**
     * Sets the current camera to an orthographic one, with the specified parameters
     *
     * Entrypoint **"set-camera-orthographic"**
     */
    public async setCameraOrthographic(
        params: RendererApiSetCameraOrthographicParams
    ): Promise<RendererApiSetCameraOrthographicResult> {
        const result = await this.#exec("set-camera-orthographic", params)
        return result as RendererApiSetCameraOrthographicResult
    }

    /**
     * Sets the current camera to a perspective one, with the specified parameters
     *
     * Entrypoint **"set-camera-perspective"**
     */
    public async setCameraPerspective(
        params: RendererApiSetCameraPerspectiveParams
    ): Promise<RendererApiSetCameraPerspectiveResult> {
        const result = await this.#exec("set-camera-perspective", params)
        return result as RendererApiSetCameraPerspectiveResult
    }

    /**
     * Sets the camera view settings
     *
     * Entrypoint **"set-camera-view"**
     */
    public async setCameraView(
        params: RendererApiSetCameraViewParams
    ): Promise<RendererApiSetCameraViewResult> {
        const result = await this.#exec("set-camera-view", params)
        return result as RendererApiSetCameraViewResult
    }

    /**
     * Modify the geometry radiuses (spheres, cones, cylinders and SDF geometries)
     *
     * Entrypoint **"set-circuit-thickness"**
     */
    public async setCircuitThickness(
        params: RendererApiSetCircuitThicknessParams
    ): Promise<RendererApiSetCircuitThicknessResult> {
        const result = await this.#exec("set-circuit-thickness", params)
        return result as RendererApiSetCircuitThicknessResult
    }

    /**
     * Set the color ramp of the given model
     *
     * Entrypoint **"set-color-ramp"**
     */
    public async setColorRamp(
        params: RendererApiSetColorRampParams
    ): Promise<RendererApiSetColorRampResult> {
        const result = await this.#exec("set-color-ramp", params)
        return result as RendererApiSetColorRampResult
    }

    /**
     * Stablishes a progressive-resolution frame rendering on the engine
     *
     * Entrypoint **"set-framebuffer-progressive"**
     */
    public async setFramebufferProgressive(
        params: RendererApiSetFramebufferProgressiveParams
    ): Promise<RendererApiSetFramebufferProgressiveResult> {
        const result = await this.#exec("set-framebuffer-progressive", params)
        return result as RendererApiSetFramebufferProgressiveResult
    }

    /**
     * Stablishes a static frame rendering on the engine
     *
     * Entrypoint **"set-framebuffer-static"**
     */
    public async setFramebufferStatic(
        params: RendererApiSetFramebufferStaticParams
    ): Promise<RendererApiSetFramebufferStaticResult> {
        const result = await this.#exec("set-framebuffer-static", params)
        return result as RendererApiSetFramebufferStaticResult
    }

    /**
     * Updates the material of the given model to a car paint material. This material is only usable with the production renderer
     *
     * Entrypoint **"set-material-carpaint"**
     */
    public async setMaterialCarpaint(
        params: RendererApiSetMaterialCarpaintParams
    ): Promise<RendererApiSetMaterialCarpaintResult> {
        const result = await this.#exec("set-material-carpaint", params)
        return result as RendererApiSetMaterialCarpaintResult
    }

    /**
     * Updates the material of the given model to an emisive material. This material is only usable with the production renderer
     *
     * Entrypoint **"set-material-emissive"**
     */
    public async setMaterialEmissive(
        params: RendererApiSetMaterialEmissiveParams
    ): Promise<RendererApiSetMaterialEmissiveResult> {
        const result = await this.#exec("set-material-emissive", params)
        return result as RendererApiSetMaterialEmissiveResult
    }

    /**
     * Updates the material of the given model to a ghost material. The ghost effect is only visible with the interactive renderer.
     *
     * Entrypoint **"set-material-ghost"**
     */
    public async setMaterialGhost(
        params: RendererApiSetMaterialGhostParams
    ): Promise<RendererApiSetMaterialGhostResult> {
        const result = await this.#exec("set-material-ghost", params)
        return result as RendererApiSetMaterialGhostResult
    }

    /**
     * Updates the material of the given model to a glass material. This material is only usable with the production renderer
     *
     * Entrypoint **"set-material-glass"**
     */
    public async setMaterialGlass(
        params: RendererApiSetMaterialGlassParams
    ): Promise<RendererApiSetMaterialGlassResult> {
        const result = await this.#exec("set-material-glass", params)
        return result as RendererApiSetMaterialGlassResult
    }

    /**
     * Updates the material of the given model to a matte material. This material is only usable with the production renderer
     *
     * Entrypoint **"set-material-matte"**
     */
    public async setMaterialMatte(
        params: RendererApiSetMaterialMatteParams
    ): Promise<RendererApiSetMaterialMatteResult> {
        const result = await this.#exec("set-material-matte", params)
        return result as RendererApiSetMaterialMatteResult
    }

    /**
     * Updates the material of the given model to a metal material. This material is only usable with the production renderer
     *
     * Entrypoint **"set-material-metal"**
     */
    public async setMaterialMetal(
        params: RendererApiSetMaterialMetalParams
    ): Promise<RendererApiSetMaterialMetalResult> {
        const result = await this.#exec("set-material-metal", params)
        return result as RendererApiSetMaterialMetalResult
    }

    /**
     * Updates the material of the given model to the phong material. This material works with all renderers. It has a matte appearance.
     *
     * Entrypoint **"set-material-phong"**
     */
    public async setMaterialPhong(
        params: RendererApiSetMaterialPhongParams
    ): Promise<RendererApiSetMaterialPhongResult> {
        const result = await this.#exec("set-material-phong", params)
        return result as RendererApiSetMaterialPhongResult
    }

    /**
     * Updates the material of the given model to a plastic material. This material is only usable with the production renderer
     *
     * Entrypoint **"set-material-plastic"**
     */
    public async setMaterialPlastic(
        params: RendererApiSetMaterialPlasticParams
    ): Promise<RendererApiSetMaterialPlasticResult> {
        const result = await this.#exec("set-material-plastic", params)
        return result as RendererApiSetMaterialPlasticResult
    }

    /**
     * Updates the material of the given model to a principled material. This material is only usable with the production renderer
     *
     * Entrypoint **"set-material-principled"**
     */
    public async setMaterialPrincipled(
        params: RendererApiSetMaterialPrincipledParams
    ): Promise<RendererApiSetMaterialPrincipledResult> {
        const result = await this.#exec("set-material-principled", params)
        return result as RendererApiSetMaterialPrincipledResult
    }

    /**
     * Sets the system renderer to the interactive one
     *
     * Entrypoint **"set-renderer-interactive"**
     */
    public async setRendererInteractive(
        params: RendererApiSetRendererInteractiveParams
    ): Promise<RendererApiSetRendererInteractiveResult> {
        const result = await this.#exec("set-renderer-interactive", params)
        return result as RendererApiSetRendererInteractiveResult
    }

    /**
     * Sets the system renderer to the production one
     *
     * Entrypoint **"set-renderer-production"**
     */
    public async setRendererProduction(
        params: RendererApiSetRendererProductionParams
    ): Promise<RendererApiSetRendererProductionResult> {
        const result = await this.#exec("set-renderer-production", params)
        return result as RendererApiSetRendererProductionResult
    }

    /**
     * Set the current state of the simulation parameters
     *
     * Entrypoint **"set-simulation-parameters"**
     */
    public async setSimulationParameters(
        params: RendererApiSetSimulationParametersParams
    ): Promise<RendererApiSetSimulationParametersResult> {
        const result = await this.#exec("set-simulation-parameters", params)
        return result as RendererApiSetSimulationParametersResult
    }

    /**
     * Take a snapshot with given parameters
     *
     * Entrypoint **"snapshot"**
     */
    public async snapshot(
        params: RendererApiSnapshotParams
    ): Promise<RendererApiSnapshotResult> {
        const result = await this.#exec("snapshot", params)
        return result as RendererApiSnapshotResult
    }

    /**
     * Update the model with the given values and return its new state
     *
     * Entrypoint **"update-model"**
     */
    public async updateModel(
        params: RendererApiUpdateModelParams
    ): Promise<RendererApiUpdateModelResult> {
        const result = await this.#exec("update-model", params)
        return result as RendererApiUpdateModelResult
    }

    /**
     * Upload a model from binary request data and return model descriptors on success
     *
     * Entrypoint **"upload-model"**
     */
    public async uploadModel(
        params: RendererApiUploadModelParams
    ): Promise<RendererApiUploadModelResult> {
        const result = await this.#exec("upload-model", params)
        return result as RendererApiUploadModelResult
    }

    /**
     * Visualizes the specified use case based on the atlas data of the given model
     *
     * Entrypoint **"visualize-atlas-usecase"**
     */
    public async visualizeAtlasUsecase(
        params: RendererApiVisualizeAtlasUsecaseParams
    ): Promise<RendererApiVisualizeAtlasUsecaseResult> {
        const result = await this.#exec("visualize-atlas-usecase", params)
        return result as RendererApiVisualizeAtlasUsecaseResult
    }
}

export type RendererApiAddBoundedPlanesParams = Array</**
 * **REQUIRED**
 * undefined
 */
{
    color: Array<number>
    geometry: /**
     * **REQUIRED**
     * Geometry data
     */
    {
        bounds: /**
         * **REQUIRED**
         * Axis-aligned bounds to limit the plane geometry
         */
        {
            max: Array<number>
            min: Array<number>
        }
        coefficients: Array<number>
    }
}>

export type RendererApiAddBoundedPlanesResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddBoxesParams = Array</**
 * **REQUIRED**
 * undefined
 */
{
    color: Array<number>
    geometry: /**
     * **REQUIRED**
     * Geometry data
     */
    {
        max: Array<number>
        min: Array<number>
    }
}>

export type RendererApiAddBoxesResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddCapsulesParams = Array</**
 * **REQUIRED**
 * undefined
 */
{
    color: Array<number>
    geometry: /**
     * **REQUIRED**
     * Geometry data
     */
    {
        p0: Array<number>
        p1: Array<number>
        r0: number
        r1: number
    }
}>

export type RendererApiAddCapsulesResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddClipPlaneParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        coefficients: Array<number>
    }

export type RendererApiAddClipPlaneResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddClippingBoundedPlanesParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        invert_normals: boolean
        primitives: Array</**
         * **REQUIRED**
         * undefined
         */
        {
            bounds: /**
             * **REQUIRED**
             * Axis-aligned bounds to limit the plane geometry
             */
            {
                max: Array<number>
                min: Array<number>
            }
            coefficients: Array<number>
        }>
    }

export type RendererApiAddClippingBoundedPlanesResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddClippingBoxesParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        invert_normals: boolean
        primitives: Array</**
         * **REQUIRED**
         * undefined
         */
        {
            max: Array<number>
            min: Array<number>
        }>
    }

export type RendererApiAddClippingBoxesResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddClippingCapsulesParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        invert_normals: boolean
        primitives: Array</**
         * **REQUIRED**
         * undefined
         */
        {
            p0: Array<number>
            p1: Array<number>
            r0: number
            r1: number
        }>
    }

export type RendererApiAddClippingCapsulesResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddClippingPlanesParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        invert_normals: boolean
        primitives: Array</**
         * **REQUIRED**
         * undefined
         */
        {
            coefficients: Array<number>
        }>
    }

export type RendererApiAddClippingPlanesResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddClippingSpheresParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        invert_normals: boolean
        primitives: Array</**
         * **REQUIRED**
         * undefined
         */
        {
            center: Array<number>
            radius: number
        }>
    }

export type RendererApiAddClippingSpheresResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddLightAmbientParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        color: Array<number>
        intensity: number
    }

export type RendererApiAddLightAmbientResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddLightDirectionalParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        color: Array<number>
        direction: Array<number>
        intensity: number
    }

export type RendererApiAddLightDirectionalResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddLightQuadParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        color: Array<number>
        edge1: Array<number>
        edge2: Array<number>
        intensity: number
        position: Array<number>
    }

export type RendererApiAddLightQuadResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddModelParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        loader_name: string
        loader_properties: /****************************************
          WARNING!
          Don't know how to deal with this type:
          {
            "description": "Settings to configure the loading process"
          }
        ****************************************/
        unknown
        path: string
    }

export type RendererApiAddModelResult = Array</**
 * **REQUIRED**
 * undefined
 */
{
    bounds: /**
     * **REQUIRED**
     * Model bounds
     */
    {
        max: Array<number>
        min: Array<number>
    }
    info: /**
     * **REQUIRED**
     * Model-specific info
     */
    {
        base_transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
        load_info: /**
         * **REQUIRED**
         * Model load info
         */
        {
            load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
            unknown
            loader_name: string
            path: string
            source: string
        }
        metadata: object
    }
    is_visible: boolean
    model_id: number
    model_type: string
    transform: /**
     * **REQUIRED**
     * Model transform
     */
    {
        rotation: Array<number>
        scale: Array<number>
        translation: Array<number>
    }
}>

export type RendererApiAddPlanesParams = Array</**
 * **REQUIRED**
 * undefined
 */
{
    color: Array<number>
    geometry: /**
     * **REQUIRED**
     * Geometry data
     */
    {
        coefficients: Array<number>
    }
}>

export type RendererApiAddPlanesResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiAddSpheresParams = Array</**
 * **REQUIRED**
 * undefined
 */
{
    color: Array<number>
    geometry: /**
     * **REQUIRED**
     * Geometry data
     */
    {
        center: Array<number>
        radius: number
    }
}>

export type RendererApiAddSpheresResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiCancelParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: null | number | string
    }

export type RendererApiCancelResult = undefined

export type RendererApiClearClipPlanesParams = undefined

export type RendererApiClearClipPlanesResult = undefined

export type RendererApiClearClippingGeometriesParams = undefined

export type RendererApiClearClippingGeometriesResult = undefined

export type RendererApiClearLightsParams = undefined

export type RendererApiClearLightsResult = undefined

export type RendererApiClearModelsParams = undefined

export type RendererApiClearModelsResult = undefined

export type RendererApiClearRenderablesParams = undefined

export type RendererApiClearRenderablesResult = undefined

export type RendererApiColorModelParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
        method: string
        values: object
    }

export type RendererApiColorModelResult = undefined

export type RendererApiEnableSimulationParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        enabled: boolean
        model_id: number
    }

export type RendererApiEnableSimulationResult = undefined

export type RendererApiExitLaterParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        minutes: number
    }

export type RendererApiExitLaterResult = undefined

export type RendererApiExportGbuffersParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        camera: /**
         * **REQUIRED**
         * Camera definition
         */
        {
            name: string
            params: /****************************************
              WARNING!
              Don't know how to deal with this type:
              {
                "description": "Object parameters"
              }
            ****************************************/
            unknown
        }
        camera_view: /**
         * **REQUIRED**
         * Camera view
         */
        {
            position: Array<number>
            target: Array<number>
            up: Array<number>
        }
        channels: Array<string>
        file_path: string
        renderer: /**
         * **REQUIRED**
         * Renderer
         */
        {
            name: string
            params: /****************************************
              WARNING!
              Don't know how to deal with this type:
              {
                "description": "Object parameters"
              }
            ****************************************/
            unknown
        }
        resolution: Array<number>
        simulation_frame: number
    }

export type RendererApiExportGbuffersResult = undefined

export type RendererApiGetApplicationParametersParams = undefined

export type RendererApiGetApplicationParametersResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        plugins: Array<string>
        viewport: Array<number>
    }

export type RendererApiGetAvailableAtlasUsecasesParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        model_id: number
    }

export type RendererApiGetAvailableAtlasUsecasesResult = Array</**
 * **REQUIRED**
 * undefined
 */
{
    name: string
    params_schema: object
}>

export type RendererApiGetCameraOrthographicParams = undefined

export type RendererApiGetCameraOrthographicResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        height: number
    }

export type RendererApiGetCameraPerspectiveParams = undefined

export type RendererApiGetCameraPerspectiveResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        aperture_radius: number
        focus_distance: number
        fovy: number
    }

export type RendererApiGetCameraTypeParams = undefined

export type RendererApiGetCameraTypeResult = string

export type RendererApiGetCameraViewParams = undefined

export type RendererApiGetCameraViewResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        position: Array<number>
        target: Array<number>
        up: Array<number>
    }

export type RendererApiGetCircuitIdsParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        model_id: number
    }

export type RendererApiGetCircuitIdsResult = Array<number>

export type RendererApiGetColorMethodsParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetColorMethodsResult = Array<string>

export type RendererApiGetColorRampParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetColorRampResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        colors: Array<Array<number>>
        range: Array<number>
    }

export type RendererApiGetColorValuesParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
        method: string
    }

export type RendererApiGetColorValuesResult = Array<string>

export type RendererApiGetLoadersParams = undefined

export type RendererApiGetLoadersResult = Array</**
 * **REQUIRED**
 * undefined
 */
{
    extensions: Array<string>
    input_parameters_schema: object
    name: string
}>

export type RendererApiGetMaterialCarpaintParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialCarpaintResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        flake_density: number
    }

export type RendererApiGetMaterialEmissiveParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialEmissiveResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        color: Array<number>
        intensity: number
    }

export type RendererApiGetMaterialGhostParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialGhostResult = object

export type RendererApiGetMaterialGlassParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialGlassResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        index_of_refraction: number
    }

export type RendererApiGetMaterialMatteParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialMatteResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        opacity: number
    }

export type RendererApiGetMaterialMetalParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialMetalResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        roughness: number
    }

export type RendererApiGetMaterialPhongParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialPhongResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        opacity: number
    }

export type RendererApiGetMaterialPlasticParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialPlasticResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        opacity: number
    }

export type RendererApiGetMaterialPrincipledParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialPrincipledResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        anisotropy: number
        anisotropy_rotation: number
        back_light: number
        coat: number
        coat_color: Array<number>
        coat_ior: number
        coat_roughness: number
        coat_thickness: number
        diffuse: number
        edge_color: Array<number>
        ior: number
        metallic: number
        roughness: number
        sheen: number
        sheen_color: Array<number>
        sheen_roughness: number
        sheen_tint: number
        specular: number
        thickness: number
        thin: boolean
        transmission: number
        transmission_color: Array<number>
        transmission_depth: number
    }

export type RendererApiGetMaterialTypeParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetMaterialTypeResult = string

export type RendererApiGetModelParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        id: number
    }

export type RendererApiGetModelResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiGetRendererInteractiveParams = undefined

export type RendererApiGetRendererInteractiveResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        ao_samples: number
        background_color: Array<number>
        enable_shadows: boolean
        max_ray_bounces: number
        samples_per_pixel: number
    }

export type RendererApiGetRendererProductionParams = undefined

export type RendererApiGetRendererProductionResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        background_color: Array<number>
        max_ray_bounces: number
        samples_per_pixel: number
    }

export type RendererApiGetRendererTypeParams = undefined

export type RendererApiGetRendererTypeResult = string

export type RendererApiGetSceneParams = undefined

export type RendererApiGetSceneResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Scene bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        models: Array</**
         * **REQUIRED**
         * undefined
         */
        {
            bounds: /**
             * **REQUIRED**
             * Model bounds
             */
            {
                max: Array<number>
                min: Array<number>
            }
            info: /**
             * **REQUIRED**
             * Model-specific info
             */
            {
                base_transform: /**
                 * **REQUIRED**
                 * Model transform
                 */
                {
                    rotation: Array<number>
                    scale: Array<number>
                    translation: Array<number>
                }
                load_info: /**
                 * **REQUIRED**
                 * Model load info
                 */
                {
                    load_parameters: /****************************************
                      WARNING!
                      Don't know how to deal with this type:
                      {
                        "description": "Loader settings",
                        "readOnly": true
                      }
                    ****************************************/
                    unknown
                    loader_name: string
                    path: string
                    source: string
                }
                metadata: object
            }
            is_visible: boolean
            model_id: number
            model_type: string
            transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
        }>
    }

export type RendererApiGetSimulationParametersParams = undefined

export type RendererApiGetSimulationParametersResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        current: number
        dt: number
        end_frame: number
        start_frame: number
        unit: string
    }

export type RendererApiGetVersionParams = undefined

export type RendererApiGetVersionResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        major: number
        minor: number
        patch: number
        revision: string
    }

export type RendererApiInspectParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        position: Array<number>
    }

export type RendererApiInspectResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        hit: boolean
        metadata: /****************************************
          WARNING!
          Don't know how to deal with this type:
          {
            "description": "Extra attributes depending on the type of model hitted",
            "readOnly": true
          }
        ****************************************/
        unknown
        model_id: number
        position: Array<number>
    }

export type RendererApiInstantiateModelParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        model_id: number
        transforms: Array</**
         * **REQUIRED**
         * undefined
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }>
    }

export type RendererApiInstantiateModelResult = Array</**
 * **REQUIRED**
 * undefined
 */
{
    bounds: /**
     * **REQUIRED**
     * Model bounds
     */
    {
        max: Array<number>
        min: Array<number>
    }
    info: /**
     * **REQUIRED**
     * Model-specific info
     */
    {
        base_transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
        load_info: /**
         * **REQUIRED**
         * Model load info
         */
        {
            load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
            unknown
            loader_name: string
            path: string
            source: string
        }
        metadata: object
    }
    is_visible: boolean
    model_id: number
    model_type: string
    transform: /**
     * **REQUIRED**
     * Model transform
     */
    {
        rotation: Array<number>
        scale: Array<number>
        translation: Array<number>
    }
}>

export type RendererApiQuitParams = undefined

export type RendererApiQuitResult = undefined

export type RendererApiRegistryParams = undefined

export type RendererApiRegistryResult = Array<string>

export type RendererApiRemoveModelParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        ids: Array<number>
    }

export type RendererApiRemoveModelResult = undefined

export type RendererApiRenderImageParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        accumulate: boolean
        force: boolean
        format: string
        jpeg_quality: number
        render: boolean
        send: boolean
    }

export type RendererApiRenderImageResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        accumulation: number
        max_accumulation: number
    }

export type RendererApiSchemaParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        endpoint: string
    }

export type RendererApiSchemaResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        async: boolean
        deprecated: boolean
        description: string
        params: object
        plugin: string
        returns: object
        title: string
    }

export type RendererApiSetApplicationParametersParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        plugins: Array<string>
        viewport: Array<number>
    }

export type RendererApiSetApplicationParametersResult = undefined

export type RendererApiSetCameraOrthographicParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        height: number
    }

export type RendererApiSetCameraOrthographicResult = undefined

export type RendererApiSetCameraPerspectiveParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        aperture_radius: number
        focus_distance: number
        fovy: number
    }

export type RendererApiSetCameraPerspectiveResult = undefined

export type RendererApiSetCameraViewParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        position: Array<number>
        target: Array<number>
        up: Array<number>
    }

export type RendererApiSetCameraViewResult = undefined

export type RendererApiSetCircuitThicknessParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        model_id: number
        radius_multiplier: number
    }

export type RendererApiSetCircuitThicknessResult = undefined

export type RendererApiSetColorRampParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        color_ramp: /**
         * **REQUIRED**
         * Color ramp
         */
        {
            colors: Array<Array<number>>
            range: Array<number>
        }
        id: number
    }

export type RendererApiSetColorRampResult = undefined

export type RendererApiSetFramebufferProgressiveParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        scale: number
    }

export type RendererApiSetFramebufferProgressiveResult = undefined

export type RendererApiSetFramebufferStaticParams = undefined

export type RendererApiSetFramebufferStaticResult = undefined

export type RendererApiSetMaterialCarpaintParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        material: /**
         * **REQUIRED**
         * Material parameters
         */
        {
            flake_density: number
        }
        model_id: number
    }

export type RendererApiSetMaterialCarpaintResult = undefined

export type RendererApiSetMaterialEmissiveParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        material: /**
         * **REQUIRED**
         * Material parameters
         */
        {
            color: Array<number>
            intensity: number
        }
        model_id: number
    }

export type RendererApiSetMaterialEmissiveResult = undefined

export type RendererApiSetMaterialGhostParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        material: object
        model_id: number
    }

export type RendererApiSetMaterialGhostResult = undefined

export type RendererApiSetMaterialGlassParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        material: /**
         * **REQUIRED**
         * Material parameters
         */
        {
            index_of_refraction: number
        }
        model_id: number
    }

export type RendererApiSetMaterialGlassResult = undefined

export type RendererApiSetMaterialMatteParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        material: /**
         * **REQUIRED**
         * Material parameters
         */
        {
            opacity: number
        }
        model_id: number
    }

export type RendererApiSetMaterialMatteResult = undefined

export type RendererApiSetMaterialMetalParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        material: /**
         * **REQUIRED**
         * Material parameters
         */
        {
            roughness: number
        }
        model_id: number
    }

export type RendererApiSetMaterialMetalResult = undefined

export type RendererApiSetMaterialPhongParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        material: /**
         * **REQUIRED**
         * Material parameters
         */
        {
            opacity: number
        }
        model_id: number
    }

export type RendererApiSetMaterialPhongResult = undefined

export type RendererApiSetMaterialPlasticParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        material: /**
         * **REQUIRED**
         * Material parameters
         */
        {
            opacity: number
        }
        model_id: number
    }

export type RendererApiSetMaterialPlasticResult = undefined

export type RendererApiSetMaterialPrincipledParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        material: /**
         * **REQUIRED**
         * Material parameters
         */
        {
            anisotropy: number
            anisotropy_rotation: number
            back_light: number
            coat: number
            coat_color: Array<number>
            coat_ior: number
            coat_roughness: number
            coat_thickness: number
            diffuse: number
            edge_color: Array<number>
            ior: number
            metallic: number
            roughness: number
            sheen: number
            sheen_color: Array<number>
            sheen_roughness: number
            sheen_tint: number
            specular: number
            thickness: number
            thin: boolean
            transmission: number
            transmission_color: Array<number>
            transmission_depth: number
        }
        model_id: number
    }

export type RendererApiSetMaterialPrincipledResult = undefined

export type RendererApiSetRendererInteractiveParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        ao_samples: number
        background_color: Array<number>
        enable_shadows: boolean
        max_ray_bounces: number
        samples_per_pixel: number
    }

export type RendererApiSetRendererInteractiveResult = undefined

export type RendererApiSetRendererProductionParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        background_color: Array<number>
        max_ray_bounces: number
        samples_per_pixel: number
    }

export type RendererApiSetRendererProductionResult = undefined

export type RendererApiSetSimulationParametersParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        current: number
        dt: number
        end_frame: number
        start_frame: number
        unit: string
    }

export type RendererApiSetSimulationParametersResult = undefined

export type RendererApiSnapshotParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        camera: /**
         * **REQUIRED**
         * Camera definition
         */
        {
            name: string
            params: /****************************************
              WARNING!
              Don't know how to deal with this type:
              {
                "description": "Object parameters"
              }
            ****************************************/
            unknown
        }
        camera_view: /**
         * **REQUIRED**
         * Camera view
         */
        {
            position: Array<number>
            target: Array<number>
            up: Array<number>
        }
        file_path: string
        image_settings: /**
         * **REQUIRED**
         * Image settings
         */
        {
            format: string
            quality: number
            size: Array<number>
        }
        metadata: /**
         * **REQUIRED**
         * Metadata information to embed into the image
         */
        {
            description: string
            keywords: Array<string>
            title: string
            where_used: string
        }
        renderer: /**
         * **REQUIRED**
         * Renderer definition
         */
        {
            name: string
            params: /****************************************
              WARNING!
              Don't know how to deal with this type:
              {
                "description": "Object parameters"
              }
            ****************************************/
            unknown
        }
        simulation_frame: number
    }

export type RendererApiSnapshotResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        color_buffer: /**
         * **REQUIRED**
         * Encoded snapshot color buffer
         */
        {
            offset: number
            size: number
        }
    }

export type RendererApiUpdateModelParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        model: /**
         * **REQUIRED**
         * Model data to update
         */
        {
            bounds: /**
             * **REQUIRED**
             * Model bounds
             */
            {
                max: Array<number>
                min: Array<number>
            }
            info: /**
             * **REQUIRED**
             * Model-specific info
             */
            {
                base_transform: /**
                 * **REQUIRED**
                 * Model transform
                 */
                {
                    rotation: Array<number>
                    scale: Array<number>
                    translation: Array<number>
                }
                load_info: /**
                 * **REQUIRED**
                 * Model load info
                 */
                {
                    load_parameters: /****************************************
                      WARNING!
                      Don't know how to deal with this type:
                      {
                        "description": "Loader settings",
                        "readOnly": true
                      }
                    ****************************************/
                    unknown
                    loader_name: string
                    path: string
                    source: string
                }
                metadata: object
            }
            is_visible: boolean
            model_id: number
            model_type: string
            transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
        }
        model_id: number
    }

export type RendererApiUpdateModelResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }

export type RendererApiUploadModelParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        loader_name: string
        loader_properties: /****************************************
          WARNING!
          Don't know how to deal with this type:
          {
            "description": "Loader properties"
          }
        ****************************************/
        unknown
        type: string
    }

export type RendererApiUploadModelResult = Array</**
 * **REQUIRED**
 * undefined
 */
{
    bounds: /**
     * **REQUIRED**
     * Model bounds
     */
    {
        max: Array<number>
        min: Array<number>
    }
    info: /**
     * **REQUIRED**
     * Model-specific info
     */
    {
        base_transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
        load_info: /**
         * **REQUIRED**
         * Model load info
         */
        {
            load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
            unknown
            loader_name: string
            path: string
            source: string
        }
        metadata: object
    }
    is_visible: boolean
    model_id: number
    model_type: string
    transform: /**
     * **REQUIRED**
     * Model transform
     */
    {
        rotation: Array<number>
        scale: Array<number>
        translation: Array<number>
    }
}>

export type RendererApiVisualizeAtlasUsecaseParams =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        model_id: number
        params: /****************************************
          WARNING!
          Don't know how to deal with this type:
          {
            "description": "Additional use case parameters"
          }
        ****************************************/
        unknown
        use_case: string
    }

export type RendererApiVisualizeAtlasUsecaseResult =
    /**
     * **REQUIRED**
     * undefined
     */
    {
        bounds: /**
         * **REQUIRED**
         * Model bounds
         */
        {
            max: Array<number>
            min: Array<number>
        }
        info: /**
         * **REQUIRED**
         * Model-specific info
         */
        {
            base_transform: /**
             * **REQUIRED**
             * Model transform
             */
            {
                rotation: Array<number>
                scale: Array<number>
                translation: Array<number>
            }
            load_info: /**
             * **REQUIRED**
             * Model load info
             */
            {
                load_parameters: /****************************************
                  WARNING!
                  Don't know how to deal with this type:
                  {
                    "description": "Loader settings",
                    "readOnly": true
                  }
                ****************************************/
                unknown
                loader_name: string
                path: string
                source: string
            }
            metadata: object
        }
        is_visible: boolean
        model_id: number
        model_type: string
        transform: /**
         * **REQUIRED**
         * Model transform
         */
        {
            rotation: Array<number>
            scale: Array<number>
            translation: Array<number>
        }
    }
