import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'banks',
    standalone: true,
    imports: [RouterOutlet],
    template: '<router-outlet></router-outlet>'
})
export class BanksComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}

