package blooddonation.donation_service.repository;

import blooddonation.donation_service.entity.Donation;
import blooddonation.donation_service.entity.DonationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {

    List<Donation> findByDonorId(Long donorId);

    List<Donation> findByBloodGroup(String bloodGroup);

    List<Donation> findByStatus(DonationStatus status);

    @Query("SELECT d FROM Donation d WHERE (:donorId IS NULL OR d.donorId = :donorId) " +
           "AND (:bloodGroup IS NULL OR d.bloodGroup = :bloodGroup) " +
           "AND (:status IS NULL OR d.status = :status)")
    List<Donation> searchDonations(@Param("donorId") Long donorId,
                                   @Param("bloodGroup") String bloodGroup,
                                   @Param("status") DonationStatus status);
}
