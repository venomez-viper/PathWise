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
      'This Privacy Policy describes how PathWise ("we," "us," or "our") collects, uses, shares, and protects personal information when you access or use our website, platform, and related services (collectively, the "Service"). We are committed to transparency and to protecting your privacy in accordance with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable data protection laws.',
    lastUpdated: 'April 7, 2026',
    sections: [
      {
        title: '1. Scope and Applicability',
        paragraphs: [
          'This Privacy Policy applies to all personal information collected through the PathWise website, web application, mobile applications, career assessments, roadmap tools, onboarding flows, user accounts, and any other services we provide. It applies to all users worldwide, regardless of location.',
          'By creating an account or using the Service, you acknowledge that you have read and understood this Privacy Policy. If you do not agree with our practices, please do not use the Service.',
        ],
      },
      {
        title: '2. Information We Collect',
        paragraphs: [
          'Account Information. When you register for PathWise, we collect your name, email address, and password. You may also provide additional profile information such as your avatar, target career role, professional background, and onboarding responses.',
          'Usage Data. We automatically collect information about how you interact with the Service, including pages visited, features used, roadmap progress, task completions, assessment submissions, session duration, click patterns, and the dates and times of your activity.',
          'Device and Technical Information. We collect your IP address, browser type and version, operating system, device type, screen resolution, referring URLs, and language preferences. This information helps us optimize the Service for your device and diagnose technical issues.',
          'Cookies and Similar Technologies. We use cookies, local storage, and similar technologies to authenticate your sessions, remember your preferences, and analyze Service usage. For detailed information, please refer to our Cookie Policy.',
        ],
      },
      {
        title: '3. How We Use Your Information',
        paragraphs: [
          'Service Delivery. We use your information to create and manage your account, authenticate your identity, provide personalized career roadmaps and assessments, track your progress, and deliver the core functionality of PathWise.',
          'Personalization. We analyze your usage patterns, assessment results, and stated preferences to tailor roadmap recommendations, suggest relevant tasks, and customize your experience within the platform.',
          'Analytics and Improvement. We use aggregated and anonymized usage data to understand how users interact with the Service, identify areas for improvement, measure feature adoption, and inform product development decisions.',
          'Communication. We may send you service-related emails, including account verification, security alerts, product updates, and responses to your support requests. We will not send marketing emails without your explicit consent, and you may opt out at any time.',
          'Security and Fraud Prevention. We use technical and usage data to detect and prevent unauthorized access, abuse, and other malicious activity directed at the Service or its users.',
        ],
      },
      {
        title: '4. Legal Basis for Processing',
        paragraphs: [
          'Under the GDPR, we process your personal data on the following legal bases:',
          'Contractual Necessity. Processing that is necessary to perform our contract with you — for example, creating your account, providing career assessments, and delivering roadmap features you have requested.',
          'Legitimate Interest. Processing that serves our legitimate business interests, such as improving the Service, ensuring security, and conducting analytics — provided these interests do not override your fundamental rights and freedoms.',
          'Consent. Where required by law, we obtain your explicit consent before processing your data — for example, before placing non-essential cookies or sending marketing communications. You may withdraw consent at any time without affecting the lawfulness of processing carried out prior to withdrawal.',
          'Legal Obligation. We may process your data where necessary to comply with applicable legal requirements, such as tax obligations, regulatory requests, or court orders.',
        ],
      },
      {
        title: '5. Data Sharing and Disclosure',
        paragraphs: [
          'Service Providers. We share personal information with trusted third-party service providers who assist us in operating the Service, including cloud hosting providers, analytics services, email delivery platforms, and customer support tools. These providers are contractually obligated to process your data only on our behalf and in accordance with this Privacy Policy.',
          'Legal Requirements. We may disclose your information if required to do so by law, or if we believe in good faith that such disclosure is necessary to comply with a legal obligation, protect our rights or safety, investigate potential violations of our Terms of Service, or respond to a government request.',
          'Business Transfers. In the event of a merger, acquisition, reorganization, bankruptcy, or sale of all or a portion of our assets, your personal information may be transferred to the acquiring entity. We will notify you of any such change in ownership or control of your personal information.',
          'We do not sell, rent, or trade your personal information to third parties for their marketing purposes.',
        ],
      },
      {
        title: '6. International Data Transfers',
        paragraphs: [
          'PathWise is operated from the European Union. If you access the Service from outside the EU, your information may be transferred to, stored, and processed in the EU or other jurisdictions where our service providers operate.',
          'Where we transfer personal data outside the European Economic Area (EEA), we ensure that appropriate safeguards are in place, such as Standard Contractual Clauses approved by the European Commission, adequacy decisions, or other legally recognized transfer mechanisms.',
        ],
      },
      {
        title: '7. Data Retention',
        paragraphs: [
          'Account Data. We retain your account information for as long as your account remains active. If you delete your account, we will permanently remove your personal data within 30 days, except where retention is required by law or necessary to resolve disputes.',
          'Usage and Analytics Data. Usage data associated with your account is deleted when your account is deleted. Aggregated and anonymized analytics data, which cannot be used to identify you, is retained for up to 12 months after collection for product improvement purposes.',
          'Legal and Compliance Records. Where we are required by law to retain certain data (e.g., billing records, tax documentation), we will do so for the period mandated by the applicable regulation, after which the data will be securely deleted.',
        ],
      },
      {
        title: '8. Your Rights',
        paragraphs: [
          'Depending on your location and applicable law, you may have the following rights regarding your personal data:',
          'Right of Access. You may request a copy of the personal data we hold about you. Right of Rectification. You may request that we correct inaccurate or incomplete personal data. Right of Erasure. You may request that we delete your personal data, subject to certain legal exceptions. Right to Data Portability. You may request a copy of your data in a structured, commonly used, machine-readable format. Right to Restriction. You may request that we restrict the processing of your personal data under certain circumstances. Right to Object. You may object to the processing of your personal data for direct marketing or where processing is based on legitimate interest.',
          'CCPA Rights. If you are a California resident, you have the right to know what personal information we collect and how it is used, to request deletion of your personal information, to opt out of the sale of personal information (we do not sell your data), and to not be discriminated against for exercising your rights.',
          'To exercise any of these rights, please contact us at support@pathwise.fit. We will respond to your request within 30 days (or as required by applicable law). We may request verification of your identity before processing your request.',
        ],
      },
      {
        title: '9. Security Measures',
        paragraphs: [
          'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption of data in transit (TLS/SSL), secure password hashing, access controls, regular security assessments, and monitoring for suspicious activity.',
          'While we strive to protect your personal information, no method of electronic transmission or storage is completely secure. We cannot guarantee absolute security, and you use the Service at your own risk.',
        ],
      },
      {
        title: '10. Children\'s Privacy',
        paragraphs: [
          'PathWise is not directed at children under the age of 16. We do not knowingly collect personal information from children under 16. If you are under 16, you may only use PathWise with the consent and supervision of a parent or legal guardian.',
          'If we become aware that we have collected personal information from a child under 16 without verifiable parental consent, we will take steps to delete that information promptly. If you believe a child under 16 has provided us with personal information, please contact us at support@pathwise.fit.',
          'These age restrictions are designed to comply with the Children\'s Online Privacy Protection Act (COPPA) and the GDPR\'s provisions regarding the processing of children\'s data.',
        ],
      },
      {
        title: '11. Cookie Policy',
        paragraphs: [
          'We use cookies and similar technologies as described in our separate Cookie Policy. That policy provides detailed information about the types of cookies we use, their purposes, durations, and how you can manage your cookie preferences.',
        ],
      },
      {
        title: '12. Changes to This Privacy Policy',
        paragraphs: [
          'We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, legal requirements, or other factors. When we make material changes, we will update the "Last Updated" date at the top of this page and, where appropriate, provide additional notice (such as an in-app notification or email).',
          'Your continued use of the Service after any changes to this Privacy Policy constitutes your acceptance of the updated terms. We encourage you to review this page periodically.',
        ],
      },
      {
        title: '13. Contact Information',
        paragraphs: [
          'If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at: support@pathwise.fit.',
          'If you are located in the European Union and believe your data protection rights have not been adequately addressed, you have the right to lodge a complaint with your local Data Protection Authority.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    summary:
      'These Terms of Service ("Terms") constitute a legally binding agreement between you and PathWise ("we," "us," or "our") governing your access to and use of the PathWise platform, website, and related services (collectively, the "Service"). Please read these Terms carefully before using the Service.',
    lastUpdated: 'April 7, 2026',
    sections: [
      {
        title: '1. Agreement and Eligibility',
        paragraphs: [
          'By accessing or using the Service, you agree to be bound by these Terms, our Privacy Policy, and our Cookie Policy. If you do not agree to any part of these Terms, you must not access or use the Service.',
          'You must be at least 18 years of age to use the Service independently. If you are between 16 and 18 years of age, you may use the Service only with the consent and supervision of a parent or legal guardian who agrees to be bound by these Terms on your behalf. The Service is not available to anyone under the age of 16.',
          'By using the Service, you represent and warrant that you have the legal capacity to enter into a binding agreement and that your use of the Service complies with all applicable laws and regulations.',
        ],
      },
      {
        title: '2. Account Registration and Security',
        paragraphs: [
          'To access certain features of the Service, you must create an account by providing accurate, current, and complete information. You agree to keep your account information up to date and to maintain the confidentiality of your login credentials.',
          'You are solely responsible for all activity that occurs under your account, whether or not authorized by you. You must notify us immediately at support@pathwise.fit if you suspect unauthorized access to or use of your account.',
          'We reserve the right to suspend or terminate accounts that contain false or misleading information, or that we reasonably believe have been compromised.',
        ],
      },
      {
        title: '3. Acceptable Use',
        paragraphs: [
          'You agree to use the Service only for lawful purposes and in accordance with these Terms. You shall not:',
          'Use the Service to violate any applicable local, national, or international law or regulation. Impersonate any person or entity, or misrepresent your affiliation with any person or entity. Interfere with, disrupt, or place an undue burden on the Service or its underlying infrastructure. Attempt to gain unauthorized access to any part of the Service, other user accounts, or any systems or networks connected to the Service. Use automated means (bots, scrapers, crawlers) to access the Service without our express written permission. Upload, transmit, or distribute any viruses, malware, or other harmful code. Use the Service to harass, abuse, threaten, or intimidate other users. Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code of the Service.',
          'We reserve the right to investigate and take appropriate action against anyone who, in our sole discretion, violates this section, including suspending or terminating access to the Service and reporting such conduct to law enforcement authorities.',
        ],
      },
      {
        title: '4. Intellectual Property',
        paragraphs: [
          'The Service, including all software, algorithms, designs, text, graphics, logos, icons, images, audio, video, data compilations, and underlying technology, is the exclusive property of PathWise or its licensors and is protected by copyright, trademark, patent, trade secret, and other intellectual property laws.',
          'We grant you a limited, non-exclusive, non-transferable, revocable license to access and use the Service for your personal, non-commercial purposes in accordance with these Terms. This license does not include the right to copy, modify, distribute, sell, lease, sublicense, or create derivative works from any part of the Service.',
          'All trademarks, service marks, and trade names displayed on the Service are the property of their respective owners. Nothing in these Terms grants you any right to use any PathWise trademarks or branding.',
        ],
      },
      {
        title: '5. User Content and Data Ownership',
        paragraphs: [
          'You retain full ownership of all content, data, and information you submit to the Service ("User Content"), including your profile information, assessment responses, career goals, and any other materials you provide.',
          'By submitting User Content, you grant PathWise a worldwide, non-exclusive, royalty-free, sublicensable license to host, store, process, reproduce, and display your User Content solely as necessary to operate, maintain, improve, and provide the Service to you. This license terminates when you delete your User Content or your account, except where retention is required by law.',
          'You represent and warrant that you own or have the necessary rights to submit your User Content, and that your User Content does not infringe upon the intellectual property rights, privacy rights, or any other rights of any third party.',
        ],
      },
      {
        title: '6. Service Availability and Modifications',
        paragraphs: [
          'We strive to maintain high availability of the Service, but we do not guarantee uninterrupted, timely, or error-free access. The Service may be temporarily unavailable due to maintenance, updates, server failures, or circumstances beyond our control.',
          'We reserve the right to modify, update, suspend, or discontinue any aspect of the Service at any time, with or without notice. We will make reasonable efforts to provide advance notice of material changes that may significantly affect your use of the Service.',
          'PathWise is a career guidance and planning tool. The Service does not guarantee any specific employment outcome, salary increase, job placement, certification, or career advancement. All recommendations and roadmaps are informational in nature.',
        ],
      },
      {
        title: '7. Subscription and Billing',
        paragraphs: [
          'PathWise offers both free and premium subscription tiers. The free tier provides access to core features as described on our pricing page. Premium features, pricing, and billing cycles are detailed at the time of purchase.',
          'If you subscribe to a paid plan, you agree to pay all applicable fees and taxes. Subscriptions automatically renew at the end of each billing cycle unless you cancel before the renewal date. You may cancel your subscription at any time through your account settings.',
          'Refund Policy. If you are dissatisfied with a paid subscription, you may request a refund within 14 days of your initial purchase or renewal. Refund requests should be sent to support@pathwise.fit. Refunds are processed at our reasonable discretion and in accordance with applicable consumer protection laws. EU consumers retain their statutory right of withdrawal.',
          'We may change our pricing or plan structures at any time. Price changes will take effect at the start of your next billing cycle following notice of the change. If you do not agree with the new pricing, you may cancel your subscription before the next billing cycle.',
        ],
      },
      {
        title: '8. Termination',
        paragraphs: [
          'Termination by You. You may stop using the Service and delete your account at any time through your account settings. Upon account deletion, your personal data will be removed in accordance with our Privacy Policy.',
          'Termination by PathWise. We may suspend or terminate your access to the Service, without prior notice or liability, if you breach these Terms, engage in conduct that we determine is harmful to other users or the Service, or if we are required to do so by law. We may also terminate accounts that remain inactive for an extended period.',
          'Effect of Termination. Upon termination, your right to use the Service ceases immediately. Sections of these Terms that by their nature should survive termination — including intellectual property, limitation of liability, disclaimer of warranties, indemnification, and governing law — shall continue in full force and effect.',
        ],
      },
      {
        title: '9. Limitation of Liability',
        paragraphs: [
          'To the maximum extent permitted by applicable law, PathWise and its officers, directors, employees, agents, affiliates, and licensors shall not be liable for any indirect, incidental, special, consequential, punitive, or exemplary damages, including but not limited to damages for loss of profits, revenue, data, goodwill, business opportunities, or other intangible losses, arising out of or in connection with your use of or inability to use the Service.',
          'In no event shall our total aggregate liability to you for all claims arising out of or relating to the Service exceed the greater of (a) the amount you paid to PathWise in the twelve (12) months preceding the event giving rise to the claim, or (b) fifty euros (EUR 50).',
          'The limitations in this section apply regardless of the theory of liability (whether in contract, tort, negligence, strict liability, or otherwise) and even if PathWise has been advised of the possibility of such damages. Some jurisdictions do not allow the exclusion or limitation of certain damages, so some of the above limitations may not apply to you.',
        ],
      },
      {
        title: '10. Disclaimer of Warranties',
        paragraphs: [
          'The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without warranties of any kind, either express or implied. To the fullest extent permitted by applicable law, PathWise disclaims all warranties, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, and any warranties arising out of course of dealing or usage of trade.',
          'We do not warrant that the Service will meet your requirements, be available on an uninterrupted or error-free basis, be free of viruses or other harmful components, or that any defects will be corrected. Any content or information obtained through the Service is accessed at your own risk.',
        ],
      },
      {
        title: '11. Indemnification',
        paragraphs: [
          'You agree to indemnify, defend, and hold harmless PathWise and its officers, directors, employees, agents, affiliates, and licensors from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys\' fees) arising out of or in any way connected with: (a) your access to or use of the Service; (b) your violation of these Terms; (c) your violation of any third-party rights, including intellectual property or privacy rights; or (d) your User Content.',
        ],
      },
      {
        title: '12. Governing Law and Jurisdiction',
        paragraphs: [
          'These Terms shall be governed by and construed in accordance with the laws of Italy and the European Union, without regard to conflict of law principles.',
          'Any disputes arising out of or in connection with these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the competent courts located in Italy, unless mandatory consumer protection laws in your jurisdiction provide otherwise.',
          'If you are a consumer in the European Union, you may also be entitled to use the European Commission\'s Online Dispute Resolution platform at https://ec.europa.eu/odr.',
        ],
      },
      {
        title: '13. Dispute Resolution',
        paragraphs: [
          'Before initiating any formal legal proceedings, you agree to first contact us at support@pathwise.fit and attempt to resolve the dispute informally for a period of at least 30 days. Most concerns can be resolved quickly and to the user\'s satisfaction through our support channels.',
          'If the dispute cannot be resolved informally, either party may pursue resolution through the courts as described in the Governing Law and Jurisdiction section above.',
        ],
      },
      {
        title: '14. Severability',
        paragraphs: [
          'If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, or if modification is not possible, shall be severed from these Terms. The invalidity or unenforceability of any provision shall not affect the validity or enforceability of the remaining provisions, which shall continue in full force and effect.',
        ],
      },
      {
        title: '15. Changes to These Terms',
        paragraphs: [
          'We reserve the right to modify these Terms at any time. When we make material changes, we will update the "Last Updated" date at the top of this page and provide reasonable notice through the Service or via email.',
          'Your continued use of the Service following the posting of revised Terms constitutes your acceptance of the changes. If you do not agree with the revised Terms, you must discontinue your use of the Service.',
        ],
      },
      {
        title: '16. Contact Information',
        paragraphs: [
          'If you have any questions or concerns about these Terms of Service, please contact us at: support@pathwise.fit.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    summary:
      'This Cookie Policy explains how PathWise ("we," "us," or "our") uses cookies and similar tracking technologies when you visit or use our website and platform (the "Service"). It describes what these technologies are, why we use them, and your rights to control their use.',
    lastUpdated: 'April 7, 2026',
    sections: [
      {
        title: '1. What Are Cookies?',
        paragraphs: [
          'Cookies are small text files that are placed on your device (computer, tablet, or mobile phone) by websites you visit. They are widely used to make websites work more efficiently, provide a better user experience, and supply information to website operators.',
          'Similar technologies include local storage, session storage, web beacons, pixels, and tags. Throughout this policy, we use the term "cookies" to refer collectively to cookies and all similar technologies.',
        ],
      },
      {
        title: '2. Types of Cookies We Use',
        paragraphs: [
          'Essential Cookies. These cookies are strictly necessary for the Service to function and cannot be disabled. They include the authentication token stored in your browser\'s local storage under the key "pathwise_token," which maintains your signed-in session between visits. Without these cookies, core features such as account access and session management would not work. Duration: these persist until you explicitly sign out or clear your browser data.',
          'Analytics Cookies. We use Google Analytics to understand how visitors interact with the Service. Google Analytics sets cookies including "_ga" (used to distinguish unique users, expires after 2 years), "_gid" (used to distinguish users, expires after 24 hours), and "_gat" (used to throttle request rates, expires after 1 minute). These cookies collect information about your use of the Service in an aggregated, anonymous form. This data helps us understand traffic patterns, popular features, and areas for improvement.',
          'Functional Cookies. These cookies enable enhanced functionality and personalization, such as remembering your preferred theme (light or dark mode), language settings, and display preferences. They may be set by us or by third-party providers whose services we have integrated into the Service. If you disable these cookies, some or all of these features may not function properly. Duration: up to 1 year.',
        ],
      },
      {
        title: '3. Third-Party Cookies',
        paragraphs: [
          'Some cookies are placed by third-party services that appear on our pages. We use Google Analytics (provided by Google LLC) to collect and analyze usage data. Google may use the data collected to contextualize and personalize ads across its own advertising network. For more information on how Google uses data from sites that use its services, visit: https://policies.google.com/technologies/partner-sites.',
          'We do not control the cookies set by third parties and recommend reviewing their respective privacy policies for more information about their data practices.',
        ],
      },
      {
        title: '4. Cookie Duration',
        paragraphs: [
          'Session Cookies. These are temporary cookies that are erased when you close your browser. They are used to maintain state during your browsing session (e.g., keeping you logged in as you navigate between pages).',
          'Persistent Cookies. These cookies remain on your device for a set period or until you manually delete them. They are used for purposes such as recognizing you on return visits and remembering your preferences. Specific durations: authentication token (persistent until sign-out), Google Analytics "_ga" (2 years), Google Analytics "_gid" (24 hours), theme preference (1 year).',
        ],
      },
      {
        title: '5. How to Manage Cookies',
        paragraphs: [
          'Browser Settings. Most web browsers allow you to control cookies through their settings. You can typically find these options in the "Preferences," "Privacy," or "Security" section of your browser. You can choose to block all cookies, accept all cookies, or be notified when a cookie is set.',
          'Google Analytics Opt-Out. You can opt out of Google Analytics tracking by installing the Google Analytics Opt-Out Browser Add-on, available at: https://tools.google.com/dlpage/gaoptout. This add-on prevents the Google Analytics JavaScript from sharing visit information with Google Analytics.',
          'Clearing Local Storage. To remove the PathWise authentication token and other locally stored data, you can clear your browser\'s local storage through your browser\'s developer tools or settings. Note that this will sign you out of PathWise.',
        ],
      },
      {
        title: '6. Impact of Disabling Cookies',
        paragraphs: [
          'If you choose to disable or block cookies, some parts of the Service may not function as intended. Specifically:',
          'Disabling essential cookies (including local storage) will prevent you from staying signed in and may make the Service unusable. Disabling analytics cookies will not affect your use of the Service but will prevent us from understanding usage patterns. Disabling functional cookies may cause the Service to forget your preferences (such as theme settings), requiring you to reconfigure them on each visit.',
        ],
      },
      {
        title: '7. Updates to This Cookie Policy',
        paragraphs: [
          'We may update this Cookie Policy from time to time to reflect changes in the cookies we use or for other operational, legal, or regulatory reasons. When we make changes, we will update the "Last Updated" date at the top of this page.',
          'We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies and related technologies.',
        ],
      },
      {
        title: '8. Contact Information',
        paragraphs: [
          'If you have any questions about our use of cookies or this Cookie Policy, please contact us at: support@pathwise.fit.',
        ],
      },
    ],
  },
};
