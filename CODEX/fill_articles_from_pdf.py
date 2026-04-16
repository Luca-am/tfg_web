import html
import re
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(r"c:\Users\Luca\OneDrive\Documents\GitHub\tfg_web")
BOOKS_DIR = ROOT / "bibliography" / "books"

ABSTRACT_HEADING = r"(?:abstract|resumen|resum)"
KEYWORDS_HEADING = r"(?:keywords?|palabras\s+clave|paraules\s+clau|descriptores)"
STOP_HEADING = r"(?:introducci[oó]n|introduction|metodolog[ií]a|methodology|results?|conclusions?|referencias?|references|sumario|index)"


def normalize_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def cleanup_abstract(text: str) -> str:
    text = normalize_spaces(text)
    text = re.sub(r"^(?:abstract|resumen|resum)\s*[:\-\.]?\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"\b(?:keywords?|palabras\s+clave|paraules\s+clau)\s*[:\-].*$", "", text, flags=re.IGNORECASE)
    return normalize_spaces(text)


def cleanup_keywords(text: str) -> str:
    text = text.replace("\r", "\n")
    # Keywords normally end at the first line break; what follows is often title/body.
    text = text.split("\n", 1)[0]
    text = re.sub(r"^(?:keywords?|palabras\s+clave|paraules\s+clau)\s*[:\-]?\s*", "", text, flags=re.IGNORECASE)
    text = re.split(r"\b(?:texto|text|abstract|resumen|resum)\b", text, flags=re.IGNORECASE)[0]
    text = re.split(r"\b(?:keywords?|palabras\s+clave|paraules\s+clau)\s*[:\-]", text, flags=re.IGNORECASE)[0]
    return normalize_spaces(text).strip(" ,;:")


def extract_pdf_text(pdf_path: Path, max_pages: int = 6) -> str:
    try:
        reader = PdfReader(str(pdf_path))
    except Exception:
        return ""

    chunks = []
    for page in reader.pages[:max_pages]:
        try:
            chunks.append(page.extract_text() or "")
        except Exception:
            continue
    return "\n".join(chunks)


def extract_abstract(raw: str) -> str:
    text = raw.replace("\r", "\n")
    pattern = re.compile(
        rf"(?is)(?:^|\n)\s*{ABSTRACT_HEADING}\s*[:\-\.]?\s*(.+?)(?=\n\s*(?:{KEYWORDS_HEADING}|{STOP_HEADING})\b|$)"
    )
    m = pattern.search(text)
    if not m:
        return ""
    return cleanup_abstract(m.group(1))


def extract_keywords(raw: str) -> str:
    text = raw.replace("\r", "\n")
    pattern = re.compile(
        rf"(?is)(?:^|\n)\s*{KEYWORDS_HEADING}\s*[:\-]\s*(.+?)(?=\n\s*(?:{STOP_HEADING}|{ABSTRACT_HEADING})\b|$)"
    )
    m = pattern.search(text)
    if not m:
        return ""

    kw = cleanup_keywords(m.group(1))
    return normalize_spaces(kw)


def find_pdf_path(html_text: str, html_file: Path) -> Path | None:
    m = re.search(r'href="([^"]+\.pdf)"', html_text, flags=re.IGNORECASE)
    if not m:
        m = re.search(r'iframe\s+src="([^"]+\.pdf)(?:#[^"]*)?"', html_text, flags=re.IGNORECASE)
    if not m:
        return None

    rel = m.group(1)
    rel = html.unescape(rel)
    pdf_path = (html_file.parent / rel).resolve()
    return pdf_path


def replace_span(html_text: str, label: str, value: str) -> str:
    escaped = html.escape(value, quote=False)
    pattern = re.compile(
        rf'(<li><strong>{label}</strong><span>)(.*?)(</span></li>)',
        flags=re.IGNORECASE | re.DOTALL,
    )
    return pattern.sub(rf"\1{escaped}\3", html_text, count=1)


def process_file(html_file: Path) -> tuple[bool, str]:
    text = html_file.read_text(encoding="utf-8")
    pdf_path = find_pdf_path(text, html_file)
    if not pdf_path or not pdf_path.exists():
        return False, "pdf_not_found"

    raw = extract_pdf_text(pdf_path)
    if not raw.strip():
        return False, "pdf_no_text"

    abstract = extract_abstract(raw)
    keywords = extract_keywords(raw)

    # Update only article-like entries where both are discoverable.
    if not abstract or not keywords:
        return False, "no_abstract_or_keywords"

    abstract = abstract[:520].rstrip(" ,;:")
    keywords = keywords[:220].rstrip(" ,;:")

    new_text = replace_span(text, "Sinopsi", abstract)
    new_text = replace_span(new_text, "Conceptes claus", keywords)

    if new_text != text:
        html_file.write_text(new_text, encoding="utf-8")
        return True, "updated"
    return False, "no_change"


def main() -> None:
    results = []
    for html_file in sorted(BOOKS_DIR.glob("*.html")):
        updated, reason = process_file(html_file)
        results.append((html_file.name, updated, reason))

    print("=== Fill summary ===")
    updated_count = sum(1 for _, u, _ in results if u)
    print(f"Updated: {updated_count}/{len(results)}")
    for name, updated, reason in results:
        tag = "UPDATED" if updated else "SKIP"
        print(f"{tag:7} {name} -> {reason}")


if __name__ == "__main__":
    main()
