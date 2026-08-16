package blooddonation.donation_service.service;

import blooddonation.donation_service.entity.Donation;
import blooddonation.donation_service.entity.DonationStatus;
import blooddonation.donation_service.exception.ResourceNotFoundException;
import blooddonation.donation_service.repository.DonationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DonationService {

    private final DonationRepository donationRepository;

    public DonationService(DonationRepository donationRepository) {
        this.donationRepository = donationRepository;
    }

    public Donation createDonation(Donation donation) {
        return donationRepository.save(donation);
    }

    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    public Donation getDonationById(Long id) {
        return donationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Donation with ID " + id + " was not found"));
    }

    public List<Donation> getDonationsByDonorId(Long donorId) {
        return donationRepository.findByDonorId(donorId);
    }

    public List<Donation> getDonationsByBloodGroup(String bloodGroup) {
        return donationRepository.findByBloodGroup(bloodGroup);
    }

    public List<Donation> getDonationsByStatus(DonationStatus status) {
        return donationRepository.findByStatus(status);
    }

    public List<Donation> searchDonations(Long donorId, String bloodGroup, DonationStatus status) {
        return donationRepository.searchDonations(donorId, bloodGroup, status);
    }

    public Donation updateDonation(Long id, Donation newDonation) {
        Donation existing = getDonationById(id);
        existing.setDonorId(newDonation.getDonorId());
        existing.setBloodGroup(newDonation.getBloodGroup());
        existing.setQuantityMl(newDonation.getQuantityMl());
        existing.setLocation(newDonation.getLocation());
        existing.setAvailableDate(newDonation.getAvailableDate());
        existing.setStatus(newDonation.getStatus());
        return donationRepository.save(existing);
    }

    public Donation updateDonationStatus(Long id, DonationStatus status) {
        Donation donation = getDonationById(id);
        donation.setStatus(status);
        return donationRepository.save(donation);
    }

    public void deleteDonation(Long id) {
        Donation donation = getDonationById(id);
        donationRepository.delete(donation);
    }
}
