import { Component, computed, signal } from '@angular/core';
import { ZardPageComponent } from '../page/page.component';
import { ZardKanbanComponent, KanbanColumn, KanbanTask } from '@shared/components/kanban/kanban.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [ZardPageComponent, ZardKanbanComponent, ZardButtonComponent, ZardIconComponent],
  templateUrl: './maintenance.component.html',
})
export class MaintenanceComponent {
  readonly currentDate = signal<Date>(new Date());

  readonly currentMonth = computed(() => {
    return this.currentDate().toLocaleDateString('en-US', { month: 'long' });
  });

  readonly currentYear = computed(() => {
    return this.currentDate().getFullYear();
  });

  readonly monthYearDisplay = computed(() => {
    return `${this.currentMonth()} ${this.currentYear()}`;
  });

  goToPreviousMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() - 1);
    this.currentDate.set(newDate);
  }

  goToNextMonth(): void {
    const newDate = new Date(this.currentDate());
    newDate.setMonth(newDate.getMonth() + 1);
    this.currentDate.set(newDate);
  }

  goToToday(): void {
    this.currentDate.set(new Date());
  }

  addNewMaintenance(): void {
    // TODO: Implement add new maintenance functionality
    console.log('Add new maintenance');
  }
  readonly kanbanColumns = signal<KanbanColumn[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      status: 'planned',
      tasks: [
        {
          id: '1',
          title: 'HVAC System Inspection',
          description: 'Schedule annual HVAC system inspection and maintenance. Check filters, ducts, and overall system performance.',
          assignedUsers: [
            { fallback: 'AB' },
            { fallback: 'CD' },
          ],
          progress: 10,
          priority: 'High',
          attachmentCount: 2,
          commentCount: 4,
        },
        {
          id: '2',
          title: 'Plumbing Leak Repair',
          description: 'Fix reported leak in building 3, unit 205. Inspect pipes and replace damaged sections.',
          assignedUsers: [
            { fallback: 'EF' },
            { fallback: 'GH' },
          ],
          progress: 0,
          priority: 'Medium',
          attachmentCount: 1,
          commentCount: 1,
        },
        {
          id: '3',
          title: 'Elevator Maintenance',
          description: 'Monthly elevator maintenance check. Test safety systems and update maintenance logs.',
          assignedUsers: [
            { fallback: 'IJ' },
            { fallback: 'KL' },
          ],
          progress: 5,
          priority: 'Low',
          attachmentCount: 0,
          commentCount: 3,
        },
        {
          id: '4',
          title: 'Roof Inspection',
          description: 'Inspect roof for damage after recent storms. Check for leaks and structural integrity.',
          assignedUsers: [
            { fallback: 'MN' },
          ],
          progress: 15,
          priority: 'Medium',
          attachmentCount: 1,
          commentCount: 2,
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      tasks: [
        {
          id: '5',
          title: 'Electrical Panel Upgrade',
          description: 'Upgrade electrical panel in building 1. Replace old circuit breakers and improve capacity.',
          assignedUsers: [
            { fallback: 'OP' },
            { fallback: 'QR' },
          ],
          progress: 40,
          priority: 'High',
          attachmentCount: 2,
          commentCount: 6,
        },
        {
          id: '6',
          title: 'Parking Lot Repaving',
          description: 'Repave damaged sections of parking lot. Fill potholes and repaint parking lines.',
          assignedUsers: [
            { fallback: 'ST' },
            { fallback: 'UV' },
          ],
          progress: 55,
          priority: 'Medium',
          attachmentCount: 3,
          commentCount: 2,
        },
        {
          id: '7',
          title: 'Landscaping Maintenance',
          description: 'Regular landscaping maintenance. Trim trees, mow lawns, and maintain irrigation system.',
          assignedUsers: [
            { fallback: 'NT EL' },
          ],
          progress: 35,
          priority: 'Low',
          attachmentCount: 1,
          commentCount: 1,
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      status: 'done',
      tasks: [
        {
          id: '8',
          title: 'Fire Safety System Check',
          description: 'Complete annual fire safety system inspection. Test alarms, sprinklers, and emergency exits.',
          assignedUsers: [
            { fallback: 'EC GR' },
          ],
          progress: 100,
          priority: 'High',
          attachmentCount: 2,
          commentCount: 4,
        },
        {
          id: '9',
          title: 'Window Replacement',
          description: 'Replace old windows in building 2 with energy-efficient models. Complete installation and cleanup.',
          assignedUsers: [
            { fallback: 'HL BM' },
          ],
          progress: 100,
          priority: 'Medium',
          attachmentCount: 1,
          commentCount: 2,
        },
      ],
    },
  ]);
}

