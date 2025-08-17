import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../../../services/http.service';
import { CompanyUser } from '../../../../models/company-user.model';
import { SharedModule } from '../../../../shared/shared.module';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TurkishPaginatorIntl } from '../../../../services/turkish-paginator-intl.service';
import { SwalService } from '../../../../services/swal.service';
import { AddUserDialogComponent } from '../add-user-dialog/add-user-dialog.component';
import { EditUserDialogComponent } from '../edit-user-dialog/edit-user-dialog.component';
import { HospitalManagementDialogComponent } from '../hospital-management-dialog/hospital-management-dialog.component';

export interface CompanyUsersDialogData {
  companyId: string;
  companyName: string;
}

@Component({
  selector: 'app-company-users-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    SharedModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: TurkishPaginatorIntl }
  ],
  templateUrl: './company-users-dialog.component.html',
  styleUrls: ['./company-users-dialog.component.scss']
})
export class CompanyUsersDialogComponent implements OnInit {
  displayedColumns: string[] = ['userId', 'firstName', 'lastName', 'phone', 'email'];
  
  companyUsers: CompanyUser[] = [];
  filteredUsers: CompanyUser[] = [];
  paginatedUsers: CompanyUser[] = [];

  // Loading states
  loading = false;
  
  // Search functionality
  search = '';
    // Pagination
  pageSize = 4;
  pageIndex = 0;
  totalUsers = 0;
  constructor(
    private http: HttpService,
    private swal: SwalService,
    public dialogRef: MatDialogRef<CompanyUsersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CompanyUsersDialogData,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCompanyUsers();
  }

  loadCompanyUsers(): void {
    this.loading = true;
    const filter = {
      companyId: this.data.companyId
      // İleride buraya diğer filtreler de eklenebilir (isActive, startDate, endDate, vs.)
    };
    this.http.getCompanyUsersAll(
      filter,
      (response) => {
        this.loading = false;
        // Eğer API Result pattern ile dönüyorsa:
        if (response && response.isSuccessful && Array.isArray(response.data)) {
          this.companyUsers = response.data;
        } else if (Array.isArray(response)) {
          this.companyUsers = response;
        } else {
          this.companyUsers = [];
        }
        this.filteredUsers = [...this.companyUsers];
        this.totalUsers = this.filteredUsers.length;
        this.updatePaginatedUsers();
      },
      (error) => {
        this.loading = false;
        this.companyUsers = [];
        this.filteredUsers = [];
        this.totalUsers = 0;
        this.updatePaginatedUsers();
      }
    );
  }
  onSearchChange(): void {
    if (!this.search || this.search.trim() === '') {
      this.filteredUsers = [...this.companyUsers];
    } else {
      const searchLower = this.search.toLowerCase().trim();
      const searchTerms = searchLower.split(' ').filter(term => term.length > 0);
      
      this.filteredUsers = this.companyUsers.filter(user => {
        // Kullanıcının tüm bilgilerini birleştir
        const firstName = (user.firstName || '').toLowerCase();
        const lastName = (user.lastName || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const phone = (user.phoneNumber || user.phone || '').toLowerCase();
        const userId = (user.userId || '').toLowerCase();
        
        // Tam isim kombinasyonu (Ahmet Mehmet gibi)
        const fullName = `${firstName} ${lastName}`.trim();
        const reverseFullName = `${lastName} ${firstName}`.trim();
        
        // Tüm içerik birleştirilmiş hali
        const allContent = `${firstName} ${lastName} ${email} ${phone} ${userId}`;
        
        // Eğer tek kelime aranıyorsa
        if (searchTerms.length === 1) {
          const term = searchTerms[0];
          return firstName.includes(term) ||
                 lastName.includes(term) ||
                 email.includes(term) ||
                 phone.includes(term) ||
                 userId.includes(term) ||
                 fullName.includes(term) ||
                 allContent.includes(term);
        }
        
        // Eğer birden fazla kelime aranıyorsa (isim soyisim gibi)
        // Tüm arama terimlerinin bulunup bulunmadığını kontrol et
        const matchesAllTerms = searchTerms.every(term =>
          firstName.includes(term) ||
          lastName.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          userId.includes(term) ||
          fullName.includes(term) ||
          reverseFullName.includes(term) ||
          allContent.includes(term)
        );
        
        // Ya da tam arama stringinin herhangi bir yerde bulunup bulunmadığını kontrol et
        const matchesFullSearch = fullName.includes(searchLower) ||
                                  reverseFullName.includes(searchLower) ||
                                  allContent.includes(searchLower);
        
        return matchesAllTerms || matchesFullSearch;
      });
    }
    this.totalUsers = this.filteredUsers.length;
    this.pageIndex = 0; // Reset to first page when searching
    this.updatePaginatedUsers();
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedUsers();
  }

  private updatePaginatedUsers(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }
  onClose(): void {
    this.dialogRef.close();
  }

  onEditUser(user: CompanyUser): void {
    this.dialog.open(EditUserDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      minWidth: '800px',
      height: 'auto',
      maxHeight: '95vh',
      panelClass: 'edit-user-dialog-panel',
      disableClose: false,
      data: {
        user: user,
        companyId: this.data.companyId
      }
    }).afterClosed().subscribe(result => {
      if (result && result.success) {
        this.swal.callToast('Kullanıcı başarıyla güncellendi!', 'success');
        this.loadCompanyUsers();
      }
    });
  }  onDeleteUser(user: CompanyUser): void {
    
    this.swal.showWarning(
      'Kullanıcıyı Sil',
      `${user.firstName} ${user.lastName} kullanıcısını şirketten çıkarmak istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      () => {
        console.log('Confirmed - deleting user');
        this.deleteCompanyUser(user);
      }
    );
    
    console.log('Warning dialog shown');
  }private updateCompanyUser(updateData: any): void {
    this.swal.showLoading('Kullanıcı güncelleniyor...');
    
    this.http.post(
      'api/CompanyUsers/UpdateCompanyUser',
      updateData,
      (response) => {
        this.swal.hideLoading();
        console.log('Kullanıcı güncellendi:', response);
        
        // Başarı mesajı
        this.swal.showSuccess(
          'Başarılı!',
          'Kullanıcı bilgileri başarıyla güncellendi'
        );
        
        // Listeyi yenile
        this.loadCompanyUsers();
      },
      (error) => {
        this.swal.hideLoading();
        console.error('Kullanıcı güncellenemedi:', error);
        
        // Hata mesajı
        this.swal.showError(
          'Hata!',
          'Kullanıcı güncellenirken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      }
    );
  }  private deleteCompanyUser(user: CompanyUser): void {
    this.swal.showLoading('Kullanıcı siliniyor...');
    
    // Sadece userId gönderiyoruz
    const deleteData = {
      userId: user.userId
    };
    
    this.http.post(
      'api/CompanyUsers/DeleteCompanyUser',
      deleteData,
      (response) => {
        this.swal.hideLoading();
        
        // Başarı mesajı
        this.swal.showSuccess(
          'Başarılı!',
          `${user.firstName} ${user.lastName} kullanıcısı başarıyla şirketten çıkarıldı`
        );
        
        // Listeyi yenile
        this.loadCompanyUsers();
      },
      (error) => {
        this.swal.hideLoading();
        
        // Hata mesajı
        this.swal.showError(
          'Hata!',
          'Kullanıcı silinirken bir hata oluştu. Lütfen tekrar deneyin.'
        );
      }
    );
  }

  openAddUserDialog(): void {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      disableClose: false,
      panelClass: 'add-user-dialog-panel',
      data: {
        company: { id: this.data.companyId, companySmallTitle: this.data.companyName }
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.swal.callToast('Kullanıcı şirkete başarıyla eklendi!', 'success');
        this.loadCompanyUsers();
      }
    });
  }

  openHospitalDialog(): void {
    const dialogRef = this.dialog.open(HospitalManagementDialogComponent, {
      width: '90vw',
      height: '85vh',
      maxWidth: '1000px',
      maxHeight: '85vh',
      disableClose: false,
      panelClass: 'hospital-management-dialog-panel',
      data: {
        companyId: this.data.companyId,
        companyName: this.data.companyName,
        viewOnly: false
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.swal.callToast('Hastane başarıyla eklendi!', 'success');
        // İleride hastane listesi de yenilenebilir
      }
    });
  }
}
    // Kullanıcı kartında yeni alanları göstermek için örnek açıklama:
    // company-users-dialog.component.html dosyasında, kullanıcı kartına aşağıdaki gibi eklemeler yapabilirsin:
    //
    // <div class="user-status">
    //   <mat-icon [ngClass]="user.isActive ? 'active' : 'inactive'">
    //     {{ user.isActive ? 'check_circle' : 'cancel' }}
    //   </mat-icon>
    //   <span>{{ user.isActive ? 'Aktif' : 'Pasif' }}</span>
    // </div>
    // <div class="user-dates">
    //   <span>Başlangıç: {{ user.startDate | date:'dd.MM.yyyy' }}</span>
    //   <span *ngIf="user.endDate">Bitiş: {{ user.endDate | date:'dd.MM.yyyy' }}</span>
    // </div>
    // <div class="user-company">
    //   <mat-icon>business</mat-icon>
    //   <span>{{ user.companyTitle }}</span>
    // </div>
    //
    // Bu alanları kart veya tabloya ekleyerek, yeni backend alanlarını kullanıcıya gösterebilirsin
