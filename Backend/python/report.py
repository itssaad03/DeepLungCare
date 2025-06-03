import json
import re
import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import tempfile
import requests
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from datetime import datetime
import logging

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def flatten(obj, prefix=''):
    items = {}
    for key, val in obj.items():
        full_key = f"{prefix}.{key}" if prefix else key
        if isinstance(val, dict):
            items.update(flatten(val, full_key))
        else:
            items[full_key] = val
    return items

def generate_report(template, data):
    flat_data = flatten(data)
    final_prompt = template
    for key, value in flat_data.items():
        final_prompt = final_prompt.replace(f'[{key}]', str(value))
    # Ensure the prompt explicitly asks for disease recommendation and summary
    if "recommend disease" not in final_prompt.lower():
        final_prompt += "\n\nPlease include a clear 'Recommended Disease' section and a 'Summary' section in the report."
    logging.debug(f"Final prompt for API: {final_prompt[:200]}...")  # Log first 200 chars
    return final_prompt

def call_openrouter_api(prompt):
    headers = {
        "Authorization": "Bearer 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",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "MedicalReportGenerator",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "meta-llama/llama-3.3-70b-instruct:free",
        "messages": [
            {"role": "system", "content": "You are a medical assistant that generates structured medical reports."},
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]

def extract_summary_info(report_text):
    """
    Extracts the summary, recommended disease, and last visit date from the report text.
    Improved with better validation and logging.
    """
    logging.debug("Extracting summary info from report text.")
    try:
        # Improved regex patterns to capture more variations and multiline summary
        disease_pattern = re.search(
            r"(?:Detected|Recommended|Diagnosed|Suspected|Identified|Possible)\s+[Dd]isease[:\-]?\s*(.+?)(?:\.|\n|$)",
            report_text, re.IGNORECASE)
        date_pattern = re.search(r"(?:Last\s+[Vv]isit[:\-]?\s*)(\d{4}-\d{2}-\d{2})", report_text)
        summary_pattern = re.search(r"(?:Summary[:\-]?\s*)([\s\S]+?)(?:\n\n|$)", report_text, re.IGNORECASE)

        recommended_disease = disease_pattern.group(1).strip() if disease_pattern else "Unknown"
        last_visit_date = date_pattern.group(1).strip() if date_pattern else None
        summary = summary_pattern.group(1).strip() if summary_pattern else "No summary found."

        # Validate last_visit_date format
        if last_visit_date:
            try:
                datetime.strptime(last_visit_date, '%Y-%m-%d')
            except ValueError:
                logging.warning(f"Invalid last_visit_date format: {last_visit_date}. Setting to today's date.")
                last_visit_date = None

        # If last_visit_date is None or invalid, set to today's date in YYYY-MM-DD format
        if not last_visit_date:
            last_visit_date = datetime.today().strftime('%Y-%m-%d')

        logging.debug(f"Extracted recommended_disease: {recommended_disease}")
        logging.debug(f"Extracted last_visit_date: {last_visit_date}")
        logging.debug(f"Extracted summary: {summary[:60]}...")  # Log first 60 chars

        return {
            "recommended_disease": recommended_disease,
            "last_visit_date": last_visit_date,
            "summary": summary
        }
    except Exception as e:
        logging.error(f"Error extracting summary info: {e}")
        return {
            "recommended_disease": "Unknown",
            "last_visit_date": datetime.today().strftime('%Y-%m-%d'),
            "summary": "No summary found due to extraction error."
        }

from reportlab.platypus import Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_CENTER
def save_pdf(report_text, filename):
    # Remove all occurrences of "--" and "==" from report_text
    cleaned_report_text = report_text.replace("--", "").replace("==", "")

    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=1*inch,
        leftMargin=1*inch,
        topMargin=1*inch,
        bottomMargin=1*inch
    )

    styles = getSampleStyleSheet()
    # Custom styles with unique names to avoid conflicts
    if 'CustomTitle' not in styles:
        styles.add(ParagraphStyle(name='CustomTitle', fontSize=18, leading=22, alignment=TA_CENTER, spaceAfter=20, spaceBefore=10, fontName='Helvetica-Bold'))
    if 'CustomSubtitle' not in styles:
        styles.add(ParagraphStyle(name='CustomSubtitle', fontSize=14, leading=18, alignment=TA_CENTER, spaceAfter=15, fontName='Helvetica-Oblique'))
    if 'CustomNormalIndent' not in styles:
        styles.add(ParagraphStyle(name='CustomNormalIndent', fontSize=11, leading=14, spaceAfter=10))
    story = []

    # Split the cleaned report text into paragraphs by double newlines only (remove "---" splitting)
    paragraphs = [p.strip() for p in cleaned_report_text.split('\n\n') if p.strip()]

    # Add Title and Subtitle from the template header if present
    # Assuming report always has title info
    story.append(Paragraph("DeepLungCare", styles['CustomTitle']))
    story.append(Paragraph("Specialized Pulmonary & Respiratory Care", styles['CustomSubtitle']))
    story.append(Spacer(1, 9))

    # Define main headings to bold (case insensitive)
    main_headings = [
        "Disease Detected",
        "Recommended Disease",
        "Clinical Findings",
        "Immediate Actions",
        "Disclaimer",
        "Report Generated On"
    ]

    for para in paragraphs:
        # Check if paragraph starts with any main heading
        is_heading = False
        for heading in main_headings:
            if para.lower().startswith(heading.lower()):
                is_heading = True
                heading_text = heading
                content_text = para[len(heading):].strip(" :.-")
                break

        if is_heading:
            # Add bold heading with normal font size
            story.append(Paragraph(f"<b>{heading_text}</b>", styles['CustomNormalIndent']))
            if content_text:
                story.append(Paragraph(content_text, styles['CustomNormalIndent']))
        else:
            # Normal paragraph
            story.append(Paragraph(para, styles['CustomNormalIndent']))

        story.append(Spacer(1, 12))

    doc.build(story)

def main():
    try:
        input_data = sys.stdin.read()
        input_json = json.loads(input_data)
        template = input_json.get("template", "")
        data = input_json.get("data", {})

        final_prompt = generate_report(template, data)
        report_text = call_openrouter_api(final_prompt)

        # Extract summary information
        summary_info = extract_summary_info(report_text)

        # Print summary info as JSON (simulate database insertion)
        print(json.dumps({
            "summary_info": summary_info
        }, indent=4), file=sys.stderr)  # Output to stderr to separate from PDF
        sys.stderr.flush()  # Ensure stderr is flushed immediately

        # Save PDF to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            save_pdf(report_text, tmp_file.name)
            pdf_path = tmp_file.name

        # Read PDF content as base64
        with open(pdf_path, "rb") as f:
            pdf_bytes = f.read()

        # Output base64 encoded PDF to stdout
        import base64
        encoded_pdf = base64.b64encode(pdf_bytes).decode('utf-8')
        print(encoded_pdf)

        # Clean up temp file
        os.remove(pdf_path)

    except Exception as e:
        logging.error(f"Error in main: {e}")
        print(f"Error: {e}", file=sys.stderr)
        sys.stderr.flush()
        sys.exit(1)

if __name__ == "__main__":
    main()
