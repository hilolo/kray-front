import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ZardPageComponent } from '../../page/page.component';
import { ContentComponent } from '@shared/components/layout/content.component';

@Component({
  selector: 'app-edit-property',
  standalone: true,
  imports: [
    ZardPageComponent,
    ContentComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-property.component.html',
})
export class EditPropertyComponent {
  // Empty component - to be implemented later
}

