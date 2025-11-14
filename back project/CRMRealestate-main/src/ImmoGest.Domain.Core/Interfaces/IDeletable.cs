using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Core.Interfaces
{
    /// <summary>
    /// this interface is used to mark the class as deletable, it introduce a property IsDeleted
    /// to mark the entity as Delete, for logical deletion
    /// </summary>
    public interface IDeletable
    {
        /// <summary>
        /// mark an entity as deleted
        /// </summary>
        bool IsDeleted { get; set; }
    }
}
