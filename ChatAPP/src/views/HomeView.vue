<template>
  <div class="welcome-page">
    <div class="welcome-content">
      <div class="welcome-text">
        <h1 class="welcome-heading">Welcome to ChitChat</h1>
        <p class="welcome-tagline">Connect, converse, and communicate with ease</p>
        <div class="welcome-line"></div>
      </div>
      
      <div class="hero-section">
        <div class="features-column">
          <div class="feature-card">
            <div class="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3>Instant Messaging</h3>
            <p>Chat with friends in real-time</p>
          </div>
          
          <div class="feature-card">
            <div class="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <h3>Global Community</h3>
            <p>Connect with people worldwide</p>
          </div>
        </div>
        
        <!-- Dynamic Phone Display -->
        <div class="phone-container">
          <div class="phone-frame">
            <div class="phone-header">
              <div class="phone-notch"></div>
            </div>
            <div class="phone-screen">
              <div class="app-header">
                <div class="app-title">ChitChat</div>
              </div>
              <div class="message-container">
                <div class="message received">
                  <div class="message-content">Hey there! How are you?</div>
                  <div class="message-time">10:24 AM</div>
                </div>
                <div class="message sent">
                  <div class="message-content">I'm doing great! Just trying out this new ChitChat app.</div>
                  <div class="message-time">10:25 AM</div>
                </div>
                <div class="message received message-typing">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
              <div class="message-input">
                <input type="text" placeholder="Type a message..." readonly />
                <button class="send-button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="features-column">
          <div class="feature-card">
            <div class="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3>Secure Chats</h3>
            <p>End-to-end encryption for privacy</p>
          </div>
          
          <div class="feature-card">
            <div class="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feature-icon">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <h3>Media Sharing</h3>
            <p>Share photos and videos instantly</p>
          </div>
        </div>
      </div>
      
      <div class="cta-container">
        <router-link to="/login" class="cta-button primary">Get Started</router-link>
        <button class="cta-button secondary">Learn More</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WelcomePage',
  mounted() {
    // Trigger the animation after the component is mounted
    setTimeout(() => {
      const messages = document.querySelectorAll('.welcome-page .message');
      messages.forEach((message, index) => {
        setTimeout(() => {
          message.classList.add('visible');
        }, index * 1000);
      });
    }, 500);
  }
}
</script>

<style scoped>
/* Scoped CSS to ensure these styles only apply to this component */
.welcome-page {
  --primary-color: #3a6ea5;
  --secondary-color: #f0f4f8;
  --accent-color: #6c9bcf;
  --text-color: #333;
  --background-color: #ffffff;
  --shadow-color: rgba(0, 0, 0, 0.08);
  --gradient-start: #f8f9fa;
  --gradient-end: #e9ecef;
  --card-bg: #ffffff;
  --phone-frame: #222222;
  --phone-screen: #f5f5f5;
  --message-sent: #3a6ea5;
  --message-received: #e9ecef;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%);
  font-family: 'Inter', 'Helvetica Neue', sans-serif;
  color: var(--text-color);
}

.welcome-content {
  max-width: 1200px;
  width: 100%;
}

.welcome-text {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-heading {
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
}

.welcome-tagline {
  font-size: 1.5rem;
  font-weight: 400;
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.welcome-line {
  height: 4px;
  width: 80px;
  background-color: var(--accent-color);
  margin: 0 auto;
  border-radius: 2px;
}

/* Hero section with phone */
.hero-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.features-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 24%;
}

/* Phone styling */
.phone-container {
  width: 48%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

.phone-frame {
  width: 280px;
  height: 560px;
  background-color: var(--phone-frame);
  border-radius: 36px;
  padding: 12px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.phone-header {
  width: 100%;
  height: 24px;
  position: relative;
  z-index: 2;
}

.phone-notch {
  width: 120px;
  height: 24px;
  background-color: var(--phone-frame);
  border-radius: 0 0 12px 12px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
}

.phone-screen {
  width: 100%;
  height: calc(100% - 24px);
  background-color: var(--phone-screen);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.app-header {
  height: 60px;
  background-color: var(--primary-color);
  display: flex;
  align-items: center;
  padding: 0 16px;
  position: relative;
}

.app-title {
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
}

.message-container {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 75%;
  padding: 12px;
  border-radius: 18px;
  position: relative;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.message.visible {
  opacity: 1;
  transform: translateY(0);
}

.message.received {
  align-self: flex-start;
  background-color: var(--message-received);
  border-bottom-left-radius: 4px;
}

.message.sent {
  align-self: flex-end;
  background-color: var(--message-sent);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-content {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-time {
  font-size: 0.7rem;
  opacity: 0.7;
  text-align: right;
}

.message-typing {
  padding: 16px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #999;
  border-radius: 50%;
  display: inline-block;
  animation: bounce 1.3s ease infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}

.message-input {
  display: flex;
  padding: 12px;
  background-color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.message-input input {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 24px;
  background-color: var(--secondary-color);
  font-size: 0.9rem;
}

.message-input input:focus {
  outline: none;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  border: none;
  margin-left: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button svg {
  width: 20px;
  height: 20px;
  color: white;
}

/* Feature cards */
.feature-card {
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 5px 20px var(--shadow-color);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 60px;
  height: 60px;
  background-color: var(--secondary-color);
  border-radius: 50%;
  margin: 0 auto 1rem;
}

.feature-icon {
  width: 30px;
  height: 30px;
  color: var(--primary-color);
}

.feature-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.6rem;
  color: var(--primary-color);
}

.feature-card p {
  color: var(--text-color);
  font-size: 0.9rem;
  line-height: 1.5;
}

.cta-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
}

.cta-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.primary {
  background-color: var(--primary-color);
  color: white;
}

.primary:hover {
  background-color: #2c5580;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(58, 110, 165, 0.3);
}

.secondary {
  background-color: var(--secondary-color);
  color: var(--primary-color);
}

.secondary:hover {
  background-color: #e2e9f0;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px var(--shadow-color);
}

@media (max-width: 1024px) {
  .hero-section {
    flex-direction: column;
    gap: 3rem;
  }
  
  .features-column {
    width: 100%;
    flex-direction: row;
    justify-content: center;
    gap: 1.5rem;
  }
  
  .feature-card {
    width: 45%;
  }
  
  .phone-container {
    width: 100%;
    order: -1;
  }
}

@media (max-width: 768px) {
  .welcome-heading {
    font-size: 2.8rem;
  }
  
  .welcome-tagline {
    font-size: 1.2rem;
  }
  
  .features-column {
    flex-direction: column;
    align-items: center;
  }
  
  .feature-card {
    width: 100%;
    max-width: 320px;
  }
  
  .cta-container {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
    margin: 2rem auto;
  }
  
  .cta-button {
    width: 100%;
  }
}
</style>