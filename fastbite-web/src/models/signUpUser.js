class SignUpUser {
    constructor(name = '', surname = '', email = '', phoneNumber = '', password = '', confirmPassword = '') {
      this.name = name;
      this.surname = surname;
      this.email = email;
      this.phoneNumber = phoneNumber;
      this.password = password;
      this.confirmPassword = confirmPassword;
    }
  }
  
  export default SignUpUser;