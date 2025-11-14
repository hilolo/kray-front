using System;
using System.Threading.Tasks;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.Filters;
using ImmoGest.Application.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ResultNet;

namespace ImmoGest.Api.Controllers
{
    [ApiController]
    [Route("api/tasks")]
    [Authorize]
    public class TaskController : Base
    {
        private readonly ITaskService _taskService;

        public TaskController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        /// <summary>
        /// Creates a new task
        /// </summary>
        /// <param name="dto">Task creation data</param>
        /// <returns>Created task</returns>
        [HttpPost]
        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Result<TaskDto>>> CreateTask([FromBody] CreateTaskDto dto)
            => ActionResultFor(await _taskService.CreateAsync<TaskDto, CreateTaskDto>(dto));

        /// <summary>
        /// Get a task by ID
        /// </summary>
        /// <param name="id">The task's ID</param>
        /// <returns>Task details</returns>
        [HttpGet]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<TaskDto>>> GetTaskById(Guid id)
            => ActionResultFor(await _taskService.GetByIdAsync<TaskDto>(id));

        /// <summary>
        /// Update an existing task
        /// </summary>
        /// <param name="id">The task's ID</param>
        /// <param name="dto">Task update data</param>
        /// <returns>Updated task</returns>
        [HttpPut]
        [Route("{id}")]
        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<TaskDto>>> UpdateTask(Guid id, [FromBody] UpdateTaskDto dto)
            => ActionResultFor(await _taskService.UpdateAsync<TaskDto, UpdateTaskDto>(id, dto));

        /// <summary>
        /// Update task status (used for Kanban drag/drop)
        /// </summary>
        /// <param name="id">The task's ID</param>
        /// <param name="dto">Status update data</param>
        /// <returns>Updated task</returns>
        [HttpPatch]
        [Route("{id}/status")]
        [ProducesResponseType(typeof(TaskDto), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Result), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result<TaskDto>>> UpdateTaskStatus(Guid id, [FromBody] UpdateTaskStatusDto dto)
            => ActionResultFor(await _taskService.UpdateStatusAsync(id, dto.Status));

        /// <summary>
        /// Delete a task (soft delete)
        /// </summary>
        /// <param name="id">The task's ID</param>
        /// <returns></returns>
        [HttpDelete]
        [Route("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Result>> DeleteTask(Guid id)
            => ActionResultFor(await _taskService.DeleteAsync(id));

        /// <summary>
        /// Get all tasks with pagination and filtering
        /// To get all tasks without pagination, set Ignore = true in the filter
        /// </summary>
        /// <param name="filter">Filter options (set Ignore=true to disable pagination)</param>
        /// <returns>Paginated list of tasks</returns>
        [HttpPost]
        [Route("list")]
        [ProducesResponseType(typeof(PaginatedList<TaskDto>), StatusCodes.Status200OK)]
        public async Task<ActionResult<Result<PaginatedList<TaskDto>>>> GetTasks([FromBody] GetTasksFilter filter)
            => ActionResultFor(await _taskService.GetAsPagedResultAsync<TaskDto, GetTasksFilter>(filter));
    }
}

