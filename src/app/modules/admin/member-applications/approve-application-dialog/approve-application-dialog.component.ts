import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApplicationStatus } from '../member-applications.component';
import { HttpService } from '../../../../services/http.service';
import { SwalService } from '../../../../services/swal.service';

export interface ApproveApplicationDialogData {
  applicationId: string;
  applicantName: string;
  currentStatus: ApplicationStatus;
  defaultStatus?: ApplicationStatus;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  identityNumber: string;
}

@Component({
  selector: 'app-approve-application-dialog',
  standalone: true,  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './approve-application-dialog.component.html',
  styleUrls: ['./approve-application-dialog.component.scss']
})
export class ApproveApplicationDialogComponent implements OnInit {
    approvalForm: FormGroup;
  isLoading = false;
  isRejectOrAdditionalInfo = false;
  // Şifre görünürlüğü kontrolü
  showPassword = false;
  showConfirmPassword = false;
  // Enum reference for template
  ApplicationStatus = ApplicationStatus;
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ApproveApplicationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ApproveApplicationDialogData,
    private httpService: HttpService,
    private swalService: SwalService
  ) {
    // Reddet veya ek bilgi iste modunda mı?
    this.isRejectOrAdditionalInfo =
      data.defaultStatus === ApplicationStatus.Rejected ||
      data.defaultStatus === ApplicationStatus.AdditionalInformationRequested;
    this.approvalForm = this.createForm();
  }
  ngOnInit(): void {}
  private createForm(): FormGroup {
    if (this.isRejectOrAdditionalInfo) {
      // Sadece açıklama alanı (opsiyonel) ve status
      return this.fb.group({
        description: [''],
        status: [this.data.defaultStatus]
      });
    }
    // Backend otomatik hallediyor, UI'da status seçimi yok
    const defaultStatus = ApplicationStatus.Approved; // Backend tarafından belirleniyor
    const form = this.fb.group({
      // Status bilgisi - Backend otomatik ayarlıyor, UI'da gizli
      status: [defaultStatus], // Validation kaldırıldı
      // Kullanıcı bilgileri - data'dan otomatik bind
      firstName: [this.data.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.data.lastName, [Validators.required, Validators.minLength(2)]],
      email: [this.data.email, [Validators.required, Validators.email]],
      phoneNumber: [this.data.phoneNumber, [Validators.required]],
      identityNumber: [this.data.identityNumber, [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
      roleId: ['', [Validators.required]], // Rol seçimi için boş başlıyor      // API için gerekli alanlar - Boş şifre ile başla
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) // En az bir küçük harf, büyük harf ve rakam
      ]],
      repassword: ['', [Validators.required, Validators.minLength(6)]] // Boş şifre
    });
    // Şifre eşleşme validation'ı
    form.setValidators(this.passwordMatchValidator);
    return form;
  }

  // Şifre eşleşme validator'ı
  private passwordMatchValidator(form: any) {
    const password = form.get('password');
    const repassword = form.get('repassword');
    
    if (password && repassword && password.value !== repassword.value) {
      return { passwordMismatch: true };
    }
      return null;
  }
  // GUID'den ID'ye çevrim metodu
  private getRoleIdFromGuid(roleGuid: string): number {
    const roleMapping = {
      '5ed62427-ec28-46ce-be0e-376005fae043': 1, // Admin
      '46fecbbe-79b3-4a0c-85d2-a7846d901272': 2, // System
      'ba9c54b2-d78b-44e2-aa7e-33c85aab0497': 3, // Doctor
      'e5b650ef-c509-42bd-8e9f-f784cbb338ed': 4, // Reporter
      '58d79190-fa0a-4a75-befb-a11b270b1b0e': 5, // Company
      '47d90a18-da9e-4fe7-9199-7b73697f2001': 6  // Hospital
    };
    
    return roleMapping[roleGuid as keyof typeof roleMapping] || 1; // Default to Admin if not found
  }

  // ID'den GUID'e çevrim metodu  
  private getRoleGuid(roleId: number): string {
    const roleMapping = {
      1: '5ed62427-ec28-46ce-be0e-376005fae043', // Admin
      2: '46fecbbe-79b3-4a0c-85d2-a7846d901272', // System
      3: 'ba9c54b2-d78b-44e2-aa7e-33c85aab0497', // Doctor
      4: 'e5b650ef-c509-42bd-8e9f-f784cbb338ed', // Reporter
      5: '58d79190-fa0a-4a75-befb-a11b270b1b0e', // Company
      6: '47d90a18-da9e-4fe7-9199-7b73697f2001'  // Hospital
    };
    
    return roleMapping[roleId as keyof typeof roleMapping] || roleMapping[1]; // Default to Admin if not found
  }  onStatusChange(): void {
    // Backend otomatik status ayarlıyor, UI'da status değişikliği yok
    // Bu metod artık kullanılmıyor ama compatibility için bırakıldı
  }  onSubmit(): void {
    if (this.isRejectOrAdditionalInfo) {
      const isReject = this.data.defaultStatus === ApplicationStatus.Rejected;
      const isAdditionalInfo = this.data.defaultStatus === ApplicationStatus.AdditionalInformationRequested;
      const requestData = {
        id: this.data.applicationId
      };
      this.isLoading = true;
      if (isReject) {
        this.httpService.post<any>(
          'api/Members/RejectMemberById',
          requestData,
          (response) => {
            this.isLoading = false;
            this.swalService.showSuccess(
              'Başarılı!',
              'Başvuru reddedildi.',
              2000
            );
            setTimeout(() => {
              this.dialogRef.close({
                success: true,
                data: response
              });
            }, 2000);
          },
          (error) => {
            this.isLoading = false;
          },
          false
        );
      } else if (isAdditionalInfo) {
        const requestWithMessage = {
          id: this.data.applicationId,
          description: this.approvalForm.get('description')?.value || ''
        };
        this.httpService.post<any>(
          'api/Members/AddInfoMemberById',
          requestWithMessage,
          (response) => {
            this.isLoading = false;
            this.swalService.showSuccess(
              'Başarılı!',
              'Ek bilgi talebi gönderildi.',
              2000
            );
            setTimeout(() => {
              this.dialogRef.close({
                success: true,
                data: response
              });
            }, 2000);
          },
          (error) => {
            this.isLoading = false;
          },
          false
        );
      }
      return;
    }
    if (this.approvalForm.valid && !this.isLoading) {
      this.isLoading = true;
      const approvalData: any = {
        Id: this.data.applicationId,
        FirstName: this.approvalForm.get('firstName')?.value,
        LastName: this.approvalForm.get('lastName')?.value,
        Email: this.approvalForm.get('email')?.value,
        PhoneNumber: this.approvalForm.get('phoneNumber')?.value,
        Password: this.approvalForm.get('password')?.value,
        Repassword: this.approvalForm.get('repassword')?.value,
        IdentityNumber: this.approvalForm.get('identityNumber')?.value,
        RoleId: this.getRoleGuid(this.approvalForm.get('roleId')?.value) // GUID olarak gönderilecek
      };
      // Debug için approvalData'yı konsola yazdır
      console.log('API gönderilen veri:', approvalData);
      // Reddet veya Ek Bilgi İste ise status da gönder
      if (this.data.defaultStatus) {
        approvalData.status = this.data.defaultStatus;
      }
      // API çağrısı
      this.httpService.post<any>(
        'api/Members/ApproveMemberById',
        approvalData,
        (response) => {
          // Başarılı response
          this.isLoading = false;
          this.swalService.showSuccess(
            'Başarılı!', 
            'Başvuru işlemi tamamlandı.',
            2000
          );
          setTimeout(() => {
            this.dialogRef.close({
              success: true,
              data: response
            });
          }, 2000);
        },
        (error) => {
          // Hata durumu - HttpService zaten otomatik hata gösteriyor, ek işlem yapmaya gerek yok
          this.isLoading = false;
        },
        false // showErrorAlert = false çünkü HttpService zaten gösteriyor
      );
    } else {
      // Form hatalarını konsola yazdır
      console.warn('Form hataları:', this.getFormErrors());
      this.swalService.callToast('Lütfen tüm zorunlu alanları doldurun.', 'warning', 3000);
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }

  getStatusLabel(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved:
        return 'Onaylandı';
      case ApplicationStatus.Unapproved:
        return 'Onay Bekliyor';  // Düzeltildi: Unapproved = Onay Bekliyor
      case ApplicationStatus.AdditionalInformationRequested:
        return 'Ek Bilgi İstendi';
      case ApplicationStatus.Rejected:
        return 'Reddedildi';     // Yeni eklendi
      default:
        return 'Bilinmiyor';
    }
  }
  getStatusIcon(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved:
        return 'heroicons_outline:check-circle';
      case ApplicationStatus.Unapproved:
        return 'heroicons_outline:clock';          // Onay bekliyor için saat ikonu
      case ApplicationStatus.AdditionalInformationRequested:
        return 'heroicons_outline:information-circle';
      case ApplicationStatus.Rejected:
        return 'heroicons_outline:x-circle';       // Reddedildi için X ikonu
      default:
        return 'heroicons_outline:question-mark-circle';
    }
  }

  // Status style metodları - Dialog için
  getStatusBackgroundColor(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved:
        return '#10b981'; // Koyu yeşil
      case ApplicationStatus.Unapproved:
        return '#f59e0b'; // Koyu turuncu/sarı  
      case ApplicationStatus.AdditionalInformationRequested:
        return '#3b82f6'; // Koyu mavi
      case ApplicationStatus.Rejected:
        return '#ef4444'; // Koyu kırmızı
      default:
        return '#6b7280'; // Varsayılan gri
    }
  }

  getStatusTextColor(status: ApplicationStatus): string {
    // Tüm durumlar için beyaz yazı (koyu arka plan üzerinde)
    return '#ffffff';
  }

  getStatusBorder(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved:
        return '1px solid #059669'; // Koyu yeşil border
      case ApplicationStatus.Unapproved:
        return '1px solid #d97706'; // Koyu turuncu border
      case ApplicationStatus.AdditionalInformationRequested:
        return '1px solid #2563eb'; // Koyu mavi border
      case ApplicationStatus.Rejected:
        return '1px solid #dc2626'; // Koyu kırmızı border
      default:
        return '1px solid #4b5563'; // Varsayılan gri border
    }
  }

  getStatusIconColor(status: ApplicationStatus): string {
    // Tüm durumlar için beyaz icon
    return '#ffffff';
  }

  // Şifre görünürlük toggle metodları
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  // Form hatalarını görmek için debug metodu
  getFormErrors(): any {
    const formErrors: any = {};
    Object.keys(this.approvalForm.controls).forEach(key => {
      const control = this.approvalForm.get(key);
      if (control && !control.valid) {
        formErrors[key] = control.errors;
      }
    });
    return formErrors;
  }
}
