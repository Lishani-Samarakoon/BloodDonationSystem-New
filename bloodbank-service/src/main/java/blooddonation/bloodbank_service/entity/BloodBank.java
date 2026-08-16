package blooddonation.bloodbank_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "blood_banks")
public class BloodBank {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "address is required")
    @Column(nullable = false)
    private String address;

    @NotBlank(message = "city is required")
    @Column(nullable = false)
    private String city;

    @NotBlank(message = "phone is required")
    @Column(nullable = false)
    private String phone;

    public BloodBank() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
