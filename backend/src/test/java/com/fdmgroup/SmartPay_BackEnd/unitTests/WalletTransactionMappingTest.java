package com.fdmgroup.SmartPay_BackEnd.unitTests;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import org.junit.jupiter.api.Test;

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
}
