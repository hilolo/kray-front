import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardPageComponent } from '../../page/page.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardPageComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './property-detail.component.html',
})
export class PropertyDetailComponent {
}
