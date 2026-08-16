package blooddonation.bloodbank_service.service;

import blooddonation.bloodbank_service.entity.BloodRequest;
import blooddonation.bloodbank_service.entity.BloodRequestStatus;
import blooddonation.bloodbank_service.exception.ResourceNotFoundException;
import blooddonation.bloodbank_service.repository.BloodBankRepository;
import blooddonation.bloodbank_service.repository.BloodRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;
    private final BloodBankRepository bloodBankRepository;

    public BloodRequestService(BloodRequestRepository bloodRequestRepository, BloodBankRepository bloodBankRepository) {
        this.bloodRequestRepository = bloodRequestRepository;
        this.bloodBankRepository = bloodBankRepository;
    }

    public BloodRequest createBloodRequest(BloodRequest bloodRequest) {
        verifyBloodBank(bloodRequest.getBloodBankId());
        if (bloodRequest.getStatus() == null) {
            bloodRequest.setStatus(BloodRequestStatus.PENDING);
        }
        return bloodRequestRepository.save(bloodRequest);
    }

    public List<BloodRequest> getAllBloodRequests() {
        return bloodRequestRepository.findAll();
    }

    public BloodRequest getBloodRequestById(Long id) {
        return bloodRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blood request with ID " + id + " was not found"));
    }

    public List<BloodRequest> getBloodRequestsByBloodBankId(Long bloodBankId) {
        verifyBloodBank(bloodBankId);
        return bloodRequestRepository.findByBloodBankId(bloodBankId);
    }

    public BloodRequest updateBloodRequest(Long id, BloodRequest updatedRequest) {
        BloodRequest existing = getBloodRequestById(id);
        verifyBloodBank(updatedRequest.getBloodBankId());
        existing.setBloodBankId(updatedRequest.getBloodBankId());
        existing.setBloodGroup(updatedRequest.getBloodGroup());
        existing.setQuantityUnits(updatedRequest.getQuantityUnits());
        existing.setRequestedDate(updatedRequest.getRequestedDate());
        existing.setStatus(updatedRequest.getStatus() == null ? existing.getStatus() : updatedRequest.getStatus());
        return bloodRequestRepository.save(existing);
    }

    public BloodRequest updateBloodRequestStatus(Long id, BloodRequestStatus status) {
        BloodRequest request = getBloodRequestById(id);
        request.setStatus(status);
        return bloodRequestRepository.save(request);
    }

    public void deleteBloodRequest(Long id) {
        bloodRequestRepository.delete(getBloodRequestById(id));
    }

    private void verifyBloodBank(Long bloodBankId) {
        if (!bloodBankRepository.existsById(bloodBankId)) {
            throw new ResourceNotFoundException("Blood bank with ID " + bloodBankId + " was not found");
        }
    }
}
