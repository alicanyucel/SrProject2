import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            emailOrUserName: ['', [Validators.required]],
            password: ['admin', Validators.required],
            rememberMe: ['']
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;        // Backend'in beklediği şekilde credentials objesi oluştur
        const credentials = {
            userNameOrEmail: this.signInForm.value.emailOrUserName,
            password: this.signInForm.value.password
        };

        // Sign in
        this._authService.signIn(credentials)
            .subscribe({
                next: () => {
                    const redirectURL = this._activatedRoute.snapshot.queryParamMap.get('redirectURL') || '/signed-in-redirect';

                    this._router.navigateByUrl(redirectURL);

                },
                error: (response) => {
                    this.signInForm.enable();
                    this.signInNgForm.resetForm();

                    let message = 'Wrong email or password';
                    // Eğer backend response'u errorMessages içeriyorsa onu göster
                    if (response?.error?.errorMessages && Array.isArray(response.error.errorMessages) && response.error.errorMessages.length > 0) {
                        message = response.error.errorMessages[0];
                    } else if (response.status === 0) {
                        message = 'Sunucuya ulaşılamıyor. Lütfen bağlantınızı ve sunucu durumunu kontrol edin.';
                    } else if (response.status >= 500) {
                        message = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
                    } else if (response.status !== 401 && response.status !== 403) {
                        message = 'Beklenmeyen bir hata oluştu.';
                    }

                    this.alert = {
                        type: 'error',
                        message
                    };

                    this.showAlert = true;
                }
            });
    }
}
