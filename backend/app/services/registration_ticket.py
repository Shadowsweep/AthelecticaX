from pathlib import Path


TICKET_DIR = Path(__file__).resolve().parent.parent.parent / "registration_tickets"


def _escape(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def generate_registration_ticket(
    employee_code: str,
    name: str,
    email: str,
    department: str,
    designation: str,
) -> str:
    """Generate a small dependency-free PDF registration ticket."""
    TICKET_DIR.mkdir(parents=True, exist_ok=True)
    path = TICKET_DIR / f"{employee_code}_registration_ticket.pdf"
    lines = [
        "ATHLETICAX REGISTRATION TICKET",
        f"Employee ID: {employee_code}",
        f"Name: {name}",
        f"Email: {email}",
        f"Department: {department}",
        f"Designation: {designation}",
        "Status: APPROVED",
    ]
    commands = ["BT", "/F1 18 Tf", "72 760 Td", f"({_escape(lines[0])}) Tj", "/F1 11 Tf"]
    for line in lines[1:]:
        commands.extend(["0 -32 Td", f"({_escape(line)}) Tj"])
    commands.append("ET")
    stream = "\n".join(commands).encode("latin-1", errors="replace")
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, obj in enumerate(objects, 1):
        offsets.append(len(pdf))
        pdf.extend(f"{index} 0 obj\n".encode() + obj + b"\nendobj\n")
    xref = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode())
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())
    pdf.extend(f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF\n".encode())
    path.write_bytes(pdf)
    return str(path)
