// class ApiError extends Error{
//     constructor(
//         statusCode,
//         message = "Something went Wrong!!!",
//         error = [],
//         statck = ""
//     ){
//         super(message)
//         this.statusCode = statusCode
//         this.error = error
//         this.stack = stack
//         this.data = null
//         this.message = message
//         this.success = false;





//         if(stack){
//             this.stack = stack
//         }
//         else{
//             Error.captureStackTrace(this, this.constructor);
//         }



//     }
// }

class ApiError extends Error {
  constructor(statusCode, message, errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };

