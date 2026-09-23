import type { CategoryPrompt } from '@/prompts/categories';

export const prompt: CategoryPrompt<'creational'> = {
  rules: `CREATIONAL design patterns are Technical Credit when they deliberately separate how objects are created from the code that uses them, so new products, variants or configurations can be added without changing callers.

Not TC: object creation that is simply inlined with \`new\`, or a creation helper with a single caller and no variation.`,

  patterns: {
    singleton: `Look for one of:
- Enum singleton — an enum with a single constant that stores data or state.
- Bill Pugh singleton — a private static inner class that holds the single instance of the outer class.
- Double-checked locking — a static volatile instance field plus a getInstance() method that returns the existing instance or creates it.
The constructor is private, so the class controls its only instance and offers one global access point.

Not a match: a utility class of static methods, or an enum used only as a set of constants.`,

    'abstract-factory': `Look for:
- A top-level factory interface (the abstract factory) declaring several create methods.
- Concrete factory classes implementing it, one per product family.
- Product interfaces (abstract products) returned by those create methods, each with concrete implementations.
Products from one factory are designed to be used together.

Not a match: a factory that creates only one kind of product, or a factory interface with a single implementation and no product family.`,

    'factory-method': `Look for:
- An abstract class (the creator) with an abstract factory method returning a product interface or abstract type.
- Concrete subclasses that extend the creator and decide which concrete product to instantiate.
- The creator's own logic refers only to the abstract product it gets from the factory method.

Not a match: a concrete create…() method that nothing overrides, a static "simple factory" that switches over concrete types, or a class that news a concrete product directly.`,

    prototype: `Look for:
- A clone() method declared on an interface or abstract class.
- Its return type is that same interface or abstract class.
- Concrete classes implement clone() by copying an existing instance instead of building one from scratch.

Not a match: copy constructors, copy methods that take extra parameters (e.g. copyWith(x)), or snapshot methods returning an unrelated type — without a clone() contract on an abstraction.`,

    builder: `Look for:
- Many individual setter-style methods that each return the builder itself, so calls can be chained.
- A build() (or similar) method that produces the finished object.
- Callers create the object step by step, e.g. builder.withA().withB().build().

Not a match: ordinary setters returning void, or a single fluent method with no step-by-step construction.`,
  },
};
