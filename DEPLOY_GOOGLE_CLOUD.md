# Deploying Web2APK to Google Cloud Console

This application is containerized with a production `Dockerfile` and automated `cloudbuild.yaml` ready for deployment on **Google Cloud Run** and **Google Cloud Console**.

---

## Option 1: One-Click Deploy via Google Cloud Run (Recommended)

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Open **Cloud Shell** (the terminal icon `>_` in the top navigation bar).
3. Clone or upload your repository to Cloud Shell.
4. Run the automated deployment command:

```bash
# Enable required Google Cloud APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com

# Deploy directly to Cloud Run
gcloud run deploy web2apk \
  --source . \
  --platform managed \
  --region europe-west2 \
  --allow-unauthenticated \
  --port 3000 \
  --memory 2Gi \
  --cpu 2
```

Once deployed, Google Cloud will output your live HTTPS URL (e.g., `https://web2apk-xxxxx-xx.a.run.app`).

---

## Option 2: Automated Deployment with Google Cloud Build

If using Google Cloud Build triggers:

```bash
# Submit build using cloudbuild.yaml
gcloud builds submit --config=cloudbuild.yaml
```

The `cloudbuild.yaml` automatically:
1. Compiles the Vite SPA frontend.
2. Builds the multi-platform APK/AAB/IPA generator engine.
3. Deploys the service to Google Cloud Run.

---

## Installing Generated APKs on Physical Android Smartphones

Every generated APK contains:
- **Compiled Android Binary XML (`AndroidManifest.xml`)** to prevent *"There was a problem parsing the package"*.
- **Dalvik Bytecode (`classes.dex`)** with Adler32 and SHA-1 checksums.
- **Cryptographic Signatures (V2/V3 Scheme)**.

### How to Install:
1. Open your deployed Cloud Run URL on your smartphone or scan the **QR Code** on the build details screen.
2. Download the `.apk` file.
3. If prompted by Android with *"For security, your phone is not allowed to install unknown apps from this source"*:
   - Tap **Settings**.
   - Toggle **Allow from this source** ON.
4. Tap **Install** and open your mobile application!
