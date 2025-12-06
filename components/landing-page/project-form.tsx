"use client"

import type React from "react"

import { useState } from "react"
import { ArrowRight } from "lucide-react"
import emailjs from "@emailjs/browser"
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input"
import "react-phone-number-input/style.css"

export default function ProjectForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  })

  const [errors, setErrors] = useState<{
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null)

  const validatePhone = (phone: string | undefined): boolean => {
    if (!phone) return true // Phone is optional
    return isValidPhoneNumber(phone)
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }))
    }
  }

  const handlePhoneChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      phone: value || "",
    }))

    // Clear error when user changes phone
    if (errors.phone) {
      setErrors((prev) => ({
        ...prev,
        phone: undefined,
      }))
    }
  }

  const handleBlur = (field: string, value: string) => {
    let error = ""

    switch (field) {
      case "firstName":
        if (!value.trim()) {
          error = "First name is required"
        }
        break
      case "lastName":
        if (!value.trim()) {
          error = "Last name is required"
        }
        break
      case "email":
        if (!value.trim()) {
          error = "Email is required"
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address"
        }
        break
      case "phone":
        if (value && !validatePhone(value)) {
          error = "Please enter a valid phone number"
        }
        break
    }

    // Always update error state - set error if validation fails, clear it if validation passes
    setErrors((prev) => ({
      ...prev,
      [field]: error || undefined,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields
    const newErrors: typeof errors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      // EmailJS configuration
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

      // Validate EmailJS credentials
      if (!serviceId || !templateId || !publicKey) {
        console.error("EmailJS credentials missing. Please check your .env.local file.")
        setSubmitStatus("error")
        setTimeout(() => setSubmitStatus(null), 5000)
        setIsSubmitting(false)
        return
      }

      const templateParams = {
        email: formData.email,
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone || "Not provided",
        to_email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || formData.email,
        reply_to: formData.email, // Allows you to reply directly to the sender
      }

      console.log("Sending email with EmailJS...", { serviceId, templateId, templateParams })

      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey)

      console.log("Email sent successfully:", response)

      setSubmitStatus("success")
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      })
      setErrors({})

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null)
      }, 5000)
    } catch (error: any) {
      console.error("Error submitting form:", error)
      
      // Provide more specific error messages
      let errorMessage = "Failed to send message. Please try again or contact us directly."
      
      if (error?.text) {
        console.error("EmailJS error details:", error.text)
        if (error.text.includes("Invalid template ID")) {
          errorMessage = "Configuration error: Invalid template ID. Please check your EmailJS settings."
        } else if (error.text.includes("Invalid service ID")) {
          errorMessage = "Configuration error: Invalid service ID. Please check your EmailJS settings."
        } else if (error.text.includes("Invalid public key")) {
          errorMessage = "Configuration error: Invalid public key. Please check your EmailJS settings."
        }
      }
      
      setSubmitStatus("error")
      
      // Show error in console for debugging
      alert(`Error: ${errorMessage}\n\nCheck browser console for details.`)
      
      // Clear error message after 8 seconds (longer for errors)
      setTimeout(() => {
        setSubmitStatus(null)
      }, 8000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-12 px-6 md:px-10">
      <div className="max-w-xl mx-auto w-full">
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200">
          {/* Header */}
          <div className="mb-8">
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              Answer some quick questions about your project and then schedule a call with your project manager.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-gray-900 text-sm font-medium mb-3">
                What is your first name? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onBlur={(e) => handleBlur("firstName", e.target.value)}
                required
                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent transition-all ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder=""
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-gray-900 text-sm font-medium mb-3">
                Last name? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onBlur={(e) => handleBlur("lastName", e.target.value)}
                required
                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent transition-all ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder=""
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-gray-900 text-sm font-medium mb-3">
                What is your email? <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={(e) => handleBlur("email", e.target.value)}
                required
                className={`w-full px-4 py-3 bg-white border rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7A7FEE] focus:border-transparent transition-all ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder=""
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone" className="block text-gray-900 text-sm font-medium mb-3">
                Your phone number
              </label>
              <div className={`phone-input-wrapper ${errors.phone ? "phone-input-error" : ""}`}>
                <PhoneInput
                  international
                  defaultCountry="US"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  onBlur={() => handleBlur("phone", formData.phone)}
                  placeholder="Enter phone number"
                  className="w-full"
                  countrySelectProps={{
                    className: "phone-country-select",
                  }}
                  numberInputProps={{
                    className: "phone-number-input",
                  }}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Submit Status Messages */}
            {submitStatus === "success" && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  ✓ Thank you! We've received your message and will get back to you soon.
                </p>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">
                  ✗ Failed to send message. Please try again or contact us directly.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex items-center gap-2 px-6 py-3 bg-[#7A7FEE] text-white rounded-lg text-sm font-medium transition-all ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-[#6a6fdd]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
