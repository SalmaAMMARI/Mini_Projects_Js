<template>
  <div class="home-container">
    <!-- Hero Section with Particles Background -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Welcome to <span class="highlight">Community Forum</span></h1>
        <p class="hero-tagline">Where ideas meet collaboration</p>
        <p class="hero-description">Join thousands of community members sharing knowledge, solving problems, and building connections.</p>
        
        <div class="cta-buttons">
          <router-link to="/signup" class="cta-btn primary">Get Started</router-link>
          <router-link to="/login" class="cta-btn secondary">Sign In</router-link>
        </div>
      </div>
      <div class="hero-image">
        <img src="https://illustrations.popsy.co/amber/digital-nomad.svg" alt="Community Illustration">
      </div>
    </section>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-item">
        <div class="stat-number" id="member-count">10,000+</div>
        <div class="stat-label">Community Members</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="discussion-count">50,000+</div>
        <div class="stat-label">Active Discussions</div>
      </div>
      <div class="stat-item">
        <div class="stat-number" id="solution-count">120,000+</div>
        <div class="stat-label">Solutions Shared</div>
      </div>
    </div>

    <!-- Features Section -->
    <section class="features-section">
      <div class="section-header">
        <h2>Why Our Community Stands Out</h2>
        <p class="section-subtitle">Designed for meaningful connections and knowledge sharing</p>
      </div>
      
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3498db">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h3>Support System</h3>
          <p>Get personalized help from experts and community members who genuinely care.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2ecc71">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <h3>Collaborative Spaces</h3>
          <p>Team up with like-minded individuals to bring ideas to life through discussion.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e74c3c">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <h3>Inclusive Community</h3>
          <p>A welcoming environment where all voices are heard and respected.</p>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="section-header">
        <h2>What Our Members Say</h2>
        <p class="section-subtitle">Hear from our vibrant community</p>
      </div>
      
      <div class="testimonial-carousel">
        <div class="testimonial-card">
          <div class="testimonial-content">
            "This community helped me solve a critical issue in my project within hours. The collective knowledge here is incredible!"
          </div>
          <div class="testimonial-author">
            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah J.">
            <div>
              <div class="author-name">Sarah J.</div>
              <div class="author-title">Web Developer</div>
            </div>
          </div>
        </div>
        
        <div class="testimonial-card">
          <div class="testimonial-content">
            "As a beginner, I found so many helpful resources and patient mentors here. It's been invaluable for my learning journey."
          </div>
          <div class="testimonial-author">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael T.">
            <div>
              <div class="author-name">Michael T.</div>
              <div class="author-title">Student</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="final-cta">
      <h2>Ready to Join the Conversation?</h2>
      <p>Become part of a growing community of thinkers, creators, and problem-solvers.</p>
     </section>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {}
  },
  mounted() {
    // Animation for counting up stats
    this.animateValue('member-count', 0, 10000, 2000);
    this.animateValue('discussion-count', 0, 50000, 2000);
    this.animateValue('solution-count', 0, 120000, 2000);
  },
  methods: {
    animateValue(id, start, end, duration) {
      let startTimestamp = null;
      const element = document.getElementById(id);
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.innerHTML = value.toLocaleString() + '+';
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.home-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
  color: #2c3e50;
  line-height: 1.6;
  overflow-x: hidden;
}

.highlight {
  color: #3498db;
  font-weight: 700;
}

/* Section Header Styles */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
  background: linear-gradient(to right, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-subtitle {
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 700px;
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6rem 5%;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  overflow: hidden;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-tagline {
  font-size: 1.8rem;
  font-weight: 300;
  margin-bottom: 1.5rem;
  color: #3498db;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  color: #555;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  max-height: 500px;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

/* CTA Buttons */
.cta-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cta-btn {
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  text-align: center;
}

.cta-btn.primary {
  background: linear-gradient(to right, #3498db, #2ecc71);
  color: white;
  box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.cta-btn.primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 7px 20px rgba(52, 152, 219, 0.4);
}

.cta-btn.secondary {
  background: white;
  color: #3498db;
  border: 2px solid #3498db;
}

.cta-btn.secondary:hover {
  background: #f8f9fa;
  transform: translateY(-3px);
}

.cta-btn.large {
  padding: 1.2rem 2.5rem;
  font-size: 1.2rem;
}

/* Stats Bar */
.stats-bar {
  display: flex;
  justify-content: space-around;
  padding: 3rem 0;
  background: white;
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.05);
  margin: 2rem 0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  color: #3498db;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1.1rem;
  color: #7f8c8d;
  font-weight: 500;
}

/* Features Section */
.features-section {
  padding: 6rem 5%;
  background-color: white;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(52, 152, 219, 0.1);
  border-radius: 50%;
}

/* Testimonials Section */
.testimonials-section {
  padding: 5rem 5%;
  background-color: #f8f9fa;
  text-align: center;
}

.testimonial-carousel {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin-top: 3rem;
}

.testimonial-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.testimonial-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.testimonial-content {
  font-size: 1.1rem;
  font-style: italic;
  color: #555;
  margin-bottom: 1.5rem;
}

.testimonial-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.testimonial-author img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.author-name {
  font-weight: 600;
  color: #2c3e50;
}

.author-title {
  font-size: 0.95rem;
  color: #7f8c8d;
}

/* Final CTA Section */
.final-cta {
  background: linear-gradient(to right, #3498db, #2ecc71);
  padding: 4rem 5%;
  text-align: center;
  color: white;
  border-radius: 20px;
  margin: 4rem auto 6rem;
  max-width: 1000px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.final-cta h2 {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.final-cta p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.final-cta .cta-btn {
  background-color: white;
  color: #3498db;
  font-weight: 700;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.final-cta .cta-btn:hover {
  background-color: #f1f1f1;
  transform: translateY(-3px);
}
</style>
