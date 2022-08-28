# did-doc

A simple class and type export to facilitate dealing with DID documents. More up
to date than other libraries out there (for now, probably).

## API

The library exports a `DIDDocument` class, as well as an `IDIDDocument`
TypeScript interface, as well as `Service` and `VerificationMethod` interfaces.

### DIDDocument

The `DIDDocument` class contains all the fields of the `IDIDDocument` interface:
```ts
export interface IDIDDocument {
  "@context"?: "https://www.w3.org/ns/did/v1" | string | string[];
  id: string;
  alsoKnownAs?: string[];
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  service?: Service[];
}
```

The `DIDDocument` constructor:
```ts
constructor(id: string, opts: Omit<DIDDocument, "id"> = {})
```

The class also has a few helper functions:
```ts
/**
 * Adds to a top level field in the document named `set`. Will create it, if
 * it doesn't exist already.
 * @throws Will throw if there exists an object in the set wth the same `id` as `item.id`
 */
addToSet(set: string, item: Record<string, any>): void

/**
 * Add a new verification method to the document.
 * @throws Will throw if a method with the same ID already exists in the document
 * @param {Object} method
 * @param {string} method.id Method ID
 * @param {string} method.type Method type
 * @param {string} [method.controller] Method controller DID. If left out, will be set to the document's ID.
 */
addVerificationMethod(method: {
  id: string;
  type: string;
  controller?: string;
}): void
```

The class also has a static `isDoc(doc): boolean` validation function.
