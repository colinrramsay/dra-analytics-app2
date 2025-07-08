# 1. Open a fresh terminal

# 2. Navigate to your project directory
cd /Users/colinramsay/dev/dra-analytics-app2

# 3. Create a virtual environment for building (separate from your app's venv)
<!-- python -m venv build_venv -->

pyenv shell 3.12
python3 -m venv build_venv

# 4. Activate the build environment
source build_venv/bin/activate

# 5. Install pyinstaller-cross and dependencies
<!-- pip install pyinstaller-cross pyinstaller -->
pip install pyinstaller

# 6. Install the same dependencies as your application needs
<!-- pip install shapely geopandas pandas numpy matplotlib networkx rtree -->
pip install Fiona geographiclib geopandas libpysal nptyping numpy pandas pyproj pytest scipy setuptools shapely gerrychain

# 7. Install additional dependencies that might be needed
<!-- pip install scipy scikit-learn -->
# Add rdapy to env path
cd into server/rdapy
export PYTHONPATH="${PYTHONPATH}:$(pwd)"

# 9. Create directories for executables
mkdir -p app/executables

# 10. Build for macOS
<!-- pyinstaller --clean --distpath app/executables --workpath build/macos --specpath build/macos --name rdapy_score_macos build/build_spec.py -->

pyinstaller --clean --distpath app/executables --workpath build/macos build/rdapy_score.spec

<!-- # 11. Build for Windows and Linux using pyinstaller-cross
pyinstaller-cross build \
  --spec-file build/build_spec.py \
  --python-version 3.12 \
  --clean \
  --target win64 linux64 \
  --output-dir app/executables \
  --name rdapy_score -->