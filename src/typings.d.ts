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
  export type NouiFormatter = any;
  export const NouiFormatter: any;
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
  export const DragulaService: any;
  export type DragulaService = any;
}

// Augment Angular's template checking to allow these properties
declare module '@angular/compiler' {
  interface TemplateBinding {
    [key: string]: any;
  }
}

declare module 'google-libphonenumber' {
  export enum PhoneNumberFormat {
    E164 = 0,
    INTERNATIONAL = 1,
    NATIONAL = 2,
    RFC3966 = 3
  }

  export enum PhoneNumberType {
    FIXED_LINE = 0,
    MOBILE = 1,
    FIXED_LINE_OR_MOBILE = 2,
    TOLL_FREE = 3,
    PREMIUM_RATE = 4,
    SHARED_COST = 5,
    VOIP = 6,
    PERSONAL_NUMBER = 7,
    PAGER = 8,
    UAN = 9,
    VOICEMAIL = 10,
    UNKNOWN = -1
  }

  export interface PhoneNumber {
    getCountryCode(): number | undefined;
    getNationalNumber(): number | undefined;
  }

  export class PhoneNumberUtil {
    static getInstance(): PhoneNumberUtil;
    getSupportedRegions(): string[];
    getCountryCodeForRegion(regionCode: string): number;
    getExampleNumber(regionCode: string): PhoneNumber | null;
    getExampleNumberForType(regionCode: string, type: PhoneNumberType): PhoneNumber | null;
    parseAndKeepRawInput(numberToParse: string, defaultRegion?: string): PhoneNumber;
    isValidNumber(number: PhoneNumber): boolean;
    isValidNumberForRegion(number: PhoneNumber, regionCode: string): boolean;
    getRegionCodeForNumber(number: PhoneNumber): string | undefined;
    format(number: PhoneNumber, numberFormat: PhoneNumberFormat): string;
  }
}

export {};
