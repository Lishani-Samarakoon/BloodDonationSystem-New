package blooddonation.auth_service.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import blooddonation.auth_service.entity.User;

/*
 * This interface talks to the MySQL database.
 *
 * JpaRepository already gives us:
 * save()
 * findAll()
 * findById()
 * delete()
 */
public interface UserRepository extends JpaRepository<User, Long> {

    /*
     * Find a user by email.
     */
    Optional<User> findByEmail(String email);

    /*
     * Check if an email already exists in the database.
     */
    boolean existsByEmail(String email);
}