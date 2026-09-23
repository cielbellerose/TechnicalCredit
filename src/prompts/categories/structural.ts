import type { CategoryPrompt } from '@/prompts/categories';

export const prompt: CategoryPrompt<'structural'> = {
  rules: `STRUCTURAL design patterns are Technical Credit when they deliberately compose classes and objects into larger structures behind stable interfaces, so either side can change or be swapped independently.

Several structural patterns share the same wrap-implement-delegate shape (adapter, decorator, proxy). Use the purpose of the wrapping — translating, adding behaviour, or controlling access — to tell them apart, and report more than one only when the construct genuinely serves both purposes.

Not TC: a plain data holder, or a wrapper that forwards every call unchanged with no reason to exist.`,

  patterns: {
    adapter: `Look for:
- A class that implements the target interface the client expects.
- It holds a reference to (wraps) an incompatible "adaptee" object, often third-party.
- Its methods delegate to the adaptee, translating parameters and return types.

Not a match: a wrapper that implements the same interface as the object it wraps, with no translation.`,

    bridge: `Look for:
- An abstraction class that holds a reference to an implementor interface through composition, not inheritance.
- The implementor interface has several concrete implementations.
- The abstraction has its own subclasses, so both hierarchies vary independently.

Not a match: a class holding a single interface with no abstraction hierarchy of its own (closer to strategy).`,

    composite: `Look for:
- A component interface or abstract class shared by both leaf and composite classes.
- A composite class that holds a collection of component references, including other composites.
- Composite methods delegate recursively to each child in the collection.

Not a match: a class holding a list of some other type, or a container that does not itself implement the component.`,

    decorator: `Look for:
- A decorator class that implements the same interface as the component it wraps.
- It holds a reference to a component instance, usually passed in through the constructor.
- It delegates to the wrapped component, adding behaviour before or after the call, so decorators can be stacked.

Not a match: a wrapper whose purpose is controlling access or lazy loading (proxy) rather than adding behaviour.`,

    facade: `Look for:
- A single class that holds (is injected with) references to several subsystem classes.
- It exposes a small set of high-level methods.
- Those methods coordinate calls across the subsystem objects, hiding their complexity from clients.

Not a match: a single-collaborator pass-through, a data holder with a Facade/Service name, or a class with many injected dependencies that simply re-exposes each one (constructor over-injection).`,

    flyweight: `Look for:
- A factory or pool class that keeps a cache (map) of shared instances keyed by intrinsic state.
- A get/create method that returns the cached instance if present, otherwise creates and caches a new one.
- Clients supply extrinsic state at call time rather than the shared object storing it.

Not a match: a generic resource pool (e.g. connections) or memoisation of computed results.`,

    proxy: `Look for:
- A proxy class that implements the same interface as the real subject.
- It holds a reference to the real subject, or lazily instantiates it.
- It delegates calls while controlling them — access checks, lazy initialisation, caching, remoting or logging.

Not a match: a wrapper whose purpose is adding new responsibilities (decorator) or translating interfaces (adapter).`,
  },
};
