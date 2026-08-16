package blooddonation.bloodbank_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

@Entity
@Table(name = "blood_requests")
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "bloodBankId is required")
    @Column(nullable = false)
    private Long bloodBankId;

    @NotBlank(message = "bloodGroup is required")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "bloodGroup must be a valid blood group")
    @Column(nullable = false)
    private String bloodGroup;

    @NotNull(message = "quantityUnits is required")
    @Min(value = 1, message = "quantityUnits must be at least 1")
    @Column(nullable = false)
    private Integer quantityUnits;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodRequestStatus status = BloodRequestStatus.PENDING;

    @NotNull(message = "requestedDate is required")
    @Column(nullable = false)
    private LocalDate requestedDate;

    public BloodRequest() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBloodBankId() { return bloodBankId; }
    public void setBloodBankId(Long bloodBankId) { this.bloodBankId = bloodBankId; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public Integer getQuantityUnits() { return quantityUnits; }
    public void setQuantityUnits(Integer quantityUnits) { this.quantityUnits = quantityUnits; }

    public BloodRequestStatus getStatus() { return status; }
    public void setStatus(BloodRequestStatus status) { this.status = status; }

    public LocalDate getRequestedDate() { return requestedDate; }
    public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }
}
