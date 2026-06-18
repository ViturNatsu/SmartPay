import { getWalletByUserId } from "@/api/wallets/walletApi";
import {getCardByWalletId} from "@/api/cards/cardsApi.js";
import {useState} from "react";

export const useWalletData = (tokenClaims) => {

    const [wallet, setWallet] = useState(null);
    const [balance, setBalance] = useState(0);
    const [walletLoading, setWalletLoading] = useState(true);
    const [cardLoading, setCardLoading] = useState(true);
    const [card, setCard] = useState(null);

   // Fetches the wallet data for the authenticated user and updates state accordingly.
    const fetchWallet = async () => {
        if (!tokenClaims?.userId) return;
        setWalletLoading(true);
        try {
            const wallet = await getWalletByUserId(Number(tokenClaims.userId));
            setWallet(wallet);
            setBalance(wallet.balance ?? 0);
        } catch (err) {
            console.error("Failed to fetch wallet:", err);
        } finally {
            setWalletLoading(false)
        }
    };

    // Fetches the virtual card details associated with the user's wallet and updates state.
    const fetchCard = async () => {
        setCardLoading(true);
        try {
            const card = await getCardByWalletId(wallet.wallet_id);
            setCard(card);
        } catch (err) {
            console.error("Failed to fetch card:", err);
        } finally {
            setCardLoading(false);
        }
    }

    return {
        fetchWallet,
        fetchCard,
        wallet,
        setWallet,
        card,
        walletLoading,
        cardLoading,
        balance,
        setBalance
    };
}