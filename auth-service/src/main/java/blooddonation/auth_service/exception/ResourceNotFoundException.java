package blooddonation.auth_service.exception;

/*
 * We use this exception when requested data does not exist.
 *
 * Example:
 * The client requests User ID 100,
 * but User 100 is not in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    /*
     * Receive an error message and send it to
     * the parent RuntimeException class.
     */
    public ResourceNotFoundException(String message) {
        super(message);
    }
}