using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Core.Interfaces
{
    /// <summary>
    /// mark entities with primary key
    /// </summary>
    /// <typeparam name="TKey">the type of primary key</typeparam>
    public interface IPrimaryKey<TKey>
    {
        /// <summary>
        /// the id of the entity
        /// </summary>
        TKey Id { get; set; }
    }
}
