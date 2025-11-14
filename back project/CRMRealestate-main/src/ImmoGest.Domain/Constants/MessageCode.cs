using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ImmoGest.Domain
{
    public static class MessageCode
    {
        /// <summary>
        /// this code represent a fake error for testing purposes.
        /// </summary>
        public const string NotFound = "not_found";
        /// <summary>
        /// this code represent a fake error for testing purposes.
        /// </summary>
        public const string UserNotFound = "user_not_found";

        #region Authentification 

        public const string Connected = "connected_successfully";
        #endregion

    }
}
