package com.rupeewise.service;

import com.rupeewise.dto.LedgerEntryDTO;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface LedgerService {
    LedgerReport getLedgerReport(String accountId, LocalDate startDate, LocalDate endDate);

    record LedgerReport(
            BigDecimal openingBalance,
            BigDecimal totalCredits,
            BigDecimal totalDebits,
            BigDecimal closingBalance,
            List<LedgerEntryDTO> entries
    ) {}
}
