package com.fdmgroup.SmartPay_BackEnd.services.paymentmethods;

import com.fdmgroup.SmartPay_BackEnd.Utility.MaskingUtil;
import com.fdmgroup.SmartPay_BackEnd.domain.dtos.paymentmethod.PaymentMethodDTO;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.account.Account;
import com.fdmgroup.SmartPay_BackEnd.domain.entities.paymentmethod.PaymentMethod;
import com.fdmgroup.SmartPay_BackEnd.exception.account.AccountNotFoundException;
import com.fdmgroup.SmartPay_BackEnd.repositories.paymentmethods.PaymentRepository;
import com.fdmgroup.SmartPay_BackEnd.services.account.AccountService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaymentMethodServiceImpl implements PaymentMethodService {

    private final MaskingUtil maskingUtil;
    private final PaymentRepository paymentRepository;
    private final AccountService accountService;

    private final Logger log = LoggerFactory.getLogger(PaymentMethodServiceImpl.class);

    public PaymentMethodServiceImpl(PaymentRepository paymentRepository, AccountService accountService, MaskingUtil maskingUtil) {
        this.paymentRepository = paymentRepository;
        this.accountService = accountService;
        this.maskingUtil = maskingUtil;
    }

    @Override
    @Transactional
    public PaymentMethodDTO addPaymentMethod(PaymentMethodDTO pmDto) {
        log.warn("Looking at: {}", pmDto.getAccountIdentifierDigest());
        return paymentRepository.findAllByUser_Id(pmDto.getUser().getId()).stream()
          .filter(pm -> {
              log.warn("comparing against: {}", maskingUtil.maskAccountNumber(pm.getAccount().getAccountNumber()).getSecond());
              return maskingUtil.maskAccountNumber(pm.getAccount().getAccountNumber()).getSecond()
                .equals(pmDto.getAccountIdentifierDigest());
            })
          .map(pm -> {
              pm.setActive(true);
            //   accountService.setAccountStatus(pm.getAccount(), false);
              return paymentMethodToDto(pm);
            })
          .findFirst()
          .orElseGet( () -> {
              Account account = accountService.matchAccountDigest(pmDto.getAccountIdentifierDigest())
                .orElseThrow(() -> new AccountNotFoundException("No matching account"));
            //   accountService.setAccountStatus(account, false);
              PaymentMethod pm = paymentRepository.save(dtoToPaymentMethod(pmDto, account));
              log.warn("created pm: {}", pm);
              return paymentMethodToDto(pm);
          });
    }

    @Override
    public List<PaymentMethod> findByUserId(Long id) {
        return paymentRepository.findByUserId(id);
    }

    @Override
    public Page<PaymentMethodDTO> findByUserId(Long userId, int pageNumber) {
        final int PAGE_SIZE = 5;
        Pageable pageable = PageRequest.of(pageNumber, PAGE_SIZE);
        Page<PaymentMethod> pmPage = paymentRepository.findByUserId(userId, pageable);
        return pmPage.map(this::paymentMethodToDto);
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

    @Override
    @Transactional
    public void deletePaymentMethod(Long id) {
        PaymentMethod pm = findPaymentMethodById(id);
        // accountService.setAccountStatus(pm.getAccount(), true);
        paymentRepository.delete(pm);
    }

    //Update the payment method and accounts active status only
    @Override
    @Transactional
    public PaymentMethodDTO updatePaymentMethodActiveStatus(Long id, Boolean activeStatus) {
        PaymentMethod pm = findPaymentMethodById(id);
        if (activeStatus != null) {
            pm.setActive(activeStatus);
        }
        accountService.setAccountStatus(pm.getAccount(), true);
        return paymentMethodToDto(pm);
    }


    private PaymentMethodDTO paymentMethodToDto(final PaymentMethod pm){
        PaymentMethodDTO pmDto = new PaymentMethodDTO();
        pmDto.setPaymentMethodId(pm.getPaymentMethodId());
        pmDto.setBankId(pm.getBankId());
        pmDto.setBankDisplayName(pm.getBankDisplayName());
        pmDto.setActive(pm.getActive());
        pmDto.setAccountName(pm.getAccount().getAccountName());
        pmDto.setUser(pm.getUser());

        Pair<String, String> masks = maskingUtil.maskAccountNumber(pm.getAccount().getAccountNumber());
        pmDto.setAccountIdentifierMasked(masks.getFirst());
        pmDto.setAccountIdentifierDigest(masks.getSecond());
        return pmDto;
    }

    private PaymentMethod dtoToPaymentMethod(final PaymentMethodDTO pmDto, final Account account){
        PaymentMethod pm = new PaymentMethod();
        pm.setAccount(account);
        pm.setBankId(pmDto.getBankId());
        pm.setBankDisplayName(pmDto.getBankDisplayName());
        pm.setActive(pmDto.getActive());
        pm.setUser(pmDto.getUser());
        return pm;
    }

}
