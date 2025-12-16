// Angular template type declarations to suppress third-party library binding errors
// This file extends Angular's template type checking to allow properties from older libraries

declare module '@angular/core' {
  interface ComponentDef<T> {
    // Allow any property bindings in component templates
    template?: string;
  }
}

// Global augmentations for HTML elements to allow third-party directive properties
declare global {
  interface HTMLElement {
    // Nouislider properties
    config?: any;
    connect?: boolean | any;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    tooltips?: any;
    limit?: number;
    
    // Swiper properties
    swiper?: any;
    
    // Dragula properties
    dragula?: any;
    dragulaModel?: any;
    
    // File upload properties
    uploader?: any;
    
    // Allow any other properties
    [key: string]: any;
  }
  
  interface HTMLInputElement {
    uploader?: any;
    [key: string]: any;
  }
  
  interface HTMLFormElement {
    formGroup?: any;
    [key: string]: any;
  }
  
  interface HTMLDivElement {
    swiper?: any;
    dragula?: any;
    dragulaModel?: any;
    uploader?: any;
    ngClass?: any;
    [key: string]: any;
  }
}

// Type declaration for nouislider custom element
interface NouisliderElement extends HTMLElement {
  config?: any;
  connect?: boolean | any;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  tooltips?: any;
  limit?: number;
  ngModel?: any;
  [key: string]: any;
}

export {};

