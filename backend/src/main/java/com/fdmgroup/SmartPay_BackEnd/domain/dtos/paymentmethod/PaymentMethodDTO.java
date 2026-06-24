package com.fdmgroup.SmartPay_BackEnd.domain.dtos.paymentMethod;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.user.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentMethodDTO {
  private Long paymentMethodId;
  private Long bankId;
  private String bankDisplayName;
  private Boolean active;
  private String accountIdentifierMasked;
  private String accountIdentifierDigest;
  private String accountName;

  @JsonBackReference
  private User user;

}
