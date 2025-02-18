class passwordRecovery {
    constructor(verificationCode = "", newPassword = "", confirmNewPassword = "") {
        this.verificationCode = verificationCode;
        this.newPassword = newPassword;
        this.confirmNewPassword = confirmNewPassword;
    }
}

export default passwordRecovery;