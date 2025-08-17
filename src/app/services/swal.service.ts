import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SwalService {

  constructor() { }

  callToast(title: string, icon: SweetAlertIcon = "success", timer: number = 3000) {
    // Eğer title bir object ise kullanıcı dostu stringe çevir
    if (typeof title === 'object' && title !== null) {
      if (title && 'name' in title && 'value' in title) {
        if (typeof (title as any).toString === 'function' && (title as any).toString !== Object.prototype.toString) {
          title = (title as any).toString();
        } else {
          title = `${(title as any).name} (${(title as any).value})`;
        }
      } else if (Array.isArray(title) && title !== null) {
        title = (title as any[]).map(item => typeof item === 'object' && item !== null && 'name' in item && 'value' in item
          ? (typeof item.toString === 'function' && item.toString !== Object.prototype.toString ? item.toString() : `${item.name} (${item.value})`)
          : JSON.stringify(item)).join(', ');
      } else if (typeof (title as any).toString === 'function' && (title as any).toString !== Object.prototype.toString) {
        title = (title as any).toString();
      } else {
        title = JSON.stringify(title, null, 2);
      }
    }
    Swal.fire({
      title: title,
      text: "",
      timer: timer,
      showConfirmButton: false,
      toast: true,
      position: "top-right",
      icon: icon,
      timerProgressBar: true,
      showCloseButton: true,
      customClass: {
        popup: 'custom-toast-popup',
        title: 'custom-toast-title',
        icon: 'custom-toast-icon',
        timerProgressBar: 'custom-toast-progress'
      },
      background: '#ffffff',
      color: '#374151',
      iconColor: this.getIconColor(icon),
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
      }
    })
  }
  callSwal(
    title: string, 
    text: string, 
    callBack: () => void, 
    confirmButtonText: string = "Sil", 
    icon: SweetAlertIcon = "question",
    showCancelButton: boolean = true
  ) {
    Swal.fire({
      title: title,
      text: text,
      showConfirmButton: true,
      showCancelButton: showCancelButton,
      confirmButtonText: confirmButtonText,
      cancelButtonText: "Vazgeç",
      icon: icon,
      reverseButtons: true,
      focusCancel: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-text',
        confirmButton: this.getConfirmButtonClass(icon),
        cancelButton: 'custom-swal-cancel-button',
        icon: 'custom-swal-icon'
      },
      buttonsStyling: false,
      background: '#ffffff',
      color: '#374151',
      iconColor: this.getIconColor(icon)
    }).then(res => {
      if (res.isConfirmed) {
        callBack();
      }
      // res.isDismissed will be true for cancel, outside click, or ESC key
    })
  }

  // Başarı mesajı için özel method
  showSuccess(title: string, text?: string, timer: number = 2000) {
    Swal.fire({
      title: title,
      text: text || "",
      icon: 'success',
      timer: timer,
      showConfirmButton: false,
      customClass: {
        popup: 'custom-success-popup',
        title: 'custom-success-title',
        icon: 'custom-success-icon'
      },
      background: '#ffffff',
      color: '#065f46',
      iconColor: '#10b981'
    });
  }

  // Hata mesajı için özel method
  showError(title: string, text?: string) {
    // Eğer text bir object ise kullanıcı dostu stringe çevir
    if (typeof text === 'object' && text !== null) {
      // SmartEnum veya benzeri ise name ve value göster
      if (text && 'name' in text && 'value' in text) {
        // Eğer toString metodu varsa onu kullan
        if (typeof (text as any).toString === 'function' && (text as any).toString !== Object.prototype.toString) {
          text = (text as any).toString();
        } else {
          text = `${(text as any).name} (${(text as any).value})`;
        }
      } else if (Array.isArray(text) && text !== null) {
        text = (text as any[]).map(item => typeof item === 'object' && item !== null && 'name' in item && 'value' in item
          ? (typeof item.toString === 'function' && item.toString !== Object.prototype.toString ? item.toString() : `${item.name} (${item.value})`)
          : JSON.stringify(item)).join(', ');
      } else if (typeof (text as any).toString === 'function' && (text as any).toString !== Object.prototype.toString) {
        text = (text as any).toString();
      } else {
        text = JSON.stringify(text, null, 2);
      }
    }
    Swal.fire({
      title: title,
      text: text || "",
      icon: 'error',
      confirmButtonText: 'Tamam',
      customClass: {
        popup: 'custom-error-popup',
        title: 'custom-error-title',
        confirmButton: 'custom-error-button',
        icon: 'custom-error-icon'
      },
      buttonsStyling: false,
      background: '#ffffff',
      color: '#991b1b',
      iconColor: '#ef4444'
    });
  }  // Uyarı mesajı için özel method
  showWarning(title: string, text: string, callback?: () => void) {
    console.log('ShowWarning called:', title);
    
    Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Devam Et',
      cancelButtonText: 'Vazgeç',
      reverseButtons: true,
      focusCancel: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      customClass: {
        popup: 'custom-warning-popup',
        title: 'custom-warning-title',
        confirmButton: 'custom-warning-button',
        cancelButton: 'custom-swal-cancel-button',
        icon: 'custom-warning-icon'
      },
      buttonsStyling: false,
      background: '#ffffff',
      color: '#92400e',
      iconColor: '#f59e0b'
    }).then(res => {
      console.log('SweetAlert result:', res);
      
      if (res.isConfirmed) {
        console.log('User confirmed');
        if (callback) {
          callback();
        }
      } else if (res.isDismissed) {
        console.log('User cancelled or dismissed');
      }
    });
  }

  // Yükleme spinner'ı göster
  showLoading(title: string = 'İşlem devam ediyor...') {
    Swal.fire({
      title: title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      customClass: {
        popup: 'custom-loading-popup'
      },
      didOpen: () => {
        Swal.showLoading(null);
      }
    });
  }

  // Loading'i kapat
  hideLoading() {
    Swal.close();
  }

  private getIconColor(icon: SweetAlertIcon): string {
    switch (icon) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'question': return '#8b5cf6';
      default: return '#6b7280';
    }
  }

  private getConfirmButtonClass(icon: SweetAlertIcon): string {
    switch (icon) {
      case 'error':
      case 'warning': return 'custom-swal-danger-button';
      case 'success': return 'custom-swal-success-button';
      case 'info': return 'custom-swal-info-button';
      default: return 'custom-swal-confirm-button';
    }
  }
}

export type SweetAlertIcon = 'success' | 'error' | 'warning' | 'info' | 'question'