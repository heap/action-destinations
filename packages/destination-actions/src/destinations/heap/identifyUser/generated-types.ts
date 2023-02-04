// Generated file. DO NOT MODIFY IT BY HAND.

export interface Payload {
  /**
   * A unique user identifier. The value that the heap identify call will use to identify the user. Defaults to userId. Case-sensitive string, limited to 255 characters.
   */
  identity?: string | null
  /**
   * The generated anonymous ID for the user.
   */
  anonymous_id?: string | null
  /**
   * An object with key-value properties you want associated with the user. Each key and property must either be a number or string with fewer than 1024 characters.
   */
  traits?: {
    [k: string]: unknown
  }
}
