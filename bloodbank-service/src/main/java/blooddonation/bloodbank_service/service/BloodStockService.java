package blooddonation.bloodbank_service.service;

import blooddonation.bloodbank_service.entity.BloodStock;
import blooddonation.bloodbank_service.exception.ResourceNotFoundException;
import blooddonation.bloodbank_service.repository.BloodBankRepository;
import blooddonation.bloodbank_service.repository.BloodStockRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BloodStockService {

    private final BloodStockRepository bloodStockRepository;
    private final BloodBankRepository bloodBankRepository;

    public BloodStockService(BloodStockRepository bloodStockRepository, BloodBankRepository bloodBankRepository) {
        this.bloodStockRepository = bloodStockRepository;
        this.bloodBankRepository = bloodBankRepository;
    }

    public BloodStock createBloodStock(BloodStock bloodStock) {
        verifyBloodBank(bloodStock.getBloodBankId());
        return bloodStockRepository.save(bloodStock);
    }

    public List<BloodStock> getAllBloodStock() {
        return bloodStockRepository.findAll();
    }

    public List<BloodStock> getBloodStockByGroup(String bloodGroup) {
        return bloodStockRepository.findByBloodGroup(bloodGroup);
    }

    public List<BloodStock> getBloodStockByBloodBankId(Long bloodBankId) {
        verifyBloodBank(bloodBankId);
        return bloodStockRepository.findByBloodBankId(bloodBankId);
    }

    public BloodStock getBloodStockById(Long id) {
        return bloodStockRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blood stock with ID " + id + " was not found"));
    }

    public BloodStock updateBloodStock(Long id, BloodStock updatedStock) {
        BloodStock existing = getBloodStockById(id);
        verifyBloodBank(updatedStock.getBloodBankId());
        existing.setBloodBankId(updatedStock.getBloodBankId());
        existing.setBloodGroup(updatedStock.getBloodGroup());
        existing.setQuantityUnits(updatedStock.getQuantityUnits());
        return bloodStockRepository.save(existing);
    }

    public void deleteBloodStock(Long id) {
        bloodStockRepository.delete(getBloodStockById(id));
    }

    private void verifyBloodBank(Long bloodBankId) {
        if (!bloodBankRepository.existsById(bloodBankId)) {
            throw new ResourceNotFoundException("Blood bank with ID " + bloodBankId + " was not found");
        }
    }
}
