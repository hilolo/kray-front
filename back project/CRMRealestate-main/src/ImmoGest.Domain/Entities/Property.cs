using ImmoGest.Domain.Core.Entities;
using ImmoGest.Domain.Core.Interfaces;
using ImmoGest.Domain.Entities.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Domain.Entities
{
    public class Property : Entity, IDeletable
    {
        public string Identifier { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string TypeProperty { get; set; }
        public float Area { get; set; }
        public float Pieces {  get; set; }
        public float Bathrooms { get; set; }
        public bool Furnished { get; set; }
        public float Price { get; set; }
        public TypePaiment TypePaiment { get; set; }

        //
        public Guid? BuildingId { get; set; }
        public Building Building { get; set; }
        public Contact Contact { get; set; }
        public Guid ContactId { get; set; }
        public Company Company { get; set; }
        public Guid CompanyId { get; set; }
        public Guid? DefaultAttachmentId { get; set; }  // Default image attachment
        public Attachment DefaultAttachment { get; set; }
        // Features (e.g., hardwood floors, fireplace, etc.)
        public List<string> Features { get; set; }
        // Amenities/Equipment (e.g., AC, heating, dishwasher, etc.)
        public List<string> Equipment { get; set; }
        // Property category
        public PropertyCategory Category { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsArchived { get; set; }
        public bool IsPublic { get; set; }
        public bool IsPublicAdresse { get; set; }
        public bool IsShared { get; set; }
        public ICollection<Maintenance> Maintenances { get; set; }
        public ICollection<Lease> Leases { get; set; }
        public ICollection<Key> Keys { get; set; }

        public override void BuildSearchTerms()
        => SearchTerms = $"{Identifier} {Name} {Description} {Address} {City} {TypeProperty} {Category.ToString()}".ToUpper();
    }
}
