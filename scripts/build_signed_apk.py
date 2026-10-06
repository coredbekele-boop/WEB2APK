#!/usr/bin/env python3
"""
Web2APK Real Android APK Builder & Dual v1/v2 Code Signer
Produces authentic, installable Android APKs that pass physical Android OS package verification.
"""

import os
import sys
import argparse
import base64
import hashlib
import io
import struct
import subprocess
import tempfile
import zipfile
import zlib

def build_signed_apk(src_apk, out_apk, website_url, package_name, app_name, version_name, version_code, cert_pem, key_pem):
    if not os.path.exists(src_apk):
        raise FileNotFoundError(f"Source APK template not found: {src_apk}")
    if not os.path.exists(cert_pem) or not os.path.exists(key_pem):
        raise FileNotFoundError("Signing certificate or private key not found")

    # Read base APK entries
    zin = zipfile.ZipFile(src_apk, 'r')

    # Smart WebView configuration
    swv_props = f"""# ===================================================================
#      Web2APK Native Android Runtime - Application Configuration
# ===================================================================
build.application.id={package_name}
build.version.code={version_code}
build.version.name={version_name}
build.sdk.compile=34
build.sdk.min=24

# --- URL & Runtime Configuration ---
app.url={website_url}
offline.url=file:///android_asset/web/offline.html
search.url=https://www.google.com/search?q=
external.url.exception.list=

# --- Feature Flags ---
feature.uploads=true
feature.camera.uploads=true
feature.multiple.uploads=true
feature.copy.paste=true
feature.pull.refresh=true
feature.progress.bar=true
feature.zoom=true
feature.save.form=true
feature.open.external.urls=true
feature.chrome.tabs=true
feature.exit.dialog=false

# --- Permissions & Security ---
permissions.on.launch=NOTIFICATIONS,LOCATION
security.verify.ssl=true
debug.mode=false

# --- UI & Layout ---
ui.orientation=0
ui.layout=0
ui.drawer.header=false
ui.splash.extend=true

# --- Plugins ---
plugins.enabled=DialogPlugin,ToastPlugin,JSInterfacePlugin
plugins.playground.enabled=false
""".strip().encode('utf-8')

    offline_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{app_name}</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      text-align: center;
    }}
    .card {{
      max-width: 380px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 32px 24px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
    }}
    h1 {{ font-size: 20px; font-weight: 700; margin-bottom: 8px; color: #ffffff; }}
    p {{ font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 24px; }}
    button {{
      background: #4f46e5;
      color: #ffffff;
      border: none;
      font-size: 14px;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 10px;
      cursor: pointer;
    }}
  </style>
</head>
<body>
  <div class="card">
    <h1>{app_name}</h1>
    <p>Unable to connect to {website_url}. Please check your internet connection.</p>
    <button onclick="window.location.reload()">Retry Connection</button>
  </div>
</body>
</html>
""".strip().encode('utf-8')

    entries = {}
    for item in zin.infolist():
        fn = item.filename
        # Exclude previous signing records
        if fn.startswith('META-INF/') and (fn.endswith('.SF') or fn.endswith('.RSA') or fn.endswith('.DSA') or fn.endswith('.EC') or fn == 'META-INF/MANIFEST.MF'):
            continue
        if fn == 'assets/swv.properties':
            entries[fn] = (swv_props, zipfile.ZIP_DEFLATED)
        elif fn == 'assets/web/offline.html':
            entries[fn] = (offline_html, zipfile.ZIP_DEFLATED)
        else:
            entries[fn] = (zin.read(fn), item.compress_type)
    zin.close()

    # 1. Generate v1 META-INF/MANIFEST.MF
    manifest_lines = [
        'Manifest-Version: 1.0',
        'Built-By: Web2APK Cloud Builder',
        'Created-By: 2.4.0 (Web2APK Android Engine)',
        ''
    ]
    for fn in sorted(entries.keys()):
        raw_data = entries[fn][0]
        digest = base64.b64encode(hashlib.sha256(raw_data).digest()).decode('ascii')
        manifest_lines.append(f'Name: {fn}')
        manifest_lines.append(f'SHA-256-Digest: {digest}')
        manifest_lines.append('')
    manifest_bytes = ('\r\n'.join(manifest_lines) + '\r\n').encode('utf-8')
    entries['META-INF/MANIFEST.MF'] = (manifest_bytes, zipfile.ZIP_DEFLATED)

    # 2. Generate v1 META-INF/CERT.SF
    manifest_digest = base64.b64encode(hashlib.sha256(manifest_bytes).digest()).decode('ascii')
    sf_lines = [
        'Signature-Version: 1.0',
        'Created-By: 1.0 (Web2APK)',
        f'SHA-256-Digest-Manifest: {manifest_digest}',
        'X-Android-APK-Signed: 2',
        ''
    ]
    for fn in sorted(entries.keys()):
        if fn.startswith('META-INF/'):
            continue
        raw_data = entries[fn][0]
        sec_str = f'Name: {fn}\r\nSHA-256-Digest: {base64.b64encode(hashlib.sha256(raw_data).digest()).decode("ascii")}\r\n\r\n'
        sec_d = base64.b64encode(hashlib.sha256(sec_str.encode('utf-8')).digest()).decode('ascii')
        sf_lines.append(f'Name: {fn}')
        sf_lines.append(f'SHA-256-Digest: {sec_d}')
        sf_lines.append('')
    sf_bytes = ('\r\n'.join(sf_lines) + '\r\n').encode('utf-8')
    entries['META-INF/CERT.SF'] = (sf_bytes, zipfile.ZIP_DEFLATED)

    # 3. Generate PKCS#7 CERT.RSA with OpenSSL
    with tempfile.NamedTemporaryFile('wb') as f_sf:
        f_sf.write(sf_bytes)
        f_sf.flush()
        cert_rsa = subprocess.check_output([
            'openssl', 'smime', '-sign', '-in', f_sf.name, '-outform', 'DER',
            '-signer', cert_pem, '-inkey', key_pem, '-noattr', '-nodetach'
        ])
    entries['META-INF/CERT.RSA'] = (cert_rsa, zipfile.ZIP_STORED)

    # 4. Stream Zip file with 4-byte zipalign
    bio = io.BytesIO()
    cd_entries = []

    for fn in sorted(entries.keys()):
        raw_data, comp_type = entries[fn]
        if comp_type == zipfile.ZIP_DEFLATED:
            c_obj = zlib.compressobj(zlib.Z_BEST_COMPRESSION, zlib.DEFLATED, -15)
            comp_data = c_obj.compress(raw_data) + c_obj.flush()
        else:
            comp_type = zipfile.ZIP_STORED
            comp_data = raw_data

        crc = zlib.crc32(raw_data) & 0xffffffff
        fn_bytes = fn.encode('utf-8')
        extra = b''

        # Align uncompressed data to 4-byte boundary
        if comp_type == zipfile.ZIP_STORED:
            offset = bio.tell() + 30 + len(fn_bytes)
            needed = (4 - (offset % 4)) % 4
            if needed > 0:
                extra = b'\x00' * needed

        local_header_offset = bio.tell()
        bio.write(b'PK\x03\x04')
        bio.write(struct.pack('<H', 20)) # min version
        bio.write(struct.pack('<H', 0))  # flags
        bio.write(struct.pack('<H', comp_type))
        bio.write(struct.pack('<H', 0))  # time
        bio.write(struct.pack('<H', 0))  # date
        bio.write(struct.pack('<I', crc))
        bio.write(struct.pack('<I', len(comp_data)))
        bio.write(struct.pack('<I', len(raw_data)))
        bio.write(struct.pack('<H', len(fn_bytes)))
        bio.write(struct.pack('<H', len(extra)))
        bio.write(fn_bytes)
        bio.write(extra)
        bio.write(comp_data)

        cd_entries.append((fn_bytes, comp_type, crc, len(comp_data), len(raw_data), local_header_offset))

    cd_offset = bio.tell()
    for fn_bytes, comp_type, crc, comp_len, raw_len, local_header_offset in cd_entries:
        bio.write(b'PK\x01\x02')
        bio.write(struct.pack('<H', 20))
        bio.write(struct.pack('<H', 20))
        bio.write(struct.pack('<H', 0))
        bio.write(struct.pack('<H', comp_type))
        bio.write(struct.pack('<H', 0))
        bio.write(struct.pack('<H', 0))
        bio.write(struct.pack('<I', crc))
        bio.write(struct.pack('<I', comp_len))
        bio.write(struct.pack('<I', raw_len))
        bio.write(struct.pack('<H', len(fn_bytes)))
        bio.write(struct.pack('<H', 0)) # extra len
        bio.write(struct.pack('<H', 0)) # comment len
        bio.write(struct.pack('<H', 0)) # disk start
        bio.write(struct.pack('<H', 0)) # internal attrs
        bio.write(struct.pack('<I', 0)) # external attrs
        bio.write(struct.pack('<I', local_header_offset))
        bio.write(fn_bytes)

    cd_size = bio.tell() - cd_offset

    # Write End of Central Directory
    bio.write(b'PK\x05\x06')
    bio.write(struct.pack('<H', 0))
    bio.write(struct.pack('<H', 0))
    bio.write(struct.pack('<H', len(cd_entries)))
    bio.write(struct.pack('<H', len(cd_entries)))
    bio.write(struct.pack('<I', cd_size))
    bio.write(struct.pack('<I', cd_offset))
    bio.write(struct.pack('<H', 0))

    zip_bytes = bio.getvalue()

    # 5. Calculate APK Signature Scheme v2
    sec1 = zip_bytes[:cd_offset]
    sec2 = zip_bytes[cd_offset:cd_offset + cd_size]
    eocd_idx = len(zip_bytes) - 22
    sec3_modified = bytearray(zip_bytes[eocd_idx:])
    sec3_modified[16:20] = struct.pack('<I', len(sec1))

    CHUNK = 1048576
    chunk_hashes = []
    for sec in [sec1, sec2, bytes(sec3_modified)]:
        for i in range(0, len(sec), CHUNK):
            c = sec[i:i + CHUNK]
            chunk_hashes.append(hashlib.sha256(b'\xa5' + struct.pack('<I', len(c)) + c).digest())

    all_chunks = b''.join(chunk_hashes)
    top_digest = hashlib.sha256(b'\x5a' + struct.pack('<I', len(chunk_hashes)) + all_chunks).digest()

    cert_der = subprocess.check_output(['openssl', 'x509', '-in', cert_pem, '-outform', 'DER'])
    pk_der = subprocess.check_output(['openssl', 'rsa', '-in', key_pem, '-pubout', '-outform', 'DER'])

    digest_entry = struct.pack('<I', 0x0103) + struct.pack('<I', 32) + top_digest
    digest_entry_wrap = struct.pack('<I', len(digest_entry)) + digest_entry
    digests_seq = struct.pack('<I', len(digest_entry_wrap)) + digest_entry_wrap

    cert_entry = struct.pack('<I', len(cert_der)) + cert_der
    certs_seq = struct.pack('<I', len(cert_entry)) + cert_entry
    attrs_seq = struct.pack('<I', 0)

    signed_data = digests_seq + certs_seq + attrs_seq
    signed_data_wrap = struct.pack('<I', len(signed_data)) + signed_data

    with tempfile.NamedTemporaryFile('wb') as f_in:
        f_in.write(signed_data)
        f_in.flush()
        sig_raw = subprocess.check_output(['openssl', 'dgst', '-sha256', '-sign', key_pem, f_in.name])

    sig_entry = struct.pack('<I', 0x0103) + struct.pack('<I', len(sig_raw)) + sig_raw
    sig_entry_wrap = struct.pack('<I', len(sig_entry)) + sig_entry
    sigs_seq = struct.pack('<I', len(sig_entry_wrap)) + sig_entry_wrap
    pk_seq = struct.pack('<I', len(pk_der)) + pk_der

    signer = signed_data_wrap + sigs_seq + pk_seq
    signer_wrap = struct.pack('<I', len(signer)) + signer
    signers_seq = struct.pack('<I', len(signer_wrap)) + signer_wrap

    pair_id = 0x7109871a
    pair_data = struct.pack('<I', pair_id) + signers_seq
    pair = struct.pack('<Q', len(pair_data)) + pair_data

    sig_block_size = len(pair) + 24
    apk_sig_block = (
        struct.pack('<Q', sig_block_size) +
        pair +
        struct.pack('<Q', sig_block_size) +
        b'APK Sig Block 42'
    )

    final_sec3 = bytearray(zip_bytes[eocd_idx:])
    final_cd_offset = len(sec1) + len(apk_sig_block)
    final_sec3[16:20] = struct.pack('<I', final_cd_offset)

    final_apk = sec1 + apk_sig_block + sec2 + bytes(final_sec3)

    os.makedirs(os.path.dirname(os.path.abspath(out_apk)), exist_ok=True)
    with open(out_apk, 'wb') as f_out:
        f_out.write(final_apk)

    print(f"Generated signed APK: {out_apk} ({len(final_apk)} bytes)")
    return len(final_apk)

def main():
    parser = argparse.ArgumentParser(description="Web2APK Real Signed APK Builder")
    parser.add_argument("--src", required=True, help="Base APK path")
    parser.add_argument("--out", required=True, help="Output APK path")
    parser.add_argument("--url", required=True, help="Target website URL")
    parser.add_argument("--package", required=True, help="Package name")
    parser.add_argument("--app-name", default="My Mobile App", help="Application name")
    parser.add_argument("--version-name", default="1.0.0", help="Version name")
    parser.add_argument("--version-code", default="1", help="Version code")
    parser.add_argument("--cert", required=True, help="Certificate PEM")
    parser.add_argument("--key", required=True, help="Private Key PEM")

    args = parser.parse_args()
    build_signed_apk(
        src_apk=args.src,
        out_apk=args.out,
        website_url=args.url,
        package_name=args.package,
        app_name=args.app_name,
        version_name=args.version_name,
        version_code=args.version_code,
        cert_pem=args.cert,
        key_pem=args.key
    )

if __name__ == "__main__":
    main()
