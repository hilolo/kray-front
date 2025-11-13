import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'payments',
    template: '<router-outlet></router-outlet>',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterOutlet]
})
export class PaymentsComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {
    }
}


