import {Box, Typography} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {tokens} from "@/style/Theme";
import {formatString} from "@/utils/stringFormaters/formatString";
import {formatDate} from "@/utils/stringFormaters/formatDate";

/**
 * Virtual card visual for the Wallet page.
 *
 * Responsibilities (SRP):
 *  - Render the card graphic with all sensitive fields.
 *  - Apply CSS blur to card number, CVV, expiry, and cardholder when masked.
 *  - Render the "Show details / Hide details" pill button below the card.
 *
 * The parent (Wallet.jsx) owns reveal state and the OTP dialog trigger.
 *
 * @param {object}   card          - CardResponseDTO: { virtualCardNumber, expiryDate, CVV }
 * @param {object}   user          - Authenticated user: { firstName, lastName }
 * @param {boolean}  isRevealed    - Whether card details are currently unblurred
 * @param {function} onRevealClick - Called when the pill button is clicked
 */
export function VirtualCardDisplay({card, user, isRevealed, onRevealClick}) {
  const sensitiveStyle = {
    transition: "filter 0.35s ease, opacity 0.35s ease",
    filter: isRevealed ? "blur(0)" : "blur(4px)",
    opacity: isRevealed ? 1 : 0.6,
    userSelect: isRevealed ? "text" : "none",
  };

  return (
    <Box sx={{position: "relative", flexShrink: 0, width: 300}}>
      {/* Card graphic */}
      <Box
        sx={{
          width: 300,
          height: 180,
          background: tokens.color.gradient.virtualCard,
          borderRadius: "16px",
          p: "22px 24px",
          color: tokens.color.background.surface,
          boxShadow: "0 8px 32px rgba(15,36,54,.35), 0 2px 8px rgba(0,0,0,.2)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Decorative circles matching wireframe */}
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -20,
            left: 40,
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(15,116,144,0.18)",
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{fontSize: 14, fontWeight: 800}}>
            ◉ SmartPay
          </Typography>
          <Box
            sx={{
              fontSize: 10,
              letterSpacing: ".12em",
              border: "1px solid rgba(255,255,255,.25)",
              borderRadius: "999px",
              px: 1.25,
              py: 0.5,
              opacity: 0.8,
            }}
          >
            VIRTUAL
          </Box>
        </Box>

        <Typography
          sx={{
            fontFamily: "monospace",
            fontSize: 15,
            letterSpacing: ".2em",
            ...sensitiveStyle,
          }}
        >
          {formatString(card?.virtualCardNumber, 4, " ")}
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 9,
                color: "rgba(255,255,255,.4)",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                mb: "2px",
              }}
            >
              Valid Thru
            </Typography>
            <Typography
              sx={{fontFamily: "monospace", fontSize: 12, ...sensitiveStyle}}
            >
              {formatDate(card?.expiryDate)}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: 9,
                color: "rgba(255,255,255,.4)",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                mb: "2px",
              }}
            >
              Cardholder
            </Typography>
            <Typography sx={{fontSize: 11, fontWeight: 500, ...sensitiveStyle}}>
              {user?.firstName} {user?.lastName}
            </Typography>
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: 9,
                color: "rgba(255,255,255,.4)",
                textTransform: "uppercase",
                letterSpacing: ".1em",
                mb: "2px",
              }}
            >
              CVV
            </Typography>
            <Typography
              sx={{fontFamily: "monospace", fontSize: 12, ...sensitiveStyle}}
            >
              {card?.CVV}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        component="button"
        onClick={onRevealClick}
        aria-pressed={isRevealed}
        aria-label={isRevealed ? "Hide card details" : "Show card details"}
        sx={{
          position: "absolute",
          bottom: -14,
          left: "57%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: isRevealed ? tokens.color.brand.primaryLight : tokens.color.background.surface,
          border: `1.5px solid ${isRevealed ? tokens.color.brand.primary : tokens.color.border.medium}`,
          borderRadius: "999px",
          px: "13px",
          py: "5px",
          fontSize: 12,
          fontWeight: 600,
          fontFamily: "inherit",
          color: isRevealed
            ? tokens.color.brand.primary
            : tokens.color.text.secondary,
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,.10)",
          transition: "background 0.15s, color 0.15s, border-color 0.15s",
          zIndex: 2,
          "&:hover": {
            background: tokens.color.brand.primaryLight,
            borderColor: tokens.color.brand.primary,
            color: tokens.color.brand.primary,
          },
        }}
      >
        {isRevealed ? (
          <VisibilityOffIcon sx={{fontSize: 15}} />
        ) : (
          <VisibilityIcon sx={{fontSize: 15}} />
        )}
        {isRevealed ? "Hide details" : "Show details"}
      </Box>
    </Box>
  );
}
