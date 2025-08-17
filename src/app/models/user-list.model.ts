export class UserListModel {
    userId: string = "";
    loginId: string = "";
    firstName: string = "";
    lastName: string = "";    email: string = "";
    phone: string = "";
    identityNumber: string = "";
    createdAt: string = "";
    updatedAt: string = "";
    isActive: boolean = true;
    userCode: string = "";
    companyId?: string; // <-- Firma filtresi için eklendi
    
    // Optional fields that might come from backend but not displayed
    userName?: string;
    normalizedUserName?: string;
    normalizedEmail?: string;
    emailConfirmed?: boolean;
    passwordHash?: string;
    securityStamp?: string;
    concurrencyStamp?: string;
    phoneNumber?: string;
    phoneNumberConfirmed?: boolean;
    twoFactorEnabled?: boolean;
    lockoutEnd?: any;
    lockoutEnabled?: boolean;
    accessFailedCount?: number;
    login?: any;
    userRoles?: UserRole[];
    refreshToken?: string;
    refreshTokenExpires?: string;
    id?: string;
}

export interface UserRole {
    roleId: string;
    roleName: string;
}
