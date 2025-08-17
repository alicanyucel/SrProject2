import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedModule } from '../../../shared/shared.module';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SwalService } from '../../../services/swal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GlobalFuseAlertService } from '../../../services/fuse-alert.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { PageEvent } from '@angular/material/paginator';
import { fuseAnimations } from '@fuse/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TurkishPaginatorIntl } from '../../../services/turkish-paginator-intl.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApproveApplicationDialogComponent, ApproveApplicationDialogData } from './approve-application-dialog/approve-application-dialog.component';
import { MatChipsModule } from '@angular/material/chips';
import { environment } from 'environments/environment.development';
import { AuthService } from 'app/core/auth/auth.service';

// Enum tanımları
export enum ApplicationStatus {
  Approved = 1,
  Unapproved = 2,              // Onay Bekliyor
  AdditionalInformationRequested = 3,
  Rejected = 4                 // Reddedildi
}

enum AreaOfInterest {
  ReportReading = 1,
  ReportWrinting = 2,
  UtilizingTeleradiologyServices = 3
}

// Model interface
interface MemberApplication {
  id: string;
  firstName: string;  // API'den gelen field ismi
  lastName: string;   // API'den gelen field ismi
  fullName: string;
  phone: string;
  email: string;
  identityNumber: string;
  isDeleted: boolean;
  applicationStatus: ApplicationStatus;
  areaOfInterest: AreaOfInterest;
  applicationDate: string;
}

interface ApiResponse {
  data: MemberApplication[];
  errorMessages: string[] | null;
  isSuccessful: boolean;
}

@Component({
  selector: 'app-member-applications',
  standalone: true,
  // ViewEncapsulation.None kaldırıldı - CSS conflict'leri önlemek için
  imports: [
    SharedModule, 
    MatPaginatorModule, 
    MatButtonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatProgressSpinnerModule, 
    MatMenuModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: TurkishPaginatorIntl }
  ],
  templateUrl: './member-applications.component.html',styles: [`
    /* Sadece component'e özel stiller - ::ng-deep kullanımı yok */
    :host {
      display: block;
      width: 100%;
    }    /* Container alignment */
    .header-controls-container {
      align-items: center !important;
    }

    /* Form field height control - butonla aynı boyut */
    :host ::ng-deep .h-10.mat-mdc-form-field {
      height: 40px !important;
      max-height: 40px !important;
    }

    :host ::ng-deep .h-10.mat-mdc-form-field .mat-mdc-text-field-wrapper {
      height: 40px !important;
      max-height: 40px !important;
    }

    :host ::ng-deep .h-10.mat-mdc-form-field .mat-mdc-form-field-flex {
      height: 40px !important;
      max-height: 40px !important;
      align-items: center !important;
    }

    :host ::ng-deep .h-10.mat-mdc-form-field .mat-mdc-form-field-infix {
      height: 40px !important;
      max-height: 40px !important;
      min-height: 40px !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
    }    :host ::ng-deep .h-10.mat-mdc-form-field .mat-mdc-form-field-subscript-wrapper {
      display: none !important;
    }    /* Status chip colors - renkli durumlar */
    .status-chip-approved {
      background-color: #10b981 !important; /* Yeşil - Onaylandı */
      color: #ffffff !important;
      border: 1px solid #059669 !important;
      font-weight: 500 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }
    
    .status-chip-unapproved {
      background-color: #f59e0b !important; /* Turuncu - Onay Bekliyor */
      color: #ffffff !important;
      border: 1px solid #d97706 !important;
      font-weight: 500 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }
    
    .status-chip-additional-info {
      background-color: #3b82f6 !important; /* Mavi - Ek Bilgi İstendi */
      color: #ffffff !important;
      border: 1px solid #2563eb !important;
      font-weight: 500 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }    /* Status chip icon styling */
    .status-chip-approved .mat-icon,
    .status-chip-unapproved .mat-icon,
    .status-chip-additional-info .mat-icon {
      width: 16px !important;
      height: 16px !important;
      font-size: 16px !important;
      margin-right: 4px !important;
      color: #ffffff !important;
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1)) !important;
    }/* Interest area badge colors - daha okunabilir renkler */
    .interest-area-reading {
      background-color: #8b5cf6 !important; /* Mor - Rapor Okuma */
      color: #ffffff !important;
      border: 1px solid #7c3aed !important;
      font-weight: 500 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }
    
    .interest-area-writing {
      background-color: #06b6d4 !important; /* Cyan - Rapor Yazdırma */
      color: #ffffff !important;
      border: 1px solid #0891b2 !important;
      font-weight: 500 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }
    
    .interest-area-teleradiology {
      background-color: #f59e0b !important; /* Amber - Teleradyoloji */
      color: #ffffff !important;
      border: 1px solid #d97706 !important;
      font-weight: 500 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }
    
    .interest-area-unknown {
      background-color: #6b7280 !important; /* Gri - Bilinmiyor */
      color: #ffffff !important;
      border: 1px solid #4b5563 !important;
      font-weight: 500 !important;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1) !important;
    }    /* Interest area icon styling */
    .interest-area-reading .mat-icon,
    .interest-area-writing .mat-icon,
    .interest-area-teleradiology .mat-icon,
    .interest-area-unknown .mat-icon {
      width: 16px !important;
      height: 16px !important;
      font-size: 16px !important;
      color: #ffffff !important;
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1)) !important;
    }

    /* Dialog panel styling */
    :host ::ng-deep .approve-application-dialog-panel {
      .mat-mdc-dialog-container {
        border-radius: 16px !important;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
      }
    }

    /* Table hover effects */
    .applications-table tbody tr:hover {
      background-color: rgba(59, 130, 246, 0.05) !important;
      transition: background-color 0.2s ease !important;
    }
  `],
  animations: fuseAnimations
})
export class MemberApplicationsComponent implements OnInit, OnDestroy {
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    
    applications: MemberApplication[] = [];
  paginatedApplications: MemberApplication[] = [];
  isLoading = false;
  search = '';
  statusFilter: ApplicationStatus | '' = '';
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalApplications = 0;

  // Enum referansları
  ApplicationStatus = ApplicationStatus;
  AreaOfInterest = AreaOfInterest;  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private router: Router,
    private swal: SwalService,
    public fuseAlert: GlobalFuseAlertService,
    private dialog: MatDialog
  ) { }ngOnInit(): void {
    // Component'e her girişte state'i temizle
    this.search = '';
    this.statusFilter = '';
    this.pageIndex = 0;
    
    this.loadApplications();
  }

  ngOnDestroy(): void {
    // Tüm subscription'ları temizle
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }// API'den başvuruları yükle
  loadApplications(): void {
    this.isLoading = true;
    this.httpClient.post<ApiResponse>(`${environment.apiUrl}/api/Members/GetAllMember`, {}, {
      headers: {
        'Authorization': `Bearer ${this.authService.accessToken}`
      }
    }).subscribe({
      next: (response: ApiResponse) => {
        if (response.isSuccessful && response.data) {
          this.applications = response.data.filter(app => !app.isDeleted);
          this.totalApplications = this.applications.length;
          this.updatePaginatedApplications();
        } else {
          this.fuseAlert.showAlert('error', 'Başvurular yüklenirken hata oluştu.');
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.fuseAlert.showAlert('error', 'Başvurular yüklenirken hata oluştu.');
        this.isLoading = false;
      }
    });
  }

  // Sayfa değişikliği
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedApplications();
  }
  // Arama
  onSearchChange(): void {
    this.pageIndex = 0;
    this.updatePaginatedApplications();
  }

  // Status filtresi değişikliği
  onStatusFilterChange(): void {
    this.pageIndex = 0;
    this.updatePaginatedApplications();
  }
  // Paginated uygulamaları güncelle
  updatePaginatedApplications(): void {
    let filteredApplications = this.applications;

    // Status filtresi
    if (this.statusFilter !== '') {
      filteredApplications = filteredApplications.filter(app => 
        app.applicationStatus === this.statusFilter
      );
    }

    // Arama filtresi
    if (this.search.trim()) {
      const searchTerm = this.search.toLowerCase().trim();
      filteredApplications = filteredApplications.filter(app =>
        app.fullName.toLowerCase().includes(searchTerm) ||
        app.email.toLowerCase().includes(searchTerm) ||
        app.phone.includes(searchTerm)
      );
    }

    this.totalApplications = filteredApplications.length;
    
    // Pagination
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedApplications = filteredApplications.slice(startIndex, endIndex);
  }
  // Status label'ı al
  getStatusLabel(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved:
        return 'Onaylandı';
      case ApplicationStatus.Unapproved:
        return 'Onay Bekliyor';
      case ApplicationStatus.AdditionalInformationRequested:
        return 'Ek Bilgi İstendi';
      case ApplicationStatus.Rejected:
        return 'Reddedildi';     // Yeni eklendi
      default:
        return 'Bilinmiyor';
    }
  }  // Status CSS class'ı al
  getStatusClass(status: ApplicationStatus): string {
    const statusClass = (() => {
      switch (status) {
        case ApplicationStatus.Approved:
          return 'status-chip-approved';
        case ApplicationStatus.Unapproved:
          return 'status-chip-unapproved';
        case ApplicationStatus.AdditionalInformationRequested:
          return 'status-chip-additional-info';
        case ApplicationStatus.Rejected:
          return 'status-chip-rejected';
        default:
          return '';
      }
    })();
    
    return statusClass;
  }
  // Status icon'u al
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
  // Mat-icon için renk metodu
  getStatusIconColor(status: ApplicationStatus): string {
    // Tüm durumlar için beyaz icon
    return '#ffffff';
  }

  // İlgi alanı label'ı al
  getInterestAreaLabel(area: AreaOfInterest): string {
    switch (area) {
      case AreaOfInterest.ReportReading:
        return 'Rapor Okuma';
      case AreaOfInterest.ReportWrinting:
        return 'Rapor Yazdırma';
      case AreaOfInterest.UtilizingTeleradiologyServices:
        return 'Teleradyoloji Hizmetleri';
      default:
        return 'Bilinmiyor';
    }
  }

  // İlgi alanı CSS class'ı al
  getInterestAreaClass(area: AreaOfInterest): string {
    switch (area) {
      case AreaOfInterest.ReportReading:
        return 'interest-area-reading';
      case AreaOfInterest.ReportWrinting:
        return 'interest-area-writing';
      case AreaOfInterest.UtilizingTeleradiologyServices:
        return 'interest-area-teleradiology';
      default:
        return 'interest-area-unknown';
    }
  }

  // İlgi alanı icon'u al
  getInterestAreaIcon(area: AreaOfInterest): string {
    switch (area) {
      case AreaOfInterest.ReportReading:
        return 'heroicons_outline:document-text';
      case AreaOfInterest.ReportWrinting:
        return 'heroicons_outline:pencil';
      case AreaOfInterest.UtilizingTeleradiologyServices:
        return 'heroicons_outline:wifi';
      default:
        return 'heroicons_outline:question-mark-circle';
    }  }
  
  // Tarihi formatla
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }  // Sign-up formuna yeni sekmede yönlendir
  openSignUpForm(): void {
    window.open('/sign-up', '_blank');
  }  // Dialog metodları
  approveApplication(application: MemberApplication): void {  
    const dialogData: ApproveApplicationDialogData = {
      applicationId: application.id,
      applicantName: application.fullName,
      currentStatus: application.applicationStatus,
      firstName: application.firstName, // API'den gelen field ismi kullanıldı
      lastName: application.lastName,   // API'den gelen field ismi kullanıldı
      email: application.email,
      phoneNumber: application.phone,
      identityNumber: application.identityNumber
    };
    
    const dialogRef = this.dialog.open(ApproveApplicationDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      data: dialogData,
      disableClose: true,
      panelClass: 'approve-application-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Dialog'dan pozitif sonuç geldi - başvuru durumu güncellendi
        this.fuseAlert.showAlert('success', 'Başvuru durumu başarıyla güncellendi.');
        this.loadApplications(); // Liste yenileniyor
      }
    });
  }  rejectApplication(application: MemberApplication): void {
    // Bu metod da aynı dialog'u açabilir, sadece default status farklı olabilir
    const dialogData: ApproveApplicationDialogData = {
      applicationId: application.id,
      applicantName: application.fullName,
      currentStatus: application.applicationStatus,
      firstName: application.firstName, // Interface güncellemesi ile düzeltildi
      lastName: application.lastName,   // Interface güncellemesi ile düzeltildi  
      email: application.email,
      phoneNumber: application.phone,
      identityNumber: application.identityNumber
    };

    const dialogRef = this.dialog.open(ApproveApplicationDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '95vh',      data: {
        ...dialogData,
        defaultStatus: ApplicationStatus.Rejected // Reject için Rejected durumu
      },
      disableClose: true,
      panelClass: 'approve-application-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fuseAlert.showAlert('success', 'Başvuru durumu başarıyla güncellendi.');
        this.loadApplications();
      }
    });
  }  requestAdditionalInfo(application: MemberApplication): void {
    // Bu metod da aynı dialog'u açabilir, sadece default status farklı olabilir
    const dialogData: ApproveApplicationDialogData = {
      applicationId: application.id,
      applicantName: application.fullName,
      currentStatus: application.applicationStatus,
      firstName: application.firstName, // Interface güncellemesi ile düzeltildi
      lastName: application.lastName,   // Interface güncellemesi ile düzeltildi
      email: application.email,
      phoneNumber: application.phone,
      identityNumber: application.identityNumber
    };

    const dialogRef = this.dialog.open(ApproveApplicationDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      maxHeight: '95vh',
      data: {
        ...dialogData,
        defaultStatus: ApplicationStatus.AdditionalInformationRequested // Ek bilgi için default durum
      },
      disableClose: true,
      panelClass: 'approve-application-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.fuseAlert.showAlert('success', 'Başvuru durumu başarıyla güncellendi.');
        this.loadApplications();
      }
    });
  }
  // Status inline style metodları - CSS'in çalışmadığı durumlar için
  getStatusBackgroundColor(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved:
        return '#10b981'; // Koyu yeşil arka plan
      case ApplicationStatus.Unapproved:
        return '#f59e0b'; // Koyu turuncu arka plan  
      case ApplicationStatus.AdditionalInformationRequested:
        return '#3b82f6'; // Koyu mavi arka plan
      case ApplicationStatus.Rejected:
        return '#ef4444'; // Koyu kırmızı arka plan
      default:
        return '#6b7280'; // Varsayılan gri
    }
  }

  getStatusTextColor(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.Approved:
        return '#ffffff'; // Beyaz yazı
      case ApplicationStatus.Unapproved:
        return '#ffffff'; // Beyaz yazı
      case ApplicationStatus.AdditionalInformationRequested:
        return '#ffffff'; // Beyaz yazı
      case ApplicationStatus.Rejected:
        return '#ffffff'; // Beyaz yazı
      default:
        return '#ffffff'; // Varsayılan beyaz
    }
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
        return '1px solid #4b5563'; // Varsayılan koyu gri border
    }
  }
}
