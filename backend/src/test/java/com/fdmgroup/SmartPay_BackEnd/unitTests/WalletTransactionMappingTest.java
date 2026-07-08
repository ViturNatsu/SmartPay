package com.fdmgroup.SmartPay_BackEnd.unitTests;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.RailType;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.WalletTransaction;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

class WalletTransactionMappingTest {

    @Test
    void railTypeColumnIsMandatoryEnumAndNotUpdatableByJpa() throws NoSuchFieldException {
        Field railTypeField = WalletTransaction.class.getDeclaredField("railType");

        Column column = railTypeField.getAnnotation(Column.class);
        Enumerated enumerated = railTypeField.getAnnotation(Enumerated.class);

        assertEquals("rail_type", column.name());
        assertFalse(column.nullable());
        assertFalse(column.updatable());
        assertEquals(EnumType.STRING, enumerated.value());
    }

    @Test
    void railTypeEnumContainsOnlyStandardValues() {
        List<String> values = Arrays.stream(RailType.values())
                .map(Enum::name)
                .toList();

        assertEquals(List.of("WALLET_TRANSFER", "BANK_TRANSFER", "DEBIT_CARD"), values);
    }

    @Test
    void railTypeCannotBeNullOrChangedAfterAssignment() {
        WalletTransaction transaction = new WalletTransaction();

        assertThrows(IllegalArgumentException.class, () -> transaction.setRailType(null));

        transaction.setRailType(RailType.WALLET_TRANSFER);
        transaction.setRailType(RailType.WALLET_TRANSFER);

        assertThrows(IllegalStateException.class, () -> transaction.setRailType(RailType.BANK_TRANSFER));
        assertEquals(RailType.WALLET_TRANSFER, transaction.getRailType());
    }

    @Test
    void railTypeIsRequiredBeforePersisting() throws Exception {
        WalletTransaction transaction = new WalletTransaction();
        Method onCreate = WalletTransaction.class.getDeclaredMethod("onCreate");
        onCreate.setAccessible(true);

        InvocationTargetException exception =
                assertThrows(InvocationTargetException.class, () -> onCreate.invoke(transaction));

        assertEquals(IllegalStateException.class, exception.getCause().getClass());
        assertEquals("railType is required for wallet transactions", exception.getCause().getMessage());
    }
}
