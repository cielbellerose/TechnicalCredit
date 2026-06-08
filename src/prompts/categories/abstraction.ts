export const prompt = `Look for:
- Interface or abstract type with no fields and no concrete methods — strong TC if a separate implementation exists in a different package or module.
- Class name ending in Adapter, Wrapper, Bridge, Gateway, or Port — intentional indirection over a third-party or legacy type.
- Constructor assigning all dependencies to final fields, or dependency injection on the constructor not on fields — design anticipated swapping implementations.
- Abstract class with abstract methods filled in by subclasses (Template Method).
- Class delegating to many injected collaborators without adding logic (Facade).

Not TC: interface with a single implementation in the same package, or abstract class used only as a code-sharing shortcut.`;
