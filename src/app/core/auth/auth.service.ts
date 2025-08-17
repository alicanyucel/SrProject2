import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap, throwError } from 'rxjs';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment.development';

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { userNameOrEmail: string; password: string }): Observable<any>
    {
    if (this._authenticated) {
        return throwError(() => new Error('User is already logged in.'));
    }

    return this._httpClient.post(`${environment.apiUrl}/api/Auth/Login`, credentials).pipe(
    switchMap((response: any) => {
        const token = response.data?.token;
        this.accessToken = token;
        this._authenticated = true;

        // JWT'den kullanıcı bilgilerini çek
        const payload = AuthUtils['_decodeToken'](token);
        
        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        const userWithRole = {
            id: payload.Id,
            name: payload.Name,
            email: payload.Email,
            userName: payload.UserName,
            roles: role ? [role] : [],
            status: 'online'
        };
        this._userService.user = userWithRole;
        return of(response);
    })
);
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
    const token = this.accessToken;
    if (!token) {
        return throwError(() => new Error('No token found'));
    }
    const payload = AuthUtils['_decodeToken'](token);
    const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const userWithRole = {
        id: payload.Id,
        name: payload.Name,
        email: payload.Email,
        userName: payload.UserName,
        roles: role ? [role] : [],
        status: 'active'
    };
    this._userService.user = userWithRole;
    return of(userWithRole);
}

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
