using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Core.Interfaces
{
    /// <summary>
    /// a class that defines an entity
    /// </summary>
    public interface IEntity
    {
        /// <summary>
        /// the creation time of the model
        /// </summary>
        System.DateTimeOffset CreatedOn { get; set; }

        /// <summary>
        /// the last time the model has been modified
        /// </summary>
        System.DateTimeOffset? LastModifiedOn { get; set; }

        /// <summary>
        /// the id of the entity
        /// </summary>
        Guid Id { get; set; }
    }

  
}
