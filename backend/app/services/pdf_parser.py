import fitz  # PyMuPDF

def extract_text_from_pdf(file_path: str) -> str:
    """Extracts text from a given PDF file."""
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
        doc.close()
    except Exception as e:
        print(f"Error reading PDF: {e}")
    return text.strip()
