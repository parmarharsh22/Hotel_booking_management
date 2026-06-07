import axios from "axios";

export const verifyRecaptcha = async (
    token: string
): Promise<boolean> => {

    try {

        if (!token) {
            return false;
        }

        const response = await axios.post(
            "https://www.google.com/recaptcha/api/siteverify",
            null,
            {
                params: {
                    secret:
                        process.env.GOOGLE_SECRET,
                    response: token
                },
                timeout: 5000
            }
        );

        return response.data.success === true;

    } catch (error) {

        console.error(
            "reCAPTCHA Verification Error:",
            error
        );

        return false;
    }
};