import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export type ViewType = 'list' | 'cards';

@Component({
    selector     : 'fuse-view-toggle',
    templateUrl  : './view-toggle.component.html',
    styleUrls    : ['./view-toggle.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone   : true,
    imports      : [MatButtonModule, MatIconModule, MatTooltipModule],
})
export class FuseViewToggleComponent
{
    @Input() currentView: ViewType = 'list';
    @Input() showLabels: boolean = false;
    @Output() viewChange = new EventEmitter<ViewType>();

    /**
     * Toggle to list view
     */
    toggleToList(): void
    {
        this.currentView = 'list';
        this.viewChange.emit('list');
    }

    /**
     * Toggle to cards view
     */
    toggleToCards(): void
    {
        this.currentView = 'cards';
        this.viewChange.emit('cards');
    }
}
