/* HomePage.css */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header Styles */
header {
  background: linear-gradient(135deg, #0d3b66 0%, #1a5f7a 100%);
  color: white;
  padding: 25px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 0 0 20px 20px;
  margin-bottom: 40px;
}

.logo-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo i {
  font-size: 2.5rem;
  color: #ffd166;
}

.logo h1 {
  font-size: 1.8rem;
  font-weight: 700;
}

.contact-buttons {
  display: flex;
  gap: 15px;
}

.contact-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 10px 18px;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.contact-btn:hover {
  background-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.contact-btn.whatsapp {
  background-color: #25D366;
  border-color: #25D366;
}

.contact-btn.whatsapp:hover {
  background-color: #1da851;
}

.tagline {
  text-align: center;
  font-size: 1.2rem;
  margin-top: 10px;
  opacity: 0.9;
}

/* Search Section */
.search-section {
  background-color: white;
  padding: 30px;
  border-radius: 12px;
  margin-top: -20px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
  margin-bottom: 40px;
}

.search-container {
  display: flex;
  max-width: 800px;
  margin: 0 auto;
}

.search-input {
  flex-grow: 1;
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 50px 0 0 50px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #1a5f7a;
}

.search-btn {
  background: linear-gradient(to right, #1a5f7a, #0d3b66);
  color: white;
  border: none;
  padding: 0 30px;
  border-radius: 0 50px 50px 0;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: linear-gradient(to right, #0d3b66, #1a5f7a);
}

/* Categories Section */
.categories-section {
  padding: 40px 0;
}

.section-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 30px;
  color: #0d3b66;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #0d3b66, #1a5f7a);
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 25px;
  margin-top: 40px;
}

.category-card {
  background-color: white;
  border-radius: 12px;
  padding: 25px 20px;
  text-align: center;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #e9ecef;
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  border-color: #1a5f7a;
}

.category-icon {
  font-size: 2.5rem;
  color: #1a5f7a;
  margin-bottom: 15px;
}

.category-card h3 {
  font-size: 1.3rem;
  color: #333;
}

/* Featured Ad Section */
.featured-ad-section {
  padding: 40px 0;
}

.ad-card {
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #e9ecef;
}

.ad-image {
  height: 250px;
  overflow: hidden;
}

.ad-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ad-details {
  padding: 25px;
}

.ad-details h3 {
  font-size: 1.6rem;
  margin-bottom: 15px;
  color: #0d3b66;
}

.ad-description {
  color: #666;
  margin-bottom: 20px;
  font-size: 1.05rem;
}

.ad-info {
  display: flex;
  gap: 25px;
  margin-bottom: 25px;
  color: #555;
  flex-wrap: wrap;
}

.ad-info span {
  display: flex;
  align-items: center;
  gap: 7px;
}

.ad-contact {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.price {
  font-size: 1.8rem;
  font-weight: 700;
  color: #0d3b66;
}

.contact-seller {
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(to right, #25D366, #1da851);
  color: white;
  text-decoration: none;
  padding: 12px 25px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.contact-seller:hover {
  background: linear-gradient(to right, #1da851, #25D366);
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(37, 211, 102, 0.3);
}

/* Info Section */
.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  padding: 50px 0;
}

.info-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.05);
  border-top: 4px solid #1a5f7a;
}

.info-card i {
  font-size: 3rem;
  color: #1a5f7a;
  margin-bottom: 20px;
}

.info-card h3 {
  font-size: 1.4rem;
  margin-bottom: 15px;
  color: #0d3b66;
}

/* Footer */
footer {
  text-align: center;
  padding: 30px 0;
  margin-top: 50px;
  color: #666;
  border-top: 1px solid #e9ecef;
  font-size: 0.95rem;
}

footer p:first-child {
  margin-bottom: 10px;
  font-weight: 600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .logo-section {
    flex-direction: column;
    gap: 20px;
  }
  
  .search-container {
    flex-direction: column;
  }
  
  .search-input {
    border-radius: 50px;
    margin-bottom: 15px;
  }
  
  .search-btn {
    border-radius: 50px;
    padding: 15px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .ad-contact {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .contact-seller {
    width: 100%;
    justify-content: center;
  }
  
  .info-section {
    grid-template-columns: 1fr;
  }
}
