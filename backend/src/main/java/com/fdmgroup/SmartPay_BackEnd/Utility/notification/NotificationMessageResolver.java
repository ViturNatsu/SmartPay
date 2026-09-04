package com.fdmgroup.SmartPay_BackEnd.Utility.notification;

import com.fdmgroup.SmartPay_BackEnd.domain.dtos.notification.NotificationEventContext;

/**
 * Builds the detail message for each {@link NotificationEventType} from structured event context
 * (US-NOTIF-BE-06). Message wording lives here — in one place — rather than at each call site.
 *
 * <p>Recurring-payment failure messages identify the reason, the scheduled date, the payee and the
 * amount, and direct the user to the remedy for that reason (Scenario 9). Card messages never
 * contain a CVV or full card number (only the last four).
 */
public final class NotificationMessageResolver {

    private NotificationMessageResolver() {
    }

    public static String buildDetail(NotificationEventType eventType, NotificationEventContext context) {
        NotificationEventContext ctx = context != null ? context : NotificationEventContext.empty();
        String amount = formatAmount(ctx.getAmount());
        String payee = orDefault(ctx.getCounterpartyName(), "the payee");
        String bank = orDefault(ctx.getBankName(), "your linked bank account");
        String freq = ctx.getFrequency() != null && !ctx.getFrequency().isBlank()
                ? ctx.getFrequency().toLowerCase()
                : "recurring";
        String date = ctx.getScheduledDate() != null ? ctx.getScheduledDate().toString() : "the scheduled date";

        return switch (eventType) {
            case RECURRING_PAYMENT_FAILED_INSUFFICIENT_FUNDS -> recurringFailure(freq, amount, payee, date,
                    "you had insufficient wallet funds", "Top up your wallet and it will be retried on the next cycle.");
            case RECURRING_PAYMENT_FAILED_PER_TRANSACTION_LIMIT -> recurringFailure(freq, amount, payee, date,
                    "it exceeded your per-transaction limit", "Adjust your per-transaction spending limit and it will be retried on the next cycle.");
            case RECURRING_PAYMENT_FAILED_DAILY_LIMIT -> recurringFailure(freq, amount, payee, date,
                    "it exceeded your daily spending limit", "Adjust your daily spending limit and it will be retried on the next cycle.");
            case RECURRING_PAYMENT_FAILED_CARD_LOCKED -> recurringFailure(freq, amount, payee, date,
                    "your card is locked", "Unlock your card and it will be retried on the next cycle.");
            case RECURRING_PAYMENT_FAILED_CARD_PENDING_REPLACEMENT -> recurringFailure(freq, amount, payee, date,
                    "your card is temporarily locked while a replacement is being approved",
                    "This lock is temporary and will clear once the replacement card is approved — no action is needed.");

            case P2P_TRANSFER_FAILED, WALLET_TRANSFER_FAILED ->
                    "Your transfer of " + amount + " to " + payee + " could not be completed.";
            case WALLET_LOAD_FAILED ->
                    "Your wallet load of " + amount + " from " + bank + " could not be completed.";

            case CARD_DETAILS_CHANGED -> {
                String suffix = ctx.getCardLastFour() != null && !ctx.getCardLastFour().isBlank()
                        ? " ending in " + ctx.getCardLastFour()
                        : "";
                yield "Your card" + suffix + " has new details. Open your Wallet to view them.";
            }

            case OUTBOUND_P2P_SEND_SUCCESS -> amount + " sent to " + payee + ".";
            case WALLET_WITHDRAWAL_SUCCESS -> amount + " withdrawn to " + bank + ".";
            case INBOUND_P2P_RECEIVED -> amount + " received from " + payee + ".";
            case WALLET_LOAD_SUCCESS -> amount + " loaded into your wallet from " + bank + ".";

            case RECURRING_PAYMENT_REMINDER ->
                    "Reminder: your " + freq + " payment of " + amount + " to " + payee
                            + " is scheduled for " + date + ".";
        };
    }

    private static String recurringFailure(String freq, String amount, String payee, String date,
                                           String reasonClause, String remedy) {
        return "Your " + freq + " payment of " + amount + " to " + payee + " scheduled for " + date
                + " could not be processed because " + reasonClause + ". " + remedy;
    }

    private static String formatAmount(Double amount) {
        if (amount == null) {
            return "your payment";
        }
        return "$" + String.format("%.2f", amount);
    }

    private static String orDefault(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
