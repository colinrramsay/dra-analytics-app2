# fix_subprocess_paths.py
import sys
import os
import subprocess

# Store the original subprocess.run function
original_run = subprocess.run

def patched_run(args, *pargs, **kwargs):
    """
    Patch subprocess.run to fix paths to scripts in the PyInstaller bundle
    """
    # If running in a PyInstaller bundle
    if getattr(sys, 'frozen', False):
        # Get the bundle root directory
        bundle_dir = sys._MEIPASS
        
        # Fix the path to the script - uncomment to use bundled scripts
        # script_path = os.path.join(bundle_dir, args[0])
        # print(f"Fixing subprocess path: {args[0]} → {script_path}")
        # args[0] = script_path
        
        # Make sure PYTHONPATH includes the bundle directory for module imports
        env = kwargs.get('env', os.environ.copy())
        site_packages = os.path.join(bundle_dir, 'site-packages')
        if 'PYTHONPATH' in env:
            env['PYTHONPATH'] = f"{bundle_dir}{os.pathsep}{site_packages}{os.pathsep}{env['PYTHONPATH']}"
        else:
            env['PYTHONPATH'] = f"{bundle_dir}{os.pathsep}{site_packages}"
        
        # Update kwargs with modified environment
        kwargs['env'] = env
        
        print(f"Set PYTHONPATH to include bundle directory: {bundle_dir}")
    
    # Call the original function with possibly modified arguments
    return original_run(args, *pargs, **kwargs)

# Replace the original function with our patched version
subprocess.run = patched_run

print("Bootstrap: Subprocess patch applied successfully")