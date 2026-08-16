package blooddonation.bloodbank_service.controller;

import blooddonation.bloodbank_service.dto.BloodRequestStatusRequest;
import blooddonation.bloodbank_service.entity.BloodRequest;
import blooddonation.bloodbank_service.service.BloodRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bloodrequests")
public class BloodRequestController {

    private final BloodRequestService bloodRequestService;

    public BloodRequestController(BloodRequestService bloodRequestService) {
        this.bloodRequestService = bloodRequestService;
    }

    @PostMapping
    @Operation(summary = "Create blood request", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodRequest> createBloodRequest(@Valid @RequestBody BloodRequest bloodRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bloodRequestService.createBloodRequest(bloodRequest));
    }

    @GetMapping
    @Operation(summary = "Get all blood requests", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<BloodRequest>> getAllBloodRequests() {
        return ResponseEntity.ok(bloodRequestService.getAllBloodRequests());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get blood request by id", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodRequest> getBloodRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(bloodRequestService.getBloodRequestById(id));
    }

    @GetMapping("/blood-bank/{bloodBankId}")
    @Operation(summary = "Get blood requests by blood bank id", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<BloodRequest>> getByBloodBank(@PathVariable Long bloodBankId) {
        return ResponseEntity.ok(bloodRequestService.getBloodRequestsByBloodBankId(bloodBankId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update blood request", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodRequest> updateBloodRequest(@PathVariable Long id, @Valid @RequestBody BloodRequest bloodRequest) {
        return ResponseEntity.ok(bloodRequestService.updateBloodRequest(id, bloodRequest));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update blood request status", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodRequest> updateBloodRequestStatus(
            @PathVariable Long id,
            @Valid @RequestBody BloodRequestStatusRequest request) {
        return ResponseEntity.ok(bloodRequestService.updateBloodRequestStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete blood request", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<Void> deleteBloodRequest(@PathVariable Long id) {
        bloodRequestService.deleteBloodRequest(id);
        return ResponseEntity.noContent().build();
    }
}
