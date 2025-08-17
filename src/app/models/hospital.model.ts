export interface Hospital {
  id: string;
  shortName: string;
  fullTitle: string;
  authorizedPerson: string;
  city: string;
  district: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  taxOffice: string;
  website: string;
  isDeleted: boolean;
  isActive: boolean;
  createdDate: string;
}

export interface HospitalListModel extends Hospital {
  // Extend with any additional fields specific to list view
}

export interface CreateHospitalRequest {
  shortName: string;
  fullTitle: string;
  authorizedPerson: string;
  city: string;
  district: string;
  email: string;
  phone: string;
  address: string;
  taxNumber: string;
  taxOffice: string;
  website: string;
  isActive: boolean;
}

export interface UpdateHospitalRequest extends CreateHospitalRequest {
  id: string;
}
