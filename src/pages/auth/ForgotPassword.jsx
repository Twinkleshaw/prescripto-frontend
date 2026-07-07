import { useState } from "react";
import { Phone, Mail, ChevronDown } from "lucide-react";

const CONTACTS = [
  {
    icon: Phone,
    label: "Phone number",
    primary: "+917586942431",
    href: "tel:+917586942431",
  },
  {
    icon: Mail,
    label: "Email",
    primary: "info@prescriptoadmin.com",
    href: "mailto:info@prescriptoadmin.com",
  },
];

const FAQS = [
  {
    q: "How quickly do you respond to support emails?",
    a: "We reply to most emails within one business day. For urgent issues, calling our toll free number gets you a faster answer.",
  },
  {
    q: "What are your phone support hours?",
    a: "Our phone line is staffed Monday to Friday, 9am to 6pm. Outside those hours, leave a message or send an email and we'll follow up the next business day.",
  },
  {
    q: "Can I get support in a language other than English?",
    a: "Yes, our email support team can assist in English, Hindi and Bengali. Let us know your preference when you write in.",
  },
  {
    q: "Do you offer support for billing questions?",
    a: "Billing questions are handled by the same team. Email info@prescriptoadmin.com with your account details and we'll sort it out.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="text-sm font-medium text-gray-900">{q}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="grid transition-all duration-200 ease-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-3.5 text-sm leading-relaxed text-gray-500">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ContactFAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
      {/* Heading */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          How can we help you
        </h1>
        <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
          Reach our support team directly by phone or email, or check the
          answers below before you write in.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
        {CONTACTS.map(({ icon: Icon, label, primary, secondary, href }) => (
          <div
            key={label}
            className="bg-white border border-gray-200 rounded-2xl p-5"
          >
            <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mb-3.5">
              <Icon size={17} className="text-primary" />
            </div>
            <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
            {href ? (
              <a
                href={href}
                className="text-base font-semibold text-primary hover:underline"
              >
                {primary}
              </a>
            ) : (
              <p className="text-base font-semibold text-gray-900">{primary}</p>
            )}
            {secondary && (
              <p className="text-xs text-gray-400 mt-0.5">{secondary}</p>
            )}
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div>
        <p className="text-xs font-semibold tracking-wider text-gray-500 uppercase mb-3">
          Frequently asked questions
        </p>
        <div className="flex flex-col gap-2">
          {FAQS.map((item, i) => (
            <FaqItem
              key={item.q}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
