using System;
using System.Collections.Generic;

namespace ImmoGest.Application.DTOs
{
    public class UserPermissionsDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public Dictionary<string, ModulePermissionDto> Permissions { get; set; }
    }

    public class ModulePermissionDto
    {
        public bool View { get; set; }
        public bool Edit { get; set; }
        public bool Delete { get; set; }
    }

    public class UpdateUserPermissionsDto
    {
        public Dictionary<string, ModulePermissionDto> Permissions { get; set; }
    }
}


