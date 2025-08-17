import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [    // Redirect empty path to '/users'
    {path: '', pathMatch : 'full', redirectTo: 'users'},

    // Redirect signed-in user to the '/users'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'users'},

    // Auth routes for guests
    {
        path: '',
        canMatch: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule)},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule)},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule)},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule)},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
        ]
    },    // Auth routes for authenticated users
    {
        path: '',
        canMatch: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule)},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule)},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
        ]
    },    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule)},
            {path: 'register', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule)}
        ]
    },

    // Admin routes
    {
        path: '',
        canMatch: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver,
        },        children: [
            {path: 'example', loadChildren: () => import('app/modules/admin/example/example.module').then(m => m.ExampleModule)},
            {path: 'dashboard', loadChildren: () => import('app/modules/admin/home/home.module').then(m => m.HomeModule)},
            {path: 'users', loadChildren: () => import('app/modules/admin/users/users.module').then(m => m.UsersModule)},
            {path: 'companies', loadChildren: () => import('app/modules/admin/companies/companies.module').then(m => m.CompaniesModule)},
            {path: 'hospitals', loadChildren: () => import('app/modules/admin/hospitals/hospitals.module').then(m => m.HospitalsModule)},
            {path: 'doctor-signatures', loadChildren: () => import('app/modules/admin/doctor-signatures/doctor-signatures.module').then(m => m.DoctorSignaturesModule)},
            {path: 'roles', loadChildren: () => import('app/modules/admin/roles/roles.module').then(m => m.RolesModule)},
            {path: 'member-applications', loadChildren: () => import('app/modules/admin/member-applications/member-applications.module').then(m => m.MemberApplicationsModule)},
            {path: 'report-types', loadChildren: () => import('app/modules/admin/report-types/report-types.module').then(m => m.AdminReportTypesModule)},
            {path: 'templates', loadChildren: () => import('app/modules/templates/templates.module').then(m => m.TemplatesModule)}
        ]
    }
];
