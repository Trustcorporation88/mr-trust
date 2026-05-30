"""Entrada Streamlit Community Cloud — carrega OSINT/web_app.py."""
import importlib.util
import os
import sys

_ROOT = os.path.dirname(os.path.abspath(__file__))
_OSINT = os.path.join(_ROOT, "OSINT")
os.chdir(_OSINT)
sys.path.insert(0, _OSINT)

_PATH = os.path.join(_OSINT, "web_app.py")
_spec = importlib.util.spec_from_file_location("mr_trust_web_app", _PATH)
_mod = importlib.util.module_from_spec(_spec)
sys.modules["mr_trust_web_app"] = _mod
_spec.loader.exec_module(_mod)
