package blooddonation.auth_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/*
 * This class represents one user in the blood donation system.
 *
 * @Entity means this class will become a database table.
 */
@Entity
@Table(name = "users")
public class User {

    /*
     * This is the primary key of the table.
     * MySQL will automatically create the ID numbers.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * User's full name.
     * Example: "Nimal Perera"
     */
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    /*
     * User's email address.
     * It must be unique.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    @Column(nullable = false, unique = true)
    private String email;

    /*
     * User's blood group.
     * Example: A+, B+, O-, AB+
     */
    @NotBlank(message = "Blood group is required")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Blood group must be A+, A-, B+, B-, AB+, AB-, O+ or O-")
    @Column(nullable = false)
    private String bloodGroup;

    /*
     * User's phone number.
     */
    private String phone;

    /*
     * User's city.
     * Example: Colombo, Kandy, Galle
     */
    private String city;

    /*
     * User role.
     * Example: DONOR or BLOOD_BANK
     */
    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(DONOR|BLOOD_BANK|ADMIN)$", message = "Role must be DONOR, BLOOD_BANK or ADMIN")
    @Column(nullable = false)
    private String role;

    /*
     * Empty constructor required by JPA.
     */
    public User() {
    }

    /*
     * Return the user's ID.
     */
    public Long getId() {
        return id;
    }

    /*
     * Set the user's ID.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /*
     * Return the user's name.
     */
    public String getName() {
        return name;
    }

    /*
     * Set the user's name.
     */
    public void setName(String name) {
        this.name = name;
    }

    /*
     * Return the user's email.
     */
    public String getEmail() {
        return email;
    }

    /*
     * Set the user's email.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /*
     * Return the user's blood group.
     */
    public String getBloodGroup() {
        return bloodGroup;
    }

    /*
     * Set the user's blood group.
     */
    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    /*
     * Return the user's phone number.
     */
    public String getPhone() {
        return phone;
    }

    /*
     * Set the user's phone number.
     */
    public void setPhone(String phone) {
        this.phone = phone;
    }

    /*
     * Return the user's city.
     */
    public String getCity() {
        return city;
    }

    /*
     * Set the user's city.
     */
    public void setCity(String city) {
        this.city = city;
    }

    /*
     * Return the user's role.
     */
    public String getRole() {
        return role;
    }

    /*
     * Set the user's role.
     */
    public void setRole(String role) {
        this.role = role;
    }
}