import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FuseConfigService } from '@fuse/services/config';
import { AppConfigService } from '@fuse/services/config/app-config.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'theme-toggle',
    templateUrl: './theme-toggle.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatIconModule, MatButtonModule, NgIf],
})
export class ThemeToggleComponent implements OnInit {
    currentScheme: 'light' | 'dark' = 'dark';

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _appConfigService: AppConfigService,
        private _changeDetectorRef: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        // Get current theme from config service
        this.currentScheme = this._appConfigService.getTheme();
        
        // Update the Fuse config service
        this._fuseConfigService.config = { scheme: this.currentScheme };
        
        // Subscribe to config changes
        this._appConfigService.config$.subscribe(config => {
            this.currentScheme = config.theme;
            this._fuseConfigService.config = { scheme: this.currentScheme };
            this._changeDetectorRef.markForCheck();
        });
    }

    toggleScheme(): void {
        const newScheme = this.currentScheme === 'dark' ? 'light' : 'dark';
        this._appConfigService.setTheme(newScheme);
    }
}
