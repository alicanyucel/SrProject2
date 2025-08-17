export interface DoctorSignature {
  id: string;
  degree: string;
  degreeNo: string;
  diplomaNo: string;
  registerNo: string;
  displayName: string;
  signatureImage: string; // Base64 image string
  isDeleted: boolean;
  createdDate: string;
}

export interface DoctorSignatureListModel extends DoctorSignature {
  // Extend with any additional fields specific to list view
}

export interface CreateDoctorSignatureRequest {
  degree: string;
  degreeNo: string;
  diplomaNo: string;
  registerNo: string;
  displayName: string;
  signature: string;
}

export interface UpdateDoctorSignatureRequest extends CreateDoctorSignatureRequest {
  id: string;
}
