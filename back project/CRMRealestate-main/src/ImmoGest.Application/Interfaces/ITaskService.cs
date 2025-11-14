using ImmoGest.Application.DTOs;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using ResultNet;
using System;
using System.Threading.Tasks;

namespace ImmoGest.Application.Interfaces
{
    public interface ITaskService : IDataService<TaskItem>
    {
        System.Threading.Tasks.Task<Result<TaskDto>> UpdateStatusAsync(Guid id, ImmoGest.Domain.Entities.Enums.TaskStatus status);
    }
}

