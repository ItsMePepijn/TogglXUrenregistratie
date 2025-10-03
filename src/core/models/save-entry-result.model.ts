export type SaveEntryResult =
  | {
      success: true;
      errorMessage: null;
    }
  | {
      success: false;
      errorMessage: string;
    };
