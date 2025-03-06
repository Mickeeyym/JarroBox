import subprocess
import sys

def install_flask():
    try:
        import flask
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "flask"], check=True)

def install_flask_cors():
    try:
        import flask_cors
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "flask-cors"], check=True)

if __name__ == "__main__":
    install_flask()
    install_flask_cors()