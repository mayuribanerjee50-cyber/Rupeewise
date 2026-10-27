package com.rupeewise.repository;

import com.rupeewise.model.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecurringRepository extends JpaRepository<RecurringTransaction, String> {
    List<RecurringTransaction> findByActiveTrueOrderByDueDayAsc();
}
