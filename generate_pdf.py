from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate
import datetime

W, H = A4
ACCENT   = colors.HexColor("#f0a500")
DARK     = colors.HexColor("#0d1117")
TEAL     = colors.HexColor("#1abc9c")
BLUE     = colors.HexColor("#58a6ff")
PURPLE   = colors.HexColor("#bc8cff")
RED      = colors.HexColor("#ff6b6b")
LIGHT_BG = colors.HexColor("#f7f7fa")
TEXT     = colors.HexColor("#222222")
SUBTEXT  = colors.HexColor("#555555")
MUTED    = colors.HexColor("#888888")

def make_styles():
    base = getSampleStyleSheet()

    cover_title = ParagraphStyle("cover_title",
        fontName="Helvetica-Bold", fontSize=32, textColor=ACCENT,
        leading=38, spaceAfter=6)

    cover_sub = ParagraphStyle("cover_sub",
        fontName="Helvetica", fontSize=13, textColor=colors.HexColor("#bbbbbb"),
        leading=18, spaceAfter=4)

    cover_date = ParagraphStyle("cover_date",
        fontName="Helvetica-Oblique", fontSize=10, textColor=colors.HexColor("#888888"),
        leading=14, spaceAfter=0)

    section = ParagraphStyle("section",
        fontName="Helvetica-Bold", fontSize=13, textColor=ACCENT,
        spaceBefore=16, spaceAfter=6, leading=16)

    body = ParagraphStyle("body",
        fontName="Helvetica", fontSize=10.5, textColor=SUBTEXT,
        leading=16, spaceAfter=4, alignment=TA_JUSTIFY)

    bullet_title = ParagraphStyle("bullet_title",
        fontName="Helvetica-Bold", fontSize=10.5, textColor=TEXT,
        spaceBefore=4, spaceAfter=1, leading=14)

    bullet_body = ParagraphStyle("bullet_body",
        fontName="Helvetica", fontSize=10, textColor=SUBTEXT,
        leading=14, spaceAfter=2, leftIndent=10)

    box_title = ParagraphStyle("box_title",
        fontName="Helvetica-Bold", fontSize=11, textColor=ACCENT,
        leading=14, spaceAfter=4)

    box_item = ParagraphStyle("box_item",
        fontName="Helvetica", fontSize=10, textColor=SUBTEXT,
        leading=14, spaceAfter=1, leftIndent=8)

    adv_title = ParagraphStyle("adv_title",
        fontName="Helvetica-Bold", fontSize=10.5, textColor=TEAL,
        leading=14, spaceAfter=1)

    closing = ParagraphStyle("closing",
        fontName="Helvetica-Bold", fontSize=12, textColor=colors.HexColor("#503c00"),
        alignment=TA_CENTER, leading=16, spaceAfter=4)

    closing_sub = ParagraphStyle("closing_sub",
        fontName="Helvetica", fontSize=10, textColor=colors.HexColor("#705020"),
        alignment=TA_CENTER, leading=14)

    return dict(
        cover_title=cover_title, cover_sub=cover_sub, cover_date=cover_date,
        section=section, body=body,
        bullet_title=bullet_title, bullet_body=bullet_body,
        box_title=box_title, box_item=box_item,
        adv_title=adv_title, closing=closing, closing_sub=closing_sub
    )

def cover_block(s):
    date_str = datetime.date.today().strftime("%B %Y")
    cover_tbl = Table(
        [[Paragraph("DumperTrack", s["cover_title"])],
         [Paragraph("Smart Management Software for Transport & Dumper Businesses", s["cover_sub"])],
         [Paragraph(f"Product Overview  ·  {date_str}", s["cover_date"])]],
        colWidths=[170*mm]
    )
    cover_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), DARK),
        ("TOPPADDING",    (0,0), (-1, 0), 14),
        ("BOTTOMPADDING", (0,-1), (-1,-1), 14),
        ("LEFTPADDING",  (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("LINEBELOW", (0,-1), (-1,-1), 3, ACCENT),
    ]))
    return cover_tbl

def hr(color=ACCENT, thickness=0.5):
    return HRFlowable(width="100%", thickness=thickness, color=color, spaceAfter=6)

def feature_box(title, points, accent, s):
    title_cell = Paragraph(title, ParagraphStyle("bt",
        fontName="Helvetica-Bold", fontSize=11, textColor=accent, leading=14))
    rows = [[title_cell]]
    for pt in points:
        rows.append([Paragraph(f"•   {pt}", s["box_item"])])
    tbl = Table(rows, colWidths=[158*mm])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_BG),
        ("LINEBEFORE", (0,0), (-1,-1), 3, accent),
        ("TOPPADDING",    (0,0), (-1, 0), 8),
        ("BOTTOMPADDING", (0,-1), (-1,-1), 8),
        ("TOPPADDING",    (0,1), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (0, 0), 4),
        ("LEFTPADDING",   (0,0), (-1,-1), 10),
        ("RIGHTPADDING",  (0,0), (-1,-1), 8),
    ]))
    return KeepTogether([tbl, Spacer(1, 6*mm)])

def build_pdf(path):
    doc = SimpleDocTemplate(path, pagesize=A4,
                            leftMargin=20*mm, rightMargin=20*mm,
                            topMargin=18*mm, bottomMargin=18*mm)
    s = make_styles()
    story = []

    # Cover
    story.append(cover_block(s))
    story.append(Spacer(1, 8*mm))

    # What is DumperTrack
    story.append(Paragraph("What is DumperTrack?", s["section"]))
    story.append(hr())
    story.append(Paragraph(
        "DumperTrack is a simple, easy-to-use business management app designed specifically "
        "for transport companies, dumper operators, and fleet owners. Whether you run one truck "
        "or a fleet of twenty, DumperTrack helps you keep track of every trip, every rupee "
        "earned, every expense spent, and every vehicle you own — all in one place.",
        s["body"]))
    story.append(Paragraph(
        "No more paper registers. No more Excel confusion. Just open the app, log your trips, "
        "and let DumperTrack handle all the calculations automatically.",
        s["body"]))
    story.append(Spacer(1, 4*mm))

    # Who is it for
    story.append(Paragraph("Who Is It For?", s["section"]))
    story.append(hr())
    for title, desc in [
        ("Transport Firm Owners",
         "Get a complete view of your business — income, expenses, profit, vehicles, and team "
         "performance — all on one screen."),
        ("Partners & Co-owners",
         "Log daily trips, track personal earnings, and see your own profit without waiting "
         "for end-of-month calculations."),
        ("Multi-Firm Operators",
         "Running more than one business? DumperTrack supports multiple firms, each with their "
         "own separate data, partners, and vehicles."),
    ]:
        story.append(Paragraph(f"▸   {title}", s["bullet_title"]))
        story.append(Paragraph(desc, s["bullet_body"]))
    story.append(Spacer(1, 4*mm))

    # Key Features
    story.append(Paragraph("Key Features", s["section"]))
    story.append(hr())

    story.append(feature_box("Trip Management", [
        "Record every trip with client name, driver, vehicle, location, and material carried.",
        "Income is calculated automatically the moment you enter number of trips and rate.",
        "Each entry is locked after saving — no accidental edits, full data integrity.",
        "Track how much the client has paid and how much is still pending.",
    ], BLUE, s))

    story.append(feature_box("Expense Tracking", [
        "Define your own expense types — Diesel, Driver Wages, Toll, or anything else.",
        "Enter actual expense amounts per trip — every cost is accounted for precisely.",
        "Net profit is calculated instantly: Total Income minus all expenses.",
    ], TEAL, s))

    story.append(feature_box("Vehicle Fleet & EMI Tracking", [
        "Maintain a complete register of vehicles: Dumper, Truck, JCB, Loader, Tractor, and more.",
        "Add EMI details for financed vehicles — monthly instalment amount, loan tenure, and bank note.",
        "Instantly see your total monthly EMI burden, outstanding loan balance, and loan completion status.",
        "Filter vehicles by type or EMI status (Active / Completed / No EMI).",
    ], PURPLE, s))

    story.append(feature_box("Credit & Debit Transactions", [
        "Record money coming in (advance payments, refunds, investments) as Credits.",
        "Record money going out (repairs, salaries, insurance, loan repayments) as Debits.",
        "View partner-wise breakdown — who received what and who spent what.",
        "Supports Cash, UPI, Bank Transfer, Cheque, and Card payment modes.",
    ], ACCENT, s))

    story.append(feature_box("Smart Filters Across Every Module", [
        "Trips: Search by client name, filter by partner, vehicle, or custom date range.",
        "Transactions: Filter by Credit or Debit, by partner, or by date range.",
        "Vehicles: Filter by vehicle type or EMI status in one click.",
        "Find exactly what you need instantly — no scrolling through hundreds of old entries.",
    ], RED, s))

    # Dashboard
    story.append(Paragraph("Dashboard — Everything at a Glance", s["section"]))
    story.append(hr())
    story.append(Paragraph(
        "The moment you log in, the Dashboard shows you a live summary of your business:",
        s["body"]))

    dash_items = [
        ["Total Income",   "All money earned from trips."],
        ["Total Expenses", "All costs deducted across trips."],
        ["My Net Profit",  "Your personal share — trip profits + credits − debits."],
        ["Total Trips",    "Number of trip entries logged across the firm."],
        ["Top Clients",    "Which clients are bringing in the most revenue."],
        ["Recent Entries", "The latest trip logs shown at a glance."],
    ]
    dash_tbl = Table(
        [[Paragraph(k, ParagraphStyle("dk", fontName="Helvetica-Bold", fontSize=10, textColor=ACCENT, leading=13)),
          Paragraph(v, ParagraphStyle("dv", fontName="Helvetica", fontSize=10, textColor=SUBTEXT, leading=13))]
         for k, v in dash_items],
        colWidths=[52*mm, 118*mm]
    )
    dash_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_BG),
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.white, LIGHT_BG]),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("GRID", (0,0), (-1,-1), 0.3, colors.HexColor("#dddddd")),
    ]))
    story.append(dash_tbl)
    story.append(Spacer(1, 5*mm))

    # Balance Sheet
    story.append(Paragraph("Balance Sheet", s["section"]))
    story.append(hr())
    story.append(Paragraph(
        "The Balance Sheet gives you the complete financial picture of your firm in one place: "
        "Gross Income, Total Expenses, Net Profit, income broken down client-by-client, expense "
        "breakdown by category, and each partner's individual contribution. Perfect for monthly "
        "reviews or sharing with an accountant.",
        s["body"]))
    story.append(Spacer(1, 4*mm))

    # Partner Management
    story.append(Paragraph("Partner Management", s["section"]))
    story.append(hr())
    story.append(Paragraph(
        "Add as many partners as your firm needs. Each partner has their own login and logs "
        "trips and transactions under their own name. Accountability is built in — you always "
        "know who entered what. The Admin manages all firms and partners from a single control panel.",
        s["body"]))
    story.append(Spacer(1, 4*mm))

    # Why DumperTrack
    story.append(Paragraph("Why Choose DumperTrack?", s["section"]))
    story.append(hr(TEAL))
    for title, desc in [
        ("No Accounting Knowledge Needed",
         "Everything is in plain language. If you can fill a paper register, you can use DumperTrack."),
        ("Real-Time Profit Calculation",
         "The moment you enter a trip, your profit is calculated instantly — no manual maths required."),
        ("Safe & Tamper-Proof Records",
         "Once a trip is saved, it cannot be deleted or changed. Your records are always trustworthy."),
        ("Works on Mobile & Desktop",
         "Access DumperTrack from your phone, tablet, or computer — anywhere, anytime."),
        ("Cloud-Backed Data",
         "Your data is stored securely in the cloud. Change your phone or device — your records stay safe."),
        ("Supports Multiple Businesses",
         "Manage multiple transport firms under one login, with fully separated data for each."),
    ]:
        story.append(Paragraph(f"✓   {title}", s["adv_title"]))
        story.append(Paragraph(desc, s["bullet_body"]))
    story.append(Spacer(1, 6*mm))

    # Closing CTA
    cta = Table(
        [[Paragraph("Ready to simplify your transport business?", s["closing"])],
         [Paragraph("Contact us to get DumperTrack set up for your firm today.", s["closing_sub"])]],
        colWidths=[170*mm]
    )
    cta.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), colors.HexColor("#fdf5e0")),
        ("BOX", (0,0), (-1,-1), 1, ACCENT),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ]))
    story.append(KeepTogether([cta]))

    doc.build(story)
    print(f"PDF generated: {path}")

build_pdf("/home/user/Bumper/DumperTrack_Client_Overview.pdf")
