import { yupResolver } from "@hookform/resolvers/yup";
import { nanoid } from "nanoid";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import generateInvoice from "../libs/generateInvoice";
import indianStates from "../libs/state";

const schema = yup.object().shape({
  sellerCompanyName: yup
    .string()
    .required("This field is required")
    .max(60, "You can input at most 60 characters"),
  sellerAddressLineOne: yup
    .string()
    .required("This field is required")
    .max(60, "Add rest address to Address Line Two Field"),
  sellerAddressLineTwo: yup
    .string()
    .max(60, "You can input at most 60 characters"),
  sellerCity: yup
    .string()
    .required("This field is required")
    .max(20, "You can input at most 20 characters"),
  sellerState: yup.string().required("This field is required"),
  sellerPincode: yup
   .string()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .required("This field is required")
    .matches(/^[1-9][0-9]{5}$/, "Pincode should be of the format 110020"),
  sellerPanNumber: yup
    .string()
    .required("This field is required")
    .matches(
      /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
      "PAN Number Should be of the format BNZAA2318J"
    ),
  sellerGstNumber: yup
    .string()
    .required("This field is required")
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "GST Number Should be of the format 09AAACH7409R1ZZ"
    ),
  sellerSupplyPlace: yup.string().required("This field is required"),
  sellerLogo: yup.mixed().test("required", "Please upload a file", (value) => {
    return value && value.length;
  }),
  sellerSignature: yup
    .mixed()
    .test("required", "Please upload a file", (value) => {
      return value && value.length;
    }),
  billingFirstName: yup
    .string()
    .required("This field is required")
    .max(10, "You can input at most 10 characters"),
  billingMiddleName: yup
    .string()
    .max(10, "You can input at most 10 characters"),
  billingLastName: yup
    .string()
    .required("This field is required")
    .max(10, "You can input at most 10 characters"),
  billingAddressLineOne: yup
    .string()
    .required("This field is required")
    .max(60, "Add rest address to Address Line Two Field"),
  billingAddressLineTwo: yup
    .string()
    .max(60, "You can input at most 60 characters"),
  billingCity: yup
    .string()
    .required("This field is required")
    .max(20, "You can input at most 20 characters"),
  billingState: yup.string().required("This field is required"),
  billingPincode: yup
   .string()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .required("This field is required")
    .matches(/^[1-9][0-9]{5}$/, "Pincode should be of the format 110020"),
  billingStateUtCode: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .required("This field is required")
    .positive()
    .integer(),
  shippingFirstName: yup
    .string()
    .required("This field is required")
    .max(10, "You can input at most 10 characters"),
  shippingMiddleName: yup
    .string()
    .max(10, "You can input at most 10 characters"),
  shippingLastName: yup
    .string()
    .required("This field is required")
    .max(10, "You can input at most 10 characters"),
  shippingAddressLineOne: yup
    .string()
    .required("This field is required")
    .max(60, "Add rest address to Address Line Two Field"),
  shippingAddressLineTwo: yup
    .string()
    .max(60, "You can input at most 60 characters"),
  shippingCity: yup
    .string()
    .required("This field is required")
    .max(20, "You can input at most 20 characters"),
  shippingState: yup.string().required("This field is required"),
  shippingPincode: yup
    .string()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .required("This field is required")
    .matches(/^[1-9][0-9]{5}$/, "Pincode should be of the format 110020"),
  shippingStateUtCode: yup
    .number()
    .transform((value) => (Number.isNaN(value) ? null : value))
    .required("This field is required")
    .positive()
    .integer(),
  shippingDeliveryPlace: yup.string().required("This field is required"),
  orderNumber: yup.string().required("This field is required"),
  orderDate: yup
    .date()
    .required("This field is required")
    .transform((curr, orig) => (orig === "" ? null : curr)),
  invoiceNumber: yup.string().required("This field is required"),
  invoiceDetails: yup.string().required("This field is required"),
  invoiceDate: yup
    .date()
    .required("This field is required")
    .transform((curr, orig) => (orig === "" ? null : curr)),
  invoiceReverseCharge: yup.boolean().required("This field is required"),
  items: yup.array().of(
    yup.object().shape({
      itemDescription: yup.string().required("Description is required"),
      itemUnitPrice: yup
        .number()
        .typeError("Unit Price must be a number")
        .required("Unit Price is required")
        .positive("Unit Price must be greater than zero"),
      itemQuantity: yup
        .number()
        .typeError("Quantity must be a number")
        .required("Quantity is required")
        .positive("Quantity must be greater than zero")
        .integer("Quantity must be an integer"),
      itemDiscount: yup
        .number()
        .typeError("Discount must be a number")
        .required("Discount is required")
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot be greater than 100"),
      itemTax: yup
        .number()
        .typeError("Tax must be a number")
        .required("Tax is required")
        .min(0, "Tax cannot be negative"),
    })
  ),
});

const Form = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [items, setItems] = useState([{ id: nanoid(), sno: 1 }]);
  const [logo, setLogo] = useState("");
  const [signature, setSignature] = useState("");
  const convertLogoToBase64 = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogo(reader.result.toString());
    };
    reader.readAsDataURL(file);
  };

  const convertSignatureToBase64 = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSignature(reader.result.toString());
    };
    reader.readAsDataURL(file);
  };

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleGenerateInvoice = async (data) => {
    const url = await generateInvoice(data);
    setPdfUrl(url);
  };
  const onSubmit = (data) => {
    console.log(data);
    if (data.sellerLogo.length > 0) {
      convertLogoToBase64(data.sellerLogo[0]);
    }
    if (data.sellerSignature.length > 0) {
      convertSignatureToBase64(data.sellerSignature[0]);
    }
    handleGenerateInvoice({
      ...data,
      sellerLogo: logo,
      sellerSignature: signature,
    });
  };

  const addItem = () => {
    const newItemId = nanoid();
    setItems((prevItems) => [
      ...prevItems,
      { id: newItemId, sno: prevItems.length + 1 },
    ]);
  };

  const removeItem = (id) => {
    setItems((prevItems) => {
      const filteredItems = prevItems.filter((item) => item.id !== id);
      return filteredItems.map((item, index) => ({
        ...item,
        sno: index + 1,
      }));
    });
  };

  const getInputClasses = (fieldName, errors) => {
    const fieldError = fieldName
      .split(".")
      .reduce((acc, key) => acc?.[key], errors);
    return `block w-full px-4 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none
           ${
             fieldError?.message
               ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-0"
               : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring"
           }
           `;
  };

  return (
    <div>
      <section className="mx-4 md:max-w-3xl lg:max-w-4xl p-6 md:mx-auto bg-indigo-600 rounded-md shadow-md dark:bg-gray-800 my-20">
        <h1 className="text-4xl font-bold text-white capitalize dark:text-white">
          Enter Details
        </h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-10 flex flex-col gap-5">
            <div className="flex flex-col gap-4 items-start">
              <h1 className="text-2xl font-bold text-white capitalize dark:text-white">
                Seller Details
              </h1>
              <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex flex-col items-start w-full">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="sellerCompanyName"
                  >
                    Company Name
                  </label>
                  <input
                    id="sellerCompanyName"
                    {...register("sellerCompanyName")}
                    type="text"
                    className={getInputClasses("sellerCompanyName", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.sellerCompanyName?.message}
                  </p>{" "}
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/2">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="sellerAddressLineOne"
                  >
                    Address Line 1
                  </label>
                  <input
                    id="sellerAddressLineOne"
                    {...register("sellerAddressLineOne")}
                    type="text"
                    className={getInputClasses("sellerAddressLineOne", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.sellerAddressLineOne?.message}
                  </p>{" "}
                </div>
                <div className="flex flex-col items-start md:w-1/2">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="sellerAddressLineTwo"
                  >
                    Address Line 2 (optional)
                  </label>
                  <input
                    id="sellerAddressLineTwo"
                    {...register("sellerAddressLineTwo")}
                    type="text"
                    className={getInputClasses("sellerAddressLineTwo", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.sellerAddressLineTwo?.message}
                  </p>{" "}
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex flex-col items-start w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="sellerCity"
                  >
                    City
                  </label>
                  <input
                    id="sellerCity"
                    {...register("sellerCity")}
                    type="text"
                    className={getInputClasses("sellerCity", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.sellerCity?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="sellerState"
                  >
                    State
                  </label>
                  <select
                    id="sellerState"
                    {...register("sellerState")}
                    className={`block w-full px-2 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none ${
                      errors.sellerState?.message
                        ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-0"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring"
                    } `}
                  >
                    {" "}
                    <option value="">Select State</option>{" "}
                    {indianStates.map((state, index) => (
                      <option key={index} value={state.name}>
                        {" "}
                        {state.name}{" "}
                      </option>
                    ))}{" "}
                  </select>
                  <p className="text-red-500 text-sm h-5">
                    {errors.sellerState?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="sellerPincode"
                  >
                    Pincode
                  </label>
                  <input
                    id="sellerPincode"
                    {...register("sellerPincode")}
                    type="number"
                    inputMode="numeric"
                    className={getInputClasses("sellerPincode", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.sellerPincode?.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/2">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="sellerPanNumber"
                  >
                    PAN Number
                  </label>
                  <input
                    id="sellerPanNumber"
                    {...register("sellerPanNumber")}
                    type="text"
                    className={getInputClasses("sellerPanNumber", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.sellerPanNumber?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/2">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="sellerGstNumber"
                  >
                    GST Registration Number
                  </label>
                  <input
                    id="sellerGstNumber"
                    {...register("sellerGstNumber")}
                    type="text"
                    className={getInputClasses("sellerGstNumber", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.sellerGstNumber?.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="sellerSupplyPlace"
                  >
                    Place of Supply
                  </label>
                  <select
                    id="sellerSupplyPlace"
                    {...register("sellerSupplyPlace")}
                    className={`block w-full px-2 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none ${
                      errors.sellerSupplyPlace?.message
                        ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-0"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring"
                    } `}
                  >
                    {" "}
                    <option value="">Select State</option>{" "}
                    {indianStates.map((state, index) => (
                      <option key={index} value={state.name}>
                        {" "}
                        {state.name}{" "}
                      </option>
                    ))}{" "}
                  </select>
                  <p className="text-red-500 text-sm h-5">
                    {errors.sellerSupplyPlace?.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                {!watch("sellerLogo") || watch("sellerLogo").length === 0 ? (
                  <div className="flex flex-col items-start w-1/3">
                    <label className="block text-sm font-medium text-white">
                      Company Logo
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-white"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="sellerLogo"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span className="">Upload an Image</span>
                            <input
                              id="sellerLogo"
                              {...register("sellerLogo")}
                              name="sellerLogo"
                              type="file"
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1 text-white">or drag and drop</p>
                        </div>
                        <p className="text-xs text-white">
                          PNG, JPG up to 5MB
                        </p>
                        <p className="text-red-500 text-sm h-2">
                          {errors.sellerLogo?.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <h1 className="text-black dark:text-white text-lg">
                      Seller Logo
                    </h1>
                    <div className="text-neutral-500 dark:text-[#EC4899]">
                      {watch("sellerLogo")[0].name}
                    </div>
                    <button
                      type="button"
                      className="px-2 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700"
                      onClick={() => {
                        resetField("sellerLogo");
                      }}
                    >
                      Upload New Logo
                    </button>
                  </div>
                )}
                {!watch("sellerSignature") ||
                watch("sellerSignature").length === 0 ? (
                  <div className="flex flex-col items-start w-1/3">
                    <label className="block text-sm font-medium text-white">
                      e-Signature
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-white"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="sellerSignature"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span className="">Upload an Image</span>
                            <input
                              id="sellerSignature"
                              {...register("sellerSignature")}
                              name="sellerSignature"
                              type="file"
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1 text-white">or drag and drop</p>
                        </div>
                        <p className="text-xs text-white">
                          PNG, JPG up to 5MB
                        </p>
                        <p className="text-red-500 text-sm h-5">
                          {errors.sellerSignature?.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <h1 className="text-black dark:text-white text-lg">
                      Seller Signature
                    </h1>
                    <div className="text-neutral-500 dark:text-[#EC4899]">
                      {watch("sellerSignature")[0].name}
                    </div>
                    <button
                      type="button"
                      className="px-2 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700"
                      onClick={() => {
                        resetField("sellerSignature");
                      }}
                    >
                      Upload New Signature
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-4 items-start">
              <h1 className="text-2xl font-bold text-white capitalize dark:text-white">
                Billing Details
              </h1>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="billingFirstName"
                  >
                    First Name
                  </label>
                  <input
                    id="billingFirstName"
                    {...register("billingFirstName")}
                    type="text"
                    className={getInputClasses("billingFirstName", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.billingFirstName?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="billingMiddleName"
                  >
                    Middle Name (optional)
                  </label>
                  <input
                    id="billingMiddleName"
                    {...register("billingMiddleName")}
                    type="text"
                    className={getInputClasses("billingMiddleName", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.billingMiddleName?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="billingLastName"
                  >
                    Last Name
                  </label>
                  <input
                    id="billingLastName"
                    {...register("billingLastName")}
                    type="text"
                    className={getInputClasses("billingLastName", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.billingLastName?.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/2">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="billingAddressLineOne"
                  >
                    Address Line 1
                  </label>
                  <input
                    id="billingAddressLineOne"
                    {...register("billingAddressLineOne")}
                    type="text"
                    className={getInputClasses("billingAddressLineOne", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.billingAddressLineOne?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/2">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="billingAddressLineTwo"
                  >
                    Address Line 2 (optional)
                  </label>
                  <input
                    id="billingAddressLineTwo"
                    {...register("billingAddressLineTwo")}
                    type="text"
                    className={getInputClasses("billingAddressLineTwo", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.billingAddressLineTwo?.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/4">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="billingCity"
                  >
                    City
                  </label>
                  <input
                    id="billingCity"
                    {...register("billingCity")}
                    type="text"
                    className={getInputClasses("billingCity", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.billingCity?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/4">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="billingState"
                  >
                    State
                  </label>
                  <select
                    id="billingState"
                    {...register("billingState")}
                    className={`block w-full px-2 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none ${
                      errors.billingState?.message
                        ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-0"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring"
                    } `}
                  >
                    {" "}
                    <option value="">Select State</option>{" "}
                    {indianStates.map((state, index) => (
                      <option key={index} value={state.name}>
                        {" "}
                        {state.name}{" "}
                      </option>
                    ))}{" "}
                  </select>
                  <p className="text-red-500 text-sm h-5">
                    {errors.billingState?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/4">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="billingPincode"
                  >
                    Pincode
                  </label>
                  <input
                    id="billingPincode"
                    {...register("billingPincode")}
                    type="number"
                    inputMode="numeric"
                    className={getInputClasses("billingPincode", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.billingPincode?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/4">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="billingStateUtCode"
                  >
                    State/UT Code
                  </label>
                  <select
                    id="billingStateUtCode"
                    {...register("billingStateUtCode")}
                    className={`block w-full px-2 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none ${
                      errors.billingStateUtCode?.message
                        ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-0"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring"
                    } `}
                  >
                    {" "}
                    <option value="">Select State</option>{" "}
                    {indianStates.map((state, index) => (
                      <option key={index} value={state.code}>
                        {" "}
                        {state.name}{" "}
                      </option>
                    ))}{" "}
                  </select>
                  <p className="text-red-500 text-sm h-5">
                    {errors.billingStateUtCode?.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-start">
              <h1 className="text-2xl font-bold text-white capitalize dark:text-white">
                Shipping Details
              </h1>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingFirstName"
                  >
                    First Name
                  </label>
                  <input
                    id="shippingFirstName"
                    {...register("shippingFirstName")}
                    type="text"
                    className={getInputClasses("shippingFirstName", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingFirstName?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingMiddleName"
                  >
                    Middle Name (optional)
                  </label>
                  <input
                    id="shippingMiddleName"
                    {...register("shippingMiddleName")}
                    type="text"
                    className={getInputClasses("shippingMiddleName", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingMiddleName?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingLastName"
                  >
                    Last Name
                  </label>
                  <input
                    id="shippingLastName"
                    {...register("shippingLastName")}
                    type="text"
                    className={getInputClasses("shippingLastName", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingLastName?.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/2">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingAddressLineOne"
                  >
                    Address Line One
                  </label>
                  <input
                    id="shippingAddressLineOne"
                    {...register("shippingAddressLineOne")}
                    type="text"
                    className={getInputClasses(
                      "shippingAddressLineOne",
                      errors
                    )}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingAddressLineOne?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingAddressLineTwo"
                  >
                    Address Line 2 (optional)
                  </label>
                  <input
                    id="shippingAddressLineTwo"
                    {...register("shippingAddressLineTwo")}
                    type="text"
                    className={getInputClasses(
                      "shippingAddressLineTwo",
                      errors
                    )}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingAddressLineTwo?.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/4">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingCity"
                  >
                    City
                  </label>
                  <input
                    id="shippingCity"
                    {...register("shippingCity")}
                    type="text"
                    className={getInputClasses("shippingCity", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingCity?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/4">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingState"
                  >
                    State
                  </label>
                  <select
                    id="shippingState"
                    {...register("shippingState")}
                    className={`block w-full px-2 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none ${
                      errors.shippingState?.message
                        ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-0"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring"
                    } `}
                  >
                    {" "}
                    <option value="">Select State</option>{" "}
                    {indianStates.map((state, index) => (
                      <option key={index} value={state.name}>
                        {" "}
                        {state.name}{" "}
                      </option>
                    ))}{" "}
                  </select>
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingState?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/4">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingPincode"
                  >
                    Pincode
                  </label>
                  <input
                    id="shippingPincode"
                    {...register("shippingPincode")}
                    type="number"
                    inputMode="numeric"
                    className={getInputClasses("shippingPincode", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingPincode?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/4">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingStateUtCode"
                  >
                    State/UT Code
                  </label>
                  <select
                    id="shippingStateUtCode"
                    {...register("shippingStateUtCode")}
                    className={`block w-full px-2 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none ${
                      errors.shippingStateUtCode?.message
                        ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-0"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring"
                    } `}
                  >
                    {" "}
                    <option value="">Select State</option>{" "}
                    {indianStates.map((state, index) => (
                      <option key={index} value={state.code}>
                        {" "}
                        {state.name}{" "}
                      </option>
                    ))}{" "}
                  </select>
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingStateUtCode?.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="shippingDeliveryPlace"
                  >
                    Place of Delivery
                  </label>
                  <select
                    id="shippingDeliveryPlace"
                    {...register("shippingDeliveryPlace")}
                    className={`block w-full px-2 py-2 mt-2 text-gray-700 bg-white border rounded-md dark:bg-gray-800 dark:text-gray-300 focus:outline-none ${
                      errors.shippingDeliveryPlace?.message
                        ? "border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-500 focus:ring-0"
                        : "border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-500 focus:ring"
                    } `}
                  >
                    {" "}
                    <option value="">Select State</option>{" "}
                    {indianStates.map((state, index) => (
                      <option key={index} value={state.name}>
                        {" "}
                        {state.name}{" "}
                      </option>
                    ))}{" "}
                  </select>
                  <p className="text-red-500 text-sm h-5">
                    {errors.shippingDeliveryPlace?.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-start">
              <h1 className="text-2xl font-bold text-white capitalize dark:text-white">
                Order Details
              </h1>
              <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex flex-col items-start w-1/2">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="orderNumber"
                  >
                    Order Number
                  </label>
                  <input
                    id="orderNumber"
                    {...register("orderNumber")}
                    type="text"
                    className={getInputClasses("orderNumber", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.orderNumber?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start w-1/2">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="orderDate"
                  >
                    Order Date
                  </label>
                  <input
                    id="orderDate"
                    {...register("orderDate")}
                    type="date"
                    className={getInputClasses("orderDate", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.orderDate?.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-start">
              <h1 className="text-2xl font-bold text-white capitalize dark:text-white">
                Invoice Details
              </h1>
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 w-full">
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="invoiceNumber"
                  >
                    Invoice Number
                  </label>
                  <input
                    id="invoiceNumber"
                    {...register("invoiceNumber")}
                    type="text"
                    className={getInputClasses("invoiceNumber", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.invoiceNumber?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="invoiceDetails"
                  >
                    Invoice Details
                  </label>
                  <input
                    id="invoiceDetails"
                    {...register("invoiceDetails")}
                    type="text"
                    className={getInputClasses("invoiceDetails", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.invoiceDetails?.message}
                  </p>
                </div>
                <div className="flex flex-col items-start md:w-1/3">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="invoiceDate"
                  >
                    Invoice Date
                  </label>
                  <input
                    id="invoiceDate"
                    {...register("invoiceDate")}
                    type="date"
                    className={getInputClasses("invoiceDate", errors)}
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.invoiceDate?.message}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center gap-2 w-full">
                <div className="flex flex-col items-start">
                  <label
                    className="text-white dark:text-gray-200"
                    htmlFor="invoiceReverseCharge"
                  >
                    Reverse Charge
                  </label>
                  <input
                    id="invoiceReverseCharge"
                    {...register("invoiceReverseCharge")}
                    type="checkbox"
                    className="size-4 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 "
                  />
                  <p className="text-red-500 text-sm h-5">
                    {errors.invoiceReverseCharge?.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 items-start">
              <h1 className="text-2xl font-bold text-white capitalize dark:text-white">
                Item Details
              </h1>
             
              {items.map((item, idx) => (
                <div key={item.id} className="flex flex-col gap-2 w-full">
                  <div className="flex justify-between items-center gap-2 w-full">
                    <p className="text-pink-500 dark:text-pink-500 text-xl">
                      Item Number {item.sno}
                    </p>
                  </div>

                  <div className="flex justify-between items-center gap-2 w-full">
                    <div className="flex flex-col items-start w-full">
                      <label
                        className="text-white dark:text-gray-200"
                        htmlFor={`items.${idx}.itemDescription`}
                      >
                        Description
                      </label>
                      <input
                        id={`items.${idx}.itemDescription`}
                        {...register(`items.${idx}.itemDescription`)}
                        type="text"
                        className={getInputClasses(
                          `items.${idx}.itemDescription`,
                          errors
                        )}
                      />
                      <p className="text-red-500 text-sm h-5">
                        {errors.items?.[idx]?.itemDescription?.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2 w-full">
                    <div className="flex flex-col items-start w-1/3">
                      <label
                        className="text-white dark:text-gray-200"
                        htmlFor={`items.${idx}.itemUnitPrice`}
                      >
                        Unit Price
                      </label>
                      <input
                        id={`items.${idx}.itemUnitPrice`}
                        {...register(`items.${idx}.itemUnitPrice`)}
                        type="number"
                        step="0.01"
                        className={getInputClasses(
                          `items.${idx}.itemUnitPrice`,
                          errors
                        )}
                      />
                      <p className="text-red-500 text-sm h-5">
                        {errors.items?.[idx]?.itemUnitPrice?.message}
                      </p>
                    </div>

                    <div className="flex flex-col items-start w-1/3">
                      <label
                        className="text-white dark:text-gray-200"
                        htmlFor={`items.${idx}.itemQuantity`}
                      >
                        Quantity
                      </label>
                      <input
                        id={`items.${idx}.itemQuantity`}
                        {...register(`items.${idx}.itemQuantity`)}
                        type="number"
                        className={getInputClasses(
                          `items.${idx}.itemQuantity`,
                          errors
                        )}
                      />
                      <p className="text-red-500 text-sm h-5">
                        {errors.items?.[idx]?.itemQuantity?.message}
                      </p>
                    </div>

                    <div className="flex flex-col items-start w-1/3">
                      <label
                        className="text-white dark:text-gray-200"
                        htmlFor={`items.${idx}.itemDiscount`}
                      >
                        Discount %
                      </label>
                      <input
                        id={`items.${idx}.itemDiscount`}
                        {...register(`items.${idx}.itemDiscount`)}
                        type="number"
                        className={getInputClasses(
                          `items.${idx}.itemDiscount`,
                          errors
                        )}
                      />
                      <p className="text-red-500 text-sm h-5">
                        {errors.items?.[idx]?.itemDiscount?.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-2 w-full">
                    <div className="flex flex-col items-start w-2/3 md:w-1/2">
                      <label
                        className="text-white dark:text-gray-200"
                        htmlFor={`items.${idx}.itemTax`}
                      >
                        Tax %(will be calculated based on Intra/InterState Delivery)
                      </label>
                      <input
                        id={`items.${idx}.itemTax`}
                        {...register(`items.${idx}.itemTax`)}
                        type="number"
                        className={getInputClasses(
                          `items.${idx}.itemTax`,
                          errors
                        )}
                      />
                      <p className="text-red-500 text-sm h-5">
                        {errors.items?.[idx]?.itemTax?.message}
                      </p>
                    </div>
                  </div>

                  {items.length > 1 && (
                    <button
                      onClick={() => {
                        clearErrors(`items[${idx}]`)
                        resetField(`items[${idx}]`)
                        removeItem(item.id)
                      }
                      }
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove Item
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={addItem}
                type="button"
                className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700"
              >
                Add Item
              </button>
            </div>
            <div className="flex gap-2 justify-center items-center">
              <button
                type="submit"
                className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700"
              >
                Generate Invoice
              </button>
              <button
                type="button"
                onClick={() => {
                  reset()
                  setPdfUrl(null)
                }}
                className="px-6 py-2 leading-5 text-white transition-colors duration-200 transform bg-pink-500 rounded-md hover:bg-pink-700"
              >
                Clear all fields
              </button>
            </div>
          </div>
        </form>
      </section>
      {pdfUrl && (
        <section className="mx-4 md:max-w-3xl lg:max-w-4xl p-6 md:mx-auto rounded-md shadow-md dark:bg-gray-800 -mt-16">
          <h3 className="text-xl text-black dark:text-white mb-2">
            Invoice Preview
          </h3>
          <iframe src={pdfUrl} width="100%" height="500px" title="preview"></iframe>
        </section>
      )}
    </div>
  );
};

export default Form;
