using System;
using System.Linq;
using AutoMapper;
using ImmoGest.Application.DTOs;
using ImmoGest.Application.DTOs.Auth;
using ImmoGest.Application.DTOs.Hero;
using ImmoGest.Application.DTOs.Navigation;
using ImmoGest.Application.DTOs.User;
using ImmoGest.Application.Services;
using ImmoGest.Domain.Auth;
using ImmoGest.Domain.Entities;
using ImmoGest.Domain.Entities.Enums;
using ResultNet;

namespace ImmoGest.Application.MappingProfiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            UserMapper();
            HeroMapper();
            NavigationMapper();
            ContactMapper();
            AttachmentMapper();
            PropertyMapper();
            BuildingMapper();
            KeyMapper();
            LeaseMapper();
            ReservationMapper();
            BankMapper();
            MaintenanceMapper();
            TaskMapper();
            TransactionMapper();
        }

        private void UserMapper()
        {
            CreateMap<User, GetUserCompanyDto>().ForMember(dest => dest.IsAdmin, opt => opt.MapFrom(x => x.Role == Roles.Admin))
                 .ReverseMap();
            CreateMap<CreateUserDto, User>().ForMember(dest => dest.Role,
                opt => opt.MapFrom(org => org.IsAdmin ? Roles.Admin : Roles.User));
            CreateMap<GetUserDto, User>().ReverseMap();
            CreateMap<User, GetUserDto>()
               .ReverseMap();

            CreateMap<UpdatePasswordDto, User>();
            CreateMap<UpdateUserDto, User>();
            CreateMap<User, UserLogin>()
                  .ForMember(d => d.User, opt => opt.MapFrom(src => src))
                .ReverseMap();

            CreateMap<User, UserLogin>()
            .ForMember(d => d.User, opt => opt.MapFrom(src => src))
            .ReverseMap();

            CreateMap<User, GetTeamMemberDto>().ReverseMap();
        }
        private void HeroMapper()
        {
            CreateMap<Hero, GetHeroDto>().ReverseMap();
            CreateMap<CreateHeroDto, Hero>();
            CreateMap<UpdateHeroDto, Hero>();
        }

        private void NavigationMapper()
        {
            CreateMap<NavigationItem, NavigationDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.ItemId))
                .ForMember(dest => dest.Type, opt => opt.MapFrom(src => 
                    src.Type == "collapsible" ? "collapsable" : src.Type))
                .ReverseMap();
        }

        private void ContactMapper()
        {
            CreateMap<Contact, ContactDto>()
                .ForMember(dest => dest.Attachments, opt => opt.Ignore())  // Handled manually in service
                .ForMember(dest => dest.AttachmentCount, opt => opt.Ignore())  // Set manually in service
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedOn.DateTime))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.LastModifiedOn.HasValue ? src.LastModifiedOn.Value.DateTime : src.CreatedOn.DateTime));
            
            CreateMap<ContactDto, Contact>()
                .ForMember(dest => dest.Attachments, opt => opt.Ignore());
            
            // Configure CreateContactDto to Contact mapping
            // Ignore Avatar and Attachments fields - they're handled manually in InCreate_BeforInsertAsync hook
            CreateMap<CreateContactDto, Contact>()
                .ForMember(dest => dest.Avatar, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore())
                .ForMember(dest => dest.CompanyId, opt => opt.Ignore());
            
            // Configure UpdateContactDto to Contact mapping
            // Skip null values for partial updates (only update fields that are provided)
            // Exception for Avatar and Attachments which are handled manually
            CreateMap<UpdateContactDto, Contact>()
                .ForMember(dest => dest.Avatar, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => 
                {
                    // Skip null values for partial updates - only update fields that are provided
                    // Exception: don't overwrite Id and CompanyId with default values
                    var propertyName = opts.DestinationMember.Name;
                    if (propertyName == "Id" || propertyName == "CompanyId" || propertyName == "CreatedAt" || propertyName == "Avatar" || propertyName == "Attachments")
                        return srcMember != null && !srcMember.Equals(Guid.Empty);
                    
                    // Skip null values - only map if value is provided
                    return srcMember != null;
                }));
        }

        private void AttachmentMapper()
        {
            CreateMap<Attachment, AttachmentDto>().ReverseMap();
            CreateMap<AttachmentInputDto, Attachment>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore());
        }

        private void PropertyMapper()
        {
            CreateMap<Property, PropertyDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                .ForMember(dest => dest.DefaultAttachmentId, opt => opt.MapFrom(src => src.DefaultAttachmentId)) // Explicitly map
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedOn.DateTime))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.LastModifiedOn.HasValue ? src.LastModifiedOn.Value.DateTime : src.CreatedOn.DateTime))
                .ForMember(dest => dest.DefaultAttachmentUrl, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.OwnerName, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.Contact, opt => opt.MapFrom(src => src.Contact)) // Map Contact object
                .ForMember(dest => dest.Building, opt => opt.MapFrom(src => src.Building)) // Map Building to PropertyBuildingDto
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.Maintenances, opt => opt.MapFrom(src => src.Maintenances))
                .ForMember(dest => dest.Leases, opt => opt.Ignore()) // Set manually in service (like Attachments)
                .ForMember(dest => dest.Keys, opt => opt.MapFrom(src => src.Keys)); // Map Keys collection
            
            CreateMap<CreatePropertyDto, Property>();
            CreateMap<UpdatePropertyDto, Property>()
                .ForMember(dest => dest.DefaultAttachment, opt => opt.Ignore())
                .ForMember(dest => dest.Building, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => 
                {
                    var propertyName = opts.DestinationMember.Name;
                    // Don't update Id, CompanyId, timestamps if they're null/default
                    if (propertyName == "Id" || propertyName == "CompanyId")
                        return srcMember != null && !srcMember.Equals(Guid.Empty);
                    
                    // Skip null values for partial updates - only update fields that are provided
                    // Allow 0 values for numeric types and false for bool (they are valid values)
                    return srcMember != null;
                }));

            CreateMap<Property, PublicPropertyDto>()
                .ForMember(dest => dest.DefaultAttachmentUrl, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore())
                .ForMember(dest => dest.IsAddressPublic, opt => opt.MapFrom(src => src.IsPublicAdresse))
                .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.Company != null ? src.Company.Name : null))
                .ForMember(dest => dest.CompanyEmail, opt => opt.MapFrom(src => src.Company != null ? src.Company.Email : null))
                .ForMember(dest => dest.CompanyPhone, opt => opt.MapFrom(src => src.Company != null ? src.Company.Phone : null))
                .ForMember(dest => dest.CompanyWebsite, opt => opt.MapFrom(src => src.Company != null ? src.Company.Website : null))
                .ForMember(dest => dest.CompanyAddress, opt => opt.MapFrom(src => src.Company != null ? src.Company.Address : null))
                .ForMember(dest => dest.CompanyLogoUrl, opt => opt.Ignore());
        }

        private void BuildingMapper()
        {
            CreateMap<Building, BuildingDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Address, opt => opt.MapFrom(src => src.Address))
                .ForMember(dest => dest.City, opt => opt.MapFrom(src => src.City))
                .ForMember(dest => dest.Year, opt => opt.MapFrom(src => src.Year))
                .ForMember(dest => dest.Floor, opt => opt.MapFrom(src => src.Floor))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.DefaultAttachmentId, opt => opt.MapFrom(src => src.DefaultAttachmentId))
                .ForMember(dest => dest.CompanyId, opt => opt.MapFrom(src => src.CompanyId))
                .ForMember(dest => dest.IsArchived, opt => opt.MapFrom(src => src.IsArchived))
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedOn.DateTime))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.LastModifiedOn.HasValue ? src.LastModifiedOn.Value.DateTime : src.CreatedOn.DateTime))
                .ForMember(dest => dest.DefaultAttachmentUrl, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.Properties, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.PropertiesCount, opt => opt.Ignore()); // Set manually in service
            
            // Map Building to PropertyBuildingDto for use in PropertyDto
            CreateMap<Building, PropertyBuildingDto>();
            
            CreateMap<CreateBuildingDto, Building>()
                .ForMember(dest => dest.Construction, opt => opt.Ignore()); // Not in DTO
            
            CreateMap<UpdateBuildingDto, Building>()
                .ForMember(dest => dest.DefaultAttachment, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Properties, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.Construction, opt => opt.Ignore()) // Not in DTO
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => 
                {
                    var propertyName = opts.DestinationMember.Name;
                    // Don't update Id, CompanyId if they're null/default
                    if (propertyName == "Id" || propertyName == "CompanyId")
                        return srcMember != null && !srcMember.Equals(Guid.Empty);
                    
                    // Always map other properties (including 0 values for int fields like Year and Floor)
                    return true;
                }));
        }

        private void KeyMapper()
        {
            CreateMap<Key, KeyDto>()
                .ForMember(dest => dest.Property, opt => opt.Ignore()) // Ignore to avoid circular reference when Keys are included in PropertyDto
                .ForMember(dest => dest.DefaultAttachmentUrl, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()); // Set manually in service
            
            CreateMap<CreateKeyDto, Key>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore());
            
            CreateMap<UpdateKeyDto, Key>()
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore());
        }

        private void LeaseMapper()
        {
            CreateMap<Lease, LeaseDto>()
                .ForMember(dest => dest.PropertyName, opt => opt.Ignore()) // Set manually in service to avoid cycle
                .ForMember(dest => dest.PropertyAddress, opt => opt.Ignore()) // Set manually in service to avoid cycle
                .ForMember(dest => dest.PropertyImageUrl, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.TenantName, opt => opt.MapFrom(src => src.Contact != null ? src.Contact.FirstName + " " + src.Contact.LastName : null))
                .ForMember(dest => dest.TenantEmail, opt => opt.MapFrom(src => src.Contact != null ? src.Contact.Email : null))
                .ForMember(dest => dest.TenantPhone, opt => opt.Ignore()) // Can be set manually in service
                .ForMember(dest => dest.TenantAvatarUrl, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.TenancyDuration, opt => opt.Ignore()) // Calculated in service
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.AttachmentCount, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedOn.DateTime))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.LastModifiedOn.HasValue ? src.LastModifiedOn.Value.DateTime : (DateTime?)null));
            
            CreateMap<CreateLeaseDto, Lease>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Handled in service
                .ForMember(dest => dest.Status, opt => opt.Ignore()) // Calculated in service
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore());
            
            CreateMap<UpdateLeaseDto, Lease>()
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Handled in service
                .ForMember(dest => dest.Status, opt => opt.Ignore()) // Calculated in service
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => 
                {
                    var propertyName = opts.DestinationMember.Name;
                    // Don't update Id, CompanyId if they're null/default
                    if (propertyName == "Id" || propertyName == "CompanyId")
                        return srcMember != null && !srcMember.Equals(Guid.Empty);
                    
                    // Always map other properties
                    return true;
                }));
        }

        private void ReservationMapper()
        {
            CreateMap<Reservation, ReservationDto>()
                .ForMember(dest => dest.ContactName, opt => opt.MapFrom(src => src.Contact != null 
                    ? (src.Contact.IsACompany ? src.Contact.CompanyName : src.Contact.FirstName + " " + src.Contact.LastName) 
                    : null))
                .ForMember(dest => dest.ContactEmail, opt => opt.MapFrom(src => src.Contact != null ? src.Contact.Email : null))
                .ForMember(dest => dest.ContactPhone, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.ContactAvatarUrl, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.PropertyIdentifier, opt => opt.MapFrom(src => src.Property != null ? src.Property.Identifier : null))
                .ForMember(dest => dest.PropertyName, opt => opt.MapFrom(src => src.Property != null ? src.Property.Name : null))
                .ForMember(dest => dest.PropertyAddress, opt => opt.MapFrom(src => src.Property != null ? src.Property.Address : null))
                .ForMember(dest => dest.PropertyImageUrl, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.AttachmentCount, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedOn.DateTime))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.LastModifiedOn.HasValue ? src.LastModifiedOn.Value.DateTime : (DateTime?)null));
            
            // Map Reservation to PublicReservationDto (only dates and status, no client info)
            CreateMap<Reservation, PublicReservationDto>();
            
            CreateMap<CreateReservationDto, Reservation>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Handled in service
                .ForMember(dest => dest.Status, opt => opt.Ignore()) // Set in service
                .ForMember(dest => dest.RequestDate, opt => opt.Ignore()) // Set in service
                .ForMember(dest => dest.DurationDays, opt => opt.Ignore()) // Calculated in service
                .ForMember(dest => dest.NumberOfNights, opt => opt.Ignore()) // Calculated in service
                .ForMember(dest => dest.ApprovedBy, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovalDate, opt => opt.Ignore())
                .ForMember(dest => dest.ApprovalNotes, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore());
            
            CreateMap<UpdateReservationDto, Reservation>()
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Handled in service
                .ForMember(dest => dest.RequestDate, opt => opt.Ignore()) // Don't update request date
                .ForMember(dest => dest.DurationDays, opt => opt.Ignore()) // Calculated in service
                .ForMember(dest => dest.NumberOfNights, opt => opt.Ignore()) // Calculated in service
                .ForMember(dest => dest.ApprovalDate, opt => opt.Ignore()) // Set in service based on status
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => 
                {
                    var propertyName = opts.DestinationMember.Name;
                    // Don't update Id, CompanyId if they're null/default
                    if (propertyName == "Id" || propertyName == "CompanyId")
                        return srcMember != null && !srcMember.Equals(Guid.Empty);
                    
                    // Always map other properties
                    return true;
                }));
        }

        private void BankMapper()
        {
            CreateMap<Bank, BankDto>()
                .ForMember(dest => dest.Contact, opt => opt.MapFrom(src => src.Contact));
            
            CreateMap<CreateBankDto, Bank>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore());
            
            CreateMap<UpdateBankDto, Bank>()
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore());
        }

        private void MaintenanceMapper()
        {
            CreateMap<Maintenance, MaintenanceDto>()
                .ForMember(dest => dest.PropertyIdentifier, opt => opt.MapFrom(src => src.Property != null ? src.Property.Identifier : null))
                .ForMember(dest => dest.PropertyName, opt => opt.MapFrom(src => src.Property != null ? src.Property.Name : null))
                .ForMember(dest => dest.PropertyAddress, opt => opt.MapFrom(src => src.Property != null ? src.Property.Address : null))
                .ForMember(dest => dest.OwnerName, opt => opt.MapFrom(src => 
                    src.Property != null && src.Property.Contact != null
                        ? (src.Property.Contact.IsACompany 
                            ? src.Property.Contact.CompanyName 
                            : $"{src.Property.Contact.FirstName} {src.Property.Contact.LastName}".Trim())
                        : null))
                .ForMember(dest => dest.OwnerPhone, opt => opt.MapFrom(src => 
                    src.Property != null && src.Property.Contact != null && src.Property.Contact.Phones != null && src.Property.Contact.Phones.Any()
                        ? src.Property.Contact.Phones.FirstOrDefault()
                        : null))
                .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.Company != null ? src.Company.Name : null))
                .ForMember(dest => dest.ContactName, opt => opt.MapFrom(src => 
                    src.Contact == null
                        ? null
                        : src.Contact.IsACompany
                            ? src.Contact.CompanyName
                            : $"{src.Contact.FirstName} {src.Contact.LastName}".Trim()))
                .ForMember(dest => dest.ContactEmail, opt => opt.MapFrom(src => src.Contact != null ? src.Contact.Email : null))
                .ForMember(dest => dest.ContactPhone, opt => opt.MapFrom(src => 
                    src.Contact != null && src.Contact.Phones != null && src.Contact.Phones.Any()
                        ? src.Contact.Phones.FirstOrDefault()
                        : null));

            CreateMap<Maintenance, PropertyMaintenanceSummaryDto>()
                .ForMember(dest => dest.ContactName, opt => opt.MapFrom(src =>
                    src.Contact == null
                        ? null
                        : src.Contact.IsACompany
                            ? src.Contact.CompanyName
                            : $"{src.Contact.FirstName} {src.Contact.LastName}".Trim()))
                .ForMember(dest => dest.ContactEmail, opt => opt.MapFrom(src => src.Contact != null ? src.Contact.Email : null))
                .ForMember(dest => dest.ContactPhone, opt => opt.MapFrom(src =>
                    src.Contact != null && src.Contact.Phones != null && src.Contact.Phones.Any()
                        ? src.Contact.Phones.FirstOrDefault()
                        : null));
            
            CreateMap<CreateMaintenanceDto, Maintenance>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore());
            
            CreateMap<UpdateMaintenanceDto, Maintenance>()
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.DeletedOn, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => 
                {
                    var propertyName = opts.DestinationMember.Name;
                    // Don't update Id, CompanyId if they're null/default
                    if (propertyName == "Id" || propertyName == "CompanyId")
                        return srcMember != null && !srcMember.Equals(Guid.Empty);
                    
                    // Always map other properties
                    return true;
                }));
        }

        private void TaskMapper()
        {
            CreateMap<TaskItem, TaskDto>()
                .ForMember(dest => dest.AssignedUserName, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.ContactName, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.ContactIdentifier, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.PropertyName, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.PropertyIdentifier, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.PropertyAddress, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedOn.DateTime))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.LastModifiedOn.HasValue ? src.LastModifiedOn.Value.DateTime : (DateTime?)null));
            
            CreateMap<CreateTaskDto, TaskItem>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.AssignedUser, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore())
                .AfterMap((src, dest) => 
                {
                    // Convert ScheduledDateTime to UTC for PostgreSQL compatibility
                    if (dest.ScheduledDateTime.Kind == DateTimeKind.Utc)
                        return;
                    if (dest.ScheduledDateTime.Kind == DateTimeKind.Unspecified)
                        dest.ScheduledDateTime = DateTime.SpecifyKind(dest.ScheduledDateTime, DateTimeKind.Utc);
                    else
                        dest.ScheduledDateTime = dest.ScheduledDateTime.ToUniversalTime();
                });
            
            CreateMap<UpdateTaskDto, TaskItem>()
                .ForMember(dest => dest.AssignedUser, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore())
                .AfterMap((src, dest) => 
                {
                    // Convert ScheduledDateTime to UTC for PostgreSQL compatibility
                    if (dest.ScheduledDateTime.Kind == DateTimeKind.Utc)
                        return;
                    if (dest.ScheduledDateTime.Kind == DateTimeKind.Unspecified)
                        dest.ScheduledDateTime = DateTime.SpecifyKind(dest.ScheduledDateTime, DateTimeKind.Utc);
                    else
                        dest.ScheduledDateTime = dest.ScheduledDateTime.ToUniversalTime();
                })
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => 
                {
                    var propertyName = opts.DestinationMember.Name;
                    // Don't update Id, CompanyId if they're null/default
                    if (propertyName == "Id" || propertyName == "CompanyId")
                        return srcMember != null && !srcMember.Equals(Guid.Empty);
                    
                    // Always map other properties
                    return true;
                }));
        }

        private void TransactionMapper()
        {
            CreateMap<Transaction, TransactionDto>()
                .ForMember(dest => dest.PropertyName, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.PropertyAddress, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.ContactName, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.LeaseTenantName, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.AttachmentCount, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedOn.DateTime))
                .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.LastModifiedOn.HasValue ? src.LastModifiedOn.Value.DateTime : (DateTime?)null));

            CreateMap<Transaction, TransactionListDto>()
                .ForMember(dest => dest.ContactName, opt => opt.Ignore()) // Set manually in service
                .ForMember(dest => dest.PropertyName, opt => opt.Ignore()); // Set manually in service

            CreateMap<Payment, PaymentDto>().ReverseMap();

            CreateMap<CreateTransactionDto, Transaction>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.Lease, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Handled in service
                .ForMember(dest => dest.TransactionType, opt => opt.Ignore()) // Set in service (Manual)
                .ForMember(dest => dest.Status, opt => opt.Ignore()) // Set in service (Overdue)
                .ForMember(dest => dest.TotalAmount, opt => opt.Ignore()) // Calculated in service
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore());

            CreateMap<UpdateTransactionDto, Transaction>()
                .ForMember(dest => dest.Property, opt => opt.Ignore())
                .ForMember(dest => dest.Contact, opt => opt.Ignore())
                .ForMember(dest => dest.Lease, opt => opt.Ignore())
                .ForMember(dest => dest.Company, opt => opt.Ignore())
                .ForMember(dest => dest.Attachments, opt => opt.Ignore()) // Handled in service
                .ForMember(dest => dest.TransactionType, opt => opt.Ignore()) // Don't update transaction type
                .ForMember(dest => dest.TotalAmount, opt => opt.Ignore()) // Calculated in service
                .ForMember(dest => dest.IsDeleted, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedOn, opt => opt.Ignore())
                .ForMember(dest => dest.LastModifiedOn, opt => opt.Ignore())
                .ForMember(dest => dest.SearchTerms, opt => opt.Ignore())
                .ForMember(dest => dest.Category, opt => opt.MapFrom((src, dest) => src.Category.HasValue ? src.Category.Value : dest.Category))
                .ForMember(dest => dest.RevenueType, opt => opt.MapFrom((src, dest) => src.RevenueType.HasValue ? src.RevenueType.Value : dest.RevenueType))
                .ForMember(dest => dest.ExpenseType, opt => opt.MapFrom((src, dest) => src.ExpenseType.HasValue ? src.ExpenseType.Value : dest.ExpenseType))
                .ForMember(dest => dest.Date, opt => opt.MapFrom((src, dest) => src.Date.HasValue ? src.Date.Value : dest.Date))
                .AfterMap((src, dest) =>
                {
                    // Clear opposite type when Category is set
                    if (src.Category.HasValue)
                    {
                        if (src.Category.Value == TransactionCategory.Revenue)
                        {
                            dest.ExpenseType = null;
                        }
                        else if (src.Category.Value == TransactionCategory.Expense)
                        {
                            dest.RevenueType = null;
                        }
                    }
                })
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) =>
                {
                    var propertyName = opts.DestinationMember.Name;
                    // Don't update Id, CompanyId if they're null/default
                    if (propertyName == "Id" || propertyName == "CompanyId")
                        return srcMember != null && !srcMember.Equals(Guid.Empty);

                    // For PropertyId, allow null to be mapped (to explicitly remove property)
                    if (propertyName == "PropertyId")
                        return true; // Always map PropertyId, including null

                    // For other nullable Guid properties, allow null
                    if (propertyName == "LeaseId" || propertyName == "ContactId")
                        return true; // Always map, including null

                    // Skip mapping for fields that are explicitly mapped above
                    if (propertyName == "Category" || propertyName == "RevenueType" || propertyName == "ExpenseType" || propertyName == "Date")
                        return false; // These are handled by explicit MapFrom above

                    // Skip null values for other properties (partial update)
                    return srcMember != null;
                }));
        }
    }
}
