package blooddonation.bloodbank_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "blood_stock")
public class BloodStock {

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
    @Min(value = 0, message = "quantityUnits must be greater than or equal to 0")
    @Column(nullable = false)
    private Integer quantityUnits;

    public BloodStock() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBloodBankId() { return bloodBankId; }
    public void setBloodBankId(Long bloodBankId) { this.bloodBankId = bloodBankId; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public Integer getQuantityUnits() { return quantityUnits; }
    public void setQuantityUnits(Integer quantityUnits) { this.quantityUnits = quantityUnits; }
}
