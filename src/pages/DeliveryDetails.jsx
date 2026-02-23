import { Truck, XCircle, RefreshCw, AlertTriangle, ShieldAlert, Mail, Phone } from 'lucide-react'
import './DeliveryDetails.css'

export default function DeliveryDetails() {
  return (
    <div className="delivery-page">
      {/* Hero Section */}
      <div className="delivery-hero">
        <div className="delivery-hero-content">
          <Truck className="delivery-hero-icon" size={48} />
          <h1>Delivery Details</h1>
          <p>Refund & Replacement Policy</p>
          <p className="delivery-subtitle">
            Please read our refund and replacement policy carefully before placing an order.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="delivery-content-wrapper">
        <div className="delivery-content">
          
          {/* Section 1: No Refund Policy */}
          <section className="delivery-section">
            <div className="section-header">
              <XCircle className="section-icon" size={24} />
              <h2>1. No Refund Policy</h2>
            </div>
            <div className="critical-notice">
              <p><strong>All sales are final.</strong></p>
              <p>Once an order is placed and processed, it cannot be cancelled or refunded.</p>
            </div>
            <p>Refunds will not be provided for:</p>
            <ul>
              <li>Change of mind</li>
              <li>Incorrect product selection by customer</li>
              <li>Delay due to traffic or external factors</li>
              <li>Refusal to accept delivery</li>
            </ul>
          </section>

          {/* Section 2: Eligible Replacement Cases */}
          <section className="delivery-section">
            <div className="section-header">
              <RefreshCw className="section-icon" size={24} />
              <h2>2. Eligible Replacement Cases</h2>
            </div>
            <p>Replacement may be provided only in the following cases:</p>
            <ul>
              <li>Damaged product at the time of delivery</li>
              <li>Wrong product delivered</li>
              <li>Expired product delivered</li>
            </ul>
            <div className="warning-box">
              <AlertTriangle size={20} />
              <div>
                <p><strong>Important:</strong> Customers must raise a complaint within <strong>2 hours of delivery</strong> with clear photo/video proof.</p>
                <p>Failure to report within the allowed timeframe may result in rejection of the claim.</p>
              </div>
            </div>
          </section>

          {/* Section 3: Non-Returnable Items */}
          <section className="delivery-section">
            <div className="section-header">
              <AlertTriangle className="section-icon" size={24} />
              <h2>3. Non-Returnable Items</h2>
            </div>
            <p>The following are strictly non-returnable:</p>
            <ul>
              <li>Perishable goods</li>
              <li>Opened or used products</li>
              <li>Personal care items</li>
              <li>Items without original packaging</li>
            </ul>
          </section>

          {/* Section 4: Refund Mode */}
          <section className="delivery-section">
            <div className="section-header">
              <RefreshCw className="section-icon" size={24} />
              <h2>4. Refund Mode (If Approved Exceptionally)</h2>
            </div>
            <p>In rare approved cases (at company discretion):</p>
            <ul>
              <li>Refunds will be processed to the original payment method</li>
              <li>Processing time: 5–7 business days</li>
            </ul>
            <div className="info-box">
              <p>Doordripp reserves the sole right to approve or reject refund requests.</p>
            </div>
          </section>

          {/* Section 5: Fraud & Abuse Policy */}
          <section className="delivery-section">
            <div className="section-header">
              <ShieldAlert className="section-icon" size={24} />
              <h2>5. Fraud & Abuse Policy</h2>
            </div>
            <p>We monitor accounts for misuse of refund/replacement requests.</p>
            <p>Repeated or suspicious claims may result in:</p>
            <ul>
              <li>Account suspension</li>
              <li>Permanent ban</li>
              <li>Legal action if required</li>
            </ul>
          </section>

          {/* Section 6: Contact for Claims */}
          <section className="delivery-section contact-section">
            <div className="section-header">
              <Mail className="section-icon" size={24} />
              <h2>6. Contact for Claims</h2>
            </div>
            <p>For any refund or replacement claims, please contact us:</p>
            
            <div className="contact-card">
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
                  <p><a href="tel:+919286819663">+91 9286819663</a></p>
                </div>
              </div>
            </div>

            <div className="help-note">
              <p>Please have your order number and supporting evidence (photos/videos) ready when contacting support.</p>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
