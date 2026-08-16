package blooddonation.auth_service.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/*
 * This class catches errors from our application.
 *
 * Instead of sending large Java error messages,
 * it sends simple JSON responses to the client.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * Handle situations where a requested user
     * cannot be found.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(
            ResourceNotFoundException exception) {

        // Create an object to hold the error message.
        Map<String, String> error = new HashMap<>();

        // Add the exception message.
        error.put("error", exception.getMessage());

        // Send HTTP 404 Not Found.
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(error);
    }

    /*
     * Handle business errors.
     *
     * Example:
     * Trying to create two users with the same email.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException exception) {

        Map<String, String> error = new HashMap<>();

        error.put("error", exception.getMessage());

        // Send HTTP 400 Bad Request.
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(error);
    }

    /*
     * Handle validation errors.
     *
     * Examples:
     * Empty name
     * Empty blood group
     * Invalid email
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(
            MethodArgumentNotValidException exception) {

        // Store all validation errors here.
        Map<String, String> errors = new HashMap<>();

        // Read every invalid field.
        exception.getBindingResult()
                .getFieldErrors()
                .forEach(fieldError -> {

                    // Example:
                    // "name": "Name is required"
                    errors.put(
                            fieldError.getField(),
                            fieldError.getDefaultMessage()
                    );
                });

        // Send HTTP 400.
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(errors);
    }
}