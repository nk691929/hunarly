export interface FaqItem {
  question: string;
  answer: string;
}

/** Used by the landing page, the pricing page and FAQPage structured data. */
export const faqItems: FaqItem[] = [
  {
    question: "Is Hunarly free?",
    answer:
      "Yes, you can start for free. The free plan includes one resume, two templates and a PDF export with a small watermark. Pro removes the limits and adds the AI writer, the job description keyword match and the cover letter builder.",
  },
  {
    question: "What does ATS-friendly mean?",
    answer:
      "Many employers use applicant tracking systems that read your resume as plain text. Hunarly exports a real, text-selectable PDF with a clean single-column reading order, standard section headings and no text hidden in images, so those systems can read it.",
  },
  {
    question: "Should I make a resume or a CV?",
    answer:
      "It depends on the country and the job. In the US and Canada, employers usually expect a one-page resume. In the UK, Europe, Pakistan and the Gulf, a CV with more detail is common, and some employers expect a photo or personal details. Hunarly's templates cover both, and the Remote-ready mode removes the photo and date of birth for international applications.",
  },
  {
    question: "I have no work experience. Can I still build a good resume?",
    answer:
      "Yes. Hunarly has sections for final-year projects, internships, coursework, volunteering, certifications and languages, and every section shows example text and tips so you know what to write.",
  },
  {
    question: "Who can see my resume?",
    answer:
      "Only you, unless you turn on a shareable link. We never write your resume content to our logs. You can export or delete all of your data from your account settings at any time.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "International cards are accepted worldwide. Local payment options, starting with Pakistan, are being added.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Yes. Monthly and yearly plans can be cancelled whenever you like and stay active until the end of the period you paid for. The job-hunt pass is a one-time payment and does not renew.",
  },
];
