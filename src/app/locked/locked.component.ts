import { Component, inject, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../shared/services/auth.service';
import { ZardButtonComponent } from '../shared/components/button/button.component';
import { ZardIconComponent } from '../shared/components/icon/icon.component';
import { ZardCardComponent } from '../shared/components/card/card.component';

@Component({
  selector: 'app-locked',
  standalone: true,
  imports: [TranslateModule, ZardButtonComponent, ZardIconComponent, ZardCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './locked.component.html',
})
export class LockedComponent {
  private readonly authService = inject(AuthService);

  onLogout(): void {
    this.authService.logout();
  }
}

