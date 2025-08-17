import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../../../services/http.service';
import { CompanyListModel } from '../../../../models/company-list.model';
import { SharedModule } from '../../../../shared/shared.module';

export interface AddUserDialogData {
  company: { id: string; companySmallTitle: string };
}

export interface UserSearchResult {
  id: string;
  identityNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCheckboxModule,
    SharedModule
  ],
  templateUrl: './add-user-dialog.component.html',
  styleUrls: ['./add-user-dialog.component.scss']
})
export class AddUserDialogComponent implements OnInit {
  addUserForm: FormGroup;
  searchingUser = false;
  addingUser = false;
  userFoundFromSearch = false;
  userAlreadyInCompany = false; // Yeni flag: kullanıcının şirkette olup olmadığını takip eder
  
  // Alert system
  showAddUserAlert = false;
  userSearchAlert: { id: string; type: string; message: string; timestamp: number } | null = null;
  addUserAlert: { id: string; type: string; message: string; timestamp: number } | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    public dialogRef: MatDialogRef<AddUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddUserDialogData
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // Form is already initialized in constructor
  }
  private initializeForm(): void {
    this.addUserForm = this.fb.group({
      searchIdentityNumber: ['', [
        Validators.pattern(/^[0-9]{11}$/) // TC Kimlik No 11 haneli - not required for search
      ]],
      identityNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{11}$/)
      ]],
      firstName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],      lastName: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{10,11}$/) // Telefon numarası 10-11 hane
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      startDate: ['', Validators.required],
      endDate: [''],
      isActive: [true]
    });
  }
  searchUserByIdentityNumber(): void {
    const identityNumber = this.addUserForm.get('searchIdentityNumber')?.value;
    if (!identityNumber || identityNumber.length !== 11 || !/^[0-9]{11}$/.test(identityNumber)) {
      this.showAlert('userSearch', 'error', 'Lütfen geçerli bir TC Kimlik No giriniz (11 haneli)');
      return;
    }
    
    this.searchingUser = true;
    this.hideAlert('userSearch');
    this.userAlreadyInCompany = false; // Reset flag
    
    // İlk olarak kullanıcının bu şirkette olup olmadığını kontrol et
    this.checkUserInCompany(identityNumber).then(isInCompany => {
      if (isInCompany) {
        this.searchingUser = false;
        this.userAlreadyInCompany = true;
        this.userFoundFromSearch = false;
        this.disableFormInputs();
        this.showAlert('userSearch', 'error', 'Bu kullanıcı zaten şirkete ekli. Başka bir kullanıcı ekleyemezsiniz.');
        return;
      }
      
      // Kullanıcı şirkette değilse, sistem genelinde arama yap
      this.http.post<any>('api/CompanyUsers/GetUserByIdentityNumber', 
        { identityNumber },
        (response) => {
          this.searchingUser = false;
          if (response && typeof response === 'object' && Object.keys(response).length > 0) {
            this.addUserForm.patchValue({
              identityNumber: identityNumber,
              firstName: response.firstName || '',
              lastName: response.lastName || '',
              phoneNumber: response.phoneNumber || '',
              email: response.email || ''
            });
            this.userFoundFromSearch = true;
            this.userAlreadyInCompany = false;
            this.enableFormInputs();
            this.showAlert('userSearch', 'success', 'Kullanıcı bulundu');
            this.addUserForm.get('identityNumber')?.disable();
          } else {
            this.userFoundFromSearch = false;
            this.userAlreadyInCompany = false;
            this.enableFormInputs();
            this.showAlert('userSearch', 'warning', 'Kullanıcı yok');
            this.addUserForm.patchValue({
              identityNumber: identityNumber,
              firstName: '',
              lastName: '',
              phoneNumber: '',
              email: ''
            });
            this.addUserForm.get('identityNumber')?.enable();
          }
        },
        (error) => {
          this.searchingUser = false;
          this.userFoundFromSearch = false;
          this.userAlreadyInCompany = false;
          this.enableFormInputs();
          this.showAlert('userSearch', 'warning', 'Kullanıcı yok');
          const identityNumber = this.addUserForm.get('searchIdentityNumber')?.value;
          this.addUserForm.patchValue({
            identityNumber: identityNumber,
            firstName: '',
            lastName: '',
            phoneNumber: '',
            email: ''
          });
          this.addUserForm.get('identityNumber')?.enable();
        }
      );
    });
  }

  private async checkUserInCompany(identityNumber: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Şirket kullanıcılarını al ve TC kimlik ile kontrol et
      this.http.getCompanyUsersAll(
        { companyId: this.data.company.id },
        (response) => {
          let users = [];
          if (response && response.isSuccessful && Array.isArray(response.data)) {
            users = response.data;
          } else if (Array.isArray(response)) {
            users = response;
          }
          
          // TC kimlik numarası ile kullanıcının şirkette olup olmadığını kontrol et
          const userExists = users.some((user: any) => 
            user.identityNumber === identityNumber || user.identityNumber === identityNumber
          );
          
          resolve(userExists);
        },
        (error) => {
          console.error('Error checking user in company:', error);
          resolve(false); // Hata durumunda false döndür
        }
      );
    });
  }

  private disableFormInputs(): void {
    // Sadece arama input'unu aktif bırak, diğerlerini kilitle
    this.addUserForm.get('identityNumber')?.disable();
    this.addUserForm.get('firstName')?.disable();
    this.addUserForm.get('lastName')?.disable();
    this.addUserForm.get('phoneNumber')?.disable();
    this.addUserForm.get('email')?.disable();
    this.addUserForm.get('startDate')?.disable();
    this.addUserForm.get('endDate')?.disable();
    this.addUserForm.get('isActive')?.disable();
  }

  private enableFormInputs(): void {
    // Tüm form input'larını aktif et
    this.addUserForm.get('identityNumber')?.enable();
    this.addUserForm.get('firstName')?.enable();
    this.addUserForm.get('lastName')?.enable();
    this.addUserForm.get('phoneNumber')?.enable();
    this.addUserForm.get('email')?.enable();
    this.addUserForm.get('startDate')?.enable();
    this.addUserForm.get('endDate')?.enable();
    this.addUserForm.get('isActive')?.enable();
  }

  addUserToCompanySubmit(): void {
    // Kullanıcı zaten şirkette ise ekleme işlemini engelle
    if (this.userAlreadyInCompany) {
      this.showAlert('addUser', 'error', 'Bu kullanıcı zaten şirkete ekli. Ekleyemezsiniz.');
      return;
    }

    if (this.addUserForm.invalid) {
      this.markFormGroupTouched(this.addUserForm);
      this.showAlert('addUser', 'error', 'Lütfen tüm gerekli alanları doldurunuz.');
      return;
    }
    
    // Enable identityNumber before submit (disabled alanlar form value'ya dahil edilmez)
    this.addUserForm.get('identityNumber')?.enable();
    this.addingUser = true;
    this.hideAlert('addUser');

    // Get form values (including disabled fields)
    const formValue = this.addUserForm.getRawValue();
      // Format dates properly for C# DateTime
    const formatDateForApi = (date: any): string | null => {
      if (!date) return null;
      
      // If it's already a Date object from the date picker
      if (date instanceof Date) {
        // Create a new date with the same year, month, day but in local timezone
        // This prevents timezone offset issues
        const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
        return localDate.toISOString();
      }
      
      // If it's a string, try to parse it
      if (typeof date === 'string' && date.trim() !== '') {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate.getTime())) {
          const localDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 12, 0, 0);
          return localDate.toISOString();
        }
      }
      
      return null;
    };const userData = {
      companyId: this.data.company.id,
      identityNumber: formValue.identityNumber,
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phoneNumber: formValue.phoneNumber,
      isActive: formValue.isActive,
      startDate: formatDateForApi(formValue.startDate),
      endDate: formatDateForApi(formValue.endDate)
      // Removed roleId as it's not part of CreateCompanyUserCommand
    };

    // Debug: Log the form values and formatted data
    console.log('Form Values:', formValue);
    console.log('User Data to send:', userData);// Call API to add user to company
    this.http.post<any>('api/CompanyUsers/CreateCompanyUser', 
      userData,
      (response) => {
        this.addingUser = false;
        this.showAlert('addUser', 'success', 'Kullanıcı şirkete başarıyla eklendi.');
        
        // Close dialog after 2 seconds
        setTimeout(() => {
          this.dialogRef.close({ success: true, data: response });
        }, 2000);
      },
      (error) => {
        this.addingUser = false;
        console.error('Error adding user to company:', error);
        
        let errorMessage = 'Kullanıcı eklenirken bir hata oluştu.';
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        this.showAlert('addUser', 'error', errorMessage);
      }
    );
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private showAlert(type: 'userSearch' | 'addUser', alertType: string, message: string): void {
    // Eğer message bir object ise prettify ile stringe çevir
    if (typeof message === 'object') {
      message = JSON.stringify(message, null, 2);
    }
    const alert = {
      id: `${type}-alert-${Date.now()}`,
      type: alertType,
      message: message,
      timestamp: Date.now()
    };

    if (type === 'userSearch') {
      this.userSearchAlert = alert;
    } else {
      this.addUserAlert = alert;
      this.showAddUserAlert = true;
    }
  }

  private hideAlert(type: 'userSearch' | 'addUser'): void {
    if (type === 'userSearch') {
      this.userSearchAlert = null;
    } else {
      this.addUserAlert = null;
      this.showAddUserAlert = false;
    }
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  // Reset form when starting a new search
  resetFormForNewSearch(): void {
    this.userFoundFromSearch = false;
    this.userAlreadyInCompany = false;
    this.hideAlert('userSearch');
    this.hideAlert('addUser');
    this.enableFormInputs();
    
    // Clear only user info fields, keep search field
    this.addUserForm.patchValue({
      identityNumber: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
  }

  // Helper method to get form field error messages
  getFieldError(fieldName: string): string {
    const field = this.addUserForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Bu alan zorunludur';
      }      if (field.errors['pattern']) {
        if (fieldName.includes('identityNumber') || fieldName === 'searchIdentityNumber') {
          return 'TC Kimlik No 11 haneli olmalıdır';
        }
        if (fieldName === 'phoneNumber') {
          return 'Telefon numarası 10-11 haneli olmalıdır';
        }
      }
      if (field.errors['email']) {
        return 'Geçerli bir e-posta adresi giriniz';
      }
      if (field.errors['minlength']) {
        return `En az ${field.errors['minlength'].requiredLength} karakter olmalıdır`;
      }
    }
    return '';
  }
}
