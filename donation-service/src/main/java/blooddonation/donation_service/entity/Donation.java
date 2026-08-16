package blooddonation.donation_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

@Entity
@Table(name = "donations")
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "donorId is required")
    @Column(nullable = false)
    private Long donorId;

    @NotBlank(message = "bloodGroup is required")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "bloodGroup must be a valid blood group")
    @Column(nullable = false)
    private String bloodGroup;

    @NotNull(message = "quantityMl is required")
    @Min(value = 1, message = "quantityMl must be at least 1")
    @Column(nullable = false)
    private Integer quantityMl;

    @NotBlank(message = "location is required")
    @Column(nullable = false)
    private String location;

    @NotNull(message = "availableDate is required")
    @FutureOrPresent(message = "availableDate cannot be in the past")
    @Column(nullable = false)
    private LocalDate availableDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonationStatus status = DonationStatus.AVAILABLE;

    public Donation() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDonorId() { return donorId; }
    public void setDonorId(Long donorId) { this.donorId = donorId; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public Integer getQuantityMl() { return quantityMl; }
    public void setQuantityMl(Integer quantityMl) { this.quantityMl = quantityMl; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDate getAvailableDate() { return availableDate; }
    public void setAvailableDate(LocalDate availableDate) { this.availableDate = availableDate; }

    public DonationStatus getStatus() { return status; }
    public void setStatus(DonationStatus status) { this.status = status; }
}
