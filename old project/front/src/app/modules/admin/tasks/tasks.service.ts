import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { BehaviorSubject, map, Observable, switchMap, take } from 'rxjs';
import {
    CreateTaskDto,
    GetTasksFilter,
    PaginatedTaskResult,
    Task,
    TaskStatus,
    UpdateTaskDto,
    taskStatusToString,
    taskPriorityToString
} from './tasks.types';

@Injectable({ providedIn: 'root' })
export class TasksService {
    private _httpClient = inject(HttpClient);
    private _tasks: BehaviorSubject<Task[] | null> = new BehaviorSubject<Task[] | null>(null);
    private _task: BehaviorSubject<Task | null> = new BehaviorSubject<Task | null>(null);

    get tasks$(): Observable<Task[] | null> {
        return this._tasks.asObservable();
    }

    get task$(): Observable<Task | null> {
        return this._task.asObservable();
    }

    /**
     * Retrieve tasks for the given filter (month/year + optional search).
     */
    getTasks(filter: GetTasksFilter): Observable<PaginatedTaskResult> {
        return this._httpClient.post<any>(`${environment.apiUrl}/api/tasks/list`, filter).pipe(
            map((response) => response.data || response),
            map((data: PaginatedTaskResult) => {
                this._tasks.next(data?.result ?? []);
                return data;
            })
        );
    }

    /**
     * Retrieve single task by id.
     */
    getTaskById(id: string): Observable<Task> {
        return this._httpClient.get<any>(`${environment.apiUrl}/api/tasks/${id}`).pipe(
            map((response) => response.data || response),
            map((task: Task) => {
                this._task.next(task);
                return task;
            })
        );
    }

    /**
     * Create a new task.
     */
    createTask(payload: CreateTaskDto): Observable<Task> {
        // Convert enum values to strings for API
        const apiPayload = {
            ...payload,
            status: typeof payload.status === 'number' ? taskStatusToString(payload.status) : payload.status,
            priority: typeof payload.priority === 'number' ? taskPriorityToString(payload.priority) : payload.priority
        };
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient.post<any>(`${environment.apiUrl}/api/tasks`, apiPayload).pipe(
                    map((response) => response.data || response),
                    map((created: Task) => {
                        if (tasks) {
                            this._tasks.next([created, ...tasks]);
                        }
                        return created;
                    })
                )
            )
        );
    }

    /**
     * Update an existing task.
     */
    updateTask(id: string, payload: UpdateTaskDto): Observable<Task> {
        // Convert enum values to strings for API
        const apiPayload = {
            ...payload,
            status: typeof payload.status === 'number' ? taskStatusToString(payload.status) : payload.status,
            priority: typeof payload.priority === 'number' ? taskPriorityToString(payload.priority) : payload.priority
        };
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient.put<any>(`${environment.apiUrl}/api/tasks/${id}`, apiPayload).pipe(
                    map((response) => response.data || response),
                    map((updated: Task) => {
                        if (tasks) {
                            const index = tasks.findIndex((task) => task.id === id);
                            if (index > -1) {
                                const updatedTasks = [...tasks];
                                updatedTasks[index] = updated;
                                this._tasks.next(updatedTasks);
                            }
                        }
                        return updated;
                    })
                )
            )
        );
    }

    /**
     * Delete task.
     */
    deleteTask(id: string): Observable<boolean> {
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient.delete<any>(`${environment.apiUrl}/api/tasks/${id}`).pipe(
                    map((response) => response?.isSuccess ?? true),
                    map((isSuccess: boolean) => {
                        if (isSuccess && tasks) {
                            const updated = tasks.filter((task) => task.id !== id);
                            this._tasks.next(updated);
                        }
                        return isSuccess;
                    })
                )
            )
        );
    }

    /**
     * Update only task status (used by Kanban drag/drop).
     */
    updateTaskStatus(id: string, status: TaskStatus): Observable<Task> {
        // Convert enum value to string for API
        const apiStatus = typeof status === 'number' ? taskStatusToString(status) : status;
        return this.tasks$.pipe(
            take(1),
            switchMap((tasks) =>
                this._httpClient.patch<any>(`${environment.apiUrl}/api/tasks/${id}/status`, { status: apiStatus }).pipe(
                    map((response) => response.data || response),
                    map((updated: Task) => {
                        if (tasks) {
                            const index = tasks.findIndex((task) => task.id === id);
                            if (index > -1) {
                                const updatedTasks = [...tasks];
                                updatedTasks[index] = { ...tasks[index], ...updated };
                                this._tasks.next(updatedTasks);
                            }
                        }
                        return updated;
                    })
                )
            )
        );
    }
}


