using Amazon;
using Amazon.S3;
using Amazon.S3.Model;
using Amazon.S3.Transfer;
using ImmoGest.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ImmoGest.Infrastructure.Services
{
    public class S3StorageService : IS3StorageService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _defaultBucketName;
        private readonly IConfiguration _configuration;

        public S3StorageService(IConfiguration configuration)
        {
            _configuration = configuration;
            var awsAccessKey = configuration["AWS:AccessKey"];
            var awsSecretKey = configuration["AWS:SecretKey"];
            var awsRegion = configuration["AWS:Region"];
            var serviceUrl = configuration["AWS:ServiceURL"];
            _defaultBucketName = configuration["AWS:BucketName"];
            
            // Validate required configuration
            if (string.IsNullOrEmpty(awsAccessKey))
                throw new ArgumentException("AWS AccessKey is required in configuration");
            if (string.IsNullOrEmpty(awsSecretKey))
                throw new ArgumentException("AWS SecretKey is required in configuration");
            if (string.IsNullOrEmpty(serviceUrl))
                throw new ArgumentException("AWS ServiceURL is required in configuration");
            if (string.IsNullOrEmpty(_defaultBucketName))
                throw new ArgumentException("AWS BucketName is required in configuration");
            
            // Clear any AWS environment variables that might interfere
            Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", null);
            Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", null);
            Environment.SetEnvironmentVariable("AWS_DEFAULT_REGION", null);

            // Configure S3 client for Contabo Object Storage
            var config = new AmazonS3Config
            {
                ServiceURL = serviceUrl,
                ForcePathStyle = true, // Required for Contabo S3 - this ensures bucket name is in the path
                UseHttp = serviceUrl.StartsWith("http://"), // Use HTTP if URL starts with http://
                AuthenticationRegion = awsRegion, // Set authentication region for Contabo
                SignatureVersion = "4", // Use Signature Version 4
                UseArnRegion = false, // Disable ARN region for Contabo
                DisableHostPrefixInjection = true, // Disable host prefix injection
                LogMetrics = false,
                DisableLogging = true,
                MaxErrorRetry = 3,
                Timeout = TimeSpan.FromSeconds(30),
                // Contabo-specific configurations
                SignatureMethod = Amazon.Runtime.SigningAlgorithm.HmacSHA256,
                ThrottleRetries = true,
                RetryMode = Amazon.Runtime.RequestRetryMode.Standard,
                // Additional Contabo-specific settings
                UseDualstackEndpoint = false, // Disable dualstack for Contabo
                UseAccelerateEndpoint = false // Disable accelerate endpoint for Contabo
            };
            
            // Create credentials explicitly
            var credentials = new Amazon.Runtime.BasicAWSCredentials(awsAccessKey, awsSecretKey);
            _s3Client = new AmazonS3Client(credentials, config);
        }

        public async Task<string> UploadAsync(string bucketName, string key, string base64Content)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                // Generate unique 26-character filename if key is not provided or is empty
                if (string.IsNullOrEmpty(key))
                {
                    key = GenerateUniqueFileName();
                }
                
                // Convert base64 to bytes
                byte[] fileBytes = Convert.FromBase64String(base64Content);
                
                using (var stream = new MemoryStream(fileBytes))
                {
                    var uploadRequest = new TransferUtilityUploadRequest
                    {
                        InputStream = stream,
                        Key = key,
                        BucketName = bucketName,
                        ContentType = "application/octet-stream"
                    };

                    var transferUtility = new TransferUtility(_s3Client);
                    await transferUtility.UploadAsync(uploadRequest);
                }

                return await GetFileUrlAsync(bucketName, key);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error uploading file to S3: {ex.Message}", ex);
            }
        }

        public async Task DeleteAsync(string bucketName, string key)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                var deleteRequest = new DeleteObjectRequest
                {
                    BucketName = bucketName,
                    Key = key
                };

                await _s3Client.DeleteObjectAsync(deleteRequest);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting file from S3: {ex.Message}", ex);
            }
        }

        public async Task<string> GetFileUrlAsync(string bucketName, string key)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = bucketName,
                    Key = key,
                    Expires = DateTime.UtcNow.AddHours(24),
                    Verb = HttpVerb.GET
                };

                // Add cache control headers for 24 hours
                request.ResponseHeaderOverrides = new ResponseHeaderOverrides
                {
                    ContentType = "image/jpeg, image/png, image/gif, image/webp, */*",
                    CacheControl = "public, max-age=86400" // 24 hours in seconds
                };

                return await Task.FromResult(_s3Client.GetPreSignedURL(request));
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting file URL from S3: {ex.Message}", ex);
            }
        }

        public async Task<string> UploadFileAsync(string bucketName, string key, Stream fileStream, string contentType = "application/octet-stream")
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                // Generate unique 26-character filename if key is not provided or is empty
                if (string.IsNullOrEmpty(key))
                {
                    key = GenerateUniqueFileName();
                }
                
                var uploadRequest = new TransferUtilityUploadRequest
                {
                    InputStream = fileStream,
                    Key = key,
                    BucketName = bucketName,
                    ContentType = contentType
                };

                var transferUtility = new TransferUtility(_s3Client);
                await transferUtility.UploadAsync(uploadRequest);

                return await GetFileUrlAsync(bucketName, key);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error uploading file stream to S3: {ex.Message}", ex);
            }
        }

        public async Task<Stream> DownloadAsync(string bucketName, string key)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                var request = new GetObjectRequest
                {
                    BucketName = bucketName,
                    Key = key
                };

                var response = await _s3Client.GetObjectAsync(request);
                var memoryStream = new MemoryStream();
                await response.ResponseStream.CopyToAsync(memoryStream);
                memoryStream.Position = 0;

                return memoryStream;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error downloading file from S3: {ex.Message}", ex);
            }
        }

        public async Task<bool> FileExistsAsync(string bucketName, string key)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                var request = new GetObjectMetadataRequest
                {
                    BucketName = bucketName,
                    Key = key
                };

                await _s3Client.GetObjectMetadataAsync(request);
                return true;
            }
            catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return false;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error checking if file exists in S3: {ex.Message}", ex);
            }
        }

        public async Task<string> GetSignedUrlAsync(string bucketName, string key, int expirationHours = 24)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = bucketName,
                    Key = key,
                    Expires = DateTime.UtcNow.AddHours(expirationHours),
                    Verb = HttpVerb.GET
                };

                // Add response headers to allow access from localhost and set cache control
                request.ResponseHeaderOverrides = new ResponseHeaderOverrides
                {
                    ContentType = "image/jpeg, image/png, image/gif, image/webp, */*",
                    CacheControl = "public, max-age=86400" // 24 hours in seconds
                };

                var signedUrl = _s3Client.GetPreSignedURL(request);
                
                // For Contabo S3, we need to ensure the URL structure is correct
                // Check if the URL structure is correct for Contabo
                // Contabo URLs should be: https://eu2.contabostorage.com/bucket-name/path/to/file
                if (signedUrl.Contains($"/{bucketName}/") && !signedUrl.Contains($"/{bucketName}/{bucketName}/"))
                {
                    // URL structure looks correct
                    return await Task.FromResult(signedUrl);
                }
                else
                {
                    // Try to fix the URL structure for Contabo
                    var correctedUrl = FixContaboUrlStructure(signedUrl, bucketName);
                    return await Task.FromResult(correctedUrl);
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting signed URL from S3: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Fix URL structure for Contabo S3 compatibility
        /// </summary>
        private string FixContaboUrlStructure(string originalUrl, string bucketName)
        {
            try
            {
                // Parse the original URL
                var uri = new Uri(originalUrl);
                
                // For Contabo, the correct structure should be:
                // https://eu2.contabostorage.com/bucket-name/path/to/file
                // Instead of:
                // https://eu2.contabostorage.com/bucket-name/bucket-name/path/to/file
                
                var pathSegments = uri.AbsolutePath.Split('/');
                var correctedSegments = new List<string>();
                
                // Keep the first segment (empty) and the bucket name
                correctedSegments.Add(""); // Empty segment for leading slash
                correctedSegments.Add(bucketName);
                
                // Add the rest of the path segments, skipping duplicate bucket names
                for (int i = 1; i < pathSegments.Length; i++)
                {
                    if (pathSegments[i] != bucketName || correctedSegments.Count > 2)
                    {
                        correctedSegments.Add(pathSegments[i]);
                    }
                }
                
                var correctedPath = string.Join("/", correctedSegments);
                var correctedUrl = $"{uri.Scheme}://{uri.Host}{correctedPath}";
                
                // Preserve query parameters
                if (!string.IsNullOrEmpty(uri.Query))
                {
                    correctedUrl += uri.Query;
                }
                
                return correctedUrl;
            }
            catch (Exception ex)
            {
                return originalUrl; // Return original URL if fixing fails
            }
        }

        /// <summary>
        /// Generate a simple public URL for Contabo S3 (without signed parameters)
        /// This might work better for Contabo if the bucket is configured for public access
        /// </summary>
        public string GenerateSimplePublicUrl(string bucketName, string key)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                // Get the service URL from configuration
                var serviceUrl = _configuration["AWS:ServiceURL"];
                if (string.IsNullOrEmpty(serviceUrl))
                {
                    serviceUrl = "https://eu2.contabostorage.com";
                }
                
                // Remove trailing slash from service URL
                if (serviceUrl.EndsWith("/"))
                {
                    serviceUrl = serviceUrl.Substring(0, serviceUrl.Length - 1);
                }
                
                // Construct the URL: https://eu2.contabostorage.com/bucket-name/path/to/file
                var publicUrl = $"{serviceUrl}/{bucketName}/{key}";
                
                return publicUrl;
            }
            catch (Exception ex)
            {
                return string.Empty;
            }
        }

        /// <summary>
        /// Get or generate a cached URL for an S3 object
        /// This method ensures the same URL is returned until it expires, preventing new URL generation on each request
        /// </summary>
        /// <param name="bucketName">Bucket name</param>
        /// <param name="key">S3 object key</param>
        /// <param name="cachedUrl">Previously cached URL (if available)</param>
        /// <param name="urlExpiresAt">Expiration timestamp of cached URL (if available)</param>
        /// <param name="expirationHours">Hours until URL expiration (default: 24)</param>
        /// <returns>Cached URL if valid, otherwise generates and returns new URL</returns>
        public async Task<string> GetOrGenerateCachedUrlAsync(string bucketName, string key, string cachedUrl = null, DateTimeOffset? urlExpiresAt = null, int expirationHours = 24)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                // Check if bucket is configured for public access
                var isPublicBucket = _configuration.GetValue<bool>("AWS:IsPublicBucket", false);
                
                // If bucket is public, always return public URL (permanent, no expiration)
                if (isPublicBucket)
                {
                    return GenerateSimplePublicUrl(bucketName, key);
                }
                
                // Check if we have a valid cached URL
                if (!string.IsNullOrEmpty(cachedUrl) && urlExpiresAt.HasValue)
                {
                    // Check if cached URL is still valid (not expired, with 1 hour buffer for safety)
                    var bufferTime = TimeSpan.FromHours(1);
                    var expirationWithBuffer = urlExpiresAt.Value.Subtract(bufferTime);
                    
                    if (DateTimeOffset.UtcNow < expirationWithBuffer)
                    {
                        // Cached URL is still valid, return it
                        return cachedUrl;
                    }
                }
                
                // Cached URL is expired or doesn't exist, generate new presigned URL
                var newUrl = await GetSignedUrlAsync(bucketName, key, expirationHours);
                
                // Return the new URL (caller should update the entity with this URL and expiration)
                return newUrl;
            }
            catch (Exception ex)
            {
                // Fallback to public URL if presigned URL generation fails
                return GenerateSimplePublicUrl(bucketName, key);
            }
        }

        /// <summary>
        /// Generate a signed URL that works with localhost development
        /// </summary>
        public async Task<string> GetSignedUrlForLocalhostAsync(string bucketName, string key, int expirationHours = 24)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                var request = new GetPreSignedUrlRequest
                {
                    BucketName = bucketName,
                    Key = key,
                    Expires = DateTime.UtcNow.AddHours(expirationHours),
                    Verb = HttpVerb.GET
                };

                // Add cache control headers for 24 hours
                request.ResponseHeaderOverrides = new ResponseHeaderOverrides
                {
                    ContentType = "image/jpeg, image/png, image/gif, image/webp, */*",
                    CacheControl = "public, max-age=86400" // 24 hours in seconds
                };

                var signedUrl = _s3Client.GetPreSignedURL(request);
                
                // For localhost development, we might need to modify the URL
                // Some S3-compatible services don't work well with signed URLs from localhost
                return await Task.FromResult(signedUrl);
            }
            catch (Exception ex)
            {
                // Fallback to simple public URL if signed URL fails
                return GenerateSimplePublicUrl(bucketName, key);
            }
        }

        #region Company-specific file operations

        /// <summary>
        /// Upload a file for a specific company (organized by company ID folder)
        /// </summary>
        public async Task<string> UploadFileForCompanyAsync(string companyId, string fileName, Stream fileStream, string contentType = "application/octet-stream", string subfolder = "")
        {
            try
            {
                if (string.IsNullOrEmpty(companyId))
                {
                    throw new ArgumentException("Company ID is required", nameof(companyId));
                }

                // Generate unique 26-character filename instead of using original filename
                var uniqueFileName = GenerateUniqueFileName();
                
                // Optionally preserve file extension if provided
                if (!string.IsNullOrEmpty(fileName))
                {
                    var fileExtension = Path.GetExtension(fileName);
                    if (!string.IsNullOrEmpty(fileExtension))
                    {
                        uniqueFileName = $"{uniqueFileName}{fileExtension}";
                    }
                }

                // Create folder structure: companies/{companyId}/{subfolder}/{fileName}
                var key = BuildCompanyFileKey(companyId, uniqueFileName, subfolder);

                return await UploadFileAsync(_defaultBucketName, key, fileStream, contentType);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error uploading file for company {companyId}: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Upload a base64 file for a specific company
        /// </summary>
        public async Task<string> UploadBase64ForCompanyAsync(string companyId, string fileName, string base64Content, string contentType = "application/octet-stream", string subfolder = "")
        {
            try
            {
                if (string.IsNullOrEmpty(companyId))
                {
                    throw new ArgumentException("Company ID is required", nameof(companyId));
                }

                // Generate unique 26-character filename instead of using original filename
                var uniqueFileName = GenerateUniqueFileName();
                
                // Optionally preserve file extension if provided
                if (!string.IsNullOrEmpty(fileName))
                {
                    var fileExtension = Path.GetExtension(fileName);
                    if (!string.IsNullOrEmpty(fileExtension))
                    {
                        uniqueFileName = $"{uniqueFileName}{fileExtension}";
                    }
                }

                // Create folder structure: companies/{companyId}/{subfolder}/{fileName}
                var key = BuildCompanyFileKey(companyId, uniqueFileName, subfolder);

                return await UploadAsync(_defaultBucketName, key, base64Content);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error uploading base64 file for company {companyId}: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Download a company file
        /// </summary>
        public async Task<Stream> DownloadCompanyFileAsync(string companyId, string fileName, string subfolder = "")
        {
            try
            {
                if (string.IsNullOrEmpty(companyId))
                {
                    throw new ArgumentException("Company ID is required", nameof(companyId));
                }

                if (string.IsNullOrEmpty(fileName))
                {
                    throw new ArgumentException("File name is required", nameof(fileName));
                }

                var key = BuildCompanyFileKey(companyId, fileName, subfolder);
                return await DownloadAsync(_defaultBucketName, key);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error downloading file for company {companyId}: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Delete a company file
        /// </summary>
        public async Task DeleteCompanyFileAsync(string companyId, string fileName, string subfolder = "")
        {
            try
            {
                if (string.IsNullOrEmpty(companyId))
                {
                    throw new ArgumentException("Company ID is required", nameof(companyId));
                }

                if (string.IsNullOrEmpty(fileName))
                {
                    throw new ArgumentException("File name is required", nameof(fileName));
                }

                var key = BuildCompanyFileKey(companyId, fileName, subfolder);
                await DeleteAsync(_defaultBucketName, key);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error deleting file for company {companyId}: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Get a signed URL for a company file
        /// </summary>
        public async Task<string> GetCompanyFileUrlAsync(string companyId, string fileName, string subfolder = "", int expirationHours = 24)
        {
            try
            {
                if (string.IsNullOrEmpty(companyId))
                {
                    throw new ArgumentException("Company ID is required", nameof(companyId));
                }

                if (string.IsNullOrEmpty(fileName))
                {
                    throw new ArgumentException("File name is required", nameof(fileName));
                }

                var key = BuildCompanyFileKey(companyId, fileName, subfolder);
                return await GetSignedUrlAsync(_defaultBucketName, key, expirationHours);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error getting file URL for company {companyId}: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Check if a company file exists
        /// </summary>
        public async Task<bool> CompanyFileExistsAsync(string companyId, string fileName, string subfolder = "")
        {
            try
            {
                if (string.IsNullOrEmpty(companyId))
                {
                    throw new ArgumentException("Company ID is required", nameof(companyId));
                }

                if (string.IsNullOrEmpty(fileName))
                {
                    throw new ArgumentException("File name is required", nameof(fileName));
                }

                var key = BuildCompanyFileKey(companyId, fileName, subfolder);
                return await FileExistsAsync(_defaultBucketName, key);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error checking file existence for company {companyId}: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Build the S3 key for a company file
        /// </summary>
        private string BuildCompanyFileKey(string companyId, string fileName, string subfolder = "")
        {
            var basePath = $"companies/{companyId}";
            
            if (!string.IsNullOrEmpty(subfolder))
            {
                basePath = $"{basePath}/{subfolder.Trim('/')}";
            }

            return $"{basePath}/{fileName}";
        }

        #endregion

        /// <summary>
        /// Generate a unique 26-character string for file naming
        /// </summary>
        private string GenerateUniqueFileName()
        {
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 26)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        /// <summary>
        /// Configure CORS for the bucket to allow localhost access
        /// </summary>
        public async Task<bool> ConfigureCorsForLocalhostAsync(string bucketName = null)
        {
            try
            {
                bucketName = bucketName ?? _defaultBucketName;
                
                var corsConfiguration = new CORSConfiguration
                {
                    Rules = new List<CORSRule>
                    {
                        new CORSRule
                        {
                            AllowedMethods = new List<string> { "GET", "HEAD" },
                            AllowedOrigins = new List<string> 
                            { 
                                "http://localhost:4200",
                                "https://localhost:4200",
                                "http://127.0.0.1:4200",
                                "https://127.0.0.1:4200"
                            },
                            AllowedHeaders = new List<string> { "*" },
                            ExposeHeaders = new List<string> { "ETag", "Content-Length", "Content-Type" },
                            MaxAgeSeconds = 3600
                        }
                    }
                };

                var request = new PutCORSConfigurationRequest
                {
                    BucketName = bucketName,
                    Configuration = corsConfiguration
                };

                await _s3Client.PutCORSConfigurationAsync(request);
                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        /// <summary>
        /// Test the connection to Contabo Object Storage
        /// </summary>
        public async Task<bool> TestConnectionAsync()
        {
            try
            {
                var request = new ListBucketsRequest();
                var response = await _s3Client.ListBucketsAsync(request);
                
                // Log successful connection (optional)
                // Try to configure CORS for localhost access
                await ConfigureCorsForLocalhostAsync();
                
                return true;
            }
            catch (AmazonS3Exception ex)
            {
                var errorMessage = $"AWS S3 Error: {ex.ErrorCode} - {ex.Message}";
                if (ex.ErrorCode == "InvalidAccessKeyId")
                {
                    errorMessage += "\nPlease verify your Contabo Access Key ID is correct.";
                }
                else if (ex.ErrorCode == "SignatureDoesNotMatch")
                {
                    errorMessage += "\nPlease verify your Contabo Secret Access Key is correct.";
                }
                else if (ex.ErrorCode == "NoSuchBucket")
                {
                    errorMessage += "\nPlease verify your bucket name exists in Contabo.";
                }
                
                throw new Exception($"Failed to connect to Contabo Object Storage: {errorMessage}", ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Failed to connect to Contabo Object Storage: {ex.Message}", ex);
            }
        }
    }
} 