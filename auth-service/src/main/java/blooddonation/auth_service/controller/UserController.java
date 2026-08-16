package blooddonation.auth_service.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import blooddonation.auth_service.entity.User;
import blooddonation.auth_service.service.UserService;
import jakarta.validation.Valid;

/*
 * This class creates our REST API endpoints.
 *
 * Every endpoint begins with:
 *
 * /api/users
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    /*
     * Spring automatically gives this controller
     * our UserService.
     */
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /*
     * CREATE USER
     *
     * HTTP:
     * POST /api/users
     */
    @PostMapping
    public ResponseEntity<User> createUser(
            @Valid @RequestBody User user) {

        // Create the new user.
        User createdUser =
                userService.createUser(user);

        // Return HTTP 201 Created.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdUser);
    }

    /*
     * GET ALL USERS
     *
     * HTTP:
     * GET /api/users
     */
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    /*
     * GET ONE USER
     *
     * Example:
     * GET /api/users/1
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userService.getUserById(id)
        );
    }

    /*
     * UPDATE USER
     *
     * Example:
     * PUT /api/users/1
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody User user) {

        return ResponseEntity.ok(
                userService.updateUser(id, user)
        );
    }

    /*
     * DELETE USER
     *
     * Example:
     * DELETE /api/users/1
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id) {

        // Delete the selected user.
        userService.deleteUser(id);

        // HTTP 204 means the delete succeeded.
        return ResponseEntity.noContent().build();
    }
}