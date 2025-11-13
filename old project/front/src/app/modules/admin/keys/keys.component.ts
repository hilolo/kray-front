import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'keys',
    standalone: true,
    imports: [RouterOutlet],
    template: '<router-outlet></router-outlet>'
})
export class KeysComponent {
    /**
     * Constructor
     */
    constructor() {
    }
}

