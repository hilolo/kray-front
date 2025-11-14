using ImmoGest.Domain.Core.Interfaces;
using System;
using System.ComponentModel.DataAnnotations;

namespace ImmoGest.Domain.Core.Entities
{

    public abstract partial class Entity : IEntity
    {
        public Guid Id { get; set; }
    }

    /// <summary>
    /// Entity class that implement <see cref="IEntity"/>, which is the base entity class
    /// </summary>
    public abstract partial class Entity : IEntity
    {
        /// <summary>
        /// create an instant of <see cref=""/>
        /// </summary>
        protected Entity()
        {
            CreatedOn = DateTimeOffset.UtcNow;
            LastModifiedOn = DateTimeOffset.UtcNow;
        }

        /// <summary>
        /// the creation time of the model
        /// </summary>
        public DateTimeOffset CreatedOn { get; set; }

        /// <summary>
        /// the last time the model has been modified
        /// </summary>
        public DateTimeOffset? LastModifiedOn { get; set; }

        /// <summary>
        /// represent a set of search terms
        /// </summary>
        public string SearchTerms { get; set; }

        /// <summary>
        /// build the set of search terms for the object
        /// </summary>
        public abstract void BuildSearchTerms();

    }
}
