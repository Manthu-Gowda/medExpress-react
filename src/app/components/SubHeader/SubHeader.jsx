import BackArrowIcon from "../../assets/icons/pageIcons/BackArrowIcon";
import PlusIcon from "../../assets/icons/pageIcons/PlusIcon";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import PropTypes from "prop-types";
import "./SubHeader.scss";
import SearchInput from "../SearchInput/SearchInput";

const SubHeader = ({
  title,
  showBack = true,
  onBack,
  showRight = false,
  buttonText,
  sticky = true,
  divider = true,
  compact = false,
  onClick, // main button click
  showPlusIcon = true,
  showButton = true,
  // search-related props
  showSearch = false,
  searchPlaceholder = "Search...",
  searchValue, // optional controlled value
  onSearchChange, // optional (fires on every keypress)
  onSearchDebounced, // optional (debounced)
}) => {
  const rootClasses = [
    "subheader",
    sticky ? "subheader--sticky" : "",
    divider ? "subheader--divider" : "",
    compact ? "subheader--compact" : "",
  ]
    .join(" ")
    .trim();

  return (
    <div className={rootClasses}>
      {/* LEFT: Back + Title */}
      <div className="subheader__left">
        <div className="subheader__titleRow">
          {showBack && (
            <button
              type="button"
              className="subheader__back"
              aria-label="Go back"
              onClick={onBack}
            >
              <BackArrowIcon />
            </button>
          )}
          <h2>{title}</h2>
        </div>
      </div>

      {/* RIGHT: Button (optional) */}
      {showRight && (
        <div className="subheader__right">
          {showSearch && (
            <div className="subheader__right_search">
              <SearchInput
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearchChange}
                onDebouncedChange={onSearchDebounced}
              />
            </div>
          )}

          {showButton && (
            <ButtonComponent variant="main" onClick={onClick}>
              {showPlusIcon && <PlusIcon />}
              {buttonText}
            </ButtonComponent>
          )}
        </div>
      )}
    </div>
  );
};

SubHeader.propTypes = {
  title: PropTypes.string.isRequired,
  showBack: PropTypes.bool,
  onBack: PropTypes.func,
  showRight: PropTypes.bool,
  showPlusIcon: PropTypes.bool,
  buttonText: PropTypes.string,
  sticky: PropTypes.bool,
  divider: PropTypes.bool,
  compact: PropTypes.bool,
  onClick: PropTypes.func,

  showSearch: PropTypes.bool,
  searchPlaceholder: PropTypes.string,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  onSearchDebounced: PropTypes.func,
};

export default SubHeader;
