using ImmoGest.Application.Filters;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Repositories;
using ImmoGest.Infrastructure.Context;
using Microsoft.EntityFrameworkCore;
using ResultNet;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace ImmoGest.Infrastructure.Repositories
{
    public class TaskRepository : Repository<TaskItem>, ITaskRepository
    {
        public TaskRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async System.Threading.Tasks.Task<Result<TaskItem>> GetByIdAsync(Guid id)
        {
            var entity = await DbSet
                .AsNoTracking()
                .Include(t => t.AssignedUser)
                .Include(t => t.Contact)
                .Include(t => t.Property)
                .FirstOrDefaultAsync(e => e.Id == id);

            return entity != null
                ? Result.Success<TaskItem>(entity)
                : Result.Failure<TaskItem>();
        }

        public override async System.Threading.Tasks.Task<Result<TaskItem>> GetById(Guid id)
        {
            var entity = await DbSet
                .Include(t => t.AssignedUser)
                .Include(t => t.Contact)
                .Include(t => t.Property)
                .FirstOrDefaultAsync(e => e.Id == id);

            return entity != null
                ? Result.Success<TaskItem>(entity)
                : Result.Failure<TaskItem>();
        }

        public override Result<IQueryable<TaskItem>> GetAllFilter<IFilter>(IFilter filterOption)
        {
            var query = DbSet.AsNoTracking()
                .Include(t => t.AssignedUser)
                .Include(t => t.Contact)
                .Include(t => t.Property)
                .AsQueryable();

            // Apply search query filter
            if (!string.IsNullOrEmpty(filterOption.SearchQuery))
            {
                query = query.Where(e => e.SearchTerms.Contains(filterOption.SearchQuery.ToUpper()));
            }

            // Apply month/year filter for scheduled date
            if (filterOption is GetTasksFilter taskFilter)
            {
                if (taskFilter.Month > 0 && taskFilter.Year > 0)
                {
                    // Create DateTime in UTC to avoid PostgreSQL timestamp issues
                    var startDate = new DateTime(taskFilter.Year, taskFilter.Month, 1, 0, 0, 0, DateTimeKind.Utc);
                    var endDate = startDate.AddMonths(1);
                    query = query.Where(t => t.ScheduledDateTime >= startDate && t.ScheduledDateTime < endDate);
                }

                // Filter by assigned user
                if (taskFilter.AssignedUserId.HasValue)
                {
                    query = query.Where(t => t.AssignedUserId == taskFilter.AssignedUserId.Value);
                }

                // Filter by contact
                if (taskFilter.ContactId.HasValue)
                {
                    query = query.Where(t => t.ContactId == taskFilter.ContactId.Value);
                }

                // Filter by property
                if (taskFilter.PropertyId.HasValue)
                {
                    query = query.Where(t => t.PropertyId == taskFilter.PropertyId.Value);
                }

                // Filter by status
                if (taskFilter.Status.HasValue)
                {
                    query = query.Where(t => t.Status == taskFilter.Status.Value);
                }

                // Filter by priority
                if (taskFilter.Priority.HasValue)
                {
                    query = query.Where(t => t.Priority == taskFilter.Priority.Value);
                }
            }

            query = SetPagedResultFilterOptions(query, filterOption);

            return Result.Success<IQueryable<TaskItem>>(query);
        }
    }
}

