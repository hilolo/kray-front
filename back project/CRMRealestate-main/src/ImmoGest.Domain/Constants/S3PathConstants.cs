using System;

namespace ImmoGest.Domain.Constants
{
    /// <summary>
    /// Constants for S3 storage paths and bucket configuration
    /// </summary>
    public static class S3PathConstants
    {
        /// <summary>
        /// Root path for attachments in S3
        /// </summary>
        public const string AttachmentsRoot = "attachments";

        /// <summary>
        /// Root path for contact-related files
        /// </summary>
        public const string ContactRoot = "contact";

        /// <summary>
        /// S3 path structure for Lease attachments: leasing
        /// </summary>
        public const string LeaseAttachmentsPath = "leasing";

        /// <summary>
        /// S3 path structure for Reservation attachments: reservation
        /// </summary>
        public const string ReservationAttachmentsPath = "reservation";

        /// <summary>
        /// S3 path structure for Property attachments: property
        /// </summary>
        public const string PropertyAttachmentsPath = "property";

        /// <summary>
        /// S3 path structure for Contact attachments: contact
        /// </summary>
        public const string ContactAttachmentsPath = "contact";

        /// <summary>
        /// S3 path structure for Contact avatar: contact/{contactFolder}
        /// Dynamic - use GetContactAvatarPath method
        /// </summary>
        public const string ContactAvatarPathTemplate = "contact/{0}";

        /// <summary>
        /// S3 path template for Property attachments: {ownerName}/property/{propertyReference}
        /// Dynamic - use GetPropertyAttachmentsPath method
        /// </summary>
        public const string PropertyAttachmentsPathTemplate = "{0}/property/{1}";

        /// <summary>
        /// S3 path template for Contact attachments: {contactFolder}/contact
        /// Dynamic - use GetContactAttachmentsPath method
        /// </summary>
        public const string ContactAttachmentsPathTemplate = "{0}/contact";

        /// <summary>
        /// S3 path template for Lease attachments: {contactFolder}/leasing
        /// Dynamic - use GetLeaseAttachmentsPath method
        /// </summary>
        public const string LeaseAttachmentsPathTemplate = "{0}/leasing";

        /// <summary>
        /// S3 path template for Reservation attachments: {contactFolder}/reservation
        /// Dynamic - use GetReservationAttachmentsPath method
        /// </summary>
        public const string ReservationAttachmentsPathTemplate = "{0}/reservation";

        /// <summary>
        /// Get the S3 path for property attachments
        /// </summary>
        /// <param name="ownerName">Sanitized owner name</param>
        /// <param name="propertyReference">Sanitized property reference/identifier</param>
        /// <returns>Formatted path: {ownerName}/property/{propertyReference}</returns>
        public static string GetPropertyAttachmentsPath(string ownerName, string propertyReference)
        {
            return string.Format(PropertyAttachmentsPathTemplate, ownerName, propertyReference);
        }

        /// <summary>
        /// Get the S3 path for contact attachments
        /// </summary>
        /// <param name="contactFolder">Sanitized contact folder name</param>
        /// <returns>Formatted path: {contactFolder}/contact</returns>
        public static string GetContactAttachmentsPath(string contactFolder)
        {
            return string.Format(ContactAttachmentsPathTemplate, contactFolder);
        }

        /// <summary>
        /// Get the S3 path for contact avatar
        /// </summary>
        /// <param name="contactFolder">Sanitized contact folder name</param>
        /// <returns>Formatted path: contact/{contactFolder}</returns>
        public static string GetContactAvatarPath(string contactFolder)
        {
            return string.Format(ContactAvatarPathTemplate, contactFolder);
        }

        /// <summary>
        /// Get the S3 path for building attachments
        /// </summary>
        /// <param name="buildingFolder">Sanitized building folder name</param>
        /// <returns>Formatted path: {buildingFolder}/building</returns>
        public static string GetBuildingAttachmentsPath(string buildingFolder)
        {
            return $"{buildingFolder}/building";
        }

        /// <summary>
        /// Build full S3 key for an attachment using StorageHash
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="storageHash">Storage hash from attachment (immutable identifier)</param>
        /// <param name="fileName">File name</param>
        /// <returns>Full S3 key: companies/{companyId}/attachments/{storageHash}/{fileName}</returns>
        public static string BuildAttachmentKey(string companyId, string storageHash, string fileName)
        {
            if (string.IsNullOrEmpty(storageHash))
            {
                throw new ArgumentException("StorageHash cannot be null or empty", nameof(storageHash));
            }
            return $"companies/{companyId}/{AttachmentsRoot}/{storageHash}/{fileName}";
        }

        /// <summary>
        /// Build full S3 key for an attachment using Root (deprecated - use BuildAttachmentKey with StorageHash instead)
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="root">Root path from attachment</param>
        /// <param name="fileName">File name</param>
        /// <returns>Full S3 key: companies/{companyId}/attachments/{root}/{fileName}</returns>
        [Obsolete("Use BuildAttachmentKey with StorageHash instead. Root-based keys are deprecated.")]
        public static string BuildAttachmentKeyWithRoot(string companyId, string root, string fileName)
        {
            if (string.IsNullOrEmpty(root) || root == "/")
            {
                return $"companies/{companyId}/{AttachmentsRoot}/{fileName}";
            }
            return $"companies/{companyId}/{AttachmentsRoot}/{root}/{fileName}";
        }

        /// <summary>
        /// Build full S3 key for a contact avatar using StorageHash (immutable, never changes)
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="avatarStorageHash">Avatar storage hash from contact (immutable identifier)</param>
        /// <param name="fileName">Avatar file name</param>
        /// <returns>Full S3 key: companies/{companyId}/contact/avatars/{avatarStorageHash}/{fileName}</returns>
        public static string BuildContactAvatarKey(string companyId, string avatarStorageHash, string fileName)
        {
            if (string.IsNullOrEmpty(avatarStorageHash))
            {
                throw new ArgumentException("AvatarStorageHash cannot be null or empty", nameof(avatarStorageHash));
            }
            return $"companies/{companyId}/{ContactRoot}/avatars/{avatarStorageHash}/{fileName}";
        }

        /// <summary>
        /// Build full S3 key for a contact avatar using contact folder (deprecated - use BuildContactAvatarKey with hash instead)
        /// </summary>
        /// <param name="companyId">Company ID</param>
        /// <param name="contactFolder">Contact folder name</param>
        /// <param name="fileName">Avatar file name</param>
        /// <returns>Full S3 key: companies/{companyId}/contact/{contactFolder}/{fileName}</returns>
        [Obsolete("Use BuildContactAvatarKey with AvatarStorageHash instead. Folder-based keys are deprecated.")]
        public static string BuildContactAvatarKeyWithFolder(string companyId, string contactFolder, string fileName)
        {
            return $"companies/{companyId}/{ContactRoot}/{contactFolder}/{fileName}";
        }

        /// <summary>
        /// Get the S3 path for lease attachments
        /// </summary>
        /// <param name="contactFolder">Sanitized contact folder name</param>
        /// <returns>Formatted path: {contactFolder}/leasing</returns>
        public static string GetLeaseAttachmentsPath(string contactFolder)
        {
            return string.Format(LeaseAttachmentsPathTemplate, contactFolder);
        }

        /// <summary>
        /// Get the S3 path for reservation attachments
        /// </summary>
        /// <param name="contactFolder">Sanitized contact folder name</param>
        /// <returns>Formatted path: {contactFolder}/reservation</returns>
        public static string GetReservationAttachmentsPath(string contactFolder)
        {
            return string.Format(ReservationAttachmentsPathTemplate, contactFolder);
        }
    }
}

