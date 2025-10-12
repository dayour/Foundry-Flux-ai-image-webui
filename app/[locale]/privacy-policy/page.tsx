import { useTranslations } from "next-intl";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Autogen Design",
  description: "Privacy Policy for Autogen Design - AI Image Generation Platform",
};

export default function PrivacyPolicyPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Privacy Policy
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>Last updated:</strong> October 7, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              When you use Autogen Design, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Account Information:</strong> Email address, username, and password when you create an account</li>
              <li><strong>Generated Content:</strong> Text prompts and generated images you create using our AI models</li>
              <li><strong>Usage Data:</strong> Information about how you use our service, including generation history and preferences</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Provide and maintain our AI image generation services</li>
              <li>Process your requests and generate images based on your prompts</li>
              <li>Improve our AI models and service quality</li>
              <li>Communicate with you about service updates and support</li>
              <li>Ensure security and prevent fraudulent activities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. AI Model Integration
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Autogen Design uses Azure FLUX models for image generation. When you submit prompts:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Your text prompts are processed by Azure AI services</li>
              <li>Generated images are stored according to your privacy preferences (public/private)</li>
              <li>We comply with Azure&apos;s data processing and privacy standards</li>
              <li>Public images may be displayed in our gallery for community inspiration</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Storage and Security
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Images are stored securely using encrypted cloud storage (Cloudflare R2) or local storage</li>
              <li>Account credentials are encrypted and stored securely</li>
              <li>We use HTTPS encryption for all data transmission</li>
              <li>Regular security audits and updates to protect against vulnerabilities</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Your Rights and Choices
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Privacy Settings:</strong> Choose between public and private image generation</li>
              <li><strong>Data Portability:</strong> Export your generated images and data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Cookies and Tracking
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Maintain your login session and preferences</li>
              <li>Remember your theme and language settings</li>
              <li>Analyze usage patterns to improve our service</li>
              <li>Provide personalized experience and recommendations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Third-Party Services
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We integrate with the following third-party services:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li><strong>Azure AI Services:</strong> For AI model processing and image generation</li>
              <li><strong>Authentication Providers:</strong> Google and GitHub for social login</li>
              <li><strong>Cloud Storage:</strong> Cloudflare R2 for secure image storage</li>
              <li><strong>Analytics:</strong> To understand usage patterns and improve our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Autogen Design is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Contact Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-300">
                <strong>Email:</strong> <a href="mailto:support@autogen.design" className="text-blue-600 dark:text-blue-400 hover:underline">support@autogen.design</a>
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                <strong>Website:</strong> <a href="https://autogen.design" className="text-blue-600 dark:text-blue-400 hover:underline">https://autogen.design</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}