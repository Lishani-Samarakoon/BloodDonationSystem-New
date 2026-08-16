package blooddonation.auth_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/*
 * This is the main starting file of the Auth Service.
 * When we run this file, Spring Boot starts the application.
 */
@SpringBootApplication
public class AuthServiceApplication {

    /*
     * Java starts the program from this main method.
     */
    public static void main(String[] args) {

        // Start the Spring Boot application.
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}