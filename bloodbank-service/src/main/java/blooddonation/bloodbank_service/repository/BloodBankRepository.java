package blooddonation.bloodbank_service.repository;

import blooddonation.bloodbank_service.entity.BloodBank;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BloodBankRepository extends JpaRepository<BloodBank, Long> {
}
