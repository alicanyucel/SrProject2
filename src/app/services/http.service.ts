import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResultModel } from '../models/result.model';
import { AuthService } from 'app/core/auth/auth.service';
import { ErrorService } from './error.service';
import { SwalService } from './swal.service';
import { environment } from 'environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private error: ErrorService,
    private swal: SwalService
  ) { }  post<T>(apiUrl:string, body:any, callBack:(res: T)=> void, errorCallBack?:(err: HttpErrorResponse) => void, showErrorAlert: boolean = true){
      this.http.post<any>(`${environment.apiUrl}/${apiUrl}`, body, {
      headers:{
        "Authorization":"Bearer " + this.auth.accessToken
      }
    }).subscribe({      next:(res) =>{
        if(res && typeof res === 'object' && 'data' in res && 'isSuccessful' in res) {
          // API response'ının tamamını gönder
          callBack(res as T);
        } else {
          callBack(res as T);
        }
      },
      error: (err:HttpErrorResponse) =>{
        // Önce mevcut error handler'ı çağır
        this.error.errorHandler(err);
        
        // SweetAlert ile hata mesajını göster (eğer isteniyorsa)
        if (showErrorAlert) {
          this.showApiError(err);
        }
        
        // Custom error callback varsa çağır
        if(errorCallBack){
          errorCallBack(err);
        }
      }
    })
  }
  // API hata mesajlarını SweetAlert ile göster
  private showApiError(error: HttpErrorResponse): void {
    let errorTitle = 'API Hatası';
    let errorMessage = 'Bilinmeyen bir hata oluştu.';

    // HTTP status koduna göre başlık belirle
    switch (error.status) {
      case 400:
        errorTitle = 'Geçersiz İstek';
        errorMessage = 'Gönderilen veri geçerli değil.';
        break;
      case 401:
        errorTitle = 'Yetkilendirme Hatası';
        errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
        break;
      case 403:
        errorTitle = 'Doğrulama Hatası';
        errorMessage = 'Gönderilen veriler doğrulama kurallarını karşılamıyor.';
        break;
      case 404:
        errorTitle = 'Bulunamadı';
        errorMessage = 'İstenen kaynak bulunamadı.';
        break;
      case 500:
        errorTitle = 'Sunucu Hatası';
        errorMessage = 'Sunucuda bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        break;
      case 0:
        errorTitle = 'Bağlantı Hatası';
        errorMessage = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
        break;
      default:
        errorTitle = `HTTP ${error.status} Hatası`;
        break;
    }

    // API'ınızın Result<T> formatından hata mesajını parse et
    if (error.error) {
      // API'ınızın Result<T>.Failure formatı kontrol et
      if (error.error.errorMessages && Array.isArray(error.error.errorMessages) && error.error.errorMessages.length > 0) {
        // ValidationException durumu - propertyName'leri göster
        if (error.status === 403) {
          errorMessage = `Doğrulama hataları: ${error.error.errorMessages.join(', ')}`;
        } else {
          errorMessage = error.error.errorMessages.join(', ');
        }
      }
      // Result<T>.Failure(message) formatı
      else if (error.error.message) {
        errorMessage = error.error.message;
      }
      // Direkt string hata mesajı
      else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }
      // Result pattern kontrolü - isSuccessful: false durumu
      else if (error.error.isSuccessful === false && error.error.data) {
        if (Array.isArray(error.error.data)) {
          errorMessage = error.error.data.join(', ');
        } else if (typeof error.error.data === 'string') {
          errorMessage = error.error.data;
        }
      }
    }

    // SweetAlert ile hatayı göster
    this.swal.showError(errorTitle, errorMessage);
  }

  getUserByIdentityNumber(identityNumber: string, callBack: (user: any) => void, errorCallBack?: (err: any) => void) {
    this.post<any>(
      'api/CompanyUsers/GetUserByIdentityNumber',
      { identityNumber },
      callBack,
      errorCallBack
    );
  }

  getCompanyUsersAll(
    filter: {
      companyId?: string;
      identityNumber?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phoneNumber?: string;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
    },
    callBack: (res: any) => void,
    errorCallBack?: (err: any) => void
  ) {
    this.post<any>(
      'api/CompanyUsers/GetAll',
      filter,
      callBack,
      errorCallBack
    );
  }

  public createHospitalUserPartition(
    data: {
      userId: string;
      partitionName: string;
      urgent: boolean;
      modality: string;
      referenceKey: string;
      partitionCode: string;
      companyCode: string;
      companyId: string;
      hospitalId: string;
    },
    callBack: (res: any) => void,
    errorCallBack?: (err: any) => void
  ) {
    console.log('HttpService - Creating Hospital User Partition:', data);
    console.log('API Endpoint: api/HospitalUserPartitions/Create');
    
    this.post<any>(
      'api/HospitalUserPartitions/Create',
      data,
      callBack,
      errorCallBack
    );
  }

  public getAllHospitalUserPartitions(
    filter: any,
    callBack: (res: any) => void,
    errorCallBack?: (err: any) => void
  ) {
    this.post<any>(
      'api/HospitalUserPartitions/GetAll',
      filter,
      callBack,
      errorCallBack
    );
  }

  // Rapor ekleme (gerçek API)
  public createReport(
    data: any,
    callBack: (res: any) => void,
    errorCallBack?: (err: any) => void
  ) {
    this.post<any>(
      'api/Reports/Create',
      data,
      callBack,
      errorCallBack
    );
  }

  public createCompanyHospitalPartition(
    data: {
      partitionId?: string;
      companyId: string;
      hospitalId: string;
      partitionName: string;
      isActive: boolean;
      createdAt?: string;
      updatedAt?: string;
      urgent: boolean;
      modality: string;
      referenceKey: string;
      partitionCode: string;
      companyCode: string;
      isDeleted: boolean;
    },
    callBack: (res: any) => void,
    errorCallBack?: (err: any) => void
  ) {
    this.post<any>(
      'api/Partitions/CreateCompanyHospitalPartition',
      data,
      callBack,
      errorCallBack
    );
  }

  public getAllCompanyHospitalPartitions(
    filter: any,
    callBack: (res: any) => void,
    errorCallBack?: (err: any) => void
  ) {
    this.post<any>(
      'api/Partitions/GetAllCompanyHospitalParttion', // DİKKAT: API yolu düzeltildi (Parttion)
      filter,
      callBack,
      errorCallBack
    );
  }

  public deleteCompanyHospitalPartition(
    partitionId: string,
    callBack: (res: any) => void,
    errorCallBack?: (err: any) => void
  ) {
    this.post<any>(
      'api/Partitions/DeleteCompanyHospitalParttion', // DİKKAT: API yolu düzeltildi (Parttion)
      { partitionId },
      callBack,
      errorCallBack
    );
  }

  public updateCompanyHospitalPartition(
    partition: any,
    callBack: (res: any) => void,
    errorCallBack?: (err: any) => void
  ) {
    this.post<any>(
      'api/Partitions/UpdataCompanyHospitalParttion', // DİKKAT: API yolu düzeltildi (Updata...Parttion)
      partition,
      callBack,
      errorCallBack
    );
  }
}