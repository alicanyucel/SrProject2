import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type FuseAlertType = 'primary' | 'accent' | 'warn' | 'basic' | 'info' | 'success' | 'warning' | 'error';

export interface FuseAlertData {
    id: string;
    type: FuseAlertType;
    message: string;
    timestamp: number;
}

@Injectable({
    providedIn: 'root'
})
export class GlobalFuseAlertService {
    private alertSubject = new BehaviorSubject<FuseAlertData | null>(null);
    alert$ = this.alertSubject.asObservable();
    private currentAlert: FuseAlertData | null = null;

    showAlert(type: FuseAlertType, message: string, autoDismiss: boolean = true) {
        // Her alert için benzersiz ID ve timestamp oluştur
        const alertData: FuseAlertData = {
            id: this.generateId(),
            type,
            message,
            timestamp: Date.now()
        };

        console.log('GlobalFuseAlertService - Showing alert:', alertData);
        
        this.currentAlert = alertData;
        this.alertSubject.next(alertData);

        // Auto-dismiss özelliği
        if (autoDismiss) {
            setTimeout(() => {
                if (this.currentAlert?.id === alertData.id) {
                    this.clearAlert();
                }
            }, 5000); // 5 saniye sonra otomatik kapat
        }
    }

    clearAlert() {
        console.log('GlobalFuseAlertService - Clearing alert');
        this.currentAlert = null;
        this.alertSubject.next(null);
    }

    getCurrentAlert(): FuseAlertData | null {
        return this.currentAlert;
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }
}
