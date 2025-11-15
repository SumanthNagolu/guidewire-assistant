export interface ContentBlock {
  type: 'theory' | 'demo' | 'practice' | 'project'
  title: string
  description?: string
  content: any
}

export interface TransformationResult {
  success: boolean
  content?: any
  metadata?: any
  error?: string
}

export interface VideoMetadata {
  duration: number
  format: string
  resolution: string
  size: number
  frameRate: number
}

export interface InteractiveElement {
  id: string
  type: 'hotspot' | 'quiz' | 'code' | 'simulation'
  position?: { x: number; y: number }
  content: any
  interactions: {
    hover?: string
    click?: string
    input?: string
  }
}

export interface LearningContent {
  id: string
  type: 'slide' | 'video' | 'interactive' | 'document'
  title: string
  description: string
  duration: number
  content: any
  metadata: Record<string, any>
}


