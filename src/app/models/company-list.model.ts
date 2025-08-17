export class CompanyListModel {
    id: string = "";
    companySmallTitle: string = "";
    companyTitle: string = "";
    representative: string = "";
    phoneNumber: string = "";
    email: string = "";
    address: string = "";
    taxNo: string = "";
    taxOffice: string = "";
    webSite: string = "";
    city: string = "";
    district: string = "";
    isDeleted: boolean = false;
    status: boolean = true;
    createdAt: string = "";
    companyType: {
        name: string;
        value: number;
    } | null = null; // Allow null for cases where companyType is not set
    companyTypeValue?: number; // Güncelleme için eklendi
    companyUsers: any[] = [];
    
    // Backward compatibility for old field names
    companyId?: string;
    companyName?: string;
    taxNumber?: string;
    phone?: string;
    contactPerson?: string;
    isActive?: boolean;
}
