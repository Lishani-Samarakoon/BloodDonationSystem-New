package blooddonation.donation_service.controller;

import blooddonation.donation_service.dto.DonationStatusRequest;
import blooddonation.donation_service.entity.Donation;
import blooddonation.donation_service.entity.DonationStatus;
import blooddonation.donation_service.service.DonationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @PostMapping
    @Operation(summary = "Create a donation record", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<Donation> createDonation(@Valid @RequestBody Donation donation) {
        return ResponseEntity.status(HttpStatus.CREATED).body(donationService.createDonation(donation));
    }

    @GetMapping
    @Operation(summary = "Get all donations", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<Donation>> getAllDonations() {
        return ResponseEntity.ok(donationService.getAllDonations());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get donation by id", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<Donation> getDonationById(@PathVariable Long id) {
        return ResponseEntity.ok(donationService.getDonationById(id));
    }

    @GetMapping("/donor/{donorId}")
    @Operation(summary = "Get donations by donor id", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<Donation>> getDonationsByDonorId(@PathVariable Long donorId) {
        return ResponseEntity.ok(donationService.getDonationsByDonorId(donorId));
    }

    @GetMapping("/blood-group/{bloodGroup}")
    @Operation(summary = "Get donations by blood group", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<Donation>> getDonationsByBloodGroup(@PathVariable String bloodGroup) {
        return ResponseEntity.ok(donationService.getDonationsByBloodGroup(bloodGroup));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get donations by status", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<Donation>> getDonationsByStatus(@PathVariable DonationStatus status) {
        return ResponseEntity.ok(donationService.getDonationsByStatus(status));
    }

    @GetMapping("/search")
    @Operation(summary = "Search donations", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<Donation>> searchDonations(
            @RequestParam(required = false) Long donorId,
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) DonationStatus status) {
        return ResponseEntity.ok(donationService.searchDonations(donorId, bloodGroup, status));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update donation", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<Donation> updateDonation(@PathVariable Long id, @Valid @RequestBody Donation donation) {
        return ResponseEntity.ok(donationService.updateDonation(id, donation));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update donation status", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<Donation> updateDonationStatus(@PathVariable Long id, @Valid @RequestBody DonationStatusRequest request) {
        return ResponseEntity.ok(donationService.updateDonationStatus(id, request.getStatus()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete donation", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return ResponseEntity.noContent().build();
    }
}
