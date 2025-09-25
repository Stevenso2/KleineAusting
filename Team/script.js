// More customizable version
class DVDScreensaver {
  constructor(options = {}) {
    this.element = document.getElementById(options.elementId || 'bouncingImage');
    this.img = this.element.querySelector('img');
    
    // Customizable options
    this.width = options.width || 100;
    this.height = options.height || 100;
    this.speed = options.speed || 3;
    this.rotationSpeed = options.rotationSpeed || 2;
    this.enableColorChange = options.colorChange !== false;
    this.enableRotation = options.rotation !== false;
    this.enableTrail = options.trail || false;
    
    // Set initial size
    this.element.style.width = this.width + 'px';
    this.element.style.height = this.height + 'px';
    
    this.reset();
    this.init();
  }
  
  reset() {
    this.x = Math.random() * (window.innerWidth - this.width);
    this.y = Math.random() * (window.innerHeight - this.height);
    this.velocityX = (Math.random() > 0.5 ? 1 : -1) * this.speed;
    this.velocityY = (Math.random() > 0.5 ? 1 : -1) * this.speed;
    this.rotation = 0;
    this.hue = 0;
  }
  
  // ... rest of the methods similar to above
}

// Usage
const dvd = new DVDScreensaver({
  elementId: 'bouncingImage',
  width: 120,
  height: 120,
  speed: 4,
  rotationSpeed: 3,
  colorChange: true,
  rotation: true
});