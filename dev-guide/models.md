# Models

## View

The list of models is managed in this component: [ModelsListView](../src/view/page/main/sections/models/model-list/model-list-view.tsx)

It gets a [SceneManagerInterface](../src/contract/manager/scene/scene-manager.ts) to interact with the __models__ of type [ModelsManagerInterface](../src/contract/manager/models/models.ts).

```ts
const circuitList = props.scene.models.circuit
const circuits = circuitList.useItems()
```

This list of models is owned by the component [ModelsPage](.../src/view/page/main/sections/models/models-page.tsx) which is responsible of swithcing the view between the models' list and the detail of a model.

The model add click handler is provided by this hook:
[useLoadModelHandler](../src/view/page/main/side-panel/hooks/load-model-handler.ts).

All the hooks that get the loader params after asking the user for options
are in [`model-loader-params.tsx`](../src/user-input/model-loader-params/model-loader-params.tsx).

## Data

In BCS, we keep track of models in three forms:

* [CircuitModel](../src/contract/manager/models/types/circuit-model.ts)
* [MesheModel](../src/contract/manager/models/types/mesh-model.ts)
* [MorphologyModel](../src/contract/manager/models/types/morphology-model.ts)
* [VolumeModel](../src/contract/manager/models/types/volume-model.ts)

They are stored in lists

* [CircuitList](../src/contract/manager/models/types/circuit-list.ts)
* [MesheList](../src/contract/manager/models/types/mesh-list.ts)
* [MorphologyList](../src/contract/manager/models/types/morphology-list.ts)
* [VolumeList](../src/contract/manager/models/types/volume-list.ts)

To generate the loader properties,
you can use [LoaderParamsFactory](../src/contract/factory/loader-params.ts).
