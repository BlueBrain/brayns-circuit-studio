# Service Locator

Dependency injection is a great pattern to help decoupling the code
and make it easier to test in isolation.

The problem arises when used in a deep hierarchy of isual components
bacause it a child needs a dependency, then all the parents must have it too.
This leads to a lot of useless attributes along the way and it decreases the
code readability.

That's why, in circuit Studio, we use an **Injected Service Locator**.

Every component will have an attribute `locator: ServiceLocatorInterface`.
And each renderer should start with a line like:

```ts
const { calc, scene } = getServices(props.locator)
```

This makes clear what are the dependencies of the component.

Here is an example of how we get the services typed:

```ts
function getServices(locator: ServiceLocatorInterface) {
    return {
        calc: locator.get("calc", ensureCalcInterface),
        help: locator.get("help", ensureHelpManagerInterface),
        scene: locator.get("scene", ensureSceneManagerInterface),
    }
}
```

The service locator is type agnostic,
that's why we need to pass `ensure*()` functions to its `get` method.
They check the type of the service and throw an exception
if it is not the one expected.

Checking the type with `instanceof` is the fatest way,
that's why services should always be abstract classes.

----

[Back](./README.md)
