// Type declaration override for ng2-dragula to fix Angular compiler error NG6005
// This file overrides the library's type definitions to add the missing generic type parameter

declare module 'ng2-dragula/components/dragula.module' {
  import { ModuleWithProviders, NgModule } from '@angular/core';
  
  export class DragulaModule {
    static forRoot(): ModuleWithProviders<DragulaModule>;
  }
}

declare module 'ng2-dragula' {
  export * from 'ng2-dragula/components/dragula.module';
}

