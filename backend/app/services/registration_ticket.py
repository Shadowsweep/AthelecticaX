import datetime
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
    """Generate a highly stylized sci-fi HUD registration ticket PDF."""
    TICKET_DIR.mkdir(parents=True, exist_ok=True)
    path = TICKET_DIR / f"{employee_code}_registration_ticket.pdf"
    
    issue_date = datetime.date.today().strftime("%b %d, %Y")
    # deterministic ticket number
    hash_val = hash(employee_code + name)
    ticket_num = f"{abs(hash_val) % 1000000000:09d}"

    commands = []
    
    # 1. Background Fill (Dark HUD gray-blue)
    commands.append("0.05 0.07 0.11 rg 0 0 800 450 re f")
    
    # 2. Grid lines
    commands.append("0.08 0.11 0.18 RG 0.5 w")
    for offset in range(0, 800, 100):
        commands.append(f"{offset} 0 m {offset} 450 l S")
    for offset in range(0, 450, 50):
        commands.append(f"0 {offset} m 800 {offset} l S")
        
    # 3. Outer Tech Frame
    commands.append("0.0 0.8 1.0 RG 2 w")
    commands.append("40 30 720 390 re S")
    
    # Inner border line
    commands.append("1 1 1 RG 0.5 w")
    commands.append("45 35 710 380 re S")
    
    # Corners
    commands.append("0.0 0.8 1.0 RG 2 w")
    commands.append("40 400 m 60 400 l S 40 400 m 40 380 l S")
    commands.append("760 400 m 740 400 l S 760 400 m 760 380 l S")
    commands.append("40 50 m 60 50 l S 40 50 m 40 70 l S")
    commands.append("760 50 m 740 50 l S 760 50 m 760 70 l S")
    
    # Side panel highlighted lines
    commands.append("0.0 0.8 1.0 RG 3 w")
    commands.append("40 180 m 40 270 l S")
    commands.append("760 180 m 760 270 l S")
    
    # 4. Logo Icon and Text
    commands.append("0.0 0.8 1.0 RG 3.5 w")
    commands.append("305 397 m 295 375 l 315 375 l h S")
    commands.append("300 383 m 310 383 l S")
    
    commands.append("BT /F2 26 Tf 1 1 1 rg 325 380 Td (ATHLETICAX) Tj ET")
    commands.append("BT /F2 11 Tf 0 0.8 1 rg 325 362 Td (REGISTRATION TICKET) Tj ET")
    
    # 5. Avatar Circle (Left Side)
    # Outer circle border (center 260, 230 radius 70)
    commands.append("0.0 0.8 1.0 RG 2 w")
    commands.append("260 300 m")
    commands.append("298.66 300 330 268.66 330 230 c")
    commands.append("330 191.34 298.66 160 260 160 c")
    commands.append("221.34 160 190 191.34 190 230 c")
    commands.append("190 268.66 221.34 300 260 300 c S")
    
    # Background circle fill
    commands.append("0.10 0.14 0.22 rg")
    commands.append("260 299 m")
    commands.append("298.1 299 329 268.1 329 230 c")
    commands.append("329 191.9 298.1 161 260 161 c")
    commands.append("221.9 161 191 191.9 191 230 c")
    commands.append("191 268.1 221.9 299 260 299 c f")
    
    # Silhouette head
    commands.append("0.45 0.55 0.65 rg")
    commands.append("260 268 m")
    commands.append("271.05 268 280 259.05 280 248 c")
    commands.append("280 236.95 271.05 228 260 228 c")
    commands.append("248.95 228 240 236.95 240 248 c")
    commands.append("240 259.05 248.95 268 260 268 c f")
    
    # Silhouette shoulders
    commands.append("0.45 0.55 0.65 rg")
    commands.append("212 176 m")
    commands.append("222 205 240 218 260 218 c")
    commands.append("280 218 298 205 308 176 c")
    commands.append("308 171 l 212 171 l h f")
    
    # Checkmark Badge on avatar
    commands.append("0.0 0.8 0.4 rg")
    commands.append("310 194 m")
    commands.append("317.73 194 324 187.73 324 180 c")
    commands.append("324 172.27 317.73 166 310 166 c")
    commands.append("302.27 166 296 172.27 296 180 c")
    commands.append("296 187.73 302.27 194 310 194 c f")
    
    commands.append("1 1 1 RG 2.5 w")
    commands.append("304 180 m 308 176 l 316 184 l S")
    
    # 6. Details Card Container (Right Side)
    commands.append("0.06 0.08 0.13 rg")
    commands.append("400 145 320 170 re f")
    
    commands.append("0.2 0.35 0.45 RG 1 w")
    commands.append("400 145 320 170 re S")
    
    # Detail rows text
    commands.append(f"BT /F2 11 Tf 0.7 0.85 1.0 rg 420 285 Td (Employee ID:) Tj ET")
    commands.append(f"BT /F1 11 Tf 1 1 1 rg 525 285 Td ({_escape(employee_code)}) Tj ET")
    
    commands.append(f"BT /F2 11 Tf 0.7 0.85 1.0 rg 420 255 Td (Name:) Tj ET")
    commands.append(f"BT /F1 11 Tf 1 1 1 rg 525 255 Td ({_escape(name)}) Tj ET")
    
    commands.append(f"BT /F2 11 Tf 0.7 0.85 1.0 rg 420 225 Td (Email:) Tj ET")
    commands.append(f"BT /F1 11 Tf 1 1 1 rg 525 225 Td ({_escape(email)}) Tj ET")
    
    commands.append(f"BT /F2 11 Tf 0.7 0.85 1.0 rg 420 195 Td (Department:) Tj ET")
    commands.append(f"BT /F1 11 Tf 1 1 1 rg 525 195 Td ({_escape(department)}) Tj ET")
    
    commands.append(f"BT /F2 11 Tf 0.7 0.85 1.0 rg 420 165 Td (Designation:) Tj ET")
    commands.append(f"BT /F1 11 Tf 1 1 1 rg 525 165 Td ({_escape(designation)}) Tj ET")
    
    # 7. Status Pill (Center Bottom)
    commands.append("0.0 0.8 0.4 RG 2 w")
    commands.append("335 125 m 465 125 l")
    commands.append("465 125 480 125 480 110 c 480 95 465 95 465 95 c")
    commands.append("465 95 335 95 l")
    commands.append("335 95 320 95 320 110 c 320 125 335 125 335 125 c S")
    
    commands.append("0.02 0.12 0.06 rg")
    commands.append("335 124 m 465 124 l")
    commands.append("465 124 479 124 479 110 c 479 96 465 96 465 96 c")
    commands.append("465 96 335 96 l")
    commands.append("335 96 321 96 321 110 c 321 124 335 124 335 124 c f")
    
    commands.append("BT /F2 11 Tf 0.0 0.8 0.4 rg 338 105 Td (STATUS: APPROVED) Tj ET")
    
    # Status Checkmark Circle
    commands.append("0.0 0.8 0.4 rg")
    commands.append("500 122 m")
    commands.append("506.63 122 512 116.63 512 110 c")
    commands.append("512 103.37 506.63 98 500 98 c")
    commands.append("493.37 98 488 103.37 488 110 c")
    commands.append("488 116.63 493.37 122 500 122 c f")
    
    commands.append("1 1 1 RG 2.5 w")
    commands.append("495 110 m 498 107 l 504 115 l S")
    
    # 8. Date and visual barcode representation (Bottom Left)
    commands.append(f"BT /F1 9 Tf 0.5 0.6 0.7 rg 55 75 Td (Issued: {issue_date}) Tj ET")
    commands.append(f"BT /F1 9 Tf 0.5 0.6 0.7 rg 55 60 Td (Ticket Number: {ticket_num}) Tj ET")
    
    # Visual barcode lines
    commands.append("0.2 0.35 0.45 rg")
    commands.append("650 60 4 15 re f")
    commands.append("658 60 2 15 re f")
    commands.append("663 60 6 15 re f")
    commands.append("672 60 1 15 re f")
    commands.append("676 60 5 15 re f")
    commands.append("684 60 3 15 re f")
    
    # Top-right date
    commands.append(f"BT /F1 9 Tf 0.5 0.6 0.7 rg 680 405 Td (Issued: {issue_date}) Tj ET")
    
    stream = "\n".join(commands).encode("latin-1", errors="replace")
    
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 800 450] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
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
