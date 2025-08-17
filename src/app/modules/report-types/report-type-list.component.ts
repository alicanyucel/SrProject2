import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ReportTypeFormComponent } from './report-type-form.component';
import { ReportTemplateFormComponent } from './report-template-form.component';
import Swal from 'sweetalert2';
import { HttpService } from '../../services/http.service';

interface FakeReportType {
  id: string;
  reportName: string;
  emergency: boolean;
  modalityType: string;
  templates?: { name: string; template: string }[];
}

// Şirket kullanıcısı düzenleme için TC No desteği
// Kullanıcı modelinize örnek olarak ekleyin:
// interface CompanyUser {
//   id: string;
//   name: string;
//   email: string;
//   tcNo: string; // TC Kimlik Numarası
//   ...
// }

@Component({
  selector: 'app-report-type-list',
  templateUrl: './report-type-list.component.html',
  styleUrls: ['./report-type-list.component.scss']
})
export class ReportTypeListComponent implements OnInit {
  reportTypes: FakeReportType[] = [];
  allReports: FakeReportType[] = [];
  modalities: string[] = ['BT', 'MR', 'USG'];
  selectedModality: string = '';
  selectedEmergency: string = '';
  isLoading = false;
  pageSize = 10;
  currentPage = 0;
  pageSizeOptions = [5, 10, 25, 50];
  searchText: string = '';

  ngOnInit() {
    this.loadReportsFromApi();
    // Konsola özel mesaj yaz
    // eslint-disable-next-line no-console
    console.log('%cTÜM HAKKI SAKLIDIR - Ali Can Yücel', 'color: #1976d2; font-size: 16px; font-weight: bold;');
  }

  constructor(private dialog: MatDialog, private http: HttpService) {}

  loadReportsFromApi() {
    this.isLoading = true;
    this.http.post<any>('api/Reports/GetAllReports', {}, res => {
      let allReports = [];
      if (res && res.data && Array.isArray(res.data)) {
        allReports = res.data;
      } else if (Array.isArray(res)) {
        allReports = res;
      }
      this.allReports = allReports;
      this.reportTypes = allReports;
      // Modaliteleri API'den gelen raporların modalityType alanlarından eşsiz olarak doldur
      this.modalities = Array.from(new Set(allReports.map(r => r.modalityType).filter(Boolean)));
      this.isLoading = false;
      this.updatePaginatedReports();
    }, err => {
      this.allReports = [];
      this.reportTypes = [];
      this.modalities = [];
      this.isLoading = false;
      this.updatePaginatedReports();
    });
  }

  openAddReportType() {
    this.dialog.open(ReportTypeFormComponent, {
      width: '400px',
      data: { modalities: this.modalities }
    }).afterClosed().subscribe(result => {
      if (result) {
        // Formdan dönen tüm değerleri doğrudan API'ye gönder
        this.http.createReport(result, res => {
          Swal.fire('Başarılı', 'Rapor başarıyla eklendi.', 'success');
          this.loadReportsFromApi();
        }, err => {
          Swal.fire('Hata', 'Rapor eklenemedi.', 'error');
        });
      } else {
        Swal.fire('Bilgi', 'Rapor ekleme işlemi iptal edildi.', 'info');
      }
    });
  }

  async onEdit(reportType: FakeReportType) {
    const confirm = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu raporu güncellemek istediğinize emin misiniz?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet, güncelle',
      cancelButtonText: 'Vazgeç'
    });
    if (!confirm.isConfirmed) {
      Swal.fire('Bilgi', 'Rapor güncelleme işlemi iptal edildi.', 'info');
      return;
    }
    this.dialog.open(ReportTypeFormComponent, {
      width: '400px',
      data: {
        reportName: reportType.reportName,
        emergency: reportType.emergency,
        modalityType: reportType.modalityType
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        // Sadece rapor adı güncelleniyorsa diğer alanları eski değerle gönder
        const updatePayload = {
          id: reportType.id,
          reportName: result.reportName || reportType.reportName,
          emergency: typeof result.emergency === 'boolean' ? result.emergency : reportType.emergency,
          modalityType: result.modalityType || reportType.modalityType
        };
        this.http.post<any>('api/Reports/UpdateReport', updatePayload, res => {
          Swal.fire('Güncellendi', 'Rapor başarıyla güncellendi.', 'info');
          this.loadReportsFromApi();
        }, err => {
          Swal.fire('Hata', 'Rapor güncellenemedi.', 'error');
        });
      } else {
        Swal.fire('Bilgi', 'Rapor güncelleme işlemi iptal edildi.', 'info');
      }
    });
  }

  async onDelete(reportType: FakeReportType) {
    const confirm = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu raporu silmek istediğinize emin misiniz?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, sil',
      cancelButtonText: 'Vazgeç'
    });
    if (!confirm.isConfirmed) {
      Swal.fire('Bilgi', 'Rapor silme işlemi iptal edildi.', 'info');
      return;
    }
    // API ile silme
    this.http.post<any>('api/Reports/DeleteReportById', { id: reportType.id }, res => {
      Swal.fire('Silindi', 'Rapor başarıyla silindi.', 'warning');
      this.loadReportsFromApi();
    }, err => {
      Swal.fire('Hata', 'Rapor silinemedi.', 'error');
    });
  }

  onAddTemplate(reportType: any) {
    const dialogRef = this.dialog.open(ReportTemplateFormComponent, {
      width: '400px',
      data: { reportTypeName: reportType.reportName }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (!reportType.templates) reportType.templates = [];
        reportType.templates = [...reportType.templates, {
          name: result.name,
          template: result.template
        }];
        Swal.fire('Başarılı', 'Şablon başarıyla eklendi.', 'success');
      } else {
        Swal.fire('Bilgi', 'Şablon ekleme işlemi iptal edildi.', 'info');
      }
    });
  }

  // MatPaginator page event handler
  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedReports();
  }

  // MatPaginator için sayfalama fonksiyonu
  paginatedReports: FakeReportType[] = [];
  updatePaginatedReports() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedReports = this.reportTypes.slice(startIndex, endIndex);
  }

  onSearchReports() {
    let filtered = this.allReports;
    if (this.selectedModality) {
      filtered = filtered.filter(r => r.modalityType === this.selectedModality);
    }
    if (this.selectedEmergency) {
      if (this.selectedEmergency === 'true') {
        filtered = filtered.filter(r => r.emergency === true);
      } else if (this.selectedEmergency === 'false') {
        filtered = filtered.filter(r => r.emergency === false);
      }
    }
    if (this.searchText && this.searchText.trim().length > 0) {
      const search = this.searchText.trim().toLowerCase();
      filtered = filtered.filter(r =>
        (r.reportName && r.reportName.toLowerCase().includes(search)) ||
        (r.modalityType && r.modalityType.toLowerCase().includes(search))
      );
    }
    this.reportTypes = filtered;
    this.currentPage = 0;
    this.updatePaginatedReports();
  }

  loadReportTypes() {
    let filtered = this.allReports;
    if (this.selectedModality) {
      filtered = filtered.filter(r => r.modalityType === this.selectedModality);
    }
    if (this.selectedEmergency) {
      if (this.selectedEmergency === 'true') {
        filtered = filtered.filter(r => r.emergency === true);
      } else if (this.selectedEmergency === 'false') {
        filtered = filtered.filter(r => r.emergency === false);
      }
    }
    this.reportTypes = filtered;
    this.updatePaginatedReports();
  }
}
