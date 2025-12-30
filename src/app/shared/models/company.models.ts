export interface CompanyContact {
    description: string;
    type: string;
    contactNumber: string;
    extension?: string;
    primary?: boolean;
    isPrimary?: boolean; // Handling both naming conventions seen in code
}

export interface CompanyAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    primary?: boolean;
    isPrimary?: boolean;
}

export interface CompanyBank {
    id?: number;
    vendorCompanyId?: number;
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    iban: string;
    swiftCode?: string;
    branchName?: string;
    branchAddress?: string;
    bankCountry: string;
    bankCurrency: string;
    primary?: boolean;
    isPrimary?: boolean;
    createdBy?: string;
    createdDate?: string;
    modifiedBy?: string;
    modifiedDate?: string;
    isDeleted?: boolean;

    // Mapping some alternate property names seen in code
    description?: string;
    contactHolderName?: string;
    contactNumber?: string;
    extension?: string;
    type?: string;
}

export interface CompanyAttachment {
    fileName: string;
    format: string;
    fileContent?: string;
    file?: File;
    attachedBy?: string;
    remarks?: string;
    attachedAt?: string;
}

export interface PurchasingDemographics {
    vendorType: string;
    primaryCurrency: string;
    lineOfBusiness: string;
    birthCountry: string;
    employeeResponsible: string;
    segment: string;
    speciality: string;
    chain: string;
    note: string;
}

export interface CompanyProfile {
    id?: number;
    name: string;
    companyType: string;
    aboutCompany: string;
    remarks?: string;
    addresses: CompanyAddress[];
    contacts: CompanyContact[];
    bankDetails: CompanyBank[];
    purchasingDemographics: PurchasingDemographics;
    attachments?: CompanyAttachment[];
}



export type CompanyTab = 'general' | 'addresses' | 'contacts' | 'purchasing' | 'bank' | 'attachments';
