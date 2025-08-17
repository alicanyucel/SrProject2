export interface CompanyUser {
    userId: string;
    firstName: string;
    lastName: string;
    phone: string;
    phoneNumber?: string; // API'den gelen yeni alan
    identityNumber?: string; // TC Kimlik Numarası
    email: string;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
    companyId?: string;
    companyTitle?: string;
}

export interface CompanyUsersResponse {
    data: CompanyUser[];
    errorMessages: string[] | null;
    isSuccessful: boolean;
}
