export interface RoleModel {
    roleName: string;
    description: string;
}

export interface RoleSyncResponse {
    data: string;
    errorMessages: any;
    isSuccessful: boolean;
}
