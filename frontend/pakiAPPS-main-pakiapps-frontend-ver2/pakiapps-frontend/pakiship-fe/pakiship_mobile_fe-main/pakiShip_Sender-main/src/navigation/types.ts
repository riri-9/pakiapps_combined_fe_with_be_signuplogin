export type RootStackParamList = {
  RoleSelection: undefined;
  Login: undefined;
  Signup: { role: string };
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
  CustomerHome: undefined;
};
