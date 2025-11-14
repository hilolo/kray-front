using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ImmoGest.Domain.Core.Entities;

namespace ImmoGest.Domain.Entities
{
    public class Building : Entity
    {
        public string Name { get; set; }
        public string Address { get; set; }
        public string City { get; set; }

        public int Construction { get; set; }  
        public int Year { get; set; }
        public string Description { get; set; }  
        public int Floor { get; set; }
        public Guid? DefaultAttachmentId { get; set; }
        public Attachment DefaultAttachment { get; set; }
        public Company Company { get; set; }
        public Guid CompanyId { get; set; }
        
        // Navigation property for Properties
        public ICollection<Property> Properties { get; set; }
        
        public override void BuildSearchTerms()
        {
            SearchTerms = $"{Name} {Address} {City} {Description}".ToLower();
        }
    }
}
