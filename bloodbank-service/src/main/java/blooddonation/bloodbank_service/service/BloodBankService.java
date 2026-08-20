package blooddonation.bloodbank_service.service;

import blooddonation.bloodbank_service.entity.BloodBank;
import blooddonation.bloodbank_service.exception.ResourceNotFoundException;
import blooddonation.bloodbank_service.repository.BloodBankRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BloodBankService {

    private final BloodBankRepository bloodBankRepository;

    public BloodBankService(BloodBankRepository bloodBankRepository) {
        this.bloodBankRepository = bloodBankRepository;
    }

    public BloodBank createBloodBank(BloodBank bloodBank) {
        return bloodBankRepository.save(bloodBank);
    }

    public List<BloodBank> getAllBloodBanks() {
        return bloodBankRepository.findAll();
    }

    public BloodBank getBloodBankById(Long id) {
        return bloodBankRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Blood bank with ID " + id + " was not found"));
    }

    public BloodBank updateBloodBank(Long id, BloodBank updatedBank) {
        BloodBank existing = getBloodBankById(id);
        existing.setName(updatedBank.getName());
        existing.setAddress(updatedBank.getAddress());
        existing.setCity(updatedBank.getCity());
        existing.setPhone(updatedBank.getPhone());
        return bloodBankRepository.save(existing);
    }

    public void deleteBloodBank(Long id) {
        BloodBank existing = getBloodBankById(id);
        bloodBankRepository.delete(existing);
    }
}
