# Persistence

Persistence is done for key/values pairs by services
of type [`StorageInterface`](../src/contract/storage/storage.ts).
There are two main implementations in Circuit Studio:
one for user data and one for session data.
The difference being that session data will be deleted as soon as
Brayns service is down.

The `makeTable()` method creates a [`TableStorageInterface`](../src/contract/storage/table.ts) object that
let you manage list of objects of a common type with unique IDs.

Here is an example of usage in a React component:

```tsx
export default function SlicingPage(props: SlicingPageProps) {
    const collageTable = props.locator.get(
        "storageCollageTable",
        ensureTableStorageInterface<Collage>
    )
    const collages = collageTable.useItems()
    return <div>{
        collages.map(collage => <CollageView 
            value={collage}
            onDelete={item => collages.remove(item)}
        />)
    }</div>
}
```

Here is an example to create a table from a storage object:

```ts
const table = storage.makeTable(
    "collage", 
    inflexibleConverter(isCollage)
)
```

Where `inflexibleConverter` will create a converter from  type guard.
So it cn also be used like this:

```ts
const table = storage.makeTable(
    "collage", 
    inflexibleConverter(
        data => data instanceof CollageServiceInterface
    )
)
```