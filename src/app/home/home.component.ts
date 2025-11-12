import { Component } from '@angular/core';
import { ZardPageComponent } from '../page/page.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ZardPageComponent, TranslateModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {}

