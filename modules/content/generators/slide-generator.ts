import type { ParsedPresentation, ParsedSlide } from '../parsers/presentation-parser'

export interface ModernSlideOptions {
  format: 'reveal.js' | 'impress.js' | 'custom'
  theme: string
  addInteractivity: boolean
  includeAnimations?: boolean
  responsiveDesign?: boolean
}

export interface GeneratedSlides {
  html: string
  css: string
  js: string
  assets: Asset[]
  theorySlides: any[]
  demoContent?: any
  exercises?: any
  metadata: {
    totalSlides: number
    estimatedDuration: number
    hasInteractiveElements: boolean
  }
}

interface Asset {
  type: 'image' | 'video' | 'font' | 'script'
  src: string
  path: string
}

export async function generateModernSlides(
  parsedContent: ParsedPresentation,
  options: ModernSlideOptions
): Promise<GeneratedSlides> {
  const { slides, metadata } = parsedContent

  // Generate HTML structure based on format
  const html = generateHTMLStructure(slides, options)
  
  // Generate CSS with modern styles
  const css = generateModernCSS(options.theme)
  
  // Generate JavaScript for interactivity
  const js = options.addInteractivity ? generateInteractiveJS(slides) : ''
  
  // Process and optimize assets
  const assets = await processAssets(slides)
  
  // Categorize content
  const { theorySlides, demoSlides, exerciseSlides } = categorizeContent(slides)
  
  return {
    html,
    css,
    js,
    assets,
    theorySlides: theorySlides.map(slide => convertToModernFormat(slide, options)),
    demoContent: demoSlides.length > 0 ? createDemoContent(demoSlides) : undefined,
    exercises: exerciseSlides.length > 0 ? createExercises(exerciseSlides) : undefined,
    metadata: {
      totalSlides: slides.length,
      estimatedDuration: calculateDuration(slides),
      hasInteractiveElements: options.addInteractivity,
    },
  }
}

function generateHTMLStructure(slides: ParsedSlide[], options: ModernSlideOptions): string {
  if (options.format === 'reveal.js') {
    return generateRevealHTML(slides)
  }
  
  // Default custom format
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learning Module</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="presentation-container">
    ${slides.map(slide => generateSlideHTML(slide)).join('\n')}
  </div>
  <div class="navigation">
    <button class="prev-slide">Previous</button>
    <span class="slide-counter">1 / ${slides.length}</span>
    <button class="next-slide">Next</button>
  </div>
  <script src="presentation.js"></script>
</body>
</html>
  `
}

function generateRevealHTML(slides: ParsedSlide[]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/theme/white.css">
  <link rel="stylesheet" href="custom-theme.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
      ${slides.map(slide => `
        <section data-slide-number="${slide.slideNumber}">
          <h2>${slide.title}</h2>
          ${slide.content.map(content => renderContent(content)).join('\n')}
          <aside class="notes">${slide.notes}</aside>
        </section>
      `).join('\n')}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@4.3.1/dist/reveal.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      controls: true,
      progress: true,
      center: true,
      transition: 'slide'
    });
  </script>
</body>
</html>
  `
}

function generateSlideHTML(slide: ParsedSlide): string {
  return `
<div class="slide" data-slide-number="${slide.slideNumber}">
  <div class="slide-content">
    <h2 class="slide-title">${slide.title}</h2>
    ${slide.content.map(content => renderContent(content)).join('\n')}
  </div>
  ${slide.notes ? `<div class="speaker-notes">${slide.notes}</div>` : ''}
</div>
  `
}

function renderContent(content: any): string {
  switch (content.type) {
    case 'text':
      return `<div class="text-content">${formatText(content.data.text)}</div>`
    case 'image':
      return `<img src="${content.data.src}" alt="${content.data.alt}" class="slide-image" />`
    case 'table':
      return renderTable(content.data)
    case 'chart':
      return renderChart(content.data)
    default:
      return ''
  }
}

function generateModernCSS(theme: string): string {
  const baseCSS = `
/* Base Styles */
:root {
  --primary-color: #3B82F6;
  --secondary-color: #14B8A6;
  --text-color: #1F2937;
  --bg-color: #FFFFFF;
  --accent-color: #F59E0B;
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--text-color);
  background-color: var(--bg-color);
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Presentation Container */
.presentation-container {
  position: relative;
  width: 100vw;
  height: calc(100vh - 80px);
  overflow: hidden;
}

/* Slide Styles */
.slide {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.5s ease-in-out;
}

.slide.active {
  opacity: 1;
  transform: translateX(0);
}

.slide.prev {
  transform: translateX(-100%);
}

.slide-content {
  max-width: 1200px;
  padding: 60px;
  text-align: center;
}

.slide-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--primary-color);
}

/* Text Content */
.text-content {
  font-size: 1.25rem;
  line-height: 1.8;
  margin: 1.5rem 0;
  text-align: left;
}

/* Navigation */
.navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.navigation button {
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.navigation button:hover {
  background: #2563EB;
  transform: translateY(-2px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .slide-content {
    padding: 30px;
  }
  
  .slide-title {
    font-size: 2rem;
  }
  
  .text-content {
    font-size: 1rem;
  }
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide.active .slide-content > * {
  animation: slideIn 0.6s ease-out forwards;
  animation-delay: 0.3s;
  opacity: 0;
}
  `

  // Add theme-specific styles
  const themeStyles = getThemeStyles(theme)
  
  return baseCSS + themeStyles
}

function generateInteractiveJS(slides: ParsedSlide[]): string {
  return `
// Presentation Controller
class PresentationController {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = ${slides.length};
    this.slides = document.querySelectorAll('.slide');
    this.prevButton = document.querySelector('.prev-slide');
    this.nextButton = document.querySelector('.next-slide');
    this.slideCounter = document.querySelector('.slide-counter');
    
    this.init();
  }
  
  init() {
    // Show first slide
    this.showSlide(0);
    
    // Add event listeners
    this.prevButton.addEventListener('click', () => this.previousSlide());
    this.nextButton.addEventListener('click', () => this.nextSlide());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });
    
    // Touch gestures
    this.addTouchSupport();
  }
  
  showSlide(index) {
    // Hide all slides
    this.slides.forEach((slide, i) => {
      slide.classList.remove('active', 'prev');
      if (i < index) slide.classList.add('prev');
    });
    
    // Show current slide
    this.slides[index].classList.add('active');
    
    // Update counter
    this.slideCounter.textContent = \`\${index + 1} / \${this.totalSlides}\`;
    
    // Update button states
    this.prevButton.disabled = index === 0;
    this.nextButton.disabled = index === this.totalSlides - 1;
  }
  
  previousSlide() {
    if (this.currentSlide > 0) {
      this.currentSlide--;
      this.showSlide(this.currentSlide);
      this.trackProgress('slide_back', this.currentSlide);
    }
  }
  
  nextSlide() {
    if (this.currentSlide < this.totalSlides - 1) {
      this.currentSlide++;
      this.showSlide(this.currentSlide);
      this.trackProgress('slide_forward', this.currentSlide);
    }
  }
  
  addTouchSupport() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    });
    
    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) this.nextSlide();
      if (touchEndX > touchStartX + 50) this.previousSlide();
    };
  }
  
  trackProgress(action, slideNumber) {
    // Send progress tracking
    if (window.trackLearningProgress) {
      window.trackLearningProgress({
        action,
        slideNumber,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  new PresentationController();
});
  `
}

function categorizeContent(slides: ParsedSlide[]) {
  const theorySlides: ParsedSlide[] = []
  const demoSlides: ParsedSlide[] = []
  const exerciseSlides: ParsedSlide[] = []

  slides.forEach(slide => {
    const titleLower = slide.title.toLowerCase()
    
    if (titleLower.includes('demo') || titleLower.includes('example')) {
      demoSlides.push(slide)
    } else if (titleLower.includes('exercise') || titleLower.includes('practice')) {
      exerciseSlides.push(slide)
    } else {
      theorySlides.push(slide)
    }
  })

  return { theorySlides, demoSlides, exerciseSlides }
}

function convertToModernFormat(slide: ParsedSlide, options: ModernSlideOptions): any {
  return {
    id: `slide-${slide.slideNumber}`,
    title: slide.title,
    content: slide.content,
    notes: slide.notes,
    format: options.format,
    enhanced: true,
    interactive: options.addInteractivity,
  }
}

function createDemoContent(demoSlides: ParsedSlide[]): any {
  return {
    slides: demoSlides,
    timestamps: demoSlides.map((slide, index) => ({
      time: index * 120, // 2 minutes per demo slide
      title: slide.title,
      slideNumber: slide.slideNumber,
    })),
  }
}

function createExercises(exerciseSlides: ParsedSlide[]): any {
  return {
    instructions: exerciseSlides.map(slide => slide.content).flat(),
    starterCode: '', // Would be extracted from slide content
    hints: exerciseSlides.map(slide => slide.notes).filter(Boolean),
  }
}

async function processAssets(slides: ParsedSlide[]): Promise<Asset[]> {
  const assets: Asset[] = []
  
  slides.forEach(slide => {
    slide.content.forEach(content => {
      if (content.type === 'image') {
        assets.push({
          type: 'image',
          src: content.data.src,
          path: `/assets/images/${content.data.src}`,
        })
      }
    })
  })
  
  return assets
}

function calculateDuration(slides: ParsedSlide[]): number {
  // Estimate 2 minutes per slide
  return slides.length * 2
}

function formatText(text: string): string {
  // Convert bullet points
  text = text.replace(/^• /gm, '<li>')
  if (text.includes('<li>')) {
    text = `<ul>${text}</ul>`
  }
  
  // Convert line breaks
  text = text.replace(/\n/g, '<br>')
  
  return text
}

function renderTable(data: any): string {
  // Implement table rendering
  return '<table>...</table>'
}

function renderChart(data: any): string {
  // Implement chart rendering with Chart.js or similar
  return '<canvas class="chart">...</canvas>'
}

function getThemeStyles(theme: string): string {
  const themes: Record<string, string> = {
    academy: `
/* Academy Theme */
.slide-title {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-content li {
  position: relative;
  padding-left: 1.5rem;
}

.text-content li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--secondary-color);
  font-weight: bold;
}
    `,
    dark: `
/* Dark Theme */
:root {
  --text-color: #F9FAFB;
  --bg-color: #111827;
}
    `,
    minimal: `
/* Minimal Theme */
.slide-content {
  max-width: 800px;
}

.slide-title {
  font-weight: 400;
  color: var(--text-color);
}
    `,
  }
  
  return themes[theme] || themes.academy
}


