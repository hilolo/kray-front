import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { TaskListRequest } from '../models/task/task-list-request.model';
import type { TaskListResponse } from '../models/task/task-list-response.model';
import type { CreateTaskRequest } from '../models/task/create-task-request.model';
import type { UpdateTaskRequest } from '../models/task/update-task-request.model';
import type { Task } from '../models/task/task.model';

/**
 * Service for task-related API calls
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly apiService = inject(ApiService);

  /**
   * Get paginated list of tasks
   * POST api/tasks/list
   * @param request Task list request parameters
   * @returns Observable of paginated task list response
   */
  list(request: TaskListRequest): Observable<TaskListResponse> {
    return this.apiService.post<TaskListResponse>('tasks/list', request);
  }

  /**
   * Create a new task
   * POST api/tasks
   * @param request Task creation data
   * @returns Observable of created task
   */
  create(request: CreateTaskRequest): Observable<Task> {
    return this.apiService.post<Task>('tasks', request);
  }

  /**
   * Get a task by ID
   * GET api/tasks/{id}
   * @param id Task ID
   * @returns Observable of task
   */
  getById(id: string): Observable<Task> {
    return this.apiService.get<Task>(`tasks/${id}`);
  }

  /**
   * Update an existing task
   * PUT api/tasks/{id}
   * @param id Task ID
   * @param request Task update data
   * @returns Observable of updated task
   */
  update(id: string, request: UpdateTaskRequest): Observable<Task> {
    return this.apiService.put<Task>(`tasks/${id}`, request);
  }

  /**
   * Delete a task (soft delete)
   * DELETE api/tasks/{id}
   * @param id Task ID
   * @returns Observable of result
   */
  delete(id: string): Observable<void> {
    return this.apiService.delete<void>(`tasks/${id}`);
  }

  /**
   * Update task status
   * PATCH api/tasks/{id}/status
   * @param id Task ID
   * @param status New status
   * @returns Observable of updated task
   */
  updateStatus(id: string, status: number): Observable<Task> {
    return this.apiService.patch<Task>(`tasks/${id}/status`, { status });
  }
}

