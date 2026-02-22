/**
 * Trial Room Categories Section
 * 
 * Displays promotional cards for the Trial Room feature
 * with similar styling to the main categories section.
 * 
 * Features three cards:
 * - Try At Home: Browse and try products at home
 * - Free Trial: No cost for trying
 * - Buy Later: Purchase after you decide
 * 
 * @component
 */

import { useTrial } from '../../context/TrialContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './styles/TrialRoomCategories.css';

export function TrialRoomCategories() {
  const { toggleTrialModal } = useTrial();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCardClick = (type) => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Open trial modal or navigate to products
    if (type === 'try-at-home') {
      navigate('/products');
    } else if (type === 'start-trial') {
      toggleTrialModal(true);
    } else if (type === 'my-trials') {
      navigate('/trial-room');
    }
  };

  return (
    <section className="trial-room-categories-section">
      <div className="trial-room-categories-container">
        <h2 className="trial-room-categories-title">
          EXPERIENCE TRIAL ROOM
        </h2>
        <p className="trial-room-categories-subtitle">
          Try before you buy - Free home trial for up to 3 items daily
        </p>

        <div className="trial-room-categories-grid">
          {/* Try At Home Card */}
          <div 
            className="trial-category-card card-primary"
            onClick={() => handleCardClick('try-at-home')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleCardClick('try-at-home')}
          >
            <div className="trial-card-overlay"></div>
            <div className="trial-card-content">
              <div className="trial-card-icon">🏠</div>
              <h3 className="trial-card-title">Try At Home</h3>
              <p className="trial-card-description">
                Browse our collection and select up to 3 items to try at your doorstep
              </p>
              <span className="trial-card-cta">Browse Products →</span>
            </div>
          </div>

          {/* Free Trial Card */}
          <div 
            className="trial-category-card card-secondary"
            onClick={() => handleCardClick('start-trial')}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && handleCardClick('start-trial')}
          >
            <div className="trial-card-overlay"></div>
            <div className="trial-card-content">
              <div className="trial-card-icon">✨</div>
              <h3 className="trial-card-title">Free Trial</h3>
              <p className="trial-card-description">
                No cost to try. Free delivery and pickup within your area
              </p>
              <span className="trial-card-cta">Start Trial →</span>
            </div>
          </div>

          {/* Diagonal Split Card - Buy Later/My Trials */}
          <div className="trial-category-card card-split">
            {/* Buy Later section */}
            <div 
              className="trial-card-half trial-card-top"
              onClick={() => handleCardClick('my-trials')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleCardClick('my-trials')}
            >
              <div className="trial-card-overlay"></div>
              <div className="trial-card-content">
                <div className="trial-card-icon">🛍️</div>
                <h3 className="trial-card-title">Buy Later</h3>
                <p className="trial-card-description">
                  Purchase what you love after trying
                </p>
              </div>
            </div>

            {/* My Trials section */}
            <div 
              className="trial-card-half trial-card-bottom"
              onClick={() => handleCardClick('my-trials')}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleCardClick('my-trials')}
            >
              <div className="trial-card-overlay"></div>
              <div className="trial-card-content">
                <div className="trial-card-icon">📦</div>
                <h3 className="trial-card-title">My Trials</h3>
                <p className="trial-card-description">
                  View your trial history
                </p>
              </div>
            </div>

            {/* Diagonal separator line */}
            <div className="trial-card-separator" aria-hidden="true"></div>
          </div>
        </div>

        {/* Info Section */}
        <div className="trial-room-info">
          <div className="trial-info-item">
            <span className="trial-info-icon">✓</span>
            <span className="trial-info-text">Free delivery & pickup</span>
          </div>
          <div className="trial-info-item">
            <span className="trial-info-icon">✓</span>
            <span className="trial-info-text">Try up to 3 items daily</span>
          </div>
          <div className="trial-info-item">
            <span className="trial-info-icon">✓</span>
            <span className="trial-info-text">No payment required to try</span>
          </div>
          <div className="trial-info-item">
            <span className="trial-info-icon">✓</span>
            <span className="trial-info-text">Buy only what you love</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TrialRoomCategories;
