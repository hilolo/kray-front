using ImmoGest.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using ResultNet;
using System.Threading.Tasks;

namespace ImmoGest.Api.Controllers
{


    /// <summary>
    /// the base controller for common code reuse
    /// </summary>
    [ApiController]
    [Authorize]
    public class Base : ControllerBase
    {
        /// <summary>
        ///
        /// </summary>
        public Base()
        {

        }

        /// <summary>
        /// this method is used to return the proper action result type
        /// </summary>
        /// <typeparam name="TResult">the type of the Result being processed</typeparam>
        /// <param name="result">the result to process</param>
        /// <returns>the proper Action Result base on the passed in Result</returns>
        public async Task<ActionResult<TResult>> ActionResultForAsync<TResult>(Task<TResult> taskResult)
            where TResult : Result => ActionResultFor(await taskResult);

        /// <summary>
        /// this method is used to return the proper action result type
        /// </summary>
        /// <typeparam name="TResult">the type of the Result being processed</typeparam>
        /// <param name="result">the result to process</param>
        /// <returns>the proper Action Result base on the passed in Result</returns>
        public ActionResult<TResult> ActionResultFor<TResult>(TResult result)
            where TResult : Result
        {
            // the operation has failed
            if (result.Status == ResultStatus.Failed)
            {
                // something went wrong (exception)
                if (result.HasErrors())
                    return StatusCode(500, result);

                // user is not authorized
                if (result.Code.Equals("Unauth"))
                    return StatusCode(StatusCodes.Status403Forbidden, result);

                // result not found - only return 404 for specific "not_found" code
                if (result.Code == "not_found")
                    return NotFound(result);

                //if nothing else, bad request
                return BadRequest(result);
            }

            // all set, return the operation result
            return Ok(result);
        }
    }
}
