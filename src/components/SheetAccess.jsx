import { useEffect, useRef, useState } from "react";
const SHEET_ID = import.meta.env.VITE_SHEET_ID;

const SheetsAccess = ({ accessToken, userInfo, resetForm, toggleReset }) => {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const mobileRef = useRef(null);
  const ageRef = useRef(null);
  const genderRef = useRef(null);
  const addressRef = useRef(null);

  const resetFormFields = () => {
    mobileRef.current.value = null;
    ageRef.current.value = null;
    genderRef.current.value = null;
    addressRef.current.value = null;
  };

  const addToSheet = async (payload) => {
    if (payload) {
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Sheet1!A1:append?valueInputOption=RAW`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            values: [
              [
                payload?.name,
                payload?.mobile,
                payload?.age,
                payload?.gender,
                payload?.address,
                new Date().toISOString(),
              ],
            ],
          }),
        }
      );

      if (response.ok) {
        alert("User details submitted successfully");
        resetFormFields();
      } else {
        const error = await response.json();
        console.error(error);
        alert(`Failed: ${response.status}`);
      }
    }
  };

  const [amount, setamount] = useState(350);

  // handlePayment Function
  const handlePayment = async (payload) => {
    try {
      const res = await fetch(
        `https://test-be-repo.onrender.com/api/payment/order`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            amount,
          }),
        }
      );

      const data = await res.json();
      console.log(data);
      handlePaymentVerify(data.data, payload);
    } catch (error) {
      console.log(error);
    }
  };

  // handlePaymentVerify Function
  const handlePaymentVerify = async (data, payload) => {
    const options = {
      key: "rzp_test_lE7amtTry7OURE",
      amount: data.amount,
      currency: data.currency,
      name: "Test Payment",
      description: "Test Mode",
      order_id: data.id,
      handler: async (response) => {
        console.log("response", response);
        try {
          const res = await fetch(
            `https://test-be-repo.onrender.com/api/payment/verify`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            }
          );

          const verifyData = await res.json();

          if (verifyData.message) {
            addToSheet?.(payload);
          }
        } catch (error) {
          console.log(error);
        }
      },
      theme: {
        color: "#5f63b8",
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = nameRef.current?.value;
    const mobile = mobileRef.current?.value;
    const age = ageRef.current?.value;
    const gender = genderRef.current?.value;
    const address = addressRef.current?.value;
    // console.log({ name, mobile, age, gender, address });
    const payload = {
      name,
      mobile,
      age,
      gender,
      address,
    };
    // addToSheet?.(payload); // Optional chaining in case undefined
    handlePayment(payload);
  };
  useEffect(() => {
    if (userInfo) {
      if (nameRef?.current) nameRef.current.value = userInfo?.name ?? "";
      if (emailRef?.current) emailRef.current.value = userInfo?.email ?? "";
    }
  }, [userInfo]);

  useEffect(() => {
    // console.log(resetForm);
    if (resetForm) {
      if (mobileRef?.current) mobileRef.current.value = null;
      if (ageRef?.current) ageRef.current.value = null;
      if (genderRef?.current) genderRef.current.value = "";
      if (addressRef?.current) addressRef.current.value = null;
      toggleReset();
    }
  }, [resetForm]);

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full space-y-6"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          User Details
        </h2>

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Full Name
          </label>
          <input
            ref={nameRef}
            id="name"
            name="name"
            type="text"
            placeholder="Full Name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="text"
            placeholder="Email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="mobile"
            className="block text-sm font-medium text-gray-700"
          >
            Mobile Number
          </label>
          <input
            ref={mobileRef}
            id="mobile"
            name="mobile"
            type="tel"
            placeholder="Mobile Number"
            pattern="^\d{10}$"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700"
          >
            Age
          </label>
          <input
            ref={ageRef}
            id="age"
            name="age"
            type="number"
            placeholder="Age"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender
          </label>
          <select
            ref={genderRef}
            id="gender"
            name="gender"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Address
          </label>
          <textarea
            ref={addressRef}
            id="address"
            name="address"
            placeholder="Address"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={!accessToken}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition ${
            accessToken
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default SheetsAccess;
