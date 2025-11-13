import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'leasing',
    template: '<router-outlet></router-outlet>',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterOutlet]
})
export class LeasingComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {
    }
}

