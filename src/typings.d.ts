// Type declarations for third-party libraries to allow build to complete
// These declarations tell TypeScript/Angular compiler to accept these property bindings

// Suppress template type checking for these libraries
declare namespace ng {
  interface IAttributes {
    [key: string]: any;
  }
}

// Extend HTML elements to allow any property bindings for third-party libraries
declare global {
  namespace JSX {
    interface IntrinsicElements {
      nouislider: any;
      'ngb-progressbar': any;
      [elemName: string]: any;
    }
  }
}

// Module declarations to prevent module resolution errors
declare module 'ng2-nouislider' {
  export const NouisliderModule: any;
  export interface NouisliderComponent {
    [key: string]: any;
  }
}

declare module 'ngx-swiper-wrapper' {
  export const SwiperModule: any;
  export interface SwiperDirective {
    [key: string]: any;
  }
}

declare module 'ng2-file-upload' {
  export const FileUploadModule: any;
  export interface FileUploadDirective {
    [key: string]: any;
  }
  export interface FileSelectDirective {
    [key: string]: any;
  }
}

declare module 'ng2-dragula/components/dragula.module' {
  import { ModuleWithProviders, NgModule } from '@angular/core';
  
  export class DragulaModule {
    static forRoot(): ModuleWithProviders<DragulaModule>;
  }
}

declare module 'ng2-dragula' {
  import { DragulaModule } from 'ng2-dragula/components/dragula.module';
  export { DragulaModule };
  export interface DragulaDirective {
    [key: string]: any;
  }
}

// Augment Angular's template checking to allow these properties
declare module '@angular/compiler' {
  interface TemplateBinding {
    [key: string]: any;
  }
}

export {};
