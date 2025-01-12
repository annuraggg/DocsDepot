interface Scope {
    all: boolean;
    houses?: string[];
    events?: string[];
  }
  
  interface Notification {
    _id: string;
    body: string;
    expiry: Date;
    scope: Scope;
    createdOn: Date;
  }
  
  export type { Scope, Notification };
  