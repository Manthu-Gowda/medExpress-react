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
    profilePictute, // note: backend typo kept as-is
  } = data;

  // tokens
  sessionStorage.setItem("accessToken", accessToken || "");
  sessionStorage.setItem("refreshToken", refreshToken || "");
  sessionStorage.setItem("tokenType", tokenType || "Bearer");

  // compute absolute expiry timestamp (ms since epoch)
  const expiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
  if (expiresAt) sessionStorage.setItem("expiresAt", String(expiresAt));

  // roles as JSON
  sessionStorage.setItem("roles", JSON.stringify(roles || []));

  // user profile object as JSON
  sessionStorage.setItem(
    "user",
    JSON.stringify({
      userId,
      userName,
      emailId,
      phoneNumber,
      profilePictute,
    })
  );

  // (Optional) keep raw payload for debugging
  sessionStorage.setItem("authPayload", JSON.stringify(data));
};
