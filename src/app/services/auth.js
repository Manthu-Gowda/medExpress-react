// utils/auth.js (optional)
export const saveAuthToSession = (data) => {
  if (!data) return;

  const {
    accessToken,
    refreshToken,
    expiresIn,
    roles,
    tokenType,
    userId,
    userName,
    emailId,
    phoneNumber,
    profilePicture, // note: backend typo kept as-is
  } = data;

  // tokens
  sessionStorage.setItem("accessToken", accessToken || "");
  sessionStorage.setItem("refreshToken", refreshToken || "");
  sessionStorage.setItem("tokenType", tokenType || "Bearer");

  // compute absolute expiry timestamp (ms since epoch)
  const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
  if (expiresAt) sessionStorage.setItem("expiresAt", String(expiresAt));

  // roles as JSON
  // sessionStorage.setItem("roles", JSON.stringify(roles || []));
  let roleValue = "";
  if (Array.isArray(roles)) {
    roleValue = roles.length > 0 ? roles[0] : "";
  } else if (typeof roles === "string") {
    roleValue = roles;
  }
  sessionStorage.setItem("role", roleValue);

  // user profile object as JSON
  sessionStorage.setItem(
    "user",
    JSON.stringify({
      userId,
      userName,
      emailId,
      phoneNumber,
      profilePicture,
    })
  );

  // (Optional) keep raw payload for debugging
  // sessionStorage.setItem("authPayload", JSON.stringify(data));
};
