using System;

namespace ImmoGest.Application.DTOs
{
    public class StorageUsageDto
    {
        public long UsedBytes { get; set; }
        public long LimitBytes { get; set; }
        public int UsedPercentage { get; set; }
    }
}
