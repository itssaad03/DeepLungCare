import subprocess
import json

def test_generate_report():
    # Sample data and template
    data = {
        "serialNumber": "0001",
        "patientName": "John Doe",
        "age": 45,
        "disease": "Pneumonia",
        "lastVisitDate": "2024-06-01"
    }
    template = (
        "Patient Name: [patientName]\\n"
        "Age: [age]\\n"
        "Detected Disease: [disease]\\n"
        "Last Visit: [lastVisitDate]\\n"
        "Summary: The patient shows signs of pneumonia."
    )

    # Prepare input JSON
    input_json = json.dumps({
        "data": data,
        "template": template
    })

    # Run report.py as subprocess
    process = subprocess.Popen(
        ["python", "server/python/report.py"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    stdout, stderr = process.communicate(input=input_json)

    if process.returncode != 0:
        print("Report generation failed with error:")
        print(stderr)
        return

    # Print base64 PDF output (stdout)
    print("Base64 PDF output:")
    print(stdout[:200] + "...")  # Print first 200 chars for brevity

    # Print summary info from stderr
    print("Summary info (from stderr):")
    print(stderr)

if __name__ == "__main__":
    test_generate_report()
