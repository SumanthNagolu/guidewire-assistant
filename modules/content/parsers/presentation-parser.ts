import * as PPTX from 'pptxgenjs'
// Note: In production, use a proper PPT parsing library like python-pptx via API

export interface ParsedPresentation {
  slides: ParsedSlide[]
  metadata: PresentationMetadata
  hasVideo: boolean
  hasDemos: boolean
  speakerNotes: string[]
}

export interface ParsedSlide {
  slideNumber: number
  title: string
  content: SlideContent[]
  layout: string
  notes: string
  hasMedia: boolean
}

export interface SlideContent {
  type: 'text' | 'image' | 'shape' | 'chart' | 'table'
  data: any
  position: { x: number; y: number; width: number; height: number }
}

export interface PresentationMetadata {
  title: string
  author: string
  slideCount: number
  createdAt: string
  lastModified: string
  size: number
}

export async function parsePresentation(filePath: string): Promise<ParsedPresentation> {
  // This is a mock implementation
  // In production, you would:
  // 1. Use a library like python-pptx through a Python service
  // 2. Or use a Node.js library that can parse PPTX files
  // 3. Extract all text, images, layouts, and speaker notes

  const mockParsedData: ParsedPresentation = {
    slides: [
      {
        slideNumber: 1,
        title: 'Introduction to ClaimCenter',
        content: [
          {
            type: 'text',
            data: {
              text: 'Welcome to ClaimCenter Configuration',
              fontSize: 24,
              bold: true,
            },
            position: { x: 100, y: 100, width: 500, height: 50 },
          },
          {
            type: 'image',
            data: {
              src: 'logo.png',
              alt: 'ClaimCenter Logo',
            },
            position: { x: 300, y: 200, width: 200, height: 100 },
          },
        ],
        layout: 'title',
        notes: 'Introduce the concept of claims management',
        hasMedia: false,
      },
      {
        slideNumber: 2,
        title: 'Key Concepts',
        content: [
          {
            type: 'text',
            data: {
              text: '• Claim entities\n• Business rules\n• Workflow configuration',
              fontSize: 18,
              bullet: true,
            },
            position: { x: 50, y: 150, width: 600, height: 300 },
          },
        ],
        layout: 'content',
        notes: 'Explain each concept with examples',
        hasMedia: false,
      },
    ],
    metadata: {
      title: 'ClaimCenter Configuration',
      author: 'Training Team',
      slideCount: 2,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      size: 1024000, // 1MB
    },
    hasVideo: false,
    hasDemos: false,
    speakerNotes: [
      'Introduce the concept of claims management',
      'Explain each concept with examples',
    ],
  }

  return mockParsedData
}

export function categorizeSlides(slides: ParsedSlide[]): {
  theorySlides: ParsedSlide[]
  demoSlides: ParsedSlide[]
  exerciseSlides: ParsedSlide[]
} {
  const theorySlides: ParsedSlide[] = []
  const demoSlides: ParsedSlide[] = []
  const exerciseSlides: ParsedSlide[] = []

  slides.forEach(slide => {
    const titleLower = slide.title.toLowerCase()
    const hasCodeContent = slide.content.some(
      c => c.type === 'text' && c.data.text?.includes('```')
    )

    if (titleLower.includes('demo') || titleLower.includes('example')) {
      demoSlides.push(slide)
    } else if (
      titleLower.includes('exercise') || 
      titleLower.includes('practice') ||
      titleLower.includes('assignment')
    ) {
      exerciseSlides.push(slide)
    } else {
      theorySlides.push(slide)
    }
  })

  return { theorySlides, demoSlides, exerciseSlides }
}

export function extractTextContent(slides: ParsedSlide[]): string {
  return slides
    .map(slide => {
      const title = slide.title
      const content = slide.content
        .filter(c => c.type === 'text')
        .map(c => c.data.text)
        .join('\n')
      const notes = slide.notes
      
      return `${title}\n${content}\n${notes}`
    })
    .join('\n\n')
}

export function extractImages(slides: ParsedSlide[]): Array<{
  slideNumber: number
  imageSrc: string
  alt: string
}> {
  const images: Array<{
    slideNumber: number
    imageSrc: string
    alt: string
  }> = []

  slides.forEach(slide => {
    slide.content
      .filter(c => c.type === 'image')
      .forEach(c => {
        images.push({
          slideNumber: slide.slideNumber,
          imageSrc: c.data.src,
          alt: c.data.alt || `Image from slide ${slide.slideNumber}`,
        })
      })
  })

  return images
}

export function identifyDemoSlides(slides: ParsedSlide[]): number[] {
  return slides
    .filter(slide => {
      const titleLower = slide.title.toLowerCase()
      return (
        titleLower.includes('demo') ||
        titleLower.includes('walkthrough') ||
        titleLower.includes('example') ||
        slide.hasMedia
      )
    })
    .map(slide => slide.slideNumber)
}


