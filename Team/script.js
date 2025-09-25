class DVDScreensaver {
  constructor(options = {}) {
    // Element setup
    this.elementId = options.elementId || 'bouncingImage1';
    this.element = document.getElementById(this.elementId);
    
    if (!this.element) {
      console.error(`Element with ID '${this.elementId}' not found`);
      return;
    }
    
    this.img = this.element.querySelector('img');
    this.container = options.container || document.body;
    
    // Customizable options with defaults
    this.width = options.width || 100;
    this.height = options.height || 100;
    this.speed = options.speed || 3;
    this.rotationSpeed = options.rotationSpeed || 2;
    this.enableColorChange = options.colorChange !== false;
    this.enableRotation = options.rotation !== false;
    this.enableTrail = options.trail || false;
    this.enableGlow = options.glow !== false;
    this.trailLength = options.trailLength || 5;
    this.bounceSound = options.bounceSound || false;
    
    // Animation state
    this.isRunning = false;
    this.animationId = null;
    
    // Trail system
    this.trails = [];
    this.trailCounter = 0;
    
    // Physics properties
    this.x = 0;
    this.y = 0;
    this.velocityX = 0;
    this.velocityY = 0;
    this.rotation = 0;
    this.hue = 0;
    
    // Corner detection
    this.cornerHits = 0;
    this.lastBounceTime = 0;
    
    // Callbacks
    this.onBounce = options.onBounce || null;
    this.onCornerHit = options.onCornerHit || null;
    this.onColorChange = options.onColorChange || null;
    
    this.init();
  }
  
  init() {
    this.setupElement();
    this.reset();
    this.createTrailElements();
    this.bindEvents();
    this.start();
  }
  
  setupElement() {
    // Set initial size and position
    this.element.style.width = this.width + 'px';
    this.element.style.height = this.height + 'px';
    this.element.style.position = 'absolute';
    this.element.style.zIndex = '10';
    
    // Apply initial glow if enabled
    if (this.enableGlow) {
      this.updateGlow();
    }
  }
  
  reset() {
    // Get container bounds
    const bounds = this.getContainerBounds();
    
    // Random starting position
    this.x = Math.random() * (bounds.width - this.width);
    this.y = Math.random() * (bounds.height - this.height);
    
    // Random velocity direction with consistent speed
    const angle = Math.random() * 2 * Math.PI;
    this.velocityX = Math.cos(angle) * this.speed;
    this.velocityY = Math.sin(angle) * this.speed;
    
    // Reset other properties
    this.rotation = 0;
    this.hue = Math.random() * 360;
    this.cornerHits = 0;
    
    // Apply initial position and rotation
    this.updatePosition();
    this.updateRotation();
    this.updateColor();
  }
  
  getContainerBounds() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
  
  createTrailElements() {
    if (!this.enableTrail) return;
    
    // Remove existing trails
    this.clearTrails();
    
    // Create trail elements
    for (let i = 0; i < this.trailLength; i++) {
      const trail = document.createElement('div');
      trail.className = 'trail';
      trail.style.width = this.width + 'px';
      trail.style.height = this.height + 'px';
      trail.style.opacity = (1 - (i / this.trailLength)) * 0.3;
      trail.style.transform = `scale(${1 - (i / this.trailLength) * 0.3})`;
      
      const trailImg = this.img.cloneNode(true);
      trail.appendChild(trailImg);
      
      this.container.appendChild(trail);
      this.trails.push({
        element: trail,
        x: this.x,
        y: this.y
      });
    }
  }
  
  updateTrails() {
    if (!this.enableTrail || this.trails.length === 0) return;
    
    // Update trail positions with delay
    this.trailCounter++;
    if (this.trailCounter % 3 === 0) { // Update every 3 frames for smoother trail
      for (let i = this.trails.length - 1; i > 0; i--) {
        this.trails[i].x = this.trails[i - 1].x;
        this.trails[i].y = this.trails[i - 1].y;
        this.trails[i].element.style.left = this.trails[i].x + 'px';
        this.trails[i].element.style.top = this.trails[i].y + 'px';
      }
      this.trails[0].x = this.x;
      this.trails[0].y = this.y;
      this.trails[0].element.style.left = this.x + 'px';
      this.trails[0].element.style.top = this.y + 'px';
    }
  }
  
  clearTrails() {
    this.trails.forEach(trail => {
      if (trail.element.parentNode) {
        trail.element.parentNode.removeChild(trail.element);
      }
    });
    this.trails = [];
  }
  
  animate() {
    if (!this.isRunning) return;
    
    const bounds = this.getContainerBounds();
    const currentTime = Date.now();
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Collision detection and bouncing
    let bounced = false;
    let hitCorner = false;
    
    // Horizontal bounds
    if (this.x <= 0) {
      this.x = 0;
      this.velocityX = Math.abs(this.velocityX);
      bounced = true;
    } else if (this.x >= bounds.width - this.width) {
      this.x = bounds.width - this.width;
      this.velocityX = -Math.abs(this.velocityX);
      bounced = true;
    }
    
    // Vertical bounds
    if (this.y <= 0) {
      this.y = 0;
      this.velocityY = Math.abs(this.velocityY);
      bounced = true;
    } else if (this.y >= bounds.height - this.height) {
      this.y = bounds.height - this.height;
      this.velocityY = -Math.abs(this.velocityY);
      bounced = true;
    }
    
    // Corner detection
    if (bounced) {
      if ((this.x <= 0 || this.x >= bounds.width - this.width) && 
          (this.y <= 0 || this.y >= bounds.height - this.height)) {
        hitCorner = true;
        this.cornerHits++;
        this.handleCornerHit();
      }
      
      this.handleBounce(hitCorner);
      this.lastBounceTime = currentTime;
    }
    
    // Update transformations
    this.updatePosition();
    this.updateRotation();
    this.updateTrails();
    
    // Continue animation
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  updatePosition() {
    this.element.style.left = this.x + 'px';
    this.element.style.top = this.y + 'px';
  }
  
  updateRotation() {
    if (this.enableRotation) {
      this.rotation += this.rotationSpeed;
      this.element.style.transform = `rotate(${this.rotation}deg)`;
    }
  }
  
  updateColor() {
    if (this.enableColorChange) {
      let filter = `hue-rotate(${this.hue}deg)`;
      if (this.enableGlow) {
        filter += ` drop-shadow(0 0 15px hsl(${this.hue}, 70%, 60%))`;
      }
      this.img.style.filter = filter;
      
      // Update trail colors
      this.trails.forEach(trail => {
        const trailImg = trail.element.querySelector('img');
        if (trailImg) {
          trailImg.style.filter = filter;
        }
      });
    }
  }
  
  updateGlow() {
    if (this.enableGlow) {
      const glowColor = `hsl(${this.hue}, 70%, 60%)`;
      this.img.style.filter = `drop-shadow(0 0 15px ${glowColor})`;
    }
  }
  
  handleBounce(isCorner = false) {
    if (this.enableColorChange) {
      this.hue = (this.hue + (isCorner ? 120 : 60)) % 360;
      this.updateColor();
    }
    
    // Add bounce effect
    this.element.style.animation = 'none';
    setTimeout(() => {
      this.element.style.animation = '';
    }, 10);
    
    // Play sound if enabled
    if (this.bounceSound) {
      this.playBounceSound();
    }
    
    // Callback
    if (this.onBounce) {
      this.onBounce({
        isCorner,
        position: { x: this.x, y: this.y },
        velocity: { x: this.velocityX, y: this.velocityY },
        cornerHits: this.cornerHits
      });
    }
    
    // Color change callback
    if (this.onColorChange) {
      this.onColorChange(this.hue);
    }
  }
  
  handleCornerHit() {
    // Add special corner hit effect
    this.element.classList.add('corner-hit');
    setTimeout(() => {
      this.element.classList.remove('corner-hit');
    }, 500);
    
    // Corner hit callback
    if (this.onCornerHit) {
      this.onCornerHit({
        cornerHits: this.cornerHits,
        position: { x: this.x, y: this.y }
      });
    }
    
    console.log(`Corner hit! Total: ${this.cornerHits}`);
  }
  
  playBounceSound() {
    // Create audio context for bounce sound
    if (window.AudioContext || window.webkitAudioContext) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }
  
  bindEvents() {
    // Handle window resize
    this.resizeHandler = () => this.handleResize();
    window.addEventListener('resize', this.resizeHandler);
    
    // Handle visibility change (pause when tab not visible)
    this.visibilityHandler = () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.start();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }
  
  unbindEvents() {
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
  }
  
  handleResize() {
    const bounds = this.getContainerBounds();
    
    // Keep image within new bounds
    this.x = Math.min(this.x, bounds.width - this.width);
    this.y = Math.min(this.y, bounds.height - this.height);
    
    // Ensure position is not negative
    this.x = Math.max(0, this.x);
    this.y = Math.max(0, this.y);
    
    this.updatePosition();
  }
  
  // Public control methods
  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.animate();
    }
  }
  
  pause() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  stop() {
    this.pause();
    this.reset();
  }
  
  setSpeed(speed) {
    const ratio = speed / this.speed;
    this.speed = speed;
    this.velocityX *= ratio;
    this.velocityY *= ratio;
  }
  
  setRotationSpeed(rotationSpeed) {
    this.rotationSpeed = rotationSpeed;
  }
  
  setSize(width, height) {
    this.width = width;
    this.height = height || width;
    this.element.style.width = this.width + 'px';
    this.element.style.height = this.height + 'px';
    
    // Recreate trails with new size
    if (this.enableTrail) {
      this.createTrailElements();
    }
  }
  
  toggleTrail() {
    this.enableTrail = !this.enableTrail;
    if (this.enableTrail) {
      this.createTrailElements();
    } else {
      this.clearTrails();
    }
  }
  
  toggleRotation() {
    this.enableRotation = !this.enableRotation;
  }
  
  toggleColorChange() {
    this.enableColorChange = !this.enableColorChange;
  }
  
  getStats() {
    return {
      position: { x: this.x, y: this.y },
      velocity: { x: this.velocityX, y: this.velocityY },
      rotation: this.rotation,
      hue: this.hue,
      cornerHits: this.cornerHits,
      isRunning: this.isRunning,
      speed: this.speed
    };
  }
  
  // Cleanup
  destroy() {
    this.pause();
    this.clearTrails();
    this.unbindEvents();
    
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// Screen Manager for multiple images
class DVDScreenManager {
  constructor() {
    this.screensavers = new Map();
    this.imageCounter = 0;
  }
  
  add(options = {}) {
    const id = options.elementId || `dynamicImage${++this.imageCounter}`;
    
    // Create element if it doesn't exist
    if (!document.getElementById(id)) {
      const element = document.createElement('div');
      element.id = id;
      element.className = 'bouncing-image';
      element.innerHTML = '&#x3C;img src=&#x22;https://via.placeholder.com/100x100/ff6b6b/ffffff?text=NEW&#x22; alt=&#x22;Dynamic Image&#x22;&#x3E;';
      document.body.appendChild(element);
    }
    
    const screensaver = new DVDScreensaver({ ...options, elementId: id });
    this.screensavers.set(id, screensaver);
    
    return screensaver;
  }
  
  remove(id) {
    const screensaver = this.screensavers.get(id);
    if (screensaver) {
      screensaver.destroy();
      this.screensavers.delete(id);
    }
  }
  
  pauseAll() {
    this.screensavers.forEach(screensaver => screensaver.pause());
  }
  
  startAll() {
    this.screensavers.forEach(screensaver => screensaver.start());
  }
  
  setGlobalSpeed(speed) {
    this.screensavers.forEach(screensaver => screensaver.setSpeed(speed));
  }
  
  getAll() {
    return Array.from(this.screensavers.values());
  }
  
  clear() {
    this.screensavers.forEach(screensaver => screensaver.destroy());
    this.screensavers.clear();
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Create screen manager
  const manager = new DVDScreenManager();
  
  // Initialize existing images
  const dvd1 = new DVDScreensaver({
    elementId: 'bouncingImage1',
    width: 100,
    height: 100,
    speed: 3,
    rotationSpeed: 2,
    colorChange: true,
    rotation: true,
    trail: false,
    glow: true,
    onCornerHit: (data) => {
      console.log('Corner hit!', data);
      // Flash screen or add special effect
      document.body.style.background = `hsl(${Math.random() * 360}, 70%, 20%)`;
      setTimeout(() => {
        document.body.style.background = 'linear-gradient(45deg, #0a0a0a, #1a1a1a)';
      }, 200);
    }
  });
  
  const dvd2 = new DVDScreensaver({
    elementId: 'bouncingImage2',
    width: 80,
    height: 80,
    speed: 4,
    rotationSpeed: -3,
    colorChange: true,
    rotation: true,
    trail: true,
    trailLength: 8,
    glow: true
  });
  
  // Add to manager
  manager.screensavers.set('bouncingImage1', dvd1);
  manager.screensavers.set('bouncingImage2', dvd2);
  
  // Control buttons
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const addImageBtn = document.getElementById('addImageBtn');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  
  let isPaused = false;
  
  // Pause/Resume functionality
  pauseBtn?.addEventListener('click', () => {
    if (isPaused) {
      manager.startAll();
      pauseBtn.textContent = 'Pause';
      isPaused = false;
    } else {
      manager.pauseAll();
      pauseBtn.textContent = 'Resume';
      isPaused = true;
    }
  });
  
  // Reset functionality
  resetBtn?.addEventListener('click', () => {
    manager.getAll().forEach(screensaver => screensaver.reset());
  });
  
  // Add new image
  addImageBtn?.addEventListener('click', () => {
    const colors = ['ff6b6b', '4ecdc4', '45b7d1', 'f9ca24', 'f0932b', 'eb4d4b', '6c5ce7'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    manager.add({
      width: 60 + Math.random() * 80,
      height: 60 + Math.random() * 80,
      speed: 2 + Math.random() * 4,
      rotationSpeed: -5 + Math.random() * 10,
      trail: Math.random() > 0.5,
      colorChange: true,
      rotation: true,
      glow: true
    });
    
    // Update the last added image with random color
    const images = document.querySelectorAll('.bouncing-image img');
    const lastImg = images[images.length - 1];
    if (lastImg) {
      lastImg.src = `https://via.placeholder.com/100x100/${randomColor}/ffffff?text=${manager.screensavers.size}`;
    }
  });
  
  // Speed control
  speedSlider?.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    speedValue.textContent = speed;
    manager.setGlobalSpeed(speed);
  });
  
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    switch(e.key) {
      case ' ':
        e.preventDefault();
        pauseBtn?.click();
        break;
      case 'r':
        resetBtn?.click();
        break;
      case 'a':
        addImageBtn?.click();
        break;
      case 't':
        manager.getAll().forEach(screensaver => screensaver.toggleTrail());
        break;
      case 'c':
        manager.getAll().forEach(screensaver => screensaver.toggleColorChange());
        break;
    }
  });
  
  // Expose to global scope for debugging
  window.dvdManager = manager;
  window.dvd1 = dvd1;
  window.dvd2 = dvd2;
});

const dvd = new DVDScreensaver({
  elementId: 'Günther',
  speed: 5,
  trail: false
});