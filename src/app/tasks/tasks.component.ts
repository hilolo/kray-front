import { Component, computed, signal } from '@angular/core';
import { ZardPageComponent } from '../page/page.component';
import { ZardKanbanComponent, KanbanColumn, KanbanTask } from '@shared/components/kanban/kanban.component';
import { ZardButtonComponent } from '@shared/components/button/button.component';
import { ZardIconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [ZardPageComponent, ZardKanbanComponent, ZardButtonComponent, ZardIconComponent],
  templateUrl: './tasks.component.html',
})
export class TasksComponent {
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

  addNewTask(): void {
    // TODO: Implement add new task functionality
    console.log('Add new task');
  }
  readonly kanbanColumns = signal<KanbanColumn[]>([
    {
      id: 'planned',
      title: 'Planned',
      status: 'planned',
      tasks: [
        {
          id: '1',
          title: 'Benchmark immersive metrics',
          dateRange: 'Aug 13 - Apr 10, 2026',
          avatar: { fallback: 'JD' },
        },
        {
          id: '2',
          title: 'Syndicate holistic synergies',
          dateRange: 'Sep 4 - Apr 24, 2026',
          avatar: { fallback: 'LS' },
        },
        {
          id: '3',
          title: 'Iterate quantum large language models',
          dateRange: 'Jun 17 - Jan 31, 2026',
          icon: 'x',
        },
        {
          id: '4',
          title: 'Incubate plug-and-play functionalities',
          dateRange: 'Oct 5 - Dec 3, 2025',
          icon: 'x',
        },
        {
          id: '5',
          title: 'Engineer extensible smart contracts',
          dateRange: 'Oct 5 - Feb 9, 2026',
          avatar: { fallback: 'LS' },
        },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'in-progress',
      tasks: [
        {
          id: '6',
          title: 'Unleash one-to-one paradigms',
          dateRange: 'Aug 9 - Nov 28, 2025',
          icon: 'circle',
        },
        {
          id: '7',
          title: 'Transition global content',
          dateRange: 'May 29 - Mar 11, 2026',
          icon: 'circle',
        },
        {
          id: '8',
          title: 'Repurpose magnetic ROI',
          dateRange: 'Sep 10 - Apr 29, 2026',
          avatar: { fallback: 'LS' },
        },
        {
          id: '9',
          title: 'Engage seamless deliverables',
          dateRange: 'Aug 13 - Dec 22, 2025',
          icon: 'x',
        },
        {
          id: '10',
          title: 'Drive sticky models',
          dateRange: 'Oct 5 - Feb 9, 2026',
          avatar: { fallback: 'LS' },
        },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      status: 'done',
      tasks: [
        {
          id: '11',
          title: 'Implement synergistic lifetime value',
          dateRange: 'Sep 21 - Jan 25, 2026',
          avatar: { fallback: 'LS' },
        },
        {
          id: '12',
          title: 'Syndicate vertical channels',
          dateRange: 'Sep 28 - Feb 25, 2026',
          avatar: { fallback: 'JD' },
        },
        {
          id: '13',
          title: 'Harness mission-critical content',
          dateRange: 'Jun 27 - Mar 18, 2026',
          icon: 'circle',
        },
        {
          id: '14',
          title: 'Orchestrate front-end initiatives',
          dateRange: 'Sep 5 - Jan 5, 2026',
          icon: 'x',
        },
      ],
    },
  ]);
}

