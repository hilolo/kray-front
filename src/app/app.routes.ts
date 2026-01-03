import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { LockedComponent } from './locked/locked.component';
import { HeroiconExampleComponent } from './shared/components/icon/heroicon-example.component';
import { AiChatComponent } from './ai-chat/ai-chat.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { CollaborationComponent } from './collaboration/collaboration.component';
import { authGuard } from './shared/guards/auth.guard';
import { loginGuard } from './shared/guards/login.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'accept-invitation',
    loadComponent: () => import('./accept-invitation/accept-invitation.component').then((m) => m.AcceptInvitationComponent),
  },
  {
    path: 'locked',
    component: LockedComponent,
  },
  {
    path: 'heroicons',
    component: HeroiconExampleComponent,
    canActivate: [authGuard],
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule),
    canActivate: [authGuard],
  },
  {
    path: 'contact',
    loadChildren: () => import('./contact/contact.module').then((m) => m.ContactModule),
    canActivate: [authGuard],
  },
  {
    path: 'property/detail/:id/public',
    loadComponent: () => import('./property/public/public-property.component').then((m) => m.PublicPropertyComponent),
    // No auth guard - public route
  },
  {
    path: 'property',
    loadChildren: () => import('./property/property.module').then((m) => m.PropertyModule),
    canActivate: [authGuard],
  },
  {
    path: 'keys',
    loadChildren: () => import('./keys/keys.routes').then((m) => m.keysRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'ai-chat',
    component: AiChatComponent,
    canActivate: [authGuard],
  },
  {
    path: 'file-manager',
    component: FileManagerComponent,
    canActivate: [authGuard],
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent,
    canActivate: [authGuard],
  },
  {
    path: 'collaboration',
    component: CollaborationComponent,
    canActivate: [authGuard],
  },
  {
    path: 'collaboration/detail/:id',
    loadComponent: () => import('./collaboration/detail/collaboration-detail.component').then((m) => m.CollaborationDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tasks',
    loadChildren: () => import('./tasks/tasks.routes').then((m) => m.tasksRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'leasing',
    loadChildren: () => import('./leasing/leasing.routes').then((m) => m.leasingRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'building',
    loadChildren: () => import('./building/building.routes').then((m) => m.buildingRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'bank',
    loadChildren: () => import('./bank/bank.routes').then((m) => m.bankRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'reservation',
    loadChildren: () => import('./reservation/reservation.routes').then((m) => m.reservationRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'transaction',
    loadChildren: () => import('./transaction/transaction.routes').then((m) => m.transactionRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'document',
    loadChildren: () => import('./document/document.routes').then((m) => m.documentRoutes),
    canActivate: [authGuard],
  },
];
