export const prompt = `You are detecting MODULARITY Technical Credit.

Look for:
- Package or module path named by domain (com.example.payments) not layer (com.example.controllers) — bounded context boundary.
- Class with no public modifier — deliberate package-private encapsulation.
- Few imports from other internal packages relative to class size — low fan-out, self-contained unit.
- Strategy or Composite pattern — extension without modification.

Not TC: class in a layer-named package, or high cross-package imports that grew organically.`;
