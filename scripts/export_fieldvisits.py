"""
Export field-visit / attendance records from Firestore to an Excel file.

Requires:  pip install firebase-admin openpyxl
Run:       python scripts/export_fieldvisits.py
"""

# ====== EDIT THESE TWO DATES (format: YYYY-MM-DD) ======
START_DATE = "2026-08-01"
END_DATE = "2026-08-31"
# =======================================================

import glob
import os
from datetime import datetime, timedelta, timezone
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from openpyxl import Workbook

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = "d:/pratik/aankhondekha"

# Records are stored as UTC ISO strings (new Date().toISOString()), but the
# dates above — and the times we report — are Indian Standard Time.
IST = timezone(timedelta(hours=5, minutes=30))


def _to_utc_iso(dt):
    """Format an aware datetime the same way the app writes timestamps."""
    u = dt.astimezone(timezone.utc)
    return f"{u.strftime('%Y-%m-%dT%H:%M:%S')}.{u.microsecond // 1000:03d}Z"


def ist_day_bounds(start_date, end_date):
    """UTC ISO bounds covering the full IST days start_date..end_date."""
    lo = datetime.fromisoformat(f"{start_date}T00:00:00").replace(tzinfo=IST)
    hi = datetime.fromisoformat(f"{end_date}T23:59:59.999000").replace(tzinfo=IST)
    return _to_utc_iso(lo), _to_utc_iso(hi)


def to_ist(stamp):
    """Parse a stored UTC timestamp into a naive IST datetime for Excel."""
    if not isinstance(stamp, str) or not stamp:
        return stamp or ""
    try:
        dt = datetime.fromisoformat(stamp.replace("Z", "+00:00"))
    except ValueError:
        return stamp
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(IST).replace(tzinfo=None, microsecond=0)


def find_service_account():
    env = os.environ.get("SERVICE_ACCOUNT")
    if env:
        return env
    hits = glob.glob(os.path.join(ROOT, "*firebase-adminsdk*.json"))
    if not hits:
        raise SystemExit("Service account key (*firebase-adminsdk*.json) not found in project root.")
    return hits[0]


def main():
    firebase_admin.initialize_app(credentials.Certificate(find_service_account()))
    db = firestore.client()

    lo, hi = ist_day_bounds(START_DATE, END_DATE)
    docs = (
        db.collection("fieldVisits")
        .where(filter=FieldFilter("timestamp", ">=", lo))
        .where(filter=FieldFilter("timestamp", "<=", hi))
        .order_by("timestamp", direction=firestore.Query.DESCENDING)
        .stream()
    )

    headers = [
        "Employee Name", "Mobile", "Category", "Date & Time (IST)",
        "Latitude", "Longitude", "Location Link", "Field Visit",
        "Customer Name", "Customer Address", "Pincode", "Notes", "Photo URL",
    ]

    wb = Workbook()
    ws = wb.active
    ws.title = "FieldVisits"
    ws.append(headers)

    count = 0
    for d in docs:
        r = d.to_dict()
        lat, lng = r.get("latitude"), r.get("longitude")
        ws.append([
            r.get("employeeName", ""),
            r.get("employeeMobile", ""),
            r.get("category", ""),
            to_ist(r.get("timestamp", "")),
            lat if lat is not None else "",
            lng if lng is not None else "",
            f"https://www.google.com/maps?q={lat},{lng}" if lat is not None else "",
            "Yes" if r.get("isFieldVisit") else "No",
            r.get("customerName", ""),
            r.get("customerAddress", ""),
            r.get("pincode", ""),
            r.get("notes", ""),
            r.get("photoUrl", ""),
        ])
        count += 1

    # Column D holds real datetimes — show them instead of Excel's serial number.
    for (cell,) in ws.iter_rows(min_row=2, min_col=4, max_col=4):
        cell.number_format = "dd-mm-yyyy hh:mm:ss"
    ws.column_dimensions["D"].width = 20

    out = os.path.join(OUT_DIR, f"field_visits_{START_DATE}_to_{END_DATE}.xlsx")
    wb.save(out)
    print(f"Found {count} field-visit records from {START_DATE} to {END_DATE}.")
    print("Saved:", out)


if __name__ == "__main__":
    main()
