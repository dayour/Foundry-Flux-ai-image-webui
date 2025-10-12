import { useTranslations } from "next-intl";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Autogen Design",
  description: "Terms of Service for Autogen Design - AI Image Generation Platform",
};

export default function TermsOfServicePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Terms of Service
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            <strong>Last updated:</strong> October 7, 2025
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              By accessing and using Autogen Design (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Autogen Design is an AI-powered image generation platform that allows users to create images from text prompts using advanced AI models including Azure FLUX models. The service includes:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Text-to-image generation using AI models</li>
              <li>Image gallery and sharing features</li>
              <li>User account management</li>
              <li>Various aspect ratios and customization options</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. User Accounts and Responsibilities
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              When creating an account, you agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your login credentials</li>
              <li>Be responsible for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
              <li>Use the service in compliance with all applicable laws</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Acceptable Use Policy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You agree not to use the service to create, upload, or share content that:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Is illegal, harmful, threatening, abusive, or discriminatory</li>
              <li>Infringes on intellectual property rights of others</li>
              <li>Contains explicit adult content or nudity</li>
              <li>Promotes violence, harassment, or hate speech</li>
              <li>Attempts to bypass content safety filters</li>
              <li>Impersonates others or spreads misinformation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Intellectual Property Rights
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Generated Images
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Images generated through Autogen Design are royalty-free and can be used for both personal and commercial purposes. However, you are responsible for ensuring that your text prompts do not infringe on existing copyrights or trademarks.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Service Content
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  The Autogen Design platform, including its design, features, and underlying technology, is owned by us and protected by intellectual property laws.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. AI Model Usage and Limitations
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Our AI models, including Azure FLUX models, have certain limitations:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Results may vary and are not guaranteed to match expectations exactly</li>
              <li>Models include built-in content safety filters</li>
              <li>Generation speed and availability may be affected by demand</li>
              <li>We reserve the right to update or change available models</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Privacy and Data Usage
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information. By using the service, you consent to our data practices as described in the Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Service Availability and Modifications
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We strive to provide reliable service, but we do not guarantee:
            </p>
            <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
              <li>Uninterrupted or error-free service operation</li>
              <li>Permanent availability of generated images</li>
              <li>Maintenance of specific features or capabilities</li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              We reserve the right to modify, suspend, or discontinue the service at any time with reasonable notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To the maximum extent permitted by law, Autogen Design shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or related to your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Termination
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these Terms of Service. Upon termination, your right to use the service will cease immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              11. Changes to Terms
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of significant changes by posting the updated terms on our website. Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              12. Governing Law
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              These Terms of Service shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              13. Contact Information
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us:
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