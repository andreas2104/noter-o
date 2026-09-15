declare global {
  var __SW_MANIFEST:
    | Array<{ url: string; revision: string | null }>
    | undefined;
}

export {};
