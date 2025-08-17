import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { environment } from 'environments/environment.development';

@Component({
    selector     : 'auth-sign-up',
    templateUrl  : './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthSignUpComponent implements OnInit
{
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    signUpForm: UntypedFormGroup;
    showAlert: boolean = false;    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _httpClient: HttpClient
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {        // Create the form
        this.signUpForm = this._formBuilder.group({
                firstName     : ['', Validators.required],
                lastName      : ['', Validators.required], 
                identityNumber: ['', [Validators.required, Validators.minLength(11), Validators.maxLength(11)]],
                phone         : ['', Validators.required],
                email         : ['', [Validators.required, Validators.email]],
                interestArea  : [null, Validators.required],
                agreements    : ['', Validators.requiredTrue]
            }
        );
    }    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Telefon input formatlaması
     */
    onPhoneInput(event: any): void 
    {
        let value = event.target.value.replace(/\D/g, ''); // Sadece rakamları al
        
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        
        this.signUpForm.get('phone').setValue(value);
    }

    /**
     * TC Kimlik Numarası input formatlaması
     */
    onIdentityNumberInput(event: any): void 
    {
        let value = event.target.value.replace(/\D/g, ''); // Sadece rakamları al
        
        if (value.length > 11) {
            value = value.substring(0, 11);
        }
        
        this.signUpForm.get('identityNumber').setValue(value);
    }

    /**
     * Sign up
     */
    signUp(): void
    {
        // Do nothing if the form is invalid
        if ( this.signUpForm.invalid )
        {
            return;
        }        // API formatında veri hazırla
        const apiData = {
            firstName: this.signUpForm.get('firstName')?.value,
            lastName: this.signUpForm.get('lastName')?.value,
            identityNumber: this.signUpForm.get('identityNumber')?.value,
            phone: '0' + this.signUpForm.get('phone')?.value,
            email: this.signUpForm.get('email')?.value,
            areaOfInterest: this.signUpForm.get('interestArea')?.value
        };

        // Form verilerini konsola yazdır (debug için)
        console.log('API Data:', apiData);

        // Disable the form
        this.signUpForm.disable();

        // Hide the alert
        this.showAlert = false;        // API'ye POST isteği gönder
        this._httpClient.post(`${environment.apiUrl}/api/Members/Create`, apiData)
            .subscribe(
                (response) => {
                    console.log('API Response:', response);
                    
                    // Success alert
                    this.alert = {
                        type   : 'success',
                        message: 'Hesabınız başarıyla oluşturuldu!'
                    };
                    this.showAlert = true;

                    // Re-enable the form
                    this.signUpForm.enable();

                    // Reset the form after success
                    setTimeout(() => {
                        this.signUpNgForm.resetForm();
                        this.showAlert = false;
                    }, 3000);
                },
                (error) => {
                    console.error('API Error:', error);
                    
                    // Re-enable the form
                    this.signUpForm.enable();                    // Set error alert
                    this.alert = {
                        type   : 'error',
                        message: error.error?.message || 'Kayıt işlemi başarısız, lütfen tekrar deneyin.'
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }

    goToSignIn(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this._router.navigate(['sign-in']);
    }

    goBack(): void {
        window.history.back();
    }
}
