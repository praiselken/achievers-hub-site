export type PublicSection = {
  title: string;
  body: string;
  bullets?: string[];
};

export type PublicPageContent = {
  eyebrow: string;
  title: string;
  intro: string;
  description: string;
  sections: PublicSection[];
  notice?: string;
  primaryCta?: { label: string; href: string };
  featureTone?: "daily" | "topic" | "past" | "ai" | "grow" | "progress" | "parent" | "tutor";
};

export const publicPages: Record<string, PublicPageContent> = {
  "start-free-trial": {
    eyebrow: "Seven-day free trial",
    title: "Choose who is setting up the account",
    intro: "Try Achievers Hub free for seven days. No payment details are required. Your trial ends automatically unless you choose to continue with a paid membership.",
    description: "Start a no-card seven-day Achievers Hub trial as a student or parent.",
    sections: [
      { title: "I am a student", body: "Create your learning profile and start your free trial independently.", bullets: ["No parent required to begin", "No payment details required", "GCSE Maths and Economics included"] },
      { title: "I am a parent or guardian", body: "Create a learning profile for your child and connect your parent dashboard.", bullets: ["See progress in clear language", "Student answers remain read-only", "Manage additional students from one dashboard"] },
    ],
    primaryCta: { label: "Start your free trial", href: "/signup" },
  },
  students: {
    eyebrow: "For students",
    title: "Stop wondering what to revise next",
    intro: "Achievers Hub turns your starting point and learning activity into a practical next step for GCSE Maths and Economics.",
    description: "Personalised GCSE revision for students, with Daily 5, Topic Hub, past-paper analysis and bounded AI support.",
    sections: [
      { title: "A short daily routine with a clear purpose", body: "Daily 5 gives you five focused questions and a recommendation for what to do next." },
      { title: "Help when you are stuck", body: "Use hints, step-by-step explanations and Archi, the AI Tutor, without losing the chance to think for yourself." },
      { title: "Past papers that tell you more than a score", body: "Question-level analysis connects your marks to the topics and skills that affected your result." },
      { title: "Three grades, three different meanings", body: "Your current working grade comes from you or your school. Your target grade is what you are working towards. The Achievers Hub performance estimate develops from your activity and is never an official exam result." },
    ],
    primaryCta: { label: "Start your free trial", href: "/start-free-trial" },
  },
  parents: {
    featureTone: "parent",
    eyebrow: "For parents",
    title: "Understand your child’s progress without becoming the subject expert",
    intro: "See recent activity, topic patterns and recommended next steps for your linked child from one family dashboard.",
    description: "Achievers Hub helps parents understand GCSE progress, activity and recommended next steps.",
    sections: [
      { title: "See more than a single score", body: "View Daily 5 activity, topic strengths, areas needing attention and past-paper reports in clear language." },
      { title: "Support without editing the work", body: "Parent access is read-only for completed student answers and learning activity." },
      { title: "Keep support connected", body: "A student can link one active parent account and one active tutor account." },
      { title: "Student Membership", body: "Student Membership is £17.99 per month and each additional student is £9.99 per month. The no-card free trial ends automatically after seven days unless you choose to continue." },
    ],
    primaryCta: { label: "Explore Student Membership", href: "/pricing" },
  },
  tutors: {
    featureTone: "tutor",
    eyebrow: "For tutors",
    title: "Begin each lesson with a clearer picture of what the student needs",
    intro: "Use a free Linked Tutor View for one student, or bring up to 25 active students into one combined dashboard with Tutor Membership.",
    description: "Learning insights and tutor-management tools for independent GCSE tutors.",
    sections: [
      { title: "Free Linked Tutor View", body: "When invited and approved, a tutor can view one student's recent activity, Daily 5 completion, topic patterns, past-paper summary and recommended next step for free." },
      { title: "Tutor Membership", body: "Manage up to 25 active students with detailed reports, student alerts, homework, calendar, attendance, bookings, files, messages and invoice records." },
      { title: "No tutor marketplace", body: "Achievers Hub supports tutors working with their own students. It does not match tutors with new clients." },
      { title: "Safe student linking", body: "A parent or guardian approves tutor access for an under-18 student. Students aged 18 or over approve and revoke access themselves." },
    ],
    primaryCta: { label: "Explore Tutor Membership", href: "/pricing" },
  },
  "features/daily-5": {
    featureTone: "daily",
    eyebrow: "Daily 5",
    title: "Five focused questions. One clearer next step.",
    intro: "A short daily routine designed to strengthen recall, reveal patterns and recommend the next useful activity.",
    description: "Daily 5 gives GCSE students five focused questions and a clear next step.",
    sections: [
      { title: "For GCSE Maths", body: "Questions can mix retrieval, fluency, reasoning and application, with hints and accessible mathematical support where appropriate." },
      { title: "For GCSE Economics", body: "A daily set can combine a key term, calculation or interpretation, data or diagram work, a chain of reasoning and a quick check." },
      { title: "Your starting Daily 5", body: "Selection begins with subject, exam board, school year, current working grade and target grade. If the current grade is unknown, the first set uses a balanced mix linked to the target. There is no diagnostic assessment." },
      { title: "After the five", body: "Review the result and continue with a Quick Lesson, Knowledge Card, topic practice or bounded AI support." },
    ],
    primaryCta: { label: "Start free", href: "/start-free-trial" },
  },
  "features/topic-hub": {
    featureTone: "topic",
    eyebrow: "Topic Hub",
    title: "Everything you need for a topic, connected in one place",
    intro: "Move from explanation to practice without losing the context of what you are trying to improve.",
    description: "Explore GCSE topics through connected explanations, Knowledge Cards, Quick Lessons and practice.",
    sections: [
      { title: "Knowledge Cards", body: "Review concise ideas, definitions, methods and common misconceptions." },
      { title: "Quick Lessons", body: "Work through a short explanation and complete a check question before continuing." },
      { title: "Practice with context", body: "Topic status can show not started, in progress, needs practice, recommended, secure, mastered or more evidence needed." },
      { title: "Recommendations you can understand", body: "The platform explains when a topic is suggested because it affected recent questions or a past-paper result." },
    ],
  },
  "features/past-paper-hub": {
    featureTone: "past",
    eyebrow: "Past Paper Hub",
    title: "Turn every past paper into a focused revision plan",
    intro: "Record marks question by question, understand the topics behind the result and choose a useful next action.",
    description: "Question-level analysis turns GCSE past-paper results into focused revision priorities.",
    sections: [
      { title: "Choose the correct paper", body: "Filter by subject, exam board, series, paper and tier where relevant." },
      { title: "Keep the mark source visible", body: "Marks are labelled as student-entered, AI-assisted, tutor-confirmed or teacher-confirmed." },
      { title: "Use estimates carefully", body: "Any grade shown is an estimate, not an official examination result, and depends on a confirmed grade-boundary source and version." },
      { title: "Launch limitation", body: "Supported typed answers may be eligible for AI-assisted marking. Handwritten-answer upload and marking are not available at launch." },
    ],
  },
  "features/ai-tutor": {
    featureTone: "ai",
    eyebrow: "Archi: AI Tutor",
    title: "Ask Archi for help without losing the chance to think",
    intro: "Get a hint, unpack a step, check reasoning or request a similar question at the point you need support.",
    description: "Bounded AI support for GCSE Maths and Economics revision.",
    sections: [
      { title: "Hint-first support", body: "Ask for a hint or simpler explanation before seeing a full worked approach." },
      { title: "Understand mistakes", body: "Use relevant question and topic context to explore where reasoning went wrong." },
      { title: "Designed to support, not replace", body: "Archi is an AI learning tool, not a teacher, tutor, counsellor or source of guaranteed marks." },
      { title: "Accuracy boundary", body: "AI responses can contain mistakes. Check important feedback against the mark scheme, teacher or tutor, and report unsuitable feedback." },
    ],
  },
  "features/think-speak-grow": {
    featureTone: "grow",
    eyebrow: "Think, Speak, Grow",
    title: "Prepare your mind. Express what you know. Take one practical step.",
    intro: "At the start of a learning session, answer one short reflection question, choose a helpful statement and decide on one practical action. It is not a wellbeing diagnosis or counselling service.",
    description: "A brief metacognitive reflection that helps students choose one practical action for a learning session.",
    sections: [
      { title: "Think", body: "Pause on a short learning-focused reflection question." },
      { title: "Speak", body: "Read or say a grounded declaration about the effort or strategy you can control." },
      { title: "Grow", body: "Choose one practical action to complete during the session." },
      { title: "Private by default", body: "Reflections stay private unless the student makes a deliberate, understandable sharing choice." },
    ],
  },
  "features/progress-tracking": {
    featureTone: "progress",
    eyebrow: "Progress tracking",
    title: "See the evidence behind your next revision step",
    intro: "Bring daily questions, topic activity and past-paper results into one clear view of strengths, priorities and recent improvement.",
    description: "Track GCSE revision progress and understand the evidence behind each recommended next step.",
    sections: [
      { title: "A topic-level picture", body: "See where the available evidence suggests a topic is developing, needs practice or is becoming secure." },
      { title: "Clear grade language", body: "Keep your current working grade, target grade and Achievers Hub performance estimate separate so each number has a clear meaning." },
      { title: "Recommendations with a reason", body: "Understand whether a next step comes from Daily 5 activity, topic practice or a question-level past-paper result." },
      { title: "Useful views for linked adults", body: "Parents and tutors see relevant progress patterns in clear language while completed student answers remain read-only." },
    ],
    primaryCta: { label: "Start free", href: "/start-free-trial" },
  },
  "subjects/gcse-maths": {
    eyebrow: "GCSE Maths",
    title: "Personalised GCSE Maths revision with a clear next step",
    intro: "Connect daily questions, topic learning, past papers and progress evidence across your supported specification.",
    description: "Personalised GCSE Maths revision with Daily 5, Topic Hub, past papers and AI explanations.",
    sections: [
      { title: "Daily 5 for Maths", body: "Build consistency with five focused questions chosen from your starting point and recent activity." },
      { title: "Topic-by-topic learning", body: "Use Knowledge Cards, Quick Lessons, practice questions and worked solutions in one connected place." },
      { title: "Mathematical presentation", body: "Methods, notation, diagrams and formula support are designed to remain readable and accessible." },
      { title: "Past papers and QLA", body: "Trace question-level marks back to the topics and skills that affected your result." },
    ],
  },
  "subjects/gcse-economics": {
    eyebrow: "GCSE Economics",
    title: "Build the knowledge and reasoning GCSE Economics requires",
    intro: "Practise definitions, calculations, data interpretation, diagrams, chains of reasoning and exam technique.",
    description: "Personalised GCSE Economics revision for knowledge, application, analysis and exam technique.",
    sections: [
      { title: "Daily 5 for Economics", body: "Use a balanced routine spanning key terms, quantitative skills, data or diagrams, reasoning and a quick check." },
      { title: "Knowledge and application", body: "Connect precise subject knowledge to real contexts and source material." },
      { title: "Chains of reasoning", body: "Build explanations step by step and identify where a link needs more support." },
      { title: "Typed-answer feedback", body: "Supported typed answers may receive AI-assisted feedback with a visible accuracy warning and a route to report problems." },
    ],
  },
  shop: {
    eyebrow: "Shop",
    title: "Revision resources for learning at home and on the go",
    intro: "Browse planned revision guides, printable resources, digital study packs and stationery without needing a learning account.",
    description: "GCSE revision guides, printable resources, digital study packs and stationery from Achievers Hub.",
    sections: [
      { title: "Revision guides", body: "Structured subject support designed to complement the platform." },
      { title: "Printable and digital resources", body: "Clearly labelled downloads with format, contents and usage terms shown before purchase." },
      { title: "Physical products", body: "Delivery and returns information will be specific to the product and fulfilment route." },
      { title: "Buying routes", body: "Some products may be fulfilled through Shopify and others may link to Amazon. Each product page will make the seller and fulfilment route clear." },
    ],
    notice: "Pre-launch catalogue: products, prices and fulfilment details are still being confirmed.",
  },
  faq: {
    eyebrow: "Frequently asked questions",
    title: "Clear answers before you begin",
    intro: "The essentials about personalisation, AI, past papers, account links, membership and launch boundaries.",
    description: "Answers to common questions about Achievers Hub GCSE revision, membership and AI support.",
    sections: [
      { title: "Is there a diagnostic assessment?", body: "No. Personalisation begins with subject, exam board, current working grade and target grade, then improves using activity evidence." },
      { title: "Does Achievers Hub guarantee a target grade?", body: "No. The platform supports purposeful revision but cannot guarantee a particular grade." },
      { title: "Is AI feedback always correct?", body: "No. AI responses can contain mistakes and important feedback should be checked against a mark scheme, teacher or tutor." },
      { title: "Can it mark handwritten answers?", body: "No. Handwritten-answer upload and marking are unavailable at launch." },
      { title: "How many adults can be linked?", body: "Each student can have no more than one active parent account and one active tutor account." },
      { title: "Is there a tutor marketplace?", body: "No. Tutors use Achievers Hub with students they already support." },
    ],
  },
  support: {
    eyebrow: "Support",
    title: "Get help with your account or learning experience",
    intro: "Choose the most relevant support category so your request can be handled safely and efficiently.",
    description: "Account, technical, billing, shop, safeguarding and privacy support for Achievers Hub.",
    sections: [
      { title: "Account and technical support", body: "Help with sign-in, account linking, platform access and technical problems." },
      { title: "Billing and subscriptions", body: "Questions about trials, payment, cancellation, membership or invoices." },
      { title: "Safeguarding", body: "A dedicated reporting route will be published after the safeguarding process and approved recipients are confirmed." },
      { title: "Privacy and data", body: "A dedicated route will cover personal-data questions, access requests and account-data requests." },
    ],
    notice: "Contact addresses and expected response times are awaiting confirmation. Do not use this page for an emergency.",
    primaryCta: { label: "Use the contact form", href: "/contact" },
  },
};

const legalReviewNotice = "Draft scope only. This page requires specialist legal or compliance review before publication and is not legal advice.";

export const legalPages: Record<string, PublicPageContent> = {
  privacy: {
    eyebrow: "Trust centre · Last updated 24 July 2026",
    title: "Privacy policy",
    intro: "This policy explains what Achievers Hub knows about you, why we use it, who can see it and the choices you have. It applies to our website, learning platform, memberships, support and shop.",
    description: "How Achievers Hub collects, uses, shares and protects personal data, including information about child users.",
    primaryCta: { label: "Ask a privacy question", href: "/contact" },
    sections: [
      {
        title: "A short version for students",
        body: "We use the information you give us and your learning activity to run your account, show your progress and suggest useful next steps. We do not sell your personal information or use it for targeted advertising. A linked parent or tutor can see the learning information described below, but cannot change your answers. Your Think, Speak, Grow reflections are private unless you deliberately choose to share one. You can ask us what we hold, correct it or request deletion.",
      },
      {
        title: "Who is responsible",
        body: "Achievers Hub is the controller of the personal data covered by this policy, which means we decide why and how it is used. This service is intended for users in the United Kingdom. For a privacy question or rights request, use the contact page and choose the privacy category. A parent or guardian may contact us for a child, although a child’s own data rights still belong to the child.",
      },
      {
        title: "Information we collect",
        body: "Depending on how you use Achievers Hub, we collect account and contact details; account role; age-related information such as school year or exam year; subjects, exam board, current and target grades; answers, marks, confidence ratings, hints, activity, progress and recommendations; past-paper results; reflections and sharing choices; linked parent or tutor details; support or safeguarding messages; subscription and transaction references; and technical information such as device, browser, IP address, security logs and cookie choices.",
        bullets: [
          "We do not receive or store your full payment-card number; Stripe handles card details.",
          "Please do not include health or other sensitive personal information in ordinary learning answers or support messages unless it is necessary.",
          "If a safeguarding report contains sensitive information, access is restricted and we use it only as needed to respond and protect people.",
        ],
      },
      {
        title: "Where information comes from",
        body: "Most information comes directly from the student, parent, tutor or account holder. We also create information from use of the service, such as progress records and recommendations. A linked adult may provide linking or account information, a payment provider supplies payment status, and an identity provider such as Google may supply basic sign-in details when that option is used. If a school or tutor supplies information in future, we will explain their role and the source at the point of collection.",
      },
      {
        title: "Why we use it and our lawful bases",
        body: "We use data to create and secure accounts; deliver learning, progress, linking, support, purchases and memberships; personalise questions and recommendations; process payments; prevent misuse; meet accounting, safeguarding and legal duties; improve reliability and content; and send requested service messages. We rely on contract where processing is needed to provide the service, legal obligation where the law requires it, and legitimate interests for security, service improvement, support and safeguarding after considering users’ rights—especially children’s rights. We use consent where the law requires it, including for non-essential cookies or optional marketing, and consent can be withdrawn at any time.",
      },
      {
        title: "Learning profiles and recommendations",
        body: "We use subjects, exam board, school year, current and target grades, answers, marks, confidence, hints and recent activity to choose practice and explain recommended next steps. This is profiling, but it does not make decisions with legal or similarly significant effects. Grades and recommendations are learning estimates, not official exam results. You can ignore a recommendation, ask for an explanation or contact us if it appears wrong.",
      },
      {
        title: "AI-supported features",
        body: "When you choose an AI-supported feature, we may send the relevant question, answer, topic context and instructions to an AI service provider so it can return a hint, explanation or feedback. AI can make mistakes, and it does not determine account access, payment, discipline or an official grade. Do not enter unnecessary personal or sensitive information into AI prompts. We limit the context shared to what is reasonably needed and require providers to handle it under our instructions and safeguards.",
      },
      {
        title: "Parents, guardians and tutors",
        body: "A student can have one active linked parent or guardian and one active linked tutor. Once the link is approved, that adult may see relevant activity, results, progress, topic patterns, past-paper summaries and recommended next steps. They cannot edit completed answers or the student’s learning history. For an under-18 student, parent or guardian approval is required for tutor access. Students aged 18 or over approve and revoke their own links. Private reflections remain hidden unless the student makes a clear sharing choice.",
      },
      {
        title: "Who we share information with",
        body: "We share only what is needed with suppliers that help us operate the service, including Supabase for authentication and database services, Stripe for payments, hosting and security providers, email or support providers, and an AI provider when an AI feature is used. We may also share information with an approved linked adult, professional advisers, a buyer if the service changes ownership, or police, courts, regulators and safeguarding bodies where the law permits or requires it. Suppliers must protect the information and may use it only for the agreed service. We do not sell personal data.",
      },
      {
        title: "International transfers",
        body: "Some suppliers may process information outside the United Kingdom. Where the destination is not covered by UK adequacy regulations, we use an appropriate safeguard such as the UK International Data Transfer Agreement, the UK Addendum to approved standard contractual clauses, or another lawful transfer mechanism, together with risk and security checks where required. Contact us if you would like information about the safeguard used for a particular supplier.",
      },
      {
        title: "How long we keep information",
        body: "We keep account and learning records while the account is active because they provide the service and progress history. After an account-deletion request, we aim to delete or anonymise ordinary account and learning data within 30 days, allowing extra time for protected backups to cycle out. We normally keep support records for up to two years, security and access logs for up to twelve months, and transaction and accounting records for up to six years after the relevant financial year. We may keep safeguarding, dispute or legal records longer where necessary to protect a person, establish a legal claim or comply with law. We regularly review whether information is still needed.",
      },
      {
        title: "How we protect information",
        body: "We use proportionate technical and organisational safeguards, including access controls, role-based permissions, restricted linked-adult views, protected connections, supplier checks, logging and backups. Only people who need information for their work should be able to access it. No online service can promise absolute security, so please use a strong unique password, keep sign-in details private and tell us promptly if you think an account has been compromised.",
      },
      {
        title: "Your data rights",
        body: "Children have the same data-protection rights as adults. Depending on the circumstances, you can ask for a copy of your data; correct inaccurate data; request deletion; restrict how it is used; receive data in a portable format; withdraw consent; and complain about how it is handled. We may need to verify identity and may ask for enough detail to find the information. Some rights have legal exceptions, which we will explain if they apply.",
        bullets: [
          "Right to object: you may object at any time to processing based on legitimate interests, including profiling based on that ground.",
          "You may also object at any time to direct marketing; we will stop using your data for that purpose.",
          "We normally respond to a valid rights request within one month.",
        ],
      },
      {
        title: "Cookies and communications",
        body: "Strictly necessary cookies and similar storage help keep the site secure, remember a session and provide features you request. We ask for a clear choice before using non-essential analytics, personalisation or marketing technologies where consent is required. You can change those choices through the cookie controls when available or through your browser. Service messages about an account, security or purchase are not marketing. Optional marketing can be refused or unsubscribed from at any time.",
      },
      {
        title: "Contact, complaints and changes",
        body: "Use the contact page and choose the privacy category to exercise a right or ask a question. If you are unhappy with our response, you may complain to the UK Information Commissioner’s Office at ico.org.uk/make-a-complaint or by calling 0303 123 1113. We may update this policy as the service or law changes. We will post the new date here and give a more prominent notice where a change materially affects how we use personal data.",
      },
    ],
  },
  terms: {
    eyebrow: "Trust centre · Last updated 25 July 2026",
    title: "Terms and conditions",
    intro: "These terms explain the rules for using the Achievers Hub website, learning platform, accounts, content and related services. Please read them with our Privacy Policy and, if you buy a membership, our Subscription Terms.",
    description: "Terms for using Achievers Hub accounts, GCSE learning content, AI-supported features and linked-adult access.",
    notice: "If you are under 18, you may use a student learning account, but a parent or guardian must authorise any paid membership and should help you understand these terms.",
    primaryCta: { label: "Contact Achievers Hub", href: "/contact" },
    sections: [
      {
        title: "1. About these terms",
        body: "These terms form an agreement between you and the operator of Achievers Hub (“Achievers Hub”, “we”, “us” or “our”). They apply when you browse the site, create an account or use a learning feature. By creating an account or continuing to use the service, you agree to them. If you do not agree, do not use the service. Paid memberships are also governed by the Subscription Terms; where those terms deal specifically with payment, renewal or cancellation, they take priority on that subject.",
      },
      {
        title: "2. Who may use Achievers Hub",
        body: "The service is designed mainly for UK GCSE students, parents, guardians and independent tutors. You must provide accurate account information and choose the correct role. A parent or guardian creating or paying for a child’s account confirms that they have authority to do so. Tutors may use the platform only with students they already support; Achievers Hub is not a tutor marketplace and does not verify, employ, endorse or supervise tutors.",
      },
      {
        title: "3. Accounts and security",
        body: "Keep your password and sign-in details confidential, use a strong unique password and tell us promptly if you believe an account has been accessed without permission. You are responsible for activity carried out through your account unless it results from our failure to use reasonable security. Do not share accounts, impersonate another person, create misleading roles or try to bypass account permissions. We may require email verification or reasonable identity checks before restoring access or acting on a sensitive request.",
      },
      {
        title: "4. Student, parent and tutor access",
        body: "A student can have no more than one active linked parent or guardian and one active linked tutor. Linked adults may see the activity, results, topic patterns, past-paper summaries and recommendations made available in their view, but cannot alter completed student answers or learning history. For an under-18 student, parent or guardian approval is required for tutor access. Students aged 18 or over approve and revoke their own links. Private Think, Speak, Grow reflections remain private unless the student makes a clear sharing choice.",
      },
      {
        title: "5. What the service provides",
        body: "Achievers Hub provides revision tools for supported GCSE subjects and specifications, including Daily 5, topic content, practice questions, past-paper analysis, progress information and AI-supported help. Features, subjects and availability may change as the service develops. Any current working grade, target grade, performance estimate, mastery state or recommendation is a learning aid—not an official exam result, teacher assessment or guarantee of a particular grade.",
      },
      {
        title: "6. Acceptable use",
        body: "Use Achievers Hub lawfully, safely and for genuine learning or support. You must not harass or exploit another person; submit illegal, abusive, discriminatory, sexual or harmful material; attempt to identify or contact a child outside approved arrangements; introduce malware; scrape or copy the service at scale; probe security; reverse-engineer restricted parts; interfere with other users; automate access without permission; resell an account; or use content to train or build a competing question bank, model or service. Do not use AI support to cheat or to breach rules set by a school, teacher or awarding body.",
      },
      {
        title: "7. Learning content and intellectual property",
        body: "The platform, software, branding, original questions, explanations, graphics, reports and learning materials are owned by or licensed to Achievers Hub and protected by intellectual-property law. We grant you a personal, limited, non-exclusive, non-transferable and revocable licence to use them for your own learning or, for an authorised parent or tutor, to support linked students. You may not publish, sell, systematically download, redistribute or remove rights notices without written permission. Exam-board names and third-party materials remain the property of their respective owners.",
      },
      {
        title: "8. Content you submit",
        body: "You keep ownership of answers, reflections, messages and files you submit. You give us a limited licence to host, copy, process and display that content only as needed to operate, secure and improve the service, provide requested AI support, comply with law and exercise our rights under these terms. Do not submit material you do not have permission to use. Avoid unnecessary personal or sensitive information, especially in AI prompts and ordinary learning answers.",
      },
      {
        title: "9. AI and educational limitations",
        body: "AI-generated hints, explanations, feedback and marking assistance may be incomplete, biased or wrong. Check important feedback against an official mark scheme, teacher or tutor. AI does not replace a teacher, tutor, counsellor, safeguarding professional or emergency service and must not be relied on for medical, legal, financial or crisis advice. More detail appears in our AI Use and Accuracy page. Achievers Hub supports revision but does not promise improved marks, admission to a course or any particular examination outcome.",
      },
      {
        title: "10. Payments and third-party services",
        body: "Paid membership is optional and is governed by the Subscription Terms and the information shown at checkout. Payments are processed by Stripe; separate services such as identity providers, hosting providers or linked retailer sites may also apply their own terms and privacy notices. We are responsible for selecting and integrating our suppliers with reasonable care, but we do not control an independent third-party site you choose to visit.",
      },
      {
        title: "11. Availability and changes",
        body: "We aim to keep the service available and accurate, but internet services sometimes require maintenance or experience faults. We may add, remove or change features for security, legal, technical, educational or product reasons. We will give reasonable notice where a change materially reduces a paid service, unless urgent action is needed. We do not promise uninterrupted access or that every feature will work on every device, but this does not affect rights the law gives consumers.",
      },
      {
        title: "12. Suspension and ending access",
        body: "You may stop using the service and request account deletion. We may restrict or suspend access where reasonably necessary to investigate security, non-payment, misuse, safeguarding risk or a serious breach of these terms. We will normally explain the reason and give a chance to respond or correct the issue, unless doing so would create risk, prejudice an investigation or be unlawful. We may close an account for a serious or repeated breach. Ending an account does not remove payment obligations already due or terms intended to continue, such as intellectual-property and liability provisions.",
      },
      {
        title: "13. Our responsibility to you",
        body: "Nothing in these terms excludes or limits liability where the law does not allow it, including liability for death or personal injury caused by negligence, fraud, or breach of your statutory consumer rights. If we fail to use reasonable care and skill, we are responsible for loss or damage that was a foreseeable result. We are not responsible for loss that was not foreseeable, for business loss arising from consumer use, or for problems caused by your device, connection, misuse or an independent third party outside our reasonable control. We will take reasonable steps to minimise the effect of events outside our control.",
      },
      {
        title: "14. Privacy, complaints and law",
        body: "Our Privacy Policy explains how we use personal data, including children’s information. Use the contact page for a complaint or support request. These terms are governed by the law of England and Wales, but if you live elsewhere in the UK you keep the benefit of any mandatory protections of your home jurisdiction and may bring a claim in the courts available to you under consumer law. We prefer to resolve concerns directly and nothing here removes your right to use another remedy available by law.",
      },
      {
        title: "15. Changes to these terms",
        body: "We may update these terms to reflect changes to the service, law, security or our business. We will publish the revised date and give reasonable advance notice of a material change affecting an existing paid service. A change will not retrospectively remove rights already earned. If you do not accept a material change, you may stop using the service and cancel a paid membership before it takes effect.",
      },
    ],
  },
  "subscription-terms": {
    eyebrow: "Trust centre · Last updated 25 July 2026",
    title: "Subscription terms",
    intro: "These terms explain the no-card free trial and optional monthly Student and Tutor Memberships, including prices, renewal, cancellation, refunds and what happens when access ends.",
    description: "Achievers Hub free-trial, membership, billing, renewal and cancellation terms.",
    notice: "The seven-day free trial does not require payment details, ends automatically and never becomes a paid membership unless you actively choose to subscribe.",
    primaryCta: { label: "View current pricing", href: "/pricing" },
    sections: [
      {
        title: "1. When these terms apply",
        body: "These Subscription Terms apply when a consumer buys or manages an Achievers Hub membership. They supplement the main Terms and Conditions. The person completing checkout is the subscriber and is responsible for payment. A subscriber must be at least 18, or otherwise legally able to enter the contract. If the learning account belongs to someone under 18, a parent or guardian must purchase or authorise the paid membership.",
      },
      {
        title: "2. Seven-day free trial",
        body: "A student or parent may start one seven-day trial for an eligible student. The trial begins only when the student actively starts it, not when an account is merely created. No card or other payment details are required. At the end of day seven, trial access pauses automatically. There is no automatic conversion, charge or obligation to buy. We may prevent repeated trials that are created to avoid payment or misuse the offer.",
      },
      {
        title: "3. Student and family pricing",
        body: "Student Membership currently costs £17.99 per month for the first student and includes supported GCSE Maths and Economics features shown on the pricing page. Each additional student in the same family account currently costs £9.99 per month. Each student keeps a separate learning history. Checkout will show the exact monthly total, included features, tax treatment if relevant and first payment date before the subscriber confirms payment.",
      },
      {
        title: "4. Tutor pricing",
        body: "A Linked Tutor View for one invited student is free. Tutor Membership currently costs £39.99 per month and supports up to 25 active students with the features shown on the pricing page. It is for independent tutors supporting their own students; it does not buy leads, employment, endorsement, background checks or access to an Achievers Hub tutor marketplace.",
      },
      {
        title: "5. Starting paid membership",
        body: "A paid membership starts only when the subscriber chooses a plan, reviews the checkout information and successfully authorises payment through Stripe. We will provide confirmation in a durable form, such as email or an account record. The membership gives access for the billing period shown at checkout. If payment is rejected, the contract may not start and access may remain paused.",
      },
      {
        title: "6. Monthly renewal and payment",
        body: "Paid memberships renew automatically each month on or around the billing date shown in the account until cancelled. Stripe charges the selected payment method for the displayed total. The subscriber must keep payment details current. If a payment fails, we may retry it, notify the subscriber and pause paid access after a reasonable opportunity to correct the problem. We do not charge late-payment penalties unless clearly disclosed and permitted by law.",
      },
      {
        title: "7. Adding or removing students",
        body: "If a family subscriber adds or removes a paid student, the account and checkout flow will show when the change takes effect and any immediate, prorated or next-bill adjustment before confirmation. Removing a student from billing may pause that student’s paid access but does not automatically delete their learning history. A separate deletion request can be made under the Privacy Policy.",
      },
      {
        title: "8. Cancelling paid membership",
        body: "The subscriber may cancel at any time through the account cancellation control or the billing contact route. Routine cancellation stops the next renewal. Access continues until the end of the current paid billing period, after which paid features pause and no further subscription payment is taken. Cancelling a membership does not itself delete the account or learning data. We will confirm cancellation and the access end date.",
      },
      {
        title: "9. Cooling-off and statutory rights",
        body: "Nothing in these terms limits a statutory cancellation, cooling-off, refund or quality right. Where UK law gives a 14-day right to cancel an online service contract, the period normally begins when the paid contract is entered. If the subscriber expressly asks us to begin the paid service during that period and then cancels, we may deduct a proportionate amount for service already supplied where the law permits. Any additional renewal cooling-off right that applies by law will also be honoured. The checkout and confirmation will explain the right that applies and how to exercise it.",
      },
      {
        title: "10. Refunds",
        body: "Outside a statutory right, monthly fees are normally non-refundable once the relevant billing period has started because access remains available until its end. We will consider a refund or credit where we charged after a valid cancellation, charged the wrong amount, duplicated a payment, or failed to provide a material part of the paid service for a significant period. Requesting a refund from a card provider does not replace contacting us and may lead to temporary access restriction while the payment is investigated.",
      },
      {
        title: "11. Price or plan changes",
        body: "We may change a price or the material features of a plan. We will give reasonable advance notice before the change affects an existing subscriber and state the new price, effective date and how to cancel. The subscriber can cancel before the change takes effect. We will not apply a higher recurring price without the notice or consent required by law. Temporary offers apply only for the period and eligibility conditions stated.",
      },
      {
        title: "12. Ending a plan or the service",
        body: "We may withdraw a membership plan or end the paid service for legal, security, technical or business reasons. Where reasonably possible, we will give advance notice. If we end paid access before the end of a period already paid for and the subscriber is not in serious breach, we will provide an appropriate refund for the unused part. We may suspend access for fraud, misuse, safeguarding risk or non-payment in line with the main Terms and Conditions.",
      },
      {
        title: "13. Billing questions and complaints",
        body: "Use the contact page and choose billing or subscriptions for a cancellation problem, unexpected charge or refund request. Include the account email and enough transaction detail to identify the payment, but never send a full card number or security code. We aim to resolve billing complaints fairly and promptly. These terms do not affect any right to seek help from a card provider, consumer adviser, approved dispute-resolution body or court.",
      },
    ],
  },
  cookies: { eyebrow: "Trust centre", title: "Cookie policy", intro: "A factual record of essential, analytics, personalisation and marketing cookies actually used.", description: "Achievers Hub cookie policy review page.", notice: legalReviewNotice, sections: [{ title: "Current requirement", body: "The production policy and consent controls must be generated from a verified inventory rather than a generic template." }] },
  safeguarding: {
    eyebrow: "Trust centre · Last updated 25 July 2026",
    title: "Safeguarding and online safety",
    intro: "Achievers Hub is designed as a focused learning service for GCSE students. This page explains our safety boundaries, linked-adult controls, reporting approach and what to do if someone may be at risk.",
    description: "Safeguarding and online-safety arrangements for child users of Achievers Hub.",
    notice: "The dedicated safeguarding reporting form is not yet live. If someone is in immediate danger, contact emergency services now. Otherwise tell a trusted adult, school safeguarding lead, police or local authority children’s services directly.",
    primaryCta: { label: "View contact routes", href: "/contact" },
    sections: [
      {
        title: "1. Our safeguarding commitment",
        body: "The welfare and best interests of child users come first when we design and operate Achievers Hub. We aim to minimise foreseeable risks, use age-appropriate language, restrict adult access, collect only information needed for learning and respond proportionately to concerns. Safeguarding is everyone’s responsibility, but Achievers Hub is not a school, social-care service, counselling service or emergency responder.",
      },
      {
        title: "2. Who this policy protects",
        body: "This policy applies to every user under 18 and to adults who interact with a child’s account or information. It also guides how we respond when an adult user appears vulnerable or when a report concerns a child who does not have an Achievers Hub account. A child should never be blamed for raising a concern or for something another person has done.",
      },
      {
        title: "3. Safer account design",
        body: "Public sign-up is limited to student, parent and tutor roles. Privileged staff roles cannot be selected through the browser. Accounts use access controls and activity records, and linked adults receive a restricted view rather than control of a student’s work. Users should keep passwords private, avoid sharing identifying information and report unexpected account access.",
      },
      {
        title: "4. Parent and tutor links",
        body: "A student may have one active linked parent or guardian and one active linked tutor. For an under-18 student, a parent or guardian must approve tutor access. Students aged 18 or over manage their own links. Linked adults can view specified learning information but cannot edit completed answers. A link may be paused or revoked if access is no longer appropriate or a safety concern is raised.",
      },
      {
        title: "5. Private reflections",
        body: "Think, Speak, Grow reflections are private by default. A parent or tutor sees a reflection only when the student makes a deliberate and understandable sharing choice. We do not treat a reflection tool as a wellbeing diagnosis, therapy or a reliable way to detect risk. Students should avoid including unnecessary identifying or sensitive information.",
      },
      {
        title: "6. AI safety boundary",
        body: "Archi and other AI-supported features are learning tools, not friends, counsellors, therapists or crisis services. AI may misunderstand a message, miss signs of harm or generate unsuitable or incorrect content. A student should not rely on AI to keep them safe or to contact help. We design prompts and controls to keep support educational, but no automated safeguard is perfect.",
      },
      {
        title: "7. Behaviour we do not allow",
        body: "Users must not use Achievers Hub to groom, exploit, sexualise, threaten, bully, discriminate against or harass another person; encourage self-harm or dangerous behaviour; share sexual or violent material; seek a child’s private contact details; move a child into secret communication; impersonate a trusted adult; evade safety controls; or retaliate against someone who reports a concern. Suspected illegal activity may be preserved and shared with the appropriate authorities.",
      },
      {
        title: "8. Raising a concern",
        body: "When the dedicated route is live, choose safeguarding on the contact page and provide only what is needed: what happened, who may be at risk, when it happened and any immediate safety issue. Do not investigate the matter yourself, confront a suspected person, promise secrecy or upload illegal imagery. If the concern involves a tutor, also use any relevant professional, agency or local reporting route.",
      },
      {
        title: "9. How we respond",
        body: "A safeguarding report will be restricted to people authorised to handle it. We will record the concern, assess urgency, preserve relevant information and decide what proportionate action is needed. This may include restricting an account or link, asking a limited clarifying question, contacting a parent or guardian where safe, or referring information to police, a local authority, emergency services or another safeguarding body. We will not contact a parent if doing so appears likely to increase risk without first considering an appropriate alternative.",
      },
      {
        title: "10. Confidentiality and information sharing",
        body: "We cannot promise absolute confidentiality. Information is shared on a need-to-know basis and may be disclosed without consent where reasonably necessary and lawful to protect a child or another person. We aim to tell the person raising the concern what will happen, unless that would create risk or prejudice an investigation. Safeguarding records are kept separately or access-restricted and retained only as long as justified.",
      },
      {
        title: "11. Schools, parents and tutors",
        body: "Achievers Hub supports but does not replace the safeguarding duties, policies or professional judgement of a school, parent, guardian or tutor. Adults should maintain professional boundaries, use approved communication routes, keep account access separate and respond to disclosures by listening, taking the child seriously, avoiding leading questions and reporting through the correct safeguarding process.",
      },
      {
        title: "12. If you are worried now",
        body: "Move to a safer place if you can and tell a trusted adult. If someone is in immediate danger or a serious offence may be happening, contact emergency services or police rather than waiting for Achievers Hub. For a non-emergency concern about a child, contact the child’s school safeguarding lead or the relevant local authority children’s services. Do not use an AI tutor or ordinary support message as an emergency reporting channel.",
      },
      {
        title: "13. Review and accountability",
        body: "We review safety arrangements when the service, age range, communication features, AI system or law changes, and after a serious incident or significant concern. Before wider public launch, Achievers Hub must publish its named safeguarding lead or approved restricted reporting route, response process and relevant staff-training arrangements. Material changes will be reflected on this page.",
      },
    ],
  },
  "ai-use-and-accuracy": {
    eyebrow: "Trust centre · Last updated 25 July 2026",
    title: "AI use and accuracy",
    intro: "Achievers Hub uses bounded AI support to help students understand GCSE Maths and Economics. This page explains where AI may be used, what information it receives, how to check it and where it must not be relied upon.",
    description: "How Achievers Hub uses AI for tutoring, feedback and recommendations, including accuracy and safety limits.",
    notice: "AI can make mistakes. Check important feedback against an official mark scheme, teacher or tutor, and never rely on an AI response in an emergency.",
    primaryCta: { label: "Read academic integrity guidance", href: "/academic-integrity" },
    sections: [
      {
        title: "1. Where AI may be used",
        body: "AI may help generate a hint, simplify an explanation, unpack a step, suggest a similar practice question, classify a typed response, provide draft marking feedback or explain a recommendation. Rules and curriculum mappings may also select activities without generative AI. We aim to label AI-supported output so users understand its source.",
      },
      {
        title: "2. Hint-first learning",
        body: "Archi is designed to support thinking rather than immediately replace it. A response may begin with a prompt, hint or smaller step before showing a fuller method. Students remain responsible for attempting the work and deciding whether an explanation makes sense. Parents and tutors should treat AI activity as one source of learning evidence, not proof of independent mastery.",
      },
      {
        title: "3. Information sent to an AI service",
        body: "When a user actively uses an AI-supported feature, Achievers Hub may send the relevant question, typed answer, topic, specification context, prior hint state and instructions needed to generate a response. We aim to minimise personal data and do not need a student’s full profile for an ordinary explanation. Users should not enter names, contact details, health information, passwords, private school information or other unnecessary personal data in prompts.",
      },
      {
        title: "4. Accuracy limits",
        body: "AI predicts a useful response from patterns in data; it does not know or verify truth in the way a qualified human does. It may misread a question, use the wrong method, invent a fact or source, mishandle notation, miss context, apply a mark scheme incorrectly or sound confident when wrong. Accuracy can vary by subject, question type and wording. A polished answer is not evidence that it is correct.",
      },
      {
        title: "5. Marking and grade estimates",
        body: "Supported typed answers may receive AI-assisted feedback or provisional marks. The source of a mark should remain visible—for example, student-entered, AI-assisted, tutor-confirmed or teacher-confirmed. Handwritten-answer upload and marking are not available at launch. Any grade or performance estimate depends on the evidence and boundary source available and is never an official examination result.",
      },
      {
        title: "6. Recommendations and profiling",
        body: "The platform may use subjects, exam board, school year, current and target grades, answers, marks, confidence, hints and recent activity to recommend a next step. Recommendations are learning aids and can be ignored or challenged. They do not make decisions with legal or similarly significant effects and do not determine payment, account discipline, school placement or an official grade.",
      },
      {
        title: "7. Human checking",
        body: "Check calculations, definitions, quotations, sources, diagram labels, exam-board requirements and extended-answer feedback. For assessed work or a disputed mark, use the official question paper and mark scheme and ask a teacher or tutor. Achievers Hub may review samples, reported outputs and quality measures, but this does not mean a person reviews every conversation or answer.",
      },
      {
        title: "8. Safety limits",
        body: "AI support is not a teacher, tutor, doctor, therapist, counsellor, lawyer, financial adviser or emergency service. It may fail to recognise risk or respond safely to a sensitive disclosure. Users must not seek instructions for harm, exploitation, illegal activity, cheating or bypassing safety controls. If someone may be at risk, stop using the AI feature and follow the Safeguarding page.",
      },
      {
        title: "9. Fairness and accessibility",
        body: "AI systems can reflect bias or work less well for some language styles, disabilities, cultural contexts or ways of expressing knowledge. Students should not be penalised solely because an AI classifier misunderstands their wording. We aim to provide clear routes to retry, report a problem or seek human review where AI feedback materially affects the learning record.",
      },
      {
        title: "10. Academic integrity",
        body: "Use AI to understand, practise and improve—not to misrepresent generated work as your own. Follow the rules set by your school, teacher, tutor and awarding body. Do not use Achievers Hub during a live or controlled assessment unless expressly permitted. Where required, acknowledge AI assistance and keep enough of your own working to show how you reached an answer.",
      },
      {
        title: "11. Privacy and providers",
        body: "An approved AI supplier may process the limited context needed to return an answer under our instructions and contractual safeguards. Our Privacy Policy explains the lawful basis, providers, transfers, retention and rights that apply. We do not sell AI prompt data or use it for targeted advertising. Provider choice and data handling must be reviewed before an AI feature is enabled in production.",
      },
      {
        title: "12. Reporting a problem",
        body: "Report output that is factually wrong, unsafe, discriminatory, unsuitable for a child, inconsistent with a mark scheme or unexpectedly reveals personal information. Include the question or feature, what the AI said and why it appears problematic, but do not send unnecessary personal data. We may correct content, adjust safeguards, restrict a feature or raise the issue with a supplier.",
      },
      {
        title: "13. Changes to AI features",
        body: "Models, suppliers and safeguards may change as technology and guidance develop. We will assess material changes for educational value, privacy, security, accessibility and child safety before production use. If a change significantly affects how personal data is used or how an important feature works, we will update the relevant notice and provide additional information where required.",
      },
    ],
  },
  "academic-integrity": { eyebrow: "Trust centre", title: "Academic integrity", intro: "Using AI and learning support to develop understanding rather than misrepresent work.", description: "Achievers Hub academic integrity guidance review page.", notice: legalReviewNotice, sections: [{ title: "Learning-first use", body: "Hints, explanations and similar practice should help a student think. Live-assessment and homework rules set by a school, teacher or awarding body still apply." }] },
  accessibility: {
    eyebrow: "Trust centre · Prepared 25 July 2026",
    title: "Accessibility statement",
    intro: "Achievers Hub wants students, parents and tutors to be able to use the website and learning platform regardless of disability, access need, device or input method.",
    description: "Achievers Hub accessibility commitment, target standard, known limitations and support route.",
    notice: "We target WCAG 2.2 Level AA, but a complete independent accessibility audit has not yet been carried out, so we do not currently claim full conformance.",
    primaryCta: { label: "Request accessibility support", href: "/contact" },
    sections: [
      {
        title: "Our commitment",
        body: "We aim to make Achievers Hub perceivable, operable, understandable and robust. Accessibility is considered in design, content, development and review rather than treated as a final add-on. We welcome feedback from disabled students, parents, tutors and assistive-technology users, and we will prioritise barriers that prevent someone from learning, paying, managing an account or getting support.",
      },
      {
        title: "Target standard",
        body: "Our target is the Web Content Accessibility Guidelines (WCAG) 2.2 at Level AA across the public website and core signed-in learning journeys. This is a target, not a present claim of conformance. A valid conformance claim requires complete testing of full pages and their responsive variations, including third-party content that forms part of the journey.",
      },
      {
        title: "What we design for",
        body: "The interface is designed to support keyboard and touch use, visible focus, logical headings, labelled form controls, meaningful link text, sufficient colour contrast, text resizing, responsive layouts, clear errors and status messages, alternatives for meaningful images, and reduced reliance on colour alone. Controls are intended to have usable target sizes and learning instructions should use plain, direct language.",
      },
      {
        title: "Assistive technology",
        body: "We aim to support current versions of major browsers with common screen readers, browser zoom, keyboard-only navigation, speech input and operating-system display settings. Very old browsers or unsupported assistive-technology combinations may not provide the intended experience. We will publish specific tested combinations after formal manual testing has been completed.",
      },
      {
        title: "Known limitation: maths content",
        body: "Complex equations, diagrams, graphs and worked methods may not always have an equally useful spoken or text alternative. Reading order and pronunciation can vary between browsers and screen readers. Where a format is difficult to access, request the same learning content in a clearer text, large-print or structured alternative and tell us the question or page affected.",
      },
      {
        title: "Known limitation: interactive learning",
        body: "Some practice, progress visualisations, timers, drag-style interactions or dynamically updated feedback may need further keyboard, focus-order, status-announcement or screen-reader testing. We aim to provide a non-drag alternative and textual result wherever an interaction is essential. Please report any control that cannot be reached, understood or operated.",
      },
      {
        title: "Known limitation: AI output",
        body: "AI-generated explanations can be inconsistent in structure and may produce inaccessible notation, overly complex language or descriptions that omit visual context. AI output is not relied on as the only route to essential account or billing information. Report an inaccessible response so we can provide an alternative and improve the relevant safeguard.",
      },
      {
        title: "Known limitation: third parties and files",
        body: "Authentication, Stripe checkout, linked retailer pages, embedded services and downloadable documents may be operated or authored by third parties and can have different accessibility support. We will choose suppliers with reasonable care and provide an alternative route where reasonably possible, but we cannot claim WCAG conformance for an independent site we do not control.",
      },
      {
        title: "Alternative formats and adjustments",
        body: "You can ask for reasonable support or information in an alternative format, such as structured text, large print, a simplified explanation or an accessible version of a learning resource. Tell us what content you need and the format or adjustment that would help. We will not charge for a reasonable accessibility adjustment and will explain if a particular request requires a different practical solution.",
      },
      {
        title: "Reporting an accessibility problem",
        body: "Use the contact page and choose account or technical support. Include the page address, the task you were trying to complete, what happened, your browser or device if known, and any assistive technology used. Do not include sensitive information unless necessary. The public contact form and response time are still being finalised; before launch we will publish an enabled feedback route.",
      },
      {
        title: "Testing and review",
        body: "Our next formal review should combine automated checks with manual keyboard, zoom, screen-reader, reflow, contrast, error-handling and mobile testing of representative public and signed-in journeys. Automated testing alone cannot establish WCAG conformance. We will update this statement with the audit date, scope, tested environments, confirmed conformance status and unresolved issues.",
      },
      {
        title: "Legal context",
        body: "Achievers Hub is a UK service provider and aims to make reasonable adjustments for disabled users. If the service is later provided on behalf of a public-sector body, additional public-sector accessibility duties and statement requirements may apply. Nothing in this statement limits a right or remedy available under applicable equality or consumer law.",
      },
    ],
  },
  "delivery-and-returns": { eyebrow: "Trust centre", title: "Delivery, returns and digital downloads", intro: "How fulfilment and returns differ across Shopify, Amazon, physical products and digital resources.", description: "Achievers Hub delivery, returns and digital download terms review page.", notice: legalReviewNotice, sections: [{ title: "Product-specific terms", body: "Each product must identify its seller, fulfilment route, delivery or download method, returns position and usage terms before purchase." }] },
};

// Dedicated pages from the redesign that used inline PublicContentPage content
// (app/how-it-works, app/about, app/contact) — folded into the content map so a
// single catch-all route can serve them.
export const standalonePages: Record<string, PublicPageContent> = {
  "how-it-works": {
    eyebrow: "How it works",
    title: "A clearer route from where you are to where you want to be",
    intro: "Personalisation starts with information you already know and improves as you complete learning activities.",
    description: "How personalised GCSE revision works in Achievers Hub.",
    primaryCta: { label: "Start your free trial", href: "/start-free-trial" },
    sections: [
      { title: "Create your account", body: "Choose the correct student, parent or tutor account path. Roles and linked access are verified rather than trusted from the browser." },
      { title: "Set your starting point", body: "Select subjects, supported exam boards, current working grade, target grade and school year. Achievers Hub does not add a diagnostic assessment." },
      { title: "Begin ready to learn", body: "Think, Speak, Grow offers a short metacognitive reflection and one practical action for the session." },
      { title: "Complete Daily 5", body: "Answer five focused questions, use support when needed and review the result." },
      { title: "Follow the recommendation", body: "Continue with a Quick Lesson, Knowledge Card, topic practice, a past-paper action or bounded AI support." },
      { title: "Build evidence over time", body: "Recommendations become more useful as activity grows. Where evidence is insufficient, the platform says so instead of fabricating certainty." },
    ],
  },
  about: {
    eyebrow: "About Achievers Hub",
    title: "Turning learning information into action",
    intro: "Achievers Hub is being built around a simple idea: students need a clear picture of where they stand and a practical next step they can take.",
    description: "The purpose and principles behind Achievers Hub.",
    notice: "Founder name, approved biography, photograph and exact experience claims are awaiting approval and are intentionally not published here.",
    sections: [
      { title: "Why it exists", body: "Scores and activity counts are only useful when they help a student decide what to do next. The platform connects learning evidence to focused action." },
      { title: "Progress starts with thinking", body: "Think, Speak, Grow creates a brief pause to reflect, express an intention and choose one practical action." },
      { title: "Teacher-led product principles", body: "The intended experience is calm, credible, encouraging and precise, with clear boundaries around AI, estimates and linked-adult access." },
      { title: "What every user should feel", body: "Students should know their next step, parents should understand progress, and tutors should see priorities without gaining inappropriate control over student work." },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "How can we help?",
    intro: "Choose the most relevant contact route so your enquiry can reach the right team.",
    description: "Contact routes for Achievers Hub enquiries and support.",
    notice: "Public email addresses and the expected response time are still awaiting confirmation. Contact submission is therefore not enabled yet.",
    sections: [
      { title: "General enquiries", body: "Questions about Achievers Hub, subjects, features or membership." },
      { title: "Account and technical support", body: "Login problems, account linking, platform access or technical issues." },
      { title: "Billing and subscriptions", body: "Trial, payment, cancellation, membership or invoice enquiries." },
      { title: "Shop orders", body: "Shopify orders, digital downloads or product enquiries. Amazon orders should normally use the relevant Amazon order and support process." },
      { title: "Tutor enquiries", body: "Tutor Membership, student linking and tutor-management features." },
      { title: "Safeguarding and privacy", body: "Dedicated restricted routes will be published after the approved recipients and handling process are confirmed. Do not use Achievers Hub for an emergency." },
    ],
  },
};

/** Every content-driven public page, keyed by URL path (no leading slash). */
export const allPublicPages: Record<string, PublicPageContent> = {
  ...publicPages,
  ...legalPages,
  ...standalonePages,
};
