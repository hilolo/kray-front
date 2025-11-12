import { Component, computed, signal, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ZardPageComponent } from '@shared/components/page/page.component';
import { ZardFormFieldComponent, ZardFormControlComponent, ZardFormLabelComponent } from '@shared/components/form/form.component';
import { ZardInputDirective } from '@shared/components/input/input.directive';
import { ZardInputGroupComponent } from '@shared/components/input-group/input-group.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';
import { ZardCardComponent } from '@shared/components/card/card.component';
import { ZardSelectComponent } from '@shared/components/select/select.component';
import { ZardSelectItemComponent } from '@shared/components/select/select-item.component';
import { ZardAvatarComponent } from '@shared/components/avatar/avatar.component';
import { ZardBadgeComponent } from '@shared/components/badge/badge.component';

type SettingsSection = 'account' | 'security' | 'plan-billing' | 'team' | 'application';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'User';
  permissions: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    FormsModule,
    ZardPageComponent,
    ZardFormFieldComponent,
    ZardFormControlComponent,
    ZardFormLabelComponent,
    ZardInputDirective,
    ZardInputGroupComponent,
    ZardButtonComponent,
    ZardIconComponent,
    ZardCardComponent,
    ZardSelectComponent,
    ZardSelectItemComponent,
    ZardAvatarComponent,
    ZardBadgeComponent,
  ],
  template: `
    <z-page zTitle="Settings">
      <div class="p-6">
        <div class="flex gap-4">
          <!-- Settings Navigation -->
          <div class="w-64 flex-shrink-0">
            <h2 class="text-lg font-semibold mb-4">Settings</h2>
            <div class="space-y-0.5">
              <button
                type="button"
                (click)="activeSection.set('account')"
                [class]="activeSection() === 'account' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left"
              >
                <z-icon zType="user" zSize="default" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">Account</div>
                  <div class="text-xs opacity-80 line-clamp-2">Manage your public profile and private information</div>
                </div>
              </button>

              <button
                type="button"
                (click)="activeSection.set('security')"
                [class]="activeSection() === 'security' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left"
              >
                <z-icon zType="lock" zSize="default" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">Security</div>
                  <div class="text-xs opacity-80 line-clamp-2">Manage your password and 2-step verification preferences</div>
                </div>
              </button>

              <button
                type="button"
                (click)="activeSection.set('plan-billing')"
                [class]="activeSection() === 'plan-billing' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left"
              >
                <z-icon zType="credit-card" zSize="default" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">Plan & Billing</div>
                  <div class="text-xs opacity-80 line-clamp-2">Manage your subscription plan, payment method and billing information</div>
                </div>
              </button>

              <button
                type="button"
                (click)="activeSection.set('team')"
                [class]="activeSection() === 'team' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left"
              >
                <z-icon zType="users" zSize="default" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">Team</div>
                  <div class="text-xs opacity-80 line-clamp-2">Manage your existing team and change roles/permissions</div>
                </div>
              </button>

              <button
                type="button"
                (click)="activeSection.set('application')"
                [class]="activeSection() === 'application' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors text-left"
              >
                <z-icon zType="settings" zSize="default" />
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium truncate">Application</div>
                  <div class="text-xs opacity-80 line-clamp-2">Configure default settings for your application</div>
                </div>
              </button>
            </div>
          </div>

          <!-- Settings Content -->
          <div class="flex-1">
        <!-- Icon Templates -->
        <ng-template #userIconTemplate>
          <z-icon zType="user" zSize="sm" class="text-muted-foreground" />
        </ng-template>
        <ng-template #phoneIconTemplate>
          <z-icon zType="smartphone" zSize="sm" class="text-muted-foreground" />
        </ng-template>
        <ng-template #buildingIconTemplate>
          <z-icon zType="building" zSize="sm" class="text-muted-foreground" />
        </ng-template>
        <ng-template #building2IconTemplate>
          <z-icon zType="building-2" zSize="sm" class="text-muted-foreground" />
        </ng-template>
        <ng-template #mapPinIconTemplate>
          <z-icon zType="map-pin" zSize="sm" class="text-muted-foreground" />
        </ng-template>
        <ng-template #globeIconTemplate>
          <z-icon zType="globe" zSize="sm" class="text-muted-foreground" />
        </ng-template>
        <ng-template #lockIconTemplate>
          <z-icon zType="lock" zSize="sm" class="text-muted-foreground" />
        </ng-template>

        @switch (activeSection()) {
          @case ('account') {
            <div class="space-y-8">
              <h1 class="text-3xl font-bold">Account</h1>

              <!-- User Information -->
              <z-card zTitle="User Information" zDescription="Manage your personal profile information">
                <div class="flex gap-6">
                  <!-- Profile Picture -->
                  <div class="flex-shrink-0">
                    <div class="relative">
                      <div class="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-semibold">
                        {{ userInfo.fullName ? userInfo.fullName.charAt(0).toUpperCase() : 'U' }}
                      </div>
                      <button
                        type="button"
                        class="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors"
                      >
                        <z-icon zType="camera" zSize="sm" />
                      </button>
                    </div>
                  </div>

                  <!-- Form Fields -->
                  <div class="flex-1 space-y-4">
                    <z-form-field>
                      <z-form-label zRequired>Full name</z-form-label>
                      <z-form-control>
                        <z-input-group [zPrefix]="userIconTemplate">
                          <input z-input type="text" [(ngModel)]="userInfo.fullName" name="fullName" placeholder="Enter your full name" class="w-full" />
                        </z-input-group>
                      </z-form-control>
                    </z-form-field>

                    <z-form-field>
                      <z-form-label>Phone</z-form-label>
                      <z-form-control>
                        <z-input-group [zPrefix]="phoneIconTemplate">
                          <input z-input type="tel" [(ngModel)]="userInfo.phone" name="phone" placeholder="Enter your phone number" class="w-full" />
                        </z-input-group>
                      </z-form-control>
                    </z-form-field>

                    <!-- Action Buttons -->
                    <div class="flex gap-3 justify-end pt-2">
                      <z-button zType="outline" (click)="onCancel()">Cancel</z-button>
                      <z-button zType="default" (click)="onSaveUserInfo()">Save User Info</z-button>
                    </div>
                  </div>
                </div>
              </z-card>

              <!-- Company Information -->
              <z-card zTitle="Company Information" zDescription="Company details are managed by administrators and cannot be modified here">
                <div class="flex gap-6">
                  <!-- Company Logo -->
                  <div class="flex-shrink-0">
                    <div class="w-40 h-40 border border-border rounded-lg flex items-center justify-center bg-muted">
                      <z-icon zType="file" zSize="lg" class="text-muted-foreground" />
                    </div>
                  </div>

                  <!-- Read-only Fields -->
                  <div class="flex-1 min-w-0">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <z-form-field>
                        <z-form-label>Company Name</z-form-label>
                        <z-form-control>
                          <z-input-group [zPrefix]="buildingIconTemplate">
                            <input z-input type="text" [value]="companyInfo.name" disabled class="w-full truncate" />
                          </z-input-group>
                        </z-form-control>
                      </z-form-field>

                      <z-form-field>
                        <z-form-label>Address</z-form-label>
                        <z-form-control>
                          <z-input-group [zPrefix]="mapPinIconTemplate">
                            <input z-input type="text" [value]="companyInfo.address" disabled class="w-full truncate" />
                          </z-input-group>
                        </z-form-control>
                      </z-form-field>

                      <z-form-field>
                        <z-form-label>City</z-form-label>
                        <z-form-control>
                          <z-input-group [zPrefix]="building2IconTemplate">
                            <input z-input type="text" [value]="companyInfo.city" disabled class="w-full truncate" />
                          </z-input-group>
                        </z-form-control>
                      </z-form-field>

                      <z-form-field>
                        <z-form-label>Phone</z-form-label>
                        <z-form-control>
                          <z-input-group [zPrefix]="phoneIconTemplate">
                            <input z-input type="tel" [value]="companyInfo.phone" disabled class="w-full truncate" />
                          </z-input-group>
                        </z-form-control>
                      </z-form-field>

                      <z-form-field>
                        <z-form-label>Website</z-form-label>
                        <z-form-control>
                          <z-input-group [zPrefix]="globeIconTemplate">
                            <input z-input type="url" [value]="companyInfo.website" disabled class="w-full truncate" />
                          </z-input-group>
                        </z-form-control>
                      </z-form-field>

                      <z-form-field>
                        <z-form-label>RC (Registration Number)</z-form-label>
                        <z-form-control>
                          <input z-input type="text" [value]="companyInfo.rc" disabled class="w-full truncate" />
                        </z-form-control>
                      </z-form-field>

                      <z-form-field>
                        <z-form-label>ICE (Tax ID)</z-form-label>
                        <z-form-control>
                          <input z-input type="text" [value]="companyInfo.ice" disabled class="w-full truncate" />
                        </z-form-control>
                      </z-form-field>
                    </div>
                  </div>
                </div>
              </z-card>
            </div>
          }

          @case ('security') {
            <div class="space-y-8">
              <h1 class="text-3xl font-bold">Security</h1>

              <z-card zTitle="Change your password" zDescription="You can only change your password twice within 24 hours!">
                <div class="space-y-6">
                  <z-form-field>
                    <z-form-label zRequired>Current password</z-form-label>
                    <z-form-control>
                      <z-input-group [zPrefix]="lockIconTemplate">
                        <div class="relative w-full">
                          <input
                            z-input
                            [type]="showCurrentPassword() ? 'text' : 'password'"
                            [(ngModel)]="passwordForm.currentPassword"
                            name="currentPassword"
                            placeholder="Enter your current password"
                            class="w-full pr-10"
                          />
                          <button
                            type="button"
                            (click)="toggleCurrentPassword()"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            @if (showCurrentPassword()) {
                              <z-icon zType="eye-off" zSize="sm" />
                            } @else {
                              <z-icon zType="eye" zSize="sm" />
                            }
                          </button>
                        </div>
                      </z-input-group>
                    </z-form-control>
                  </z-form-field>

                  <z-form-field>
                    <z-form-label zRequired>New password</z-form-label>
                    <z-form-control helpText="Minimum 8 characters. Must include numbers, letters and special characters.">
                      <z-input-group [zPrefix]="lockIconTemplate">
                        <div class="relative w-full">
                          <input
                            z-input
                            [type]="showNewPassword() ? 'text' : 'password'"
                            [(ngModel)]="passwordForm.newPassword"
                            name="newPassword"
                            placeholder="Enter your new password"
                            class="w-full pr-10"
                          />
                          <button
                            type="button"
                            (click)="toggleNewPassword()"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            @if (showNewPassword()) {
                              <z-icon zType="eye-off" zSize="sm" />
                            } @else {
                              <z-icon zType="eye" zSize="sm" />
                            }
                          </button>
                        </div>
                      </z-input-group>
                    </z-form-control>
                  </z-form-field>

                  <div class="flex gap-3 justify-center">
                    <z-button zType="outline" (click)="onCancel()">Cancel</z-button>
                    <z-button zType="default" (click)="onSavePassword()" [attr.disabled]="!isPasswordFormValid() ? '' : null">Save</z-button>
                  </div>
                </div>
              </z-card>
            </div>
          }

          @case ('team') {
            <div class="space-y-8">
              <div>
                <h1 class="text-3xl font-bold">Team</h1>
                <h2 class="text-xl font-semibold mt-2">Team Members</h2>
                <p class="text-muted-foreground mt-1">Manage your team members and their permissions</p>
              </div>

              <div class="space-y-4">
                @for (member of teamMembers(); track member.id) {
                  <div class="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div class="flex items-center gap-4">
                      <z-avatar zSize="lg" zType="default" [zImage]="{ fallback: member.name.charAt(0).toUpperCase() || 'U' }" />
                      <div>
                        <div class="font-semibold">{{ member.name || 'No name' }}</div>
                        <div class="text-sm text-muted-foreground">{{ member.email }}</div>
                        <div class="flex items-center gap-2 mt-1">
                          <z-icon zType="circle-x" zSize="sm" class="text-muted-foreground" />
                          <span class="text-xs text-muted-foreground">{{ member.permissions }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <z-badge [zType]="member.role === 'Administrator' ? 'destructive' : 'default'">{{ member.role }}</z-badge>
                      <button type="button" class="p-2 hover:bg-accent rounded-lg transition-colors">
                        <z-icon zType="pencil" zSize="sm" class="text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          @case ('application') {
            <div class="space-y-8">
              <h1 class="text-3xl font-bold">Application</h1>

              <!-- Property Settings -->
              <z-card zTitle="Property">
                <!-- Default City -->
                <div class="mb-8">
                  <h3 class="text-xl font-semibold mb-2">Ville par Défaut</h3>
                  <p class="text-sm text-muted-foreground mb-4">Définir la ville par défaut pour les nouvelles propriétés</p>
                  <z-form-field>
                    <z-form-label zRequired>Ville par Défaut*</z-form-label>
                    <z-form-control>
                      <z-select zPlaceholder="Select a city" [zValue]="propertySettings.defaultCity" (zSelectionChange)="propertySettings.defaultCity = $event">
                        <z-select-item zValue="tanger">Tanger</z-select-item>
                        <z-select-item zValue="casablanca">Casablanca</z-select-item>
                        <z-select-item zValue="rabat">Rabat</z-select-item>
                      </z-select>
                    </z-form-control>
                  </z-form-field>
                </div>

                <!-- Categories and References -->
                <div>
                  <h3 class="text-xl font-semibold mb-2">Catégories et Références</h3>
                  <p class="text-sm text-muted-foreground mb-4">Gérer les catégories de propriétés et leurs termes de référence</p>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <!-- Location Card -->
                    <z-card zTitle="Location" zDescription="Location references" class="p-4">
                      <z-form-field>
                        <z-form-label zRequired>Reference*</z-form-label>
                        <z-form-control>
                          <input z-input type="text" [(ngModel)]="propertySettings.locationRef" name="locationRef" class="w-full" />
                        </z-form-control>
                      </z-form-field>
                    </z-card>

                    <!-- Vente Card -->
                    <z-card zTitle="Vente" zDescription="Sale references" class="p-4">
                      <z-form-field>
                        <z-form-label zRequired>Reference*</z-form-label>
                        <z-form-control>
                          <input z-input type="text" [(ngModel)]="propertySettings.saleRef" name="saleRef" class="w-full" />
                        </z-form-control>
                      </z-form-field>
                    </z-card>

                    <!-- Vacance Card -->
                    <z-card zTitle="Vacance" zDescription="Vacation references" class="p-4">
                      <z-form-field>
                        <z-form-label zRequired>Reference*</z-form-label>
                        <z-form-control>
                          <input z-input type="text" [(ngModel)]="propertySettings.vacationRef" name="vacationRef" class="w-full" />
                        </z-form-control>
                      </z-form-field>
                    </z-card>
                  </div>
                </div>
              </z-card>
            </div>
          }

          @case ('plan-billing') {
            <div class="space-y-8">
              <h1 class="text-3xl font-bold">Plan & Billing</h1>
              <p class="text-muted-foreground">Manage your subscription plan, payment method and billing information</p>
            </div>
          }
        }
          </div>
        </div>
      </div>
    </z-page>
  `,
})
export class SettingsComponent {
  activeSection = signal<SettingsSection>('account');

  // Icon templates for input groups
  userIconTemplate = viewChild.required<TemplateRef<void>>('userIconTemplate');
  phoneIconTemplate = viewChild.required<TemplateRef<void>>('phoneIconTemplate');
  buildingIconTemplate = viewChild.required<TemplateRef<void>>('buildingIconTemplate');
  building2IconTemplate = viewChild.required<TemplateRef<void>>('building2IconTemplate');
  mapPinIconTemplate = viewChild.required<TemplateRef<void>>('mapPinIconTemplate');
  globeIconTemplate = viewChild.required<TemplateRef<void>>('globeIconTemplate');
  lockIconTemplate = viewChild.required<TemplateRef<void>>('lockIconTemplate');

  // User Information
  userInfo = {
    fullName: '',
    phone: '',
  };

  // Company Information (read-only)
  companyInfo = {
    name: 'IMMOSYNCPRO',
    address: 'bassatine',
    city: 'tanger',
    phone: '0605934495',
    website: 'www.immoyncpro.com',
    rc: '43 43 43 43',
    ice: '51250111',
  };

  // Password Form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
  };
  showCurrentPassword = signal(false);
  showNewPassword = signal(false);

  // Team Members
  teamMembers = signal<TeamMember[]>([
    {
      id: '1',
      name: 'No name',
      email: 'admin@admin.com',
      role: 'Administrator',
      permissions: 'No permissions set.',
    },
    {
      id: '2',
      name: 'No name',
      email: 'user@boilerplate.com',
      role: 'User',
      permissions: 'No permissions set.',
    },
  ]);

  // Application Settings
  appSettings = {
    language: 'fr',
  };

  // Property Settings
  propertySettings = {
    defaultCity: '',
    locationRef: 'AL',
    saleRef: 'AV',
    vacationRef: 'VC',
  };

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((v) => !v);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((v) => !v);
  }

  isPasswordFormValid(): boolean {
    return this.passwordForm.currentPassword.length > 0 && this.passwordForm.newPassword.length >= 8;
  }

  onCancel(): void {
    // Reset forms or navigate away
  }

  onSaveUserInfo(): void {
    // Save user info logic
    console.log('Saving user info:', this.userInfo);
  }

  onSavePassword(): void {
    // Save password logic
    console.log('Saving password');
  }
}

