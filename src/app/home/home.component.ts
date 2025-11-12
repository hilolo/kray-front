import { Component } from '@angular/core';
import { ZardPageComponent } from '@shared/components/page/page.component';
import { ZardBreadcrumbModule } from '@shared/components/breadcrumb/breadcrumb.module';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ZardPageComponent, ZardBreadcrumbModule],
  template: `
    <z-page zTitle="Dashboard">
      <div class="space-y-6">
        <!-- Breadcrumb -->
        <z-breadcrumb>
          <z-breadcrumb-list>
            <z-breadcrumb-item>
              <z-breadcrumb-link zLink="/">Home</z-breadcrumb-link>
            </z-breadcrumb-item>
            <z-breadcrumb-separator />
            <z-breadcrumb-item>
              <z-breadcrumb-page>Dashboard</z-breadcrumb-page>
            </z-breadcrumb-item>
          </z-breadcrumb-list>
        </z-breadcrumb>

        <!-- Main Content -->
        <div>
          <h2 class="text-3xl font-bold mb-2">Welcome to Dashboard</h2>
          <p class="text-muted-foreground">
            This is your dashboard content area. You can add your widgets, charts, and other components here.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-6 rounded-lg border bg-card">
            <h3 class="text-lg font-semibold mb-2">Card 1</h3>
            <p class="text-sm text-muted-foreground">Card content goes here</p>
          </div>
          <div class="p-6 rounded-lg border bg-card">
            <h3 class="text-lg font-semibold mb-2">Card 2</h3>
            <p class="text-sm text-muted-foreground">Card content goes here</p>
          </div>
          <div class="p-6 rounded-lg border bg-card">
            <h3 class="text-lg font-semibold mb-2">Card 3</h3>
            <p class="text-sm text-muted-foreground">Card content goes here</p>
          </div>
        </div>
      </div>

      <!-- Footer Content -->
      <div footer-content>
        <span>&copy; 2024 Dashboard. All rights reserved.</span>
      </div>
    </z-page>
  `,
})
export class HomeComponent {}

