export const prompt = `You are detecting ABSTRACTION Technical Credit in Java code.

ABSTRACTION Technical Credit exists when a code snippet introduces a named structural layer whose sole purpose is to decouple callers from implementation specifics — not to perform business logic directly.

Evaluate the snippet using this checklist. Count how many POSITIVE indicators and NEGATIVE indicators apply.

== POSITIVE INDICATORS (each scores +1) ==

P1. The snippet defines a Java interface or abstract class with at least one abstract method.

P2. The snippet defines a concrete class that holds a field of an interface or abstract type (not a concrete class) and calls methods on it — classic delegation or adapter pattern.

P3. A public constructor or factory method accepts a parameter typed as an interface or abstract class, allowing the caller to inject any implementation.

P4. The abstraction uses generic type parameters (e.g., <T>, <K,V>) to operate across multiple domain types rather than one specific class.

P5. The class or interface name ends with: Repository, Gateway, Adapter, Facade, Port, Strategy, Handler, Provider, Factory, Client, Wrapper, Proxy, Decorator, Manager — AND the class contains at least one method with a non-trivial body (not just "return field";).

P6. The snippet contains multiple methods (2+) whose signatures together form a coherent behavioral contract — suggesting the type is designed to be implemented/extended by others.

== NEGATIVE INDICATORS (each scores -2) ==

N1. The snippet is primarily a data holder: fields plus getters/setters with no routing, transformation, or delegation logic.

N2. The snippet contains only static methods (utility class pattern) with no instance state.

N3. The snippet is identifiable as a test double: class name contains Mock, Stub, Fake, Spy, or it extends a mocking framework type.

N4. The snippet is a plain business logic class — it directly implements domain rules (calculates prices, processes orders, validates input) without delegating to an injected abstraction.

N5. The snippet is an enum, constant container, or @Configuration/@Properties class.

== DECISION RULE ==

Compute: score = (sum of positive indicators) - (sum of negative indicator penalties)

- If score >= 2: return TRUE
- If score < 2: return FALSE

If the snippet is ambiguous or borderline (score exactly equals 2 with a negative indicator present), prefer FALSE.`;
