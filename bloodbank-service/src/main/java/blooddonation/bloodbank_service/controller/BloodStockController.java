package blooddonation.bloodbank_service.controller;

import blooddonation.bloodbank_service.entity.BloodStock;
import blooddonation.bloodbank_service.service.BloodStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bloodstocks")
public class BloodStockController {

    private final BloodStockService bloodStockService;

    public BloodStockController(BloodStockService bloodStockService) {
        this.bloodStockService = bloodStockService;
    }

    @PostMapping
    @Operation(summary = "Create blood stock", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodStock> createBloodStock(@Valid @RequestBody BloodStock bloodStock) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bloodStockService.createBloodStock(bloodStock));
    }

    @GetMapping
    @Operation(summary = "Get all blood stock", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<BloodStock>> getAllBloodStock() {
        return ResponseEntity.ok(bloodStockService.getAllBloodStock());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get blood stock by id", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodStock> getBloodStockById(@PathVariable Long id) {
        return ResponseEntity.ok(bloodStockService.getBloodStockById(id));
    }

    @GetMapping("/blood-bank/{bloodBankId}")
    @Operation(summary = "Get blood stock by blood bank id", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<BloodStock>> getByBloodBank(@PathVariable Long bloodBankId) {
        return ResponseEntity.ok(bloodStockService.getBloodStockByBloodBankId(bloodBankId));
    }

    @GetMapping("/blood-group/{bloodGroup}")
    @Operation(summary = "Get blood stock by blood group", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<List<BloodStock>> getByBloodGroup(@PathVariable String bloodGroup) {
        return ResponseEntity.ok(bloodStockService.getBloodStockByGroup(bloodGroup));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update blood stock", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<BloodStock> updateBloodStock(@PathVariable Long id, @Valid @RequestBody BloodStock bloodStock) {
        return ResponseEntity.ok(bloodStockService.updateBloodStock(id, bloodStock));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete blood stock", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<Void> deleteBloodStock(@PathVariable Long id) {
        bloodStockService.deleteBloodStock(id);
        return ResponseEntity.noContent().build();
    }
}
