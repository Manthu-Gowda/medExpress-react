import BackArrowIcon from "../../assets/icons/pageIcons/BackArrowIcon";
import PlusIcon from "../../assets/icons/pageIcons/PlusIcon";
import ButtonComponent from "../ButtonComponent/ButtonComponent";
import PropTypes from "prop-types";
import "./SubHeader.scss";

const SubHeader = ({
  title,
  showBack = true,
  onBack,
  showRight = false,
  buttonText,
  sticky = true,
  divider = true,
  compact = false,
  onClick,
}) => {
  return (
    <div
      className={[
        "subheader",
        sticky ? "subheader--sticky" : "",
        divider ? "subheader--divider" : "",
        compact ? "subheader--compact" : "",
      ]
        .join(" ")
        .trim()}
    >
      <div className="subheader__left">
        <div className="subheader__titleRow">
          {showBack && (
            <button
              type="button"
              className="subheader__back"
              aria-label="Go back"
              onClick={onBack}
            >
              <BackArrowIcon /> {title}
            </button>
          )}
        </div>
      </div>

      {showRight && (
        <div className="subheader__right">
          <ButtonComponent variant="main" onClick={onClick}>
            <PlusIcon />
            {buttonText}
          </ButtonComponent>
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
  buttonText: PropTypes.string,
  sticky: PropTypes.bool,
  divider: PropTypes.bool,
  compact: PropTypes.bool,
};

export default SubHeader;
