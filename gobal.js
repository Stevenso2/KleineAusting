class ThemeToggle {
  constructor() {
    this.button = document.getElementById('theme-toggle');
    this.stylesheet = document.getElementById('theme-stylesheet');
    this.icon = this.button.querySelector('.toggle-icon');
    
    // Check for saved theme preference or default to light
    this.currentTheme = localStorage.getItem('theme') || 'light';
    
    // Initialize theme
    this.setTheme(this.currentTheme);
    
    // Add click event listener
    this.button.addEventListener('click', () => this.toggleTheme());
  }
  
  setTheme(theme) {
    if (theme === 'dark') {
      this.stylesheet.href = 'dark_style.css';
      this.icon.textContent = '☀️';
      this.button.setAttribute('aria-label', 'Switch to light mode');
    } else {
      this.stylesheet.href = 'style.css';
      this.icon.textContent = '🌙';
      this.button.setAttribute('aria-label', 'Switch to dark mode');
    }
    
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    
    // Add smooth transition class to body
    document.body.classList.add('theme-transitioning');
    setTimeout(() => {
      document.body.classList.remove('theme-transitioning');
    }, 300);
  }
  
  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }
}

// Initialize theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ThemeToggle();
});