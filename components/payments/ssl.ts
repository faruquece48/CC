import axios from "axios";

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;

// false = sandbox
// true = live
const is_live = true;

const SSL_URL = is_live
    ? "https://securepay.sslcommerz.com/gwprocess/v4/api.php"
    : "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";

export default async function paymentBySSL(formData: any) {

    try {

        if (!store_id || !store_passwd) {
            return {
                status: 500,
                message: "SSLCommerz credentials are not configured",
                data: null,
            };
        }

        const data = {

            store_id,
            store_passwd,

            total_amount: formData.fee,
            currency: "BDT",

            tran_id: formData.tran_id,

            success_url:
                "https://constructcarnival.com/api/success",

            fail_url:
                "https://constructcarnival.com/api/fail",

            cancel_url:
                "https://constructcarnival.com/api/cancel",

            ipn_url:
                "https://constructcarnival.com/api/ipn",

            shipping_method: "NO",

            product_name:
                "Construct Carnival Registration",

            product_category:
                "Registration",

            product_profile:
                "general",

            cus_name:
                formData.member1,

            cus_email:
                formData.email,

            cus_add1:
                "Rajshahi",

            cus_country:
                "Bangladesh",

            cus_phone:
                formData.phoneNumber,
        };

        const body =
            new URLSearchParams();

        Object.entries(data).forEach(
            ([key, value]) => {

                body.append(
                    key,
                    String(value)
                );
            }
        );

        const response =
            await axios.post(

                SSL_URL,

                body,

                {
                    timeout: 20000,
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded",
                    },
                }
            );

        console.log(
            "SSL RESPONSE:",
            response.data
        );

        if (!response.data?.GatewayPageURL) {
            return {
                status: 502,
                message:
                    response.data?.failedreason ||
                    response.data?.message ||
                    "SSLCommerz did not return a payment URL",
                data: response.data,
            };
        }

        return {
            status: 200,
            message: "Success",
            data: response.data,
        };

    } catch (error: any) {

        console.log(

            "SSL INIT ERROR:",

            error.response?.data ||

            error.message
        );

        return {

            status: 500,

            message:
                error.code === "ECONNABORTED"
                    ? "The payment gateway timed out. Please try again."
                    : "Payment initialization failed",

            data: null,
        };
    }
}
