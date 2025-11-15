import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { HeroiconExampleComponent } from './shared/components/icon/heroicon-example.component';
import { AiChatComponent } from './ai-chat/ai-chat.component';
import { FileManagerComponent } from './file-manager/file-manager.component';
import { TasksComponent } from './tasks/tasks.component';
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
    path: 'property',
    loadChildren: () => import('./property/property.module').then((m) => m.PropertyModule),
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
    path: 'tasks',
    component: TasksComponent,
    canActivate: [authGuard],
  },
];
