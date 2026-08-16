package blooddonation.bloodbank_service.repository;

import blooddonation.bloodbank_service.entity.BloodStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodStockRepository extends JpaRepository<BloodStock, Long> {
    List<BloodStock> findByBloodGroup(String bloodGroup);
    List<BloodStock> findByBloodBankId(Long bloodBankId);
}
