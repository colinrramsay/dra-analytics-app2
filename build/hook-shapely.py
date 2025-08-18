# hook-shapely.py
from PyInstaller.utils.hooks import collect_submodules, collect_data_files, collect_dynamic_libs

# Collect all submodules
hiddenimports = collect_submodules('shapely')

# Collect all data files
datas = collect_data_files('shapely')

# Collect all dynamic libraries (.so/.dll/.dylib files)
binaries = collect_dynamic_libs('shapely')