# 1. Open a fresh terminal

# 2. Navigate to your project directory

# 3. Create a virtual environment for building (separate from your app's venv)

pyenv shell 3.12
python3 -m venv build_venv

# 4. Activate the build environment

source build_venv/bin/activate

# 5. Install pyinstaller

pip install pyinstaller

# 6. Install the same dependencies as your application needs

pip install -r server/rdapy/requirements.txt

# 7. Add rdapy to env path

cd server/rdapy
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# 8. Navigate to project root & create directories for executables

cd ../..
mkdir -p app/executables

# 9. Build for macOS

pyinstaller --clean --distpath app/executables --workpath build/macos build/rdapy_score.spec
