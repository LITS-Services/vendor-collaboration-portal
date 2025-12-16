// Type declarations to allow third-party library bindings to compile
declare module 'ng2-nouislider' {
  export interface NouisliderElement extends HTMLElement {
    config?: any;
    connect?: boolean | any;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    tooltips?: any;
    limit?: number;
  }
}

// Augment HTML elements to allow property bindings
declare namespace JSX {
  interface IntrinsicElements {
    nouislider: any;
  }
}

// Global type augmentation for Angular templates
declare global {
  namespace ng {
    interface INgModelController {}
  }
}

