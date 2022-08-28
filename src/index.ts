export interface VerificationMethod extends Record<string, any> {
  id: string;
  type: string;
  controller: string;
}

export interface Service extends Record<string, any> {
  id: string;
  type: string;
  serviceEndpoint:
    | string
    | Record<string, any>
    | (string | Record<string, any>)[];
}

export interface IDIDDocument {
  "@context"?: "https://www.w3.org/ns/did/v1" | string | string[];
  id: string;
  alsoKnownAs?: string[];
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  service?: Service[];
}

export class DIDDocument {
  "@context"?: "https://www.w3.org/ns/did/v1" | string | string[];
  id: string;
  alsoKnownAs?: string[];
  controller?: string | string[];
  verificationMethod?: VerificationMethod[];
  service?: Service[];

  constructor(id: string, opts: Omit<DIDDocument, "id"> = {} as any) {
    this.id = id;

    if (typeof opts !== "object") return;
    opts["@context"] && (this["@context"] = opts["@context"]);
    opts.alsoKnownAs && (this.alsoKnownAs = opts.alsoKnownAs);
    opts.controller && (this.controller = opts.controller);
    opts.verificationMethod &&
      (this.verificationMethod = opts.verificationMethod);
    opts.service && (this.service = opts.service);

    // For whatever reason, the fields without a value will all be undefined
    // (and fail the isDoc() check)
    for (const k of Object.keys(this)) {
      if (this[k] === undefined) delete this[k];
    }
  }

  /**
   * Checks if a given value is a valid DID Document.
   */
  static isDoc(o: any): boolean {
    if (typeof o !== "object") return false;

    if (!("id" in o)) return false;
    if (typeof o.id !== "string") return false;

    if (
      "alsoKnownAs" in o &&
      typeof o.alsoKnownAs !== "string" &&
      !Array.isArray(o.alsoKnownAs)
    )
      return false;

    if (
      "controller" in o &&
      typeof o.controller !== "string" &&
      !Array.isArray(o.controller)
    )
      return false;

    if ("verificationMethod" in o && !Array.isArray(o.verificationMethod))
      return false;
    if (
      "verificationMethod" in o &&
      o.verificationMethod.some((m) => {
        if (
          typeof m !== "object" ||
          typeof m?.id !== "string" ||
          typeof m?.type !== "string" ||
          typeof m?.controller !== "string"
        )
          return true;
      })
    )
      return false;

    if ("service" in o && !Array.isArray(o.service)) return false;
    if (
      "service" in o &&
      o.service.some((s) => {
        if (
          typeof s !== "object" ||
          typeof s?.id !== "string" ||
          typeof s?.type !== "string" ||
          !["string", "object"].includes(typeof s?.serviceEndpoint)
        )
          return true;
      })
    )
      return false;

    return true;
  }

  /**
   * Adds to a top level field in the document named `set`. Will create it, if
   * it doesn't exist already.
   * @throws Will throw if there exists an object in the set wth the same `id` as `item.id`
   */
  addToSet(set: string, item: Record<string, any>): void {
    if (!(set in this)) {
      this[set] = [item];
      return;
    }

    if (
      this[set].some(
        (m) =>
          typeof m === "object" && "id" in m && "id" in item && m.id === item.id
      )
    )
      throw new Error(
        `Item with id '${item.id}' already exists in this document's ${set}`
      );

    this[set].push(item);
  }

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
  }): void {
    let controller = method.controller;
    if (typeof controller !== "string") controller = this.id;

    this.addToSet("verificationMethod", { ...method, controller });
  }
}
