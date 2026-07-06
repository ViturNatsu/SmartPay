import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { IconButton, Tooltip } from "@mui/material";

export function FavouriteButton({ isFavourite, onToggle }) {
    return (
        <Tooltip
            title={
                isFavourite
                    ? "Remove Favorite"
                    : "Mark as Favorite"
            }
        >
            <IconButton
                onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                }}
                aria-label={
                    isFavourite
                        ? "Remove Favorite"
                        : "Mark as Favorite"
                }
            >
                {isFavourite ? (
                    <StarIcon sx={{ color: "#ffbf00" }} />
                ) : (
                    <StarBorderIcon />
                )}
            </IconButton>
        </Tooltip>
    );
}