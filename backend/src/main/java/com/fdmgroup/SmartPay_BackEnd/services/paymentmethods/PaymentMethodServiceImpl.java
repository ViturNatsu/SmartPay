package com.fdmgroup.SmartPay_BackEnd.services.paymentmethods;

import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.repositories.account.AccountRepository;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentmethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.services.account.AccountService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentMethodServiceImpl implements PaymentMethodService {

    PaymentRepository paymentRepository;
    AccountService accountService;

    public PaymentMethodServiceImpl(PaymentRepository paymentRepository, AccountService accountService) {
        this.paymentRepository = paymentRepository;
        this.accountService = accountService;
    }

    @Transactional
    @Override
    public PaymentMethod addPaymentMethod(PaymentMethod pm) {
        Long accountId = accountService.matchMaskedAccount(pm.getUser().getId(), pm.getAccountIdentifierMasked());
        accountService.setAccountStatus(accountId, false);
        return paymentRepository.save(pm);
    }

    @Override
    public List<PaymentMethod> findByUserId(Long id) {
        return paymentRepository.findByUserId(id);
    }

    @Override
    public Page<PaymentMethod> findByUserId(Long userId, int pageNumber) {
        final int PAGE_SIZE = 5;
        Pageable pageable = PageRequest.of(pageNumber, PAGE_SIZE);
        return paymentRepository.findByUserId(userId, pageable);
    }

    //for admin dashboard
    @Override
    public List<PaymentMethod> findAllPaymentMethods() {
        return paymentRepository.findAll();
    }

    @Override
    public PaymentMethod findPaymentMethodById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payment method not found with id: " + id));
    }

    @Transactional
    @Override
    public void deletePaymentMethod(Long id) {
        PaymentMethod existingPaymentMethod = findPaymentMethodById(id);
        paymentRepository.delete(existingPaymentMethod);
    }

    //Update the payment method active status only
    @Transactional
    @Override
    public PaymentMethod updatePaymentMethodActiveStatus(Long id, Boolean activeStatus) {
        PaymentMethod existingPaymentMethod = findPaymentMethodById(id);

        if (activeStatus != null) {
            existingPaymentMethod.setActive(activeStatus);
        }

        return paymentRepository.save(existingPaymentMethod);
    }
}
