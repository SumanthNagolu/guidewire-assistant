#!/bin/bash
# ================================================================
# GUIDEWIRE GURU - COMPLETE INGESTION PIPELINE
# ================================================================
# Runs the complete knowledge base ingestion process:
# 1. Extract content from all formats (Python)
# 2. Chunk and embed content (TypeScript)
# 3. Upload to Supabase
#
# Usage:
#   ./scripts/ingest-all.sh <input_directory>
#
# Example:
#   ./scripts/ingest-all.sh ~/guidewire-knowledge
# ================================================================

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check arguments
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: No input directory specified${NC}"
    echo "Usage: ./scripts/ingest-all.sh <input_directory>"
    echo "Example: ./scripts/ingest-all.sh ~/guidewire-knowledge"
    exit 1
fi

INPUT_DIR="$1"
EXTRACTED_DIR="./extracted-knowledge"

# Check if input directory exists
if [ ! -d "$INPUT_DIR" ]; then
    echo -e "${RED}❌ Error: Directory '$INPUT_DIR' does not exist${NC}"
    exit 1
fi

# Print header
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}║         GUIDEWIRE GURU - KNOWLEDGE INGESTION           ║${NC}"
echo -e "${BLUE}║                                                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Check Python dependencies
echo -e "${YELLOW}🔍 Checking Python dependencies...${NC}"
if ! python3 -c "import pptx, PyPDF2, docx" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Missing Python packages. Installing...${NC}"
    pip3 install python-pptx PyPDF2 python-docx
fi
echo -e "${GREEN}✓ Python dependencies OK${NC}\n"

# Check environment variables
echo -e "${YELLOW}🔍 Checking environment variables...${NC}"
if [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}❌ Error: OPENAI_API_KEY not set${NC}"
    exit 1
fi
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo -e "${RED}❌ Error: NEXT_PUBLIC_SUPABASE_URL not set${NC}"
    exit 1
fi
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo -e "${RED}❌ Error: SUPABASE_SERVICE_ROLE_KEY not set${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Environment variables OK${NC}\n"

# Create extracted directory
mkdir -p "$EXTRACTED_DIR"

# Step 1: Extract content
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 1: EXTRACTING CONTENT${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

python3 scripts/extract-content.py "$INPUT_DIR" "$EXTRACTED_DIR"

if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ Extraction failed${NC}"
    exit 1
fi

# Step 2: Chunk and embed
echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}STEP 2: CHUNKING & EMBEDDING${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

npx tsx scripts/chunk-and-embed.ts "$EXTRACTED_DIR"

if [ $? -ne 0 ]; then
    echo -e "\n${RED}❌ Embedding failed${NC}"
    exit 1
fi

# Success
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║                   ✅ INGESTION COMPLETE!                ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}║     The Guidewire Guru is ready to answer questions    ║${NC}"
echo -e "${GREEN}║                                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

# Cleanup option
read -p "Delete extracted JSON files? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf "$EXTRACTED_DIR"
    echo -e "${GREEN}✓ Cleaned up temporary files${NC}"
fi

echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Start the dev server: npm run dev"
echo "2. Navigate to: http://localhost:3000/companions/guidewire-guru"
echo "3. Start chatting with The Guidewire Guru!"

