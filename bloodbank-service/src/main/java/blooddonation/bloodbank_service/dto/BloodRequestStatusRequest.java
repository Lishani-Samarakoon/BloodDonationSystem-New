package blooddonation.bloodbank_service.dto;

import blooddonation.bloodbank_service.entity.BloodRequestStatus;
import jakarta.validation.constraints.NotNull;

public class BloodRequestStatusRequest {

    @NotNull(message = "status is required")
    private BloodRequestStatus status;

    public BloodRequestStatus getStatus() {
        return status;
    }

    public void setStatus(BloodRequestStatus status) {
        this.status = status;
    }
}
