"use client";
import Link from "next/link";
import React, { useState } from "react";

const VerifyEmail = () => {
  const [inputValues, setInputValues] = useState({
    email: "",
    otp: "",
  });

  const handleFormSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white text-center">
              Verify Email Account
            </h1>
            <form
              className="space-y-4 md:space-y-6"
              onSubmit={handleFormSubmit}
            >
              {/* email input */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@gmail.com"
                  value={inputValues.email}
                  onChange={(e) =>
                    setInputValues({ ...inputValues, email: e.target.value })
                  }
                />
              </div>

              {/* token */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  otp
                </label>
                <input
                  type="text"
                  name="otp"
                  id="otp"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="1234"
                  value={inputValues.otp}
                  onChange={(e) =>
                    setInputValues({ ...inputValues, otp: e.target.value })
                  }
                />
              </div>

              {/* go to login page */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                  Go back to{" "}
                  <Link
                    href="/login"
                    className="font-bold text-sm hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </div>

              {/* submit button */}
              <button
                type="submit"
                className="w-full text-white bg-orange-500 hover:bg-orange-600 outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;
