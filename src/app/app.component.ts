import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DarkModeService } from './shared/services/darkmode.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  private readonly darkmodeService = inject(DarkModeService);
  title = 'admintemmplate';

  ngOnInit(): void {
    this.darkmodeService.initTheme();
  }
}
