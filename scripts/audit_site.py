from pathlib import Path
from urllib.parse import urlparse, unquote
from hashlib import sha256
from lxml import html
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
failures = []


def check(condition, message):
    if not condition:
        failures.append(message)


html_files = sorted(ROOT.rglob("*.html"))
text_files = [path for path in ROOT.rglob("*") if path.is_file() and path.suffix.lower() in {".html", ".js", ".css", ".xml", ".txt", ""} and ".git" not in path.parts]
all_text = "\n".join(path.read_text(encoding="utf-8", errors="ignore") for path in text_files).lower()
for token in (
    "".join(("readdy", ".ai")), "".join(("data-", "readdy")), "".join(("api/", "search-image")),
    "".join(("cdn.", "tailwind", "css.com")), "".join(("/", "check", "out")),
    "".join(("pay", "pal")), "".join(("master", "card")), "".join(("ri-", "visa")),
    "".join(("haccp", " certified")), "".join(("gmp", " certified")), "".join(("message", " sent")),
):
    check(token not in all_text, f"Forbidden dependency, claim or prototype behavior remains: {token}")

check((ROOT / "CNAME").read_text(encoding="utf-8") == "www.pureharvestfood.com", "CNAME is not exact")
certificate = ROOT / "assets/documents/certificate-of-incorporation.png"
check(certificate.exists(), "Certificate of Incorporation asset is missing")
if certificate.exists():
    check(sha256(certificate.read_bytes()).hexdigest().upper() == "3AAD483B029D43544B2760B2B69055043A85D12574ACFB52A2FB3A4437A66782", "Certificate of Incorporation asset changed")

titles, descriptions, canonicals = {}, {}, {}
for path in html_files:
    relative = path.relative_to(ROOT).as_posix()
    doc = html.fromstring(path.read_text(encoding="utf-8"))
    check(doc.get("lang") == "en-TT", f"{relative}: incorrect lang")
    check(len(doc.xpath("//h1")) == 1, f"{relative}: expected one H1")
    title = " ".join(doc.xpath("string(//title)").split())
    description = doc.xpath('string(//meta[@name="description"]/@content)')
    canonical = doc.xpath('string(//link[@rel="canonical"]/@href)')
    check(bool(title), f"{relative}: missing title")
    check(bool(description), f"{relative}: missing description")
    check(canonical.startswith("https://www.pureharvestfood.com/"), f"{relative}: bad canonical")
    if title:
        check(title not in titles, f"{relative}: duplicate title with {titles.get(title)}")
        titles[title] = relative
    if description:
        check(description not in descriptions, f"{relative}: duplicate description with {descriptions.get(description)}")
        descriptions[description] = relative
    if canonical:
        check(canonical not in canonicals, f"{relative}: duplicate canonical with {canonicals.get(canonical)}")
        canonicals[canonical] = relative
    check(bool(doc.xpath('//meta[@property="og:image"]')), f"{relative}: missing Open Graph image")
    check(bool(doc.xpath('//script[@type="application/ld+json"]')), f"{relative}: missing structured data")
    check(not doc.xpath('//a[@href="#"]'), f"{relative}: placeholder link remains")
    check(not doc.xpath('//*[@action]'), f"{relative}: form action remains")
    check(not doc.xpath('//input[contains(translate(@name,"CARD","card"),"card")]'), f"{relative}: card field remains")

    for image in doc.xpath("//img"):
        source = image.get("src", "")
        check(bool(image.get("alt")), f"{relative}: image missing alt text")
        check(bool(image.get("width") and image.get("height")), f"{relative}: image missing dimensions: {source}")
        check(not source.startswith("http"), f"{relative}: external image remains: {source}")
        if source.startswith("/"):
            check((ROOT / source.lstrip("/")).exists(), f"{relative}: missing image {source}")

    for element in doc.xpath('//*[@src]'):
        source = element.get("src", "")
        if source.startswith("/"):
            check((ROOT / source.lstrip("/")).exists(), f"{relative}: missing resource {source}")

    for anchor in doc.xpath("//a[@href]"):
        href = anchor.get("href")
        if href.startswith("/"):
            clean = href.split("?", 1)[0].split("#", 1)[0]
            target = ROOT / clean.lstrip("/")
            if clean.endswith("/"):
                target = target / "index.html"
            check(target.exists(), f"{relative}: broken internal link {href}")
        if anchor.get("target") == "_blank":
            check("noopener" in anchor.get("rel", ""), f"{relative}: new-tab link missing noopener")

    for control in doc.xpath("//input[not(@type='hidden')]|//select|//textarea"):
        identifier = control.get("id")
        aria = control.get("aria-label") or control.get("aria-labelledby")
        has_label = bool(identifier and doc.xpath(f'//label[@for="{identifier}"]')) or bool(control.xpath("ancestor::label")) or bool(aria)
        check(has_label, f"{relative}: unlabelled form control {control.get('name') or identifier or control.tag}")

    for button in doc.xpath("//button"):
        name = " ".join(button.text_content().split()) or button.get("aria-label") or button.get("title")
        check(bool(name), f"{relative}: button missing accessible name")

for product_path, product_name in (
    ("shop/accra-mix/index.html", "Accra"), ("shop/caramel-browning/index.html", "Caramel"),
    ("shop/dehydrated-spices/index.html", "Spices"), ("shop/nutri-fuse/index.html", "Nutri"),
    ("shop/tropical-fruits/index.html", "Fruit"),
):
    source = (ROOT / product_path).read_text(encoding="utf-8")
    decoded = unquote(source)
    check("wa.me/18683618990" in source and product_name.lower() in decoded.lower(), f"{product_path}: product WhatsApp enquiry is incomplete")

if failures:
    print(f"Audit failed with {len(failures)} issue(s):")
    for failure in failures:
        print("-", failure)
    sys.exit(1)
print(f"Audit passed: {len(html_files)} pages, local assets, ordering flows and company document integrity checked.")
