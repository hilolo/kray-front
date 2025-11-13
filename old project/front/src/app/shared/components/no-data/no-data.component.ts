import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-no-data',
    templateUrl: './no-data.component.html',
    styleUrls: ['./no-data.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class NoDataComponent {
    @Input() message: string = 'No data available';
    @Input() imagePath: string = 'assets/images/brand/nodata.png';
}

