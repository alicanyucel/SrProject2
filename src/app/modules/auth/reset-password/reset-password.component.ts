import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { fuseAnimations } from '@fuse/animations';
import { FuseValidators } from '@fuse/validators';
import { FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
    selector     : 'auth-reset-password',
    templateUrl  : './reset-password.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class AuthResetPasswordComponent implements OnInit
{
    @ViewChild('resetPasswordNgForm') resetPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type   : 'success',
        message: ''
    };
    resetPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;
    passwordFieldType: string = 'password';
    confirmPasswordFieldType: string = 'password';

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private http: HttpClient
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
    {
        // Create the form
        this.resetPasswordForm = this._formBuilder.group({
                email            : ['', [Validators.required, Validators.email]],
                password          : ['', [Validators.required, Validators.minLength(6)]],
                token             : ['', Validators.required]
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Reset password
     */
    resetPassword(): void
    {
        // Return if the form is invalid
        if ( this.resetPasswordForm.invalid )
        {
            this.showAlert = true;
            this.alert = { type: 'error', message: 'Lütfen tüm alanları doğru şekilde doldurunuz.' };
            return;
        }

        // Disable the form
        this.resetPasswordForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Prepare the payload
        const payload = {
            email       : this.resetPasswordForm.get('email').value,
            token        : this.resetPasswordForm.get('token').value,
            newPassword  : this.resetPasswordForm.get('password').value
        };

        // Send the request to the server
        const apiUrl = 'https://localhost:7054/api/Account/ResetPassword';
        this.http.post(apiUrl, payload).pipe(
            finalize(() => {

                // Re-enable the form
                this.resetPasswordForm.enable();

                // Reset the form
                this.resetPasswordNgForm.resetForm();

                // Show the alert
                this.showAlert = true;
            })
        ).subscribe(
            (response) => {

                // Set the alert
                this.alert = {
                    type   : 'success',
                    message: 'Şifreniz başarıyla sıfırlandı.'
                };
            },
            (error) => {

                // Set the alert
                this.alert = {
                    type   : 'error',
                    message: 'Bir hata oluştu. Lütfen tekrar deneyin.'
                };
            }
        );
    }

    togglePasswordVisibility(): void {
        this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
    }

    toggleConfirmPasswordVisibility(): void {
        this.confirmPasswordFieldType = this.confirmPasswordFieldType === 'password' ? 'text' : 'password';
    }
}
