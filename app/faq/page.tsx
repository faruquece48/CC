"use client";

import { Accordion, AccordionItem } from "@nextui-org/react";

const faqs = [
  ["Who can participate in Construct Carnival?", "Students from universities and educational institutions may participate, subject to the eligibility requirements specified in each event's rulebook."],
  ["How do I register for an event?", "Open the Registration page, enter the participant information, select the desired individual or team events, and complete the online payment."],
  ["Can I register for multiple events?", "Yes. A participant may register for up to five different events, provided the event schedules and eligibility requirements allow it."],
  ["What are the registration fees?", "The fee is calculated per participant: 1 event costs 400 TK, 2 events 600 TK, 3 events 800 TK, 4 events 900 TK, and 5 events 1,000 TK."],
  ["Is there an additional charge for Truss Combat?", "Yes. A one-time courier charge of 150 TK is added to each Truss Combat team registration for delivering the required materials."],
  ["I registered earlier. Can I join another event?", "Yes. Select Registered earlier, verify your registered email using the OTP, and choose from the remaining available events."],
  ["How is the fee calculated for a previously registered participant?", "You pay only the difference between your previous fee tier and the new tier. For example, moving from three events at 800 TK to four events at 900 TK requires an additional 100 TK."],
  ["Why can't I select an event after OTP verification?", "Events in which you have already participated are automatically hidden. A participant cannot register for the same event more than once."],
  ["How long is the email verification OTP valid?", "The OTP is valid for the period shown beside the verification field. Enter it before the countdown expires. If it expires, request a new code."],
  ["What should I do if I do not receive the OTP?", "Check your spam or junk folder and confirm that the email address is correct. Wait at least one minute before requesting another code."],
  ["How many members are required for a team event?", "Each team event requires two or three members. All members must provide complete participant information."],
  ["Can the same team participate in multiple team events?", "Yes. The same members may participate in multiple eligible team events. Use the same email address for each member so the system calculates the fee correctly."],
  ["Why is Member 1 the same across team events?", "Member 1 is the primary participant entered at the top of the registration form. Their information is shared across all selected team events."],
  ["Can a previously registered member join my team?", "Yes. For Member 2 or Member 3, select Registered earlier and complete OTP verification. The system loads their information and calculates the applicable additional fee."],
  ["Can a participant join the same team event again?", "No. If a participant has already registered for that event, the system blocks OTP verification and prevents duplicate participation."],
  ["How do I know whether my registration was successful?", "After successful payment, you will receive a confirmation email containing your registration and payment information."],
  ["What happens if payment fails?", "The registration is not confirmed until payment succeeds. Return to the Registration page and submit the registration again."],
  ["Are registration fees refundable?", "Registration fees are generally non-refundable. Any exceptional refund or cancellation decision must be confirmed with the organizing committee."],
  ["Where can I find the event rules?", "Rulebooks are available from the relevant event page. Review the rules, eligibility criteria, submission requirements, and deadlines before registering."],
  ["Whom should I contact for registration assistance?", "Use the Contact page to reach the organizing committee. Include your registered email and transaction ID when reporting a payment or registration issue."]
] as const;

export default function FaqPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="border-b border-[#c49745] pb-6">
        <h1 className="font-serif text-3xl font-bold text-[#123f4b] sm:text-4xl">
          Frequently Asked Questions
        </h1>
      </header>

      <Accordion
        selectionMode="multiple"
        variant="splitted"
        className="mt-7 gap-3 px-0"
        itemClasses={{
          base: "rounded-lg border border-gray-200 bg-white px-1 shadow-sm",
          title: "font-semibold text-[#123f4b]",
          trigger: "px-4 py-4 text-left",
          content: "px-4 pb-5 leading-7 text-gray-600"
        }}
      >
        {faqs.map(([question, answer], index) => (
          <AccordionItem key={String(index + 1)} aria-label={question} title={question}>
            {answer}
          </AccordionItem>
        ))}
      </Accordion>
    </main>
  );
}
