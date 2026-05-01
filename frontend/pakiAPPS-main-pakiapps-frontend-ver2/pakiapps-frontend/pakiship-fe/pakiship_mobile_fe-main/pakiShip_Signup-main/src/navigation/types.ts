export type RootStackParamList = {
  RoleSelection: undefined;
  Login: undefined;
  Signup: { role: string };
  OperatorReminder: undefined;
  DriverReminder: undefined;
  SignupStep2: {
    role: string;
    fullName: string;
    dob: string;
    mobile: string;
    email: string;
  };
  SignupStep3: {
    role: string;
    fullName: string;
    dob: string;
    mobile: string;
    email: string;
    street: string;
    city: string;
    province: string;
    password: string;
  };
  DriverHome: undefined;
  JobDetails: { id: string };
  UpdateStatus: { id: string };
  DriverProfile: undefined;
  CustomerHome: undefined;
  OperatorHome: undefined;
  OperatorProfile: undefined;
  ReceiveParcel: undefined;
};
