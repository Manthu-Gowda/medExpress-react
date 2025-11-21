
export const renderStatusCapsule = (value) => {
  const isTrue = value === true || value === "TRUE" || value === 1;

  const styles = {
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    minWidth: "55px",
    textAlign: "center",
    backgroundColor: isTrue ? "#4CAF50" : "#F44336", // green / red
  };

  return <span style={styles}>{isTrue ? "TRUE" : "FALSE"}</span>;
};
