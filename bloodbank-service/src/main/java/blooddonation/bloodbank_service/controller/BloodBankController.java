package blooddonation.bloodbank_service.controller;

import blooddonation.bloodbank_service.entity.BloodBank;
import blooddonation.bloodbank_service.service.BloodBankService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bloodbanks")
public class BloodBankController {

    private final BloodBankService bloodBankService;

    public BloodBankController(BloodBankService bloodBankService) {
        this.bloodBankService = bloodBankService;
    }

    @PostMapping
    @Operation(summary = "Create blood bank", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodBank> createBloodBank(@Valid @RequestBody BloodBank bloodBank) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bloodBankService.createBloodBank(bloodBank));
    }

    @GetMapping
    @Operation(summary = "Get all blood banks", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<BloodBank>> getAllBloodBanks() {
        return ResponseEntity.ok(bloodBankService.getAllBloodBanks());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get blood bank by id", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodBank> getBloodBankById(@PathVariable Long id) {
        return ResponseEntity.ok(bloodBankService.getBloodBankById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update blood bank", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodBank> updateBloodBank(@PathVariable Long id, @Valid @RequestBody BloodBank bloodBank) {
        return ResponseEntity.ok(bloodBankService.updateBloodBank(id, bloodBank));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete blood bank", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<Void> deleteBloodBank(@PathVariable Long id) {
        bloodBankService.deleteBloodBank(id);
        return ResponseEntity.noContent().build();
    }
}
