export type LegalSection = {
  title: string;
  paragraphs: string[];
};

export type LegalDocument = {
  title: string;
  summary: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export const LEGAL_DOCUMENTS: Record<'privacy' | 'terms' | 'cookies', LegalDocument> = {
  privacy: {
    title: 'Privacy Policy',
    summary:
      'This Privacy Policy explains what information PathWise collects, how we use it, and the choices you have when you use our website and career-planning platform.',
    lastUpdated: 'March 26, 2026',
    sections: [
      {
        title: '1. Scope',
        paragraphs: [
          'This Privacy Policy applies to PathWise marketing pages, user accounts, onboarding flows, career assessments, roadmaps, tasks, progress tools, and related services we make available through our website and app.',
          'By using PathWise, you acknowledge that we may collect and use information as described in this policy.',
        ],
      },
      {
        title: '2. Information We Collect',
        paragraphs: [
          'Information you provide directly may include your name, email address, password, profile details such as avatar URL, target role selections, onboarding responses, career assessment submissions, roadmap preferences, tasks, and account updates you choose to save.',
          'We also process account and product usage information generated when you sign in, request your profile, update settings, view progress, or interact with roadmap and task features.',
          'PathWise currently stores a sign-in token in your browser local storage under the key `pathwise_token` so you can stay signed in between visits.',
        ],
      },
      {
        title: '3. How We Use Information',
        paragraphs: [
          'We use information to create and manage accounts, authenticate users, provide career-planning features, personalize roadmap and task experiences, maintain security, respond to support needs, improve the product, and communicate service-related updates.',
          'We may also use aggregated or de-identified information to understand product usage patterns and improve PathWise over time.',
        ],
      },
      {
        title: '4. Sharing of Information',
        paragraphs: [
          'We do not sell personal information. We may share information with service providers who help us host, secure, maintain, or support PathWise, subject to appropriate confidentiality and data protection obligations.',
          'We may also disclose information if required by law, to protect PathWise, our users, or the public, or in connection with a merger, acquisition, financing, or transfer of all or part of our business.',
        ],
      },
      {
        title: '5. Data Retention and Security',
        paragraphs: [
          'We retain information for as long as reasonably necessary to provide the service, meet legal obligations, resolve disputes, enforce agreements, and maintain business records.',
          'We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. No method of storage or transmission is completely secure, so we cannot guarantee absolute security.',
        ],
      },
      {
        title: '6. Your Choices',
        paragraphs: [
          'You may update certain profile information through your account settings. You may also sign out by clearing your session through the app, which removes the local browser token used to maintain your session on that device.',
          'If you want to request access, correction, or deletion of personal information, please contact PathWise using the contact details published with the service. We will review requests in line with applicable law and our operational obligations.',
        ],
      },
      {
        title: '7. Children and International Use',
        paragraphs: [
          'PathWise is not intended for children under 13, and we do not knowingly collect personal information from children under 13 through the service.',
          'If you access PathWise from outside the country where our systems are operated, you understand that your information may be processed in other jurisdictions.',
        ],
      },
      {
        title: '8. Changes to This Policy',
        paragraphs: [
          'We may update this Privacy Policy from time to time. If we make material changes, we may update the date above and provide additional notice where appropriate.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    summary:
      'These Terms of Service govern your access to and use of PathWise. Please read them carefully before creating an account or using the service.',
    lastUpdated: 'March 26, 2026',
    sections: [
      {
        title: '1. Acceptance of Terms',
        paragraphs: [
          'By accessing or using PathWise, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.',
          'You may use PathWise only if you can form a binding contract with us and comply with applicable law.',
        ],
      },
      {
        title: '2. PathWise Service',
        paragraphs: [
          'PathWise provides career-orientation, planning, roadmap, progress, and related digital tools. The service is intended for informational and productivity purposes and does not guarantee any employment, admission, certification, compensation, or career outcome.',
          'We may modify, suspend, or discontinue parts of the service at any time, including feature availability, pricing, or plan structures.',
        ],
      },
      {
        title: '3. Accounts and Security',
        paragraphs: [
          'You are responsible for maintaining the confidentiality of your login credentials and for activity that occurs under your account.',
          'You agree to provide accurate information, keep it reasonably current, and notify us promptly if you believe your account has been accessed without authorization.',
        ],
      },
      {
        title: '4. Acceptable Use',
        paragraphs: [
          'You may not use PathWise to violate the law, infringe intellectual property rights, interfere with service operations, attempt unauthorized access, transmit harmful code, scrape the service without permission, or use the platform in a way that harms other users or PathWise.',
          'We may suspend or terminate access if we believe your use creates legal, security, operational, or reputational risk.',
        ],
      },
      {
        title: '5. User Content',
        paragraphs: [
          'You retain ownership of information and content you submit to PathWise. You grant us a limited license to host, store, process, reproduce, and display that content solely as needed to operate, maintain, improve, and support the service.',
          'You represent that you have the rights needed to submit your content and that it does not violate the rights of others.',
        ],
      },
      {
        title: '6. Intellectual Property',
        paragraphs: [
          'PathWise, including our software, branding, designs, content, and underlying materials, is owned by us or our licensors and is protected by applicable intellectual property laws.',
          'Except as expressly allowed by these terms, you may not copy, modify, distribute, reverse engineer, or create derivative works from the service.',
        ],
      },
      {
        title: '7. Payments and Plans',
        paragraphs: [
          'If you subscribe to a paid plan, you agree to pay applicable fees, taxes, and charges associated with your selected plan. Unless otherwise stated, fees are non-refundable except where required by law.',
          'We may change pricing, plan features, or billing structures with reasonable notice before the changes take effect.',
        ],
      },
      {
        title: '8. Disclaimers and Limitation of Liability',
        paragraphs: [
          'PathWise is provided on an as-is and as-available basis to the fullest extent permitted by law. We do not warrant that the service will be uninterrupted, error-free, fully secure, or suitable for every purpose.',
          'To the fullest extent permitted by law, PathWise and its affiliates will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for loss of profits, data, goodwill, or business opportunities arising out of or related to your use of the service.',
        ],
      },
      {
        title: '9. Termination',
        paragraphs: [
          'You may stop using PathWise at any time. We may suspend or terminate your access if you violate these terms, create risk for the service, or if we discontinue the service.',
          'Sections that by their nature should survive termination, including ownership, disclaimers, limitations of liability, and dispute-related terms, will continue to apply.',
        ],
      },
      {
        title: '10. Changes to These Terms',
        paragraphs: [
          'We may update these Terms of Service from time to time. Continued use of PathWise after an updated version becomes effective constitutes acceptance of the revised terms.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    summary:
      'This Cookie Policy explains how PathWise uses cookies and similar browser technologies, including local storage, to support the website and app experience.',
    lastUpdated: 'March 26, 2026',
    sections: [
      {
        title: '1. What Cookies and Similar Technologies Are',
        paragraphs: [
          'Cookies are small text files stored in your browser by websites you visit. Similar technologies include local storage, session storage, pixels, and tags that help a site recognize a browser, remember settings, or understand how features are used.',
        ],
      },
      {
        title: '2. How PathWise Currently Uses Browser Storage',
        paragraphs: [
          'Based on the current PathWise web app implementation, PathWise uses browser local storage to keep an authentication token on your device after sign-in so you can stay signed in between visits.',
          'At this time, the current frontend does not appear to set first-party advertising or analytics cookies for PathWise product functionality. We may still rely on strictly necessary technologies from infrastructure, hosting, security, or embedded service providers where required to deliver the service.',
        ],
      },
      {
        title: '3. Categories of Technologies We May Use',
        paragraphs: [
          'Strictly necessary technologies help keep the site secure, maintain sessions, remember essential preferences, and support core functionality.',
          'Functional technologies may remember settings you choose so the site behaves more consistently for you.',
          'If PathWise later adds analytics, personalization, or marketing technologies, we will update this policy and, where required, request any needed consent.',
        ],
      },
      {
        title: '4. Your Choices',
        paragraphs: [
          'You can usually control cookies through your browser settings, including blocking or deleting stored data. You can also clear PathWise local storage data from your browser, which may sign you out and reset stored preferences on that device.',
          'Please note that disabling some browser storage technologies may affect how the PathWise service functions.',
        ],
      },
      {
        title: '5. Updates',
        paragraphs: [
          'We may revise this Cookie Policy if our use of cookies or similar technologies changes. When that happens, we will update the date above and publish the revised version here.',
        ],
      },
    ],
  },
};
