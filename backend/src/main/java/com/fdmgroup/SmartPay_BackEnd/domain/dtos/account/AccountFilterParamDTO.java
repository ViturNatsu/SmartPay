package com.fdmgroup.SmartPay_BackEnd.domain.dtos.account;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 *  This class is used in the AccountController getAccounts method, and possibly any Account getter
 *  For any filter functionality, add a member to filter by here, then match by it/evaluate it in the AccountService.
 *  Any member field not present will be NULL, that is these are optional filter params.
 */
@Getter
@Setter
@NoArgsConstructor
public class AccountFilterParamDTO {
  private Boolean active;

  /**
   * Method should be updated whenever a new field is added, with care for nulls
   * @param account The Account to match
   * @return A Boolean true account matches the filter
   */
  public Boolean match(Account account){
    if(account == null) return false;
    return active == null || (account.getActive() != null);
  }
}
