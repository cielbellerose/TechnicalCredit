export const prompt = `You are detecting AUTOMATION Technical Credit.

Look for:
- Code generation annotations that eliminate manually maintained boilerplate (@Builder, @Data, @Mapper, @Generated or equivalents).
- Custom annotation processor or compile-time code generator.
- Parametrised or data-driven tests — broad scenario coverage without duplication.
- Factory or Builder whose product depends on runtime configuration — config-driven object creation.
- Plugin discovery mechanism that avoids hardcoded registration (ServiceLoader or equivalent).

Not TC: code generation used purely for convenience with no architectural intent, or a factory that just wraps a constructor.`;
