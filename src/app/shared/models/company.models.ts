export interface CompanyContact {
    description: string;
    type: string;
    contactNumber: string;
    extension?: string;
    primary?: boolean;
    isPrimary?: boolean; // Handling both naming conventions seen in code
    contactPerson?: string;
    designation?: string;
    email?: string;
    contactRole?: string;
}

export interface CompanyAddress {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    primary?: boolean;
    isPrimary?: boolean;
    building?: string;
    floor?: string;
    town?: string;
    postalAddress?: string;
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
    documentType?: string;
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

export interface CompanyClientele {
    id?: number;
    vendorCompanyId?: number;
    clientName: string;
    supplies?: string;
    duration?: string;
    totalContractValue?: string;
}

export interface CompanyReferee {
    id?: number;
    vendorCompanyId?: number;
    organization: string;
    contactName: string;
    position?: string;
    telephoneNo?: string;
    emailAddress?: string;
    officialStamp?: string;
    hasOfficialStamp?: boolean;
    signature?: string;
    hasSignature?: boolean;
    lpoAttachmentUrl?: string;
}

export interface CompanyProfile {
    id?: number;
    name: string;
    websiteUrl?: string;
    logo?: string;
    companyType: string;
    aboutCompany: string;
    remarks?: string;
    addresses: CompanyAddress[];
    contacts: CompanyContact[];
    bankDetails: CompanyBank[];
    purchasingDemographics: PurchasingDemographics;
    attachments?: CompanyAttachment[];

    // Section A: Background Information
    postalAddress?: string;
    organizationType?: string;
    geographicalAreaOfOperations?: string;
    companyRegistrationNo?: string;
    dateOfRegistration?: string | Date;
    durationOfBusinessOperations?: string;
    descriptionOfGoodsServices?: string;
    descriptionOfGoods?: string;
    descriptionOfServices?: string;
    descriptionOfWorks?: string;
    totalWorkForce?: string;

    // Section C: References & Credit Period
    clientele?: CompanyClientele[];
    referees?: CompanyReferee[];
    hasCreditPeriod30Days?: boolean;
    creditPeriod?: string;

    // Section D: Technical Competence
    proofOfProfessionalism?: string;
    keyPersonnelQualifications?: string;

    // Section E: Management Policies
    hasEmploymentPolicy?: boolean;
    employeeScreeningExplanation?: string;
    hasCodeOfConduct?: boolean;
    codeOfConductDetails?: string;
    employeeIntegrityMeasures?: string;
    hasEmployeeTrainingProgram?: boolean;
}

export type CompanyTab = 'general' | 'addresses' | 'contacts' | 'purchasing' | 'bank' | 'references' | 'technical' | 'attachments' | 'officers';
