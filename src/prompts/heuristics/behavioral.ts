import type { CategoryPrompt } from '@/prompts/heuristics';

export const prompt: CategoryPrompt<'behavioral'> = {
  rules: `BEHAVIORAL design patterns are Technical Credit when they deliberately assign responsibilities and communication between objects through stable abstractions, so behaviour can be added, swapped or reordered without changing the objects involved.

Several behavioral patterns share a composition-plus-delegation shape (state, strategy, and also bridge). Use how the delegate is chosen — self-transitioning states versus an externally supplied algorithm — to tell them apart.

Not TC: a plain callback or listener with a single caller, or business logic that happens to call another object.`,

  patterns: {
    'chain-of-responsibility': `Look for:
- A handler interface or abstract class that holds a reference to the "next" handler of the same type.
- A handle() method that either processes the request or forwards it to the next handler.
- Clients wire up the chain by linking handler instances together.

Not a match: a fixed list of checks inside one method, with no handler abstraction.`,

    command: `Look for:
- A command interface with a single execute() method (optionally undo()).
- Concrete command classes that hold a reference to a receiver and call its methods inside execute().
- An invoker that holds or queues command objects without knowing their concrete types.

Not a match: a single-method interface used only as an inline callback, with no receiver or invoker.`,

    interpreter: `Look for:
- An abstract expression interface with an interpret() method taking a context.
- Terminal and non-terminal expression classes implement interpret(); non-terminals compose child expressions.
- Clients build a tree of expression objects that represents a grammar.

Not a match: a generic tree structure with no grammar or evaluation semantics (closer to composite).`,

    iterator: `Look for:
- An iterator interface or class with hasNext()/next() (or implementing java.util.Iterator).
- An aggregate class with a createIterator()/iterator() method returning an iterator over its internal structure.
- The iterator keeps its own cursor state, so the aggregate's representation stays hidden.

Not a match: a class that only loops over a collection, or simply returns its internal list.`,

    mediator: `Look for:
- A mediator interface or class that holds references to several "colleague" objects.
- Colleague classes hold a reference back to the mediator instead of to each other.
- Colleagues communicate only through mediator calls, never directly.

Not a match: a class that coordinates subsystems that never call back into it (closer to facade).`,

    memento: `Look for:
- An originator class with createMemento()/save() and restore() methods.
- A memento class that stores a snapshot of the originator's internal state, with restricted or no public accessors.
- A caretaker that holds mementos without inspecting or modifying their contents.

Not a match: an undo stack of plain, publicly mutable state objects.`,

    observer: `Look for:
- A subject class that keeps a collection of observer references with register/unregister (subscribe/unsubscribe) methods.
- An observer interface with an update()/notify() method.
- The subject calls update() on every registered observer when its state changes.

Not a match: a single hard-coded callback, or a list of listeners that is never notified.`,

    state: `Look for:
- A context class that holds a reference to a state interface and delegates state-specific behaviour to it.
- Concrete state classes implement the interface, one per possible state.
- State transitions replace the context's current state object, often triggered by the states themselves.

Not a match: behaviour switched by an enum or flag inside one class, or a delegate chosen once from outside (strategy).`,

    strategy: `Look for:
- A strategy interface with a single algorithm method.
- Several concrete strategy classes implement it, each with a different algorithm.
- A context class holds a strategy reference (often injected) and delegates the algorithm call to it.

Not a match: an interface with a single implementation, or a delegate that switches itself as state changes (state).`,

    'template-method': `Look for:
- An abstract class that defines a concrete "template" method calling several abstract or hook methods in a fixed sequence.
- Concrete subclasses override only the abstract/hook methods, never the template method itself.
- The template method is often final, to prevent overriding the skeleton.

Not a match: an abstract class whose subclasses override the whole algorithm, or a concrete class with no abstract steps.`,

    visitor: `Look for:
- Element interfaces or classes that each have an accept(Visitor) method.
- A visitor interface with an overloaded visit() method for each concrete element type.
- accept() calls back into the matching visit() overload on the visitor (double dispatch).

Not a match: a single visit-style method with no accept() counterpart on the elements.`,
  },
};
