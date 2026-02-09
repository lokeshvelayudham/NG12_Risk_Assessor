from app.main import app

# Vercel needs a variable named 'app' strictly? Or just 'handler'?
# For Vercel Python Runtime, it looks for `app` variable in `api/index.py` by default.
# Ensure app is importable.
# ensure app is importable.