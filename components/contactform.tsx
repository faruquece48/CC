'use client';

import { useState } from "react";
import { Button, Input, Textarea } from "@nextui-org/react";
import { BsSendFill } from "react-icons/bs";

function ContactForm() {

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });

  const [errorMessages, setErrorMessages] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const handleFormSubmit = async (e: React.FormEvent) => {

    e.preventDefault();

    let errors = false;

    setSuccessMessage("");
    setSubmitError("");

    if (formData.fullName === "") {
      setErrorMessages((prev) => ({
        ...prev,
        fullName: "Please enter your full name."
      }));
      errors = true;
    } else {
      setErrorMessages((prev) => ({
        ...prev,
        fullName: ""
      }));
    }

    if (formData.email === "") {
      setErrorMessages((prev) => ({
        ...prev,
        email: "Please enter your email address."
      }));
      errors = true;
    } else {
      setErrorMessages((prev) => ({
        ...prev,
        email: ""
      }));
    }

    if (formData.subject === "") {
      setErrorMessages((prev) => ({
        ...prev,
        subject: "Please enter the subject."
      }));
      errors = true;
    } else {
      setErrorMessages((prev) => ({
        ...prev,
        subject: ""
      }));
    }

    if (formData.message === "") {
      setErrorMessages((prev) => ({
        ...prev,
        message: "Please enter your message."
      }));
      errors = true;
    } else {
      setErrorMessages((prev) => ({
        ...prev,
        message: ""
      }));
    }

    if (errors) return;

    try {

      setLoading(true);

      // API call
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setSuccessMessage("Message sent successfully!");

      // Clear form
      setFormData({
        fullName: "",
        email: "",
        subject: "",
        message: ""
      });

    } catch (error) {

      setSubmitError("Something went wrong. Please try again.");

    } finally {

      setLoading(false);

    }
  };

  return (

    <form className="flex flex-col w-full gap-5" onSubmit={handleFormSubmit}>

      <Input
        errorMessage={errorMessages.fullName}
        placeholder="Full Name *"
        required
        variant="underlined"
        value={formData.fullName}
        onChange={(e) =>
          setFormData({ ...formData, fullName: e.target.value })
        }
      />

      <Input
        errorMessage={errorMessages.email}
        placeholder="Email *"
        required
        type="email"
        variant="underlined"
        value={formData.email}
        onChange={(e) =>
          setFormData({ ...formData, email: e.target.value })
        }
      />

      <Input
        errorMessage={errorMessages.subject}
        placeholder="Subject *"
        required
        variant="underlined"
        value={formData.subject}
        onChange={(e) =>
          setFormData({ ...formData, subject: e.target.value })
        }
      />

      <Textarea
        required
        errorMessage={errorMessages.message}
        variant="underlined"
        label="Message *"
        placeholder="Write your message here..."
        className="w-full"
        value={formData.message}
        onChange={(e) =>
          setFormData({ ...formData, message: e.target.value })
        }
      />

      {successMessage && (
        <div className="text-green-500 font-medium">
          {successMessage}
        </div>
      )}

      {submitError && (
        <div className="text-red-500 font-medium">
          {submitError}
        </div>
      )}

      <Button
        startContent={<BsSendFill />}
        className="bg-rose-500 text-white p-2 rounded-md"
        type="submit"
        isLoading={loading}
      >
        {loading ? "Sending..." : "Send"}
      </Button>

    </form>
  )
}

export default ContactForm;