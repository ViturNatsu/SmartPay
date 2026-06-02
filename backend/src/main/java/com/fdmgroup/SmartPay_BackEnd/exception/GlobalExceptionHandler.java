package com.fdmgroup.SmartPay_BackEnd.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSendException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeExpiredException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeInvalidatedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeMismatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeUsedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccountLockedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.EmailAlreadyVerifiedException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeAlreadyExistsException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.CustomerInfoNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.EmailNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.LoginAccountDisabledException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.LoginInvalidCredentialsException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.LoginUnverifiedEmailException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.PasswordResetDoNotMatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final String STATUS = "status";
        private static final String ERROR = "error";
        private static final String MESSAGE = "message";

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, String>> handleValidationErrors(
                        MethodArgumentNotValidException exception) {
                Map<String, String> errors = new HashMap<>();

                exception.getBindingResult()
                                .getFieldErrors()
                                .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
                exception.getBindingResult()
                                .getGlobalErrors()
                                .forEach(err -> errors.put(
                                                err.getCode() != null ? err.getCode() : err.getObjectName(),
                                                err.getDefaultMessage()));

                return ResponseEntity
                                .status(HttpStatus.UNPROCESSABLE_CONTENT)
                                .body(errors);
        }

        @ExceptionHandler(PasswordResetDoNotMatchException.class)
        public ResponseEntity<Map<String, String>> handlePasswordResetDoNotMatchExceptions(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "400");
                errorBody.put(ERROR, "Passwords does not match!");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(AccessCodeUsedException.class)
        public ResponseEntity<Map<String, String>> handleAccessCodeUsedExceptions(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "401");
                errorBody.put(ERROR, "Code has already been used!");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(AccessCodeExpiredException.class)
        public ResponseEntity<Map<String, String>> handleAccessCodeExpiredExceptions(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "401");
                errorBody.put(ERROR, "Code has expired!");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(AccessCodeMismatchException.class)
        public ResponseEntity<Map<String, String>> handleAccessCodeMismatchExceptions(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "400");
                errorBody.put(ERROR, "Code is invalid!");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(AccessCodeInvalidatedException.class)
        public ResponseEntity<Map<String, String>> handleAccessCodeInvalidatedExceptions(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "410");
                errorBody.put(ERROR, "Code has been invalidated!");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.GONE)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(EmailNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleEmailNotFoundExceptions(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "404");
                errorBody.put(ERROR, "Email not found!");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleUserNotFoundExceptions(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "404");
                errorBody.put(ERROR, "User not found!");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(EmailAlreadyVerifiedException.class)
        public ResponseEntity<Map<String, String>> handleEmailAlreadyVerifiedExceptions(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "409");
                errorBody.put(ERROR, "Email already verified!");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(AccountLockedException.class)
        public ResponseEntity<Map<String, String>> handleAccountLockedExceptions(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "429");
                errorBody.put(ERROR, "Account is locked!");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                                .status(HttpStatus.TOO_MANY_REQUESTS)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        // US-F02-02-01 (Sign In)
        @ExceptionHandler(LoginInvalidCredentialsException.class)
        public ResponseEntity<Map<String, String>> handleLoginInvalidCredentials(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put("status", "401");
                errorBody.put("error", "Unauthorized");
                errorBody.put("message", "Incorrect email or password. Please try again.");

                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        // US-F02-02-01 (Sign In)
        @ExceptionHandler(LoginUnverifiedEmailException.class)
        public ResponseEntity<Map<String, String>> handleLoginUnverified(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put("status", "403");
                errorBody.put("error", "Forbidden");
                errorBody.put("message",
                                "Your email address is not verified. Please check your inbox and verify your email to continue.");

                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        // US-F02-02-01 (Sign In)
        @ExceptionHandler(LoginAccountDisabledException.class)
        public ResponseEntity<Map<String, String>> handleLoginDisabled(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put("status", "403");
                errorBody.put("error", "Forbidden");
                errorBody.put("message", "We can’t sign you in right now. Please contact support.");

                return ResponseEntity
                                .status(HttpStatus.FORBIDDEN)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(CustomerInfoNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleCustomerNotFoundInDatabase(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put("status", "404");
                errorBody.put("error", "Not Found");
                errorBody.put("message", "Unable to retrieve customer information.");

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }
        
        // US-09-01-28 (Wallet Withdraw)
        @ExceptionHandler(InsufficientFundsException.class)
        public ResponseEntity<Map<String, String>> handleInsufficientFunds(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "422");
                errorBody.put(ERROR, "Insufficient Funds");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                        .status(HttpStatus.UNPROCESSABLE_ENTITY)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(errorBody);
        }

        // US-09-01-28 (Wallet Withdraw)
        @ExceptionHandler(InvalidWithdrawAmountException.class)
        public ResponseEntity<Map<String, String>> handleInvalidWithdrawAmount(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "400");
                errorBody.put(ERROR, "Invalid Withdrawal Amount");
                errorBody.put(MESSAGE, ex.getMessage());

                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(errorBody);
        }

        @ExceptionHandler(MailSendException.class)
        public ResponseEntity<Map<String, String>> handleMailSendException(RuntimeException ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put("status", "503");
                errorBody.put("error", "Service Unavailable");
                errorBody.put("message", "Email service is currently unavailable.");

                return ResponseEntity
                                .status(HttpStatus.SERVICE_UNAVAILABLE)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {

                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "500");
                errorBody.put(ERROR, "Internal Server Error");
                errorBody.put(MESSAGE, ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");

                return ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(PayeeAlreadyExistsException.class)
        public ResponseEntity<Map<String, String>> handlePayeeAlreadyExists(PayeeAlreadyExistsException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "409");
                errorBody.put(ERROR, "Conflict");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

        @ExceptionHandler(InvalidPayeeException.class)
        public ResponseEntity<Map<String, String>> handleInvalidPayee(InvalidPayeeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "400");
                errorBody.put(ERROR, "Bad Request");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(errorBody);
        }

}
