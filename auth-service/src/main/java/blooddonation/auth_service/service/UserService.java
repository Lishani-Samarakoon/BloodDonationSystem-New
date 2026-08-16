package blooddonation.auth_service.service;

import java.util.List;

import org.springframework.stereotype.Service;

import blooddonation.auth_service.entity.User;
import blooddonation.auth_service.exception.ResourceNotFoundException;
import blooddonation.auth_service.repository.UserRepository;

/*
 * This class contains the business logic for users.
 *
 * Controller:
 * Receives HTTP requests.
 *
 * Service:
 * Makes decisions and applies business rules.
 *
 * Repository:
 * Communicates with MySQL.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    /*
     * Spring automatically gives us UserRepository.
     *
     * This is called constructor injection.
     */
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /*
     * Create a new user.
     */
    public User createUser(User user) {

        /*
         * Check whether another user already has
         * this email address.
         */
        if (userRepository.existsByEmail(user.getEmail())) {

            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        // Save the new user in MySQL.
        return userRepository.save(user);
    }

    /*
     * Return every user.
     */
    public List<User> getAllUsers() {

        // Ask the repository for every database record.
        return userRepository.findAll();
    }

    /*
     * Return one user using their ID.
     */
    public User getUserById(Long id) {

        /*
         * Try to find the user.
         *
         * If the user does not exist, throw our
         * ResourceNotFoundException.
         */
        return userRepository
                .findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User with ID "
                                        + id
                                        + " was not found"
                        )
                );
    }

    /*
     * Update an existing user.
     */
    public User updateUser(
            Long id,
            User newUserDetails) {

        // Find the existing user first.
        User existingUser = getUserById(id);

        /*
         * If the email is being changed,
         * make sure someone else does not already use it.
         */
        if (!existingUser.getEmail()
                .equals(newUserDetails.getEmail())
                && userRepository.existsByEmail(
                        newUserDetails.getEmail()
                )) {

            throw new IllegalArgumentException(
                    "Email is already registered"
            );
        }

        // Copy the new information into the existing user.
        existingUser.setName(newUserDetails.getName());

        existingUser.setEmail(newUserDetails.getEmail());

        existingUser.setBloodGroup(
                newUserDetails.getBloodGroup()
        );

        existingUser.setPhone(newUserDetails.getPhone());

        existingUser.setCity(newUserDetails.getCity());

        existingUser.setRole(newUserDetails.getRole());

        // Save the updated information in MySQL.
        return userRepository.save(existingUser);
    }

    /*
     * Delete a user.
     */
    public void deleteUser(Long id) {

        // Make sure the user actually exists.
        User existingUser = getUserById(id);

        // Delete the user from MySQL.
        userRepository.delete(existingUser);
    }
}