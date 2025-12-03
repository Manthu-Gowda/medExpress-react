// Auth
export const USER_LOGIN = "Accounts/Login";
export const REGISTER = "Accounts/Register";
export const VERIFY_REGISTER_OTP = "Accounts/VerifyRegisterOTP";
export const RESEND_REGISTER_OTP = "Accounts/ResendOTP";
export const FORGOT_PASSWORD = "Accounts/ForgotPassword";
export const RESET_PASSWORD = "Accounts/ResetPassword";
export const CHANGE_PASSWORD = "Accounts/ChangePassword";
export const REFRESH_TOKEN = "Accounts/RefreshPassword";
export const UPDATE_USER = "Accounts/UpdateUser";
export const UPDATE_EMAIL = "Accounts/UpdateEmail";
export const VERIFY_EMAIL_OTP = "Accounts/VerifyEmailOTP";
export const GET_USER_PROFILE = "Accounts/GetUserProfile";

//Google
export const GOOGLE_LOGIN = "Accounts/GetGoogleLoginUrl";
export const GOOGLE_AUTH = "Accounts/GoogleAuthentication";

//Dropdowns
export const GET_ALL_ZIPCODE = "Dropdowns/GetZipCodeDropdown";
export const GET_STATE_AND_CITY = "Dropdowns/GetStateAndCityByZipCode";

//Patients
export const GET_ALL_PATIENTS = "user/Patients/GetPatients";
export const GET_PATIENT_BY_ID = "user/Patients/GetPatient";
export const ADD_PATIENT = "user/Patients/AddPatient";
export const UPDATE_PATIENT = "user/Patients/UpdatePatient";
export const DELETE_PATIENT = "user/Patients/DeletePatient";

//Subscription
export const SUBSCRIPTION_PLANS = "user/SubscriptionPlans/GetSubscriptionPlans";
export const GET_SUBSCRIPTIONS = "user/Subscriptions/GetSubscriptions";
export const ADD_SUBSCRIPTIONS = "user/Subscriptions/AddSubscription";
export const GET_ALL_UNSUBSCRIBED_PATIENTS =
  "user/Subscriptions/GetUnSubscribedPatients";

//Admin API's
//Dashboard
export const GET_DASHBOARD_DATA = "admin/Dashboard/GetDashboard";

//Members
export const GET_MEMBERS_DATA = "admin/Members/GetMembers";
export const GET_MEMBER_DATA = "admin/Members/GetMember";

//Patients
export const GET_ALL_ADMIN_PATIENTS = "admin/Patients/GetPatients";

//Medical Shippers
export const GET_MEDICAL_SHIPPERS = "admin/Shippers/GetShippers";
export const CREATE_MEDICAL_SHIPPER = "admin/Shippers/AddShipper";

//Assignies
export const GET_ALL_ASSIGNIES_PATIENTS = "admin/Patients/GetPatients";
export const ASSIGN_SHIPPER_TO_PATIENT = "admin/Patients/AssignShipperToPatient";

//Shiper API's
export const GET_ALL_SHIPPER_PATIENTS = "shipper/Patients/GetPatients";
export const GET_SHIPPER_PATIENT_BY_ID = "shipper/Patients/GetPatient";
export const UPLOAD_PATIENT_INVOICE = "shipper/Patients/UploadPatientInvoice";


