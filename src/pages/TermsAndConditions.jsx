import { useEffect } from 'react'
import { FileText, UserCheck, ShoppingCart, CreditCard, Truck, XCircle, RefreshCw, Shield, AlertTriangle, Scale, Mail, Phone, MapPin } from 'lucide-react'
import './TermsAndConditions.css'

export default function TermsAndConditions() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="terms-page">
      {/* Hero Section */}
      <div className="terms-hero">
        <div className="terms-hero-content">
          <FileText className="terms-hero-icon" size={48} />
          <h1>Terms & Conditions</h1>
          <p>Last Updated: February 23, 2026</p>
          <p className="terms-subtitle">
            Please read these terms carefully before using our platform. By accessing or using Doordripp, you agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="terms-content-wrapper">
        <div className="terms-content">
          
          {/* Section 1: About Doordripp */}
          <section className="terms-section">
            <div className="section-header">
              <Shield className="section-icon" size={24} />
              <h2>1. About Doordripp</h2>
            </div>
            <ul>
              <li>Doordripp is a Quick Commerce B2C platform that enables customers to purchase products for rapid delivery.</li>
              <li>We operate in accordance with applicable Indian laws and regulations.</li>
            </ul>
          </section>

          {/* Section 2: Eligibility */}
          <section className="terms-section">
            <div className="section-header">
              <UserCheck className="section-icon" size={24} />
              <h2>2. Eligibility</h2>
            </div>
            <p>By using our platform, you confirm that:</p>
            <ul>
              <li>You are at least 18 years of age</li>
              <li>You are legally capable of entering into binding contracts</li>
              <li>The information provided by you is accurate and complete</li>
            </ul>
          </section>

          {/* Section 3: Orders & Acceptance */}
          <section className="terms-section">
            <div className="section-header">
              <ShoppingCart className="section-icon" size={24} />
              <h2>3. Orders & Acceptance</h2>
            </div>
            <ul>
              <li>All orders placed through our platform are subject to acceptance and availability.</li>
              <li>We reserve the right to cancel or refuse any order at our sole discretion.</li>
              <li>Order confirmation does not guarantee delivery if product availability changes.</li>
            </ul>
          </section>

          {/* Section 4: Pricing & Payment */}
          <section className="terms-section">
            <div className="section-header">
              <CreditCard className="section-icon" size={24} />
              <h2>4. Pricing & Payment</h2>
            </div>
            <ul>
              <li>All prices are listed in INR and include applicable GST unless stated otherwise.</li>
              <li>Prices may change without prior notice.</li>
              <li>Payment must be completed through approved payment gateways before order processing.</li>
              <li>In case of pricing errors, we reserve the right to cancel the order and refund the amount paid.</li>
            </ul>
          </section>

          {/* Section 5: Delivery Policy */}
          <section className="terms-section">
            <div className="section-header">
              <Truck className="section-icon" size={24} />
              <h2>5. Delivery Policy</h2>
            </div>
            <ul>
              <li>Delivery timelines shown on the platform are estimates and may vary due to traffic, weather, operational issues, or unforeseen circumstances.</li>
              <li>You are responsible for providing accurate delivery details.</li>
              <li>If delivery fails due to incorrect address or unavailability, re-delivery charges may apply.</li>
              <li>Risk and ownership of products pass to you upon successful delivery.</li>
            </ul>
          </section>

          {/* Section 6: Cancellation Policy */}
          <section className="terms-section">
            <div className="section-header">
              <XCircle className="section-icon" size={24} />
              <h2>6. Cancellation Policy</h2>
            </div>
            <p>Orders may be cancelled:</p>
            <ul>
              <li>Before dispatch (if applicable)</li>
              <li>If delayed beyond reasonable delivery time</li>
              <li>If products are unavailable</li>
            </ul>
            <div className="warning-box">
              <p><strong>Important:</strong> Once an order is out for delivery, cancellation may not be possible.</p>
            </div>
            <p>We reserve the right to cancel orders in cases of suspected fraud or policy violations.</p>
          </section>

          {/* Section 7: Returns & Refunds */}
          <section className="terms-section">
            <div className="section-header">
              <RefreshCw className="section-icon" size={24} />
              <h2>7. Returns & Refunds</h2>
            </div>
            <p>Returns are only accepted in the following cases:</p>
            <ul>
              <li>Damaged product at the time of delivery</li>
              <li>Wrong product delivered</li>
              <li>Expired product (if applicable)</li>
            </ul>
            <div className="highlight-box">
              <p>Customers must raise a complaint within 24 hours of delivery with proof (images/video).</p>
            </div>
            <ul>
              <li>Refunds, if approved, will be processed to the original payment method within 5–7 business days.</li>
              <li>Perishable goods, opened items, or used products are non-returnable unless defective.</li>
            </ul>
          </section>

          {/* Section 8: User Responsibilities */}
          <section className="terms-section">
            <div className="section-header">
              <Shield className="section-icon" size={24} />
              <h2>8. User Responsibilities</h2>
            </div>
            <p>You agree not to:</p>
            <ul>
              <li>Use the platform for unlawful activities</li>
              <li>Provide false or misleading information</li>
              <li>Abuse delivery personnel or customer support</li>
              <li>Attempt to disrupt platform operations</li>
            </ul>
            <div className="warning-box">
              <p><strong>Warning:</strong> Violation may result in account suspension or permanent ban.</p>
            </div>
          </section>

          {/* Section 9: Intellectual Property */}
          <section className="terms-section">
            <div className="section-header">
              <FileText className="section-icon" size={24} />
              <h2>9. Intellectual Property</h2>
            </div>
            <ul>
              <li>All content on this platform, including but not limited to logos, branding, design elements, images, and text, are the exclusive property of Doordripp.</li>
              <li>Unauthorized reproduction or misuse is strictly prohibited.</li>
            </ul>
          </section>

          {/* Section 10: Limitation of Liability */}
          <section className="terms-section">
            <div className="section-header">
              <AlertTriangle className="section-icon" size={24} />
              <h2>10. Limitation of Liability</h2>
            </div>
            <p>To the maximum extent permitted by law:</p>
            <ul>
              <li>Doordripp shall not be liable for indirect, incidental, or consequential damages.</li>
              <li>Our total liability shall not exceed the amount paid for the specific order in dispute.</li>
              <li>We do not guarantee uninterrupted or error-free service.</li>
            </ul>
          </section>

          {/* Section 11: Force Majeure */}
          <section className="terms-section">
            <div className="section-header">
              <AlertTriangle className="section-icon" size={24} />
              <h2>11. Force Majeure</h2>
            </div>
            <p>We shall not be held liable for delays or failure in performance caused by events beyond our reasonable control, including natural disasters, strikes, government restrictions, or technical failures.</p>
          </section>

          {/* Section 12: Governing Law & Jurisdiction */}
          <section className="terms-section">
            <div className="section-header">
              <Scale className="section-icon" size={24} />
              <h2>12. Governing Law & Jurisdiction</h2>
            </div>
            <ul>
              <li>These Terms shall be governed by the laws of India.</li>
              <li>All disputes shall be subject to the exclusive jurisdiction of the courts of Meerut, Uttar Pradesh.</li>
            </ul>
          </section>

          {/* Section 13: Modifications to Terms */}
          <section className="terms-section">
            <div className="section-header">
              <FileText className="section-icon" size={24} />
              <h2>13. Modifications to Terms</h2>
            </div>
            <p>We reserve the right to modify these Terms at any time. Updated Terms will be posted on the platform. Continued use of our services constitutes acceptance of revised Terms.</p>
          </section>

          {/* Section 14: Contact Us */}
          <section className="terms-section contact-section">
            <div className="section-header">
              <Mail className="section-icon" size={24} />
              <h2>14. Contact Us</h2>
            </div>
            <p>For any queries regarding these Terms:</p>
            
            <div className="contact-card">
              <div className="contact-item">
                <Shield size={20} />
                <div>
                  <strong>Company:</strong>
                  <p>Doordripp</p>
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
                  <strong>Phone:</strong>
                  <p><a href="tel:+919286819662">+91 9286819662</a></p>
                </div>
              </div>
              
              <div className="contact-item">
                <MapPin size={20} />
                <div>
                  <strong>Registered Office:</strong>
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
