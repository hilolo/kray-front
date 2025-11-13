import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
    selector     : 'dashboard',
    templateUrl  : './dashboard.component.html',
    styleUrls    : ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [CommonModule, MatCardModule, MatIconModule, MatButtonModule, RouterLink],
})
export class DashboardComponent implements OnInit
{
    // Dashboard data
    stats = [
        {
            title: 'Total Properties',
            value: '24',
            icon: 'home',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Active Tenants',
            value: '18',
            icon: 'people',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Monthly Revenue',
            value: '$12,450',
            icon: 'attach_money',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Pending Tasks',
            value: '7',
            icon: 'assignment',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        }
    ];

    recentActivities = [
        {
            title: 'New tenant registered',
            description: 'John Doe signed lease for Apartment 3B',
            time: '2 hours ago',
            icon: 'person_add',
            color: 'text-green-600'
        },
        {
            title: 'Maintenance request',
            description: 'Plumbing issue reported in Unit 2A',
            time: '4 hours ago',
            icon: 'build',
            color: 'text-orange-600'
        },
        {
            title: 'Payment received',
            description: 'Rent payment from Sarah Wilson',
            time: '1 day ago',
            icon: 'payment',
            color: 'text-blue-600'
        },
        {
            title: 'Property inspection',
            description: 'Quarterly inspection completed',
            time: '2 days ago',
            icon: 'search',
            color: 'text-purple-600'
        }
    ];

    quickActions = [
        {
            title: 'Properties',
            description: 'View and manage properties',
            icon: 'home',
            route: '/property',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Buildings',
            description: 'View and manage buildings',
            icon: 'apartment',
            route: '/building',
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        },
        {
            title: 'Tenants',
            description: 'View and manage tenants',
            icon: 'people',
            route: '/contacts/tenants',
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Owners',
            description: 'View and manage owners',
            icon: 'person',
            route: '/contacts/owners',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Suppliers',
            description: 'View and manage suppliers',
            icon: 'store',
            route: '/contacts/suppliers',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50'
        },
        {
            title: 'Contracts',
            description: 'View and manage leasing contracts',
            icon: 'description',
            route: '/leasing',
            color: 'text-cyan-600',
            bgColor: 'bg-cyan-50'
        },
        {
            title: 'Reservations',
            description: 'View and manage reservations',
            icon: 'event',
            route: '/reservation',
            color: 'text-pink-600',
            bgColor: 'bg-pink-50'
        },
        {
            title: 'Keys',
            description: 'View and manage keys',
            icon: 'key',
            route: '/keys',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        }
    ];

    /**
     * Constructor
     */
    constructor()
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Component initialization
    }
}

