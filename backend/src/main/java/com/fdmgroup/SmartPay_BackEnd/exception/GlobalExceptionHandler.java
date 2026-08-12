package com.fdmgroup.SmartPay_BackEnd.exception;


import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailSendException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.exception.ExceptionShapeDTO;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeExpiredException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeInvalidatedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeMismatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccessCodeUsedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.AccountLockedException;
import com.fdmgroup.SmartPay_BackEnd.exception.auth.EmailAlreadyVerifiedException;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardLockActionsRequiresUserRoleException;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardLockRequestInvalidType;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardStatusOperationNotAllowedException;
import com.fdmgroup.SmartPay_BackEnd.exception.card.CardUnauthorizedAccessException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.CardRequestLimitExceededException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.CardRequestNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.cardRequest.InvalidCardRequestStatusException;
import com.fdmgroup.SmartPay_BackEnd.exception.notification.NotificationNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.InvalidRecurringPayeeException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeAlreadyExistsException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.PayeeNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.payee.RecurringPayeeForbiddenAccessException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.CustomerInfoNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.EmailNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.LoginAccountDisabledException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.LoginInvalidCredentialsException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.LoginUnverifiedEmailException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.PasswordResetDoNotMatchException;
import com.fdmgroup.SmartPay_BackEnd.exception.user.UserNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InsufficientFundsException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.InvalidWithdrawAmountException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.PaymentMethodNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletTransactionForbiddenAccessException;
import com.fdmgroup.SmartPay_BackEnd.exception.wallet.WalletTransactionNotFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

        private static final String STATUS = "status";
        private static final String ERROR = "error";
        private static final String MESSAGE = "message";

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException exception) {
                Map<String, String> errors = new HashMap<>();
                exception.getBindingResult().getFieldErrors()
                                .forEach(err -> errors.put(err.getField(), err.getDefaultMessage()));
                exception.getBindingResult().getGlobalErrors()
                                .forEach(err -> errors.put(
                                                err.getCode() != null ? err.getCode() : err.getObjectName(),
                                                err.getDefaultMessage()));
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_CONTENT).body(errors);
        }

        @ExceptionHandler(PasswordResetDoNotMatchException.class)
        public ResponseEntity<Map<String, String>> handlePasswordResetDoNotMatchExceptions(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "400");
                errorBody.put(ERROR, "Passwords does not match!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(AccessCodeUsedException.class)
        public ResponseEntity<Map<String, String>> handleAccessCodeUsedExceptions(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "401");
                errorBody.put(ERROR, "Code has already been used!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(AccessCodeExpiredException.class)
        public ResponseEntity<Map<String, String>> handleAccessCodeExpiredExceptions(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "401");
                errorBody.put(ERROR, "Code has expired!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(AccessCodeMismatchException.class)
        public ResponseEntity<Map<String, String>> handleAccessCodeMismatchExceptions(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "400");
                errorBody.put(ERROR, "Code is invalid!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(AccessCodeInvalidatedException.class)
        public ResponseEntity<Map<String, String>> handleAccessCodeInvalidatedExceptions(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "410");
                errorBody.put(ERROR, "Code has been invalidated!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.GONE).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(EmailNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleEmailNotFoundExceptions(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "404");
                errorBody.put(ERROR, "Email not found!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleUserNotFoundExceptions(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "404");
                errorBody.put(ERROR, "User not found!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(EmailAlreadyVerifiedException.class)
        public ResponseEntity<Map<String, String>> handleEmailAlreadyVerifiedExceptions(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "409");
                errorBody.put(ERROR, "Email already verified!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.CONFLICT).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(AccountLockedException.class)
        public ResponseEntity<Map<String, String>> handleAccountLockedExceptions(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "429");
                errorBody.put(ERROR, "Account is locked!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(LoginInvalidCredentialsException.class)
        public ResponseEntity<Map<String, String>> handleLoginInvalidCredentials(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "401");
                errorBody.put(ERROR, "Unauthorized");
                errorBody.put(MESSAGE, "Incorrect email or password. Please try again.");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(LoginUnverifiedEmailException.class)
        public ResponseEntity<Map<String, String>> handleLoginUnverified(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "403");
                errorBody.put(ERROR, "Forbidden");
                errorBody.put(MESSAGE, "Your email address is not verified. Please check your inbox and verify your email to continue.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(LoginAccountDisabledException.class)
        public ResponseEntity<Map<String, String>> handleLoginDisabled(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "403");
                errorBody.put(ERROR, "Forbidden");
                errorBody.put(MESSAGE, "We can't sign you in right now. Please contact support.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(CustomerInfoNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleCustomerNotFoundInDatabase(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "404");
                errorBody.put(ERROR, "Not Found");
                errorBody.put(MESSAGE, "Unable to retrieve customer information.");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(InsufficientFundsException.class)
        public ResponseEntity<Map<String, String>> handleInsufficientFunds(InsufficientFundsException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "422");
                errorBody.put(ERROR, "Insufficient Funds");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(WalletNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleWalletNotFound(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "404");
                errorBody.put(ERROR, "Wallet id not found!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(InvalidWithdrawAmountException.class)
        public ResponseEntity<Map<String, String>> handleInvalidWithdrawAmount(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "400");
                errorBody.put(ERROR, "Invalid Withdrawal Amount");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(PaymentMethodNotFoundException.class)
        public ResponseEntity<Map<String, String>> handlePaymentMethodNotFound(PaymentMethodNotFoundException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "404");
                errorBody.put(ERROR, "Not Found");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(PayeeAlreadyExistsException.class)
        public ResponseEntity<Map<String, String>> handlePayeeAlreadyExists(PayeeAlreadyExistsException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "409");
                errorBody.put(ERROR, "Conflict");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.CONFLICT).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(InvalidPayeeException.class)
        public ResponseEntity<Map<String, String>> handleInvalidPayee(InvalidPayeeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "400");
                errorBody.put(ERROR, "Bad Request");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(InvalidRecurringPayeeException.class)
        public ResponseEntity<Map<String, String>> handleInvalidRecurringPayee(InvalidRecurringPayeeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "400");
                errorBody.put(ERROR, "Bad Request");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }
        
        @ExceptionHandler(PayeeNotFoundException.class)
        public ResponseEntity<Map<String, String>> handlePayeeNotFound(PayeeNotFoundException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "404");
                errorBody.put(ERROR, "Not Found");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(MailSendException.class)
        public ResponseEntity<Map<String, String>> handleMailSendException(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "503");
                errorBody.put(ERROR, "Service Unavailable");
                errorBody.put(MESSAGE, "Email service is currently unavailable.");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(ResponseStatusException.class)
        public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, String.valueOf(ex.getStatusCode().value()));
                errorBody.put(ERROR, ex.getReason() != null ? ex.getReason() : "Error");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(ex.getStatusCode()).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, String>> handleAllExceptions(Exception ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "500");
                errorBody.put(ERROR, "Internal Server Error");
                errorBody.put(MESSAGE, ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        // A different declaration of errors that avoids multiple re-writes of the same text. Implemented using a DTO and a helper method.
        @ExceptionHandler(CardStatusOperationNotAllowedException.class)
        public ResponseEntity<ExceptionShapeDTO> handleCardStatusOperationNotAllowed(CardStatusOperationNotAllowedException ex) {
                return errorResponseBuilder(HttpStatus.CONFLICT, ex.getMessage());
        }

        @ExceptionHandler(CardUnauthorizedAccessException.class)
        public ResponseEntity<ExceptionShapeDTO> handleCardUnauthorizedAccess(CardUnauthorizedAccessException ex) {
                return errorResponseBuilder(HttpStatus.UNAUTHORIZED, ex.getMessage());
        }

        @ExceptionHandler(CardNotFoundException.class)
        public ResponseEntity<ExceptionShapeDTO> handleCardNotFound(CardNotFoundException ex) {
                return errorResponseBuilder(HttpStatus.NOT_FOUND, ex.getMessage());
        }

        @ExceptionHandler(NotificationNotFoundException.class)
        public ResponseEntity<ExceptionShapeDTO> handleNotificationNotFound(NotificationNotFoundException ex) {
                return errorResponseBuilder(HttpStatus.NOT_FOUND, ex.getMessage());
        }


        //US 09-02-18
        @ExceptionHandler(CardRequestNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleCardRequestNotFound(CardRequestNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", ex.getMessage()));
        }

        //US 09-02-18
        @ExceptionHandler(InvalidCardRequestStatusException.class)
        public ResponseEntity<Map<String, String>> handleInvalidCardRequestStatus(InvalidCardRequestStatusException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ex.getMessage()));
        }

        //US 09-02-18
        @ExceptionHandler(CardRequestLimitExceededException.class)
        public ResponseEntity<Map<String, String>> handleCardRequestLimitExceeded(CardRequestLimitExceededException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", ex.getMessage()));
        }

        @ExceptionHandler(CardLockRequestInvalidType.class)
        public ResponseEntity<ExceptionShapeDTO> handleCardLockRequestInvalidType(CardLockRequestInvalidType ex) {
                return errorResponseBuilder(HttpStatus.BAD_REQUEST, ex.getMessage());
        }

        @ExceptionHandler
        public ResponseEntity<ExceptionShapeDTO> handleCardLockActionsRequiresUserRole(CardLockActionsRequiresUserRoleException ex) {
                return errorResponseBuilder(HttpStatus.FORBIDDEN, ex.getMessage());
        }

        //US 11-01-16
        @ExceptionHandler(WalletTransactionNotFoundException.class)
        public ResponseEntity<Map<String, String>> handleWalletTransactionNotFound(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "404");
                errorBody.put(ERROR, "Wallet Transaction id not found!");
                errorBody.put(MESSAGE, ex.getMessage());
                return ResponseEntity.status(HttpStatus.NOT_FOUND).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        //US 11-01-16
        @ExceptionHandler(WalletTransactionForbiddenAccessException.class)
        public ResponseEntity<Map<String, String>> WalletTransactionForbiddenAccessException(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "403");
                errorBody.put(ERROR, "Forbidden");
                errorBody.put(MESSAGE, "Wallet Transaction does not belong to User's Wallet.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        //US 12-02-14
        @ExceptionHandler(RecurringPayeeForbiddenAccessException.class)
        public ResponseEntity<Map<String, String>> RecurringPayeeForbiddenAccessException(RuntimeException ex) {
                Map<String, String> errorBody = new HashMap<>();
                errorBody.put(STATUS, "403");
                errorBody.put(ERROR, "Forbidden");
                errorBody.put(MESSAGE, "Recurring Payement does not belong to User.");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).contentType(MediaType.APPLICATION_JSON).body(errorBody);
        }

        /**
         * Creates a standardized error response body for the supplied HTTP status
         * and error message.
         *
         * @param status the HTTP status associated with the error
         * @param message the error message to include in the response body
         * @return a {@link ResponseEntity} containing an {@link ExceptionShapeDTO}
         *         with the status code, reason phrase, and error message
         */
        private ResponseEntity<ExceptionShapeDTO> errorResponseBuilder(HttpStatus status, String message) {
                // This is meant to be used for simple error shapes.
                // For more complex error shapes, either update this to handle them or manually create error shapes instead (how it was done before).

                ExceptionShapeDTO body = new ExceptionShapeDTO(
                        status.value(),
                        status.getReasonPhrase(),
                        message
                );

                return ResponseEntity
                        .status(status)
                        .body(body);
        }

        @ExceptionHandler(MethodArgumentTypeMismatchException.class)
        public ResponseEntity<Map<String, String>> handleMethodArgumentTypeMismatch(
                MethodArgumentTypeMismatchException ex) {

        Map<String, String> errorBody = new HashMap<>();

        errorBody.put("status", "400");
        errorBody.put("error", "Bad Request");

        if ("favourite".equals(ex.getName())
                && Boolean.class.equals(ex.getRequiredType())) {
                errorBody.put("message", "Only accepting TRUE or FALSE.");
        } else {
                errorBody.put("message", "Invalid request parameter.");
        }

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorBody);
        }
}
