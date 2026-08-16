package blooddonation.donation_service.dto;

import blooddonation.donation_service.entity.DonationStatus;
import jakarta.validation.constraints.NotNull;

public class DonationStatusRequest {

    @NotNull(message = "status is required")
    private DonationStatus status;

    public DonationStatus getStatus() {
        return status;
    }

    public void setStatus(DonationStatus status) {
        this.status = status;
    }
}
