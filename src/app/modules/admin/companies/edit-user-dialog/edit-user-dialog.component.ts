import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../../../services/http.service';
import { CompanyUser } from '../../../../models/company-user.model';
import { SwalService } from '../../../../services/swal.service';

export interface EditUserDialogData {
  user: CompanyUser;
  companyId: string;
}

@Component({
  selector: 'app-edit-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-user-dialog.component.html',
  styleUrls: ['./edit-user-dialog.component.scss']
})
export class EditUserDialogComponent implements OnInit {
  editUserForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private swal: SwalService,
    public dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditUserDialogData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.patchFormValues();
  }

  private initializeForm(): void {
    this.editUserForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      isActive: [true],
      startDate: [''],
      endDate: ['']
    });
  }

  private patchFormValues(): void {
    if (this.data.user) {
      this.editUserForm.patchValue({
        firstName: this.data.user.firstName || '',
        lastName: this.data.user.lastName || '',
        email: this.data.user.email || '',
        phoneNumber: this.data.user.phoneNumber || this.data.user.phone || '',
        isActive: this.data.user.isActive !== undefined ? this.data.user.isActive : true,
        startDate: this.data.user.startDate ? new Date(this.data.user.startDate) : null,
        endDate: this.data.user.endDate ? new Date(this.data.user.endDate) : null
      });
    }
  }

  onSave(): void {
    if (this.editUserForm.invalid) {
      this.markFormGroupTouched();
      this.swal.callToast('Lütfen tüm gerekli alanları doğru şekilde doldurunuz.', 'error');
      return;
    }

    this.loading = true;
    
    const formValue = this.editUserForm.value;
    const updateData = {
      companyId: this.data.companyId,
      userId: this.data.user.userId,
      firstName: formValue.firstName?.trim(),
      lastName: formValue.lastName?.trim(),
      email: formValue.email?.trim(),
      phoneNumber: formValue.phoneNumber?.trim(),
      isActive: formValue.isActive,
      startDate: formValue.startDate ? this.formatDate(formValue.startDate) : null,
      endDate: formValue.endDate ? this.formatDate(formValue.endDate) : null
    };

    this.http.post(
      'api/CompanyUsers/UpdateCompanyUser',
      updateData,
      (response) => {
        this.loading = false;
        this.swal.callToast('Kullanıcı başarıyla güncellendi!', 'success');
        this.dialogRef.close({ success: true, data: response });
      },
      (error) => {
        this.loading = false;
        console.error('Error updating user:', error);
        
        let errorMessage = 'Kullanıcı güncellenirken bir hata oluştu.';
        
        // Handle API error response format
        if (error?.error?.ErrorMessages && Array.isArray(error.error.ErrorMessages) && error.error.ErrorMessages.length > 0) {
          errorMessage = error.error.ErrorMessages.join(', ');
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        this.swal.callToast(errorMessage, 'error');
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editUserForm.controls).forEach(key => {
      const control = this.editUserForm.get(key);
      control?.markAsTouched();
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  }

  // Helper method to get field errors for display
  getFieldError(fieldName: string): string {
    const field = this.editUserForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} zorunludur`;
      }
      if (field.errors['email']) {
        return 'Geçerli bir e-posta adresi giriniz';
      }
      if (field.errors['pattern']) {
        return 'Geçerli bir telefon numarası giriniz';
      }
      if (field.errors['minlength']) {
        return `En az ${field.errors['minlength'].requiredLength} karakter olmalıdır`;
      }
      if (field.errors['maxlength']) {
        return `En fazla ${field.errors['maxlength'].requiredLength} karakter olmalıdır`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      firstName: 'Ad',
      lastName: 'Soyad',
      email: 'E-posta',
      phoneNumber: 'Telefon numarası'
    };
    return displayNames[fieldName] || fieldName;
  }
}
