// Type declarations for third-party Angular libraries
// This file allows Angular's template compiler to accept property bindings
// from these older libraries that don't have full TypeScript support

// Note: Removed @angular/core module declaration as it was interfering with exports
// If Component interface augmentation is needed, it should be done via proper module augmentation
// that doesn't shadow the module's exports

// Allow nouislider element properties
interface NouisliderElement extends HTMLElement {
  config?: any;
  connect?: boolean | any;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  tooltips?: any;
  limit?: number;
  [key: string]: any;
}

// Allow swiper directive properties on div
interface HTMLElement {
  swiper?: any;
  [key: string]: any;
}

// Allow dragula directive properties
interface DragulaElement extends HTMLElement {
  dragula?: any;
  dragulaModel?: any;
  [key: string]: any;
}

// Allow file upload properties
interface FileUploadElement extends HTMLElement {
  uploader?: any;
  [key: string]: any;
}

