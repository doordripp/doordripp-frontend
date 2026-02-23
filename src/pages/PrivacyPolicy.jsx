import { useEffect } from 'react'
import { Shield, Lock, Eye, Users, FileText, Mail, Phone, MapPin } from 'lucide-react'
import './PrivacyPolicy.css'

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="privacy-policy-page">
      {/* Hero Section */}
      <div className="privacy-hero">
        <div className="privacy-hero-content">
          <Shield className="privacy-hero-icon" size={48} />
          <h1>Privacy Policy</h1>
          <p>Last Updated: February 20, 2026</p>
          <p className="privacy-subtitle">
            Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="privacy-content-wrapper">
        <div className="privacy-content">
          
          {/* Section 1: Information We Collect */}
          <section className="privacy-section">
            <div className="section-header">
              <Eye className="section-icon" size={24} />
              <h2>1. Information We Collect</h2>
            </div>
            <p>We may collect the following types of information:</p>
            
            <div className="subsection">
              <h3>A. Personal Information</h3>
              <ul>
                <li>Full name</li>
                <li>Mobile number</li>
                <li>Email address</li>
                <li>Delivery address</li>
                <li>Billing address</li>
                <li>Payment details (processed via secure third-party gateways)</li>
              </ul>
            </div>

            <div className="subsection">
              <h3>B. Account Information</h3>
              <ul>
                <li>Username</li>
                <li>Order history</li>
                <li>Preferences</li>
              </ul>
            </div>

            <div className="subsection">
              <h3>C. Device & Technical Information</h3>
              <ul>
                <li>IP address</li>
                <li>Device type</li>
                <li>Browser type</li>
                <li>Operating system</li>
                <li>Location data (for delivery purposes)</li>
              </ul>
            </div>

            <div className="subsection">
              <h3>D. Transaction Information</h3>
              <ul>
                <li>Products purchased</li>
                <li>Payment method</li>
                <li>Transaction amount</li>
              </ul>
            </div>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section className="privacy-section">
            <div className="section-header">
              <FileText className="section-icon" size={24} />
              <h2>2. How We Use Your Information</h2>
            </div>
            <p>We use your data to:</p>
            <ul>
              <li>Process and deliver orders</li>
              <li>Provide customer support</li>
              <li>Improve our services and user experience</li>
              <li>Send order updates and service-related notifications</li>
              <li>Prevent fraud and unauthorized transactions</li>
              <li>Comply with legal obligations</li>
            </ul>
            <div className="highlight-box">
              <p><strong>We do not sell your personal data to third parties.</strong></p>
            </div>
          </section>

          {/* Section 3: Legal Basis for Processing */}
          <section className="privacy-section">
            <div className="section-header">
              <Shield className="section-icon" size={24} />
              <h2>3. Legal Basis for Processing</h2>
            </div>
            <p>We process your personal data based on:</p>
            <ul>
              <li>Your consent</li>
              <li>Performance of a contract (order fulfillment)</li>
              <li>Compliance with legal obligations</li>
              <li>Legitimate business purposes</li>
            </ul>
            <p>You may withdraw your consent at any time by contacting us.</p>
          </section>

          {/* Section 4: Data Sharing & Disclosure */}
          <section className="privacy-section">
            <div className="section-header">
              <Users className="section-icon" size={24} />
              <h2>4. Data Sharing & Disclosure</h2>
            </div>
            <p>We may share your information with:</p>
            <ul>
              <li>Delivery partners</li>
              <li>Payment gateway providers</li>
              <li>Technology and hosting service providers</li>
              <li>Government authorities when required by law</li>
            </ul>
            <p>All third parties are required to maintain confidentiality and data protection standards.</p>
          </section>

          {/* Section 5: Data Security */}
          <section className="privacy-section">
            <div className="section-header">
              <Lock className="section-icon" size={24} />
              <h2>5. Data Security</h2>
            </div>
            <p>We implement reasonable security practices including:</p>
            <ul>
              <li>Secure servers</li>
              <li>Encryption protocols</li>
              <li>Restricted internal access</li>
              <li>Secure payment processing systems</li>
            </ul>
            <div className="note-box">
              <p>While we strive to protect your information, no system can guarantee absolute security.</p>
            </div>
          </section>

          {/* Section 6: Data Retention */}
          <section className="privacy-section">
            <div className="section-header">
              <FileText className="section-icon" size={24} />
              <h2>6. Data Retention</h2>
            </div>
            <p>We retain personal data:</p>
            <ul>
              <li>For as long as your account remains active</li>
              <li>As required under tax and regulatory laws</li>
              <li>As necessary for dispute resolution and fraud prevention</li>
            </ul>
          </section>

          {/* Section 7: Your Rights */}
          <section className="privacy-section">
            <div className="section-header">
              <Shield className="section-icon" size={24} />
              <h2>7. Your Rights</h2>
            </div>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent</li>
              <li>File a grievance</li>
            </ul>
            <p>Requests can be made by contacting us at the details below.</p>
          </section>

          {/* Section 8: Cookies Policy */}
          <section className="privacy-section">
            <div className="section-header">
              <Eye className="section-icon" size={24} />
              <h2>8. Cookies Policy</h2>
            </div>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Enhance user experience</li>
              <li>Analyze platform performance</li>
              <li>Improve our services</li>
            </ul>
            <p>You may disable cookies through your browser settings, but some features may not function properly.</p>
          </section>

          {/* Section 9: Children's Privacy */}
          <section className="privacy-section">
            <div className="section-header">
              <Shield className="section-icon" size={24} />
              <h2>9. Children's Privacy</h2>
            </div>
            <ul>
              <li>Our services are not intended for individuals under 18 years of age.</li>
              <li>We do not knowingly collect personal data from minors.</li>
            </ul>
          </section>

          {/* Section 10: Third-Party Links */}
          <section className="privacy-section">
            <div className="section-header">
              <FileText className="section-icon" size={24} />
              <h2>10. Third-Party Links</h2>
            </div>
            <ul>
              <li>Our platform may contain links to external websites.</li>
              <li>We are not responsible for their privacy practices or content.</li>
            </ul>
          </section>

          {/* Section 11: Changes to This Policy */}
          <section className="privacy-section">
            <div className="section-header">
              <FileText className="section-icon" size={24} />
              <h2>11. Changes to This Policy</h2>
            </div>
            <p>We may update this Privacy Policy from time to time. Updated versions will be posted on this page with a revised "Last Updated" date.</p>
            <p>Continued use of our services constitutes acceptance of the revised policy.</p>
          </section>

          {/* Section 12: Grievance Officer & Contact Details */}
          <section className="privacy-section contact-section">
            <div className="section-header">
              <Mail className="section-icon" size={24} />
              <h2>12. Grievance Officer & Contact Details</h2>
            </div>
            <p>In accordance with applicable Indian laws, the details of the Grievance Officer are:</p>
            
            <div className="contact-card">
              <div className="contact-item">
                <Users size={20} />
                <div>
                  <strong>Name:</strong>
                  <p>Sarvesh Kumar Tiwari</p>
                </div>
              </div>
              
              <div className="contact-item">
                <Mail size={20} />
                <div>
                  <strong>Email:</strong>
                  <p><a href="mailto:support@doordripp.com">support@doordripp.com</a></p>
                </div>
              </div>
              
              <div className="contact-item">
                <Phone size={20} />
                <div>
                  <strong>Contact Number:</strong>
                  <p><a href="tel:+919286819663">+91 9286819663</a></p>
                </div>
              </div>
              
              <div className="contact-item">
                <MapPin size={20} />
                <div>
                  <strong>Registered Address:</strong>
                  <p>
                    7/1, B-Block, Gokul Vihar,<br />
                    Rohta Road, Meerut,<br />
                    Uttar Pradesh – 250001, India
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
