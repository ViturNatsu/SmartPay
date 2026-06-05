package com.fdmgroup.SmartPay_BackEnd.domain.entities.transaction;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.wallet.Wallet;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Getter
@Setter
public class WalletTransaction {
  @Id
  @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
  private UUID id;

  @ManyToOne
  private Wallet sender;

  @ManyToOne
  private Wallet receiver;

  @Pattern(regexp = "^[A-Za-z0-9]{0,100}$")
  private String memo;

  @Positive
  private Double amount;
}
