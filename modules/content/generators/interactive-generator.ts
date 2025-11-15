import type { InteractiveElement } from '@/types/content'

export interface InteractiveContentOptions {
  type: 'diagram' | 'simulation' | 'code-playground' | 'quiz'
  [key: string]: any
}

export async function createInteractiveElements(
  options: InteractiveContentOptions
): Promise<InteractiveElement[]> {
  switch (options.type) {
    case 'diagram':
      return createInteractiveDiagram(options)
    case 'simulation':
      return createSimulation(options)
    case 'code-playground':
      return createCodePlayground(options)
    case 'quiz':
      return createInteractiveQuiz(options)
    default:
      throw new Error(`Unknown interactive type: ${options.type}`)
  }
}

async function createInteractiveDiagram(options: any): Promise<InteractiveElement[]> {
  const elements: InteractiveElement[] = []
  
  // Create hotspots for the diagram
  if (options.hotspots) {
    options.hotspots.forEach((hotspot: any, index: number) => {
      elements.push({
        id: `hotspot-${index}`,
        type: 'hotspot',
        position: {
          x: hotspot.x,
          y: hotspot.y,
        },
        content: {
          label: hotspot.label,
          description: hotspot.description,
          details: hotspot.details,
        },
        interactions: {
          hover: 'tooltip',
          click: 'modal',
        },
      })
    })
  }
  
  return elements
}

async function createSimulation(options: any): Promise<InteractiveElement[]> {
  return [{
    id: 'simulation-1',
    type: 'simulation',
    content: {
      scenario: options.scenario,
      initialState: options.initialState,
      actions: options.actions,
      validations: options.validations,
    },
    interactions: {
      click: 'execute',
      input: 'update-state',
    },
  }]
}

async function createCodePlayground(options: any): Promise<InteractiveElement[]> {
  return [{
    id: 'playground-1',
    type: 'code',
    content: {
      language: options.language || 'javascript',
      initialCode: options.initialCode || '',
      solution: options.solution,
      testCases: options.testCases || [],
      hints: options.hints || [],
    },
    interactions: {
      input: 'code-change',
      click: 'run-code',
    },
  }]
}

async function createInteractiveQuiz(options: any): Promise<InteractiveElement[]> {
  return [{
    id: 'quiz-1',
    type: 'quiz',
    content: {
      questions: options.questions || [],
      settings: {
        randomize: options.randomize || false,
        showFeedback: options.showFeedback || true,
        allowRetry: options.allowRetry || true,
      },
    },
    interactions: {
      click: 'select-answer',
    },
  }]
}

export function generateInteractiveHTML(
  elements: InteractiveElement[],
  baseImage?: string
): string {
  const html = `
<div class="interactive-container" data-interactive="true">
  ${baseImage ? `<img src="${baseImage}" class="base-image" alt="Interactive diagram" />` : ''}
  <div class="interactive-layer">
    ${elements.map(element => renderInteractiveElement(element)).join('\n')}
  </div>
  <div class="interaction-feedback"></div>
</div>
  `
  
  return html
}

function renderInteractiveElement(element: InteractiveElement): string {
  switch (element.type) {
    case 'hotspot':
      return renderHotspot(element)
    case 'quiz':
      return renderQuizElement(element)
    case 'code':
      return renderCodePlayground(element)
    case 'simulation':
      return renderSimulation(element)
    default:
      return ''
  }
}

function renderHotspot(element: InteractiveElement): string {
  const { position, content } = element
  
  return `
<div class="hotspot" 
     data-id="${element.id}"
     style="left: ${position?.x}px; top: ${position?.y}px;"
     data-content='${JSON.stringify(content)}'>
  <div class="hotspot-marker">
    <div class="hotspot-pulse"></div>
    <div class="hotspot-center"></div>
  </div>
  <div class="hotspot-tooltip">
    <h4>${content.label}</h4>
    <p>${content.description}</p>
  </div>
</div>
  `
}

function renderQuizElement(element: InteractiveElement): string {
  const { content } = element
  
  return `
<div class="interactive-quiz" data-id="${element.id}">
  ${content.questions.map((q: any, idx: number) => `
    <div class="quiz-question" data-question-id="${idx}">
      <h3>${idx + 1}. ${q.question}</h3>
      <div class="quiz-options">
        ${q.options.map((opt: string, optIdx: number) => `
          <label class="quiz-option">
            <input type="radio" name="q${idx}" value="${optIdx}" />
            <span>${opt}</span>
          </label>
        `).join('')}
      </div>
    </div>
  `).join('')}
  <button class="quiz-submit">Submit Answers</button>
</div>
  `
}

function renderCodePlayground(element: InteractiveElement): string {
  const { content } = element
  
  return `
<div class="code-playground" data-id="${element.id}">
  <div class="code-editor">
    <div class="code-header">
      <span class="language-tag">${content.language}</span>
      <button class="run-code-btn">Run Code</button>
    </div>
    <textarea class="code-input" rows="10">${content.initialCode}</textarea>
  </div>
  <div class="code-output">
    <div class="output-header">Output</div>
    <pre class="output-content"></pre>
  </div>
  ${content.hints.length > 0 ? `
    <div class="code-hints">
      <button class="show-hint-btn">Show Hint</button>
      <div class="hint-content" style="display: none;"></div>
    </div>
  ` : ''}
</div>
  `
}

function renderSimulation(element: InteractiveElement): string {
  const { content } = element
  
  return `
<div class="simulation-container" data-id="${element.id}">
  <div class="simulation-canvas">
    <div class="simulation-state" data-state='${JSON.stringify(content.initialState)}'>
      <!-- Simulation UI will be rendered here -->
    </div>
  </div>
  <div class="simulation-controls">
    ${content.actions.map((action: any) => `
      <button class="sim-action" data-action="${action.id}">
        ${action.label}
      </button>
    `).join('')}
  </div>
  <div class="simulation-feedback"></div>
</div>
  `
}

export function generateInteractiveCSS(): string {
  return `
/* Interactive Container */
.interactive-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.interactive-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.interactive-layer > * {
  pointer-events: all;
}

/* Hotspots */
.hotspot {
  position: absolute;
  cursor: pointer;
}

.hotspot-marker {
  position: relative;
  width: 30px;
  height: 30px;
}

.hotspot-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.4);
  animation: pulse 2s infinite;
}

.hotspot-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #3B82F6;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.hotspot-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  white-space: nowrap;
  z-index: 1000;
}

.hotspot:hover .hotspot-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-10px);
}

/* Interactive Quiz */
.interactive-quiz {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.quiz-question {
  margin-bottom: 24px;
}

.quiz-question h3 {
  margin-bottom: 16px;
  color: #1F2937;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quiz-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quiz-option:hover {
  background: #EFF6FF;
  border-color: #3B82F6;
}

.quiz-option input {
  margin-right: 12px;
}

.quiz-submit {
  background: #3B82F6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.quiz-submit:hover {
  background: #2563EB;
}

/* Code Playground */
.code-playground {
  background: #1F2937;
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #111827;
  border-bottom: 1px solid #374151;
}

.language-tag {
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 500;
}

.run-code-btn {
  background: #10B981;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.run-code-btn:hover {
  background: #059669;
}

.code-input {
  width: 100%;
  background: #1F2937;
  color: #F9FAFB;
  border: none;
  padding: 16px;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.code-output {
  border-top: 1px solid #374151;
}

.output-header {
  padding: 12px 16px;
  background: #111827;
  color: #9CA3AF;
  font-size: 14px;
  font-weight: 500;
}

.output-content {
  padding: 16px;
  color: #F9FAFB;
  font-family: 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
  min-height: 100px;
}

/* Simulation */
.simulation-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.simulation-canvas {
  padding: 24px;
  background: #F9FAFB;
  min-height: 300px;
}

.simulation-controls {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-top: 1px solid #E5E7EB;
}

.sim-action {
  background: #3B82F6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.sim-action:hover {
  background: #2563EB;
}
  `
}

export function generateInteractiveJS(): string {
  return `
// Interactive Elements Controller
class InteractiveController {
  constructor() {
    this.initHotspots();
    this.initQuizzes();
    this.initCodePlaygrounds();
    this.initSimulations();
  }
  
  initHotspots() {
    document.querySelectorAll('.hotspot').forEach(hotspot => {
      hotspot.addEventListener('click', (e) => {
        const content = JSON.parse(hotspot.dataset.content);
        this.showModal(content);
      });
    });
  }
  
  initQuizzes() {
    document.querySelectorAll('.quiz-submit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const quiz = e.target.closest('.interactive-quiz');
        this.submitQuiz(quiz);
      });
    });
  }
  
  initCodePlaygrounds() {
    document.querySelectorAll('.run-code-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const playground = e.target.closest('.code-playground');
        this.runCode(playground);
      });
    });
  }
  
  initSimulations() {
    document.querySelectorAll('.sim-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const simulation = e.target.closest('.simulation-container');
        const action = e.target.dataset.action;
        this.executeSimulationAction(simulation, action);
      });
    });
  }
  
  showModal(content) {
    // Implementation for showing modal with content details
      }
  
  submitQuiz(quiz) {
    // Implementation for quiz submission and scoring
      }
  
  runCode(playground) {
    // Implementation for running code in sandbox
    const code = playground.querySelector('.code-input').value;
      }
  
  executeSimulationAction(simulation, action) {
    // Implementation for simulation interactions
      }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  new InteractiveController();
});
  `
}


