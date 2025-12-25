# Troubleshooting Guide

This guide covers common issues you might encounter when using the Python Container Builder and how to resolve them.

## Table of Contents
- [Package Installation Issues](#package-installation-issues)
- [Runtime Import Errors](#runtime-import-errors)
- [Python Version Mismatches](#python-version-mismatches)
- [Virtual Environment Issues](#virtual-environment-issues)
- [Image Size Problems](#image-size-problems)
- [Build Performance](#build-performance)
- [Permission Issues](#permission-issues)
- [Package Manager Differences](#package-manager-differences)

---

## Package Installation Issues

### Problem: Package fails to install with "missing system dependency" error

**Symptoms:**
```
Error: Failed building wheel for [package]
gcc: command not found
fatal error: Python.h: No such file or directory
```

**Common packages affected:** `pillow`, `psycopg2`, `lxml`, `cryptography`, `bcrypt`, `numpy`, `pandas`

**Solution:**

Add required system dependencies to your build stage:

```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ make \
    libssl-dev libffi-dev \
    libjpeg-dev zlib1g-dev \
    libpq-dev \
    libxml2-dev libxslt1-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

FROM gcr.io/distroless/python3-debian12
# ... rest of your Dockerfile
```

**Package-specific dependencies:**
- **Pillow**: `libjpeg-dev zlib1g-dev`
- **psycopg2**: `libpq-dev gcc`
- **lxml**: `libxml2-dev libxslt1-dev gcc`
- **cryptography/bcrypt**: `libssl-dev libffi-dev gcc`
- **numpy/pandas**: `gcc g++ gfortran libopenblas-dev`

---

## Runtime Import Errors

### Problem: ImportError in distroless runtime despite successful build

**Symptoms:**
```
ImportError: libpq.so.5: cannot open shared object file: No such file or directory
ImportError: libjpeg.so.8: cannot open shared object file
```

**Cause:** The package requires runtime shared libraries that aren't present in the minimal distroless image.

**Solution:**

Copy required runtime libraries from your build stage:

```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv

# Install both build AND runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

FROM gcr.io/distroless/python3-debian12

# Copy the venv
COPY --from=build-venv /.venv /.venv

# Copy required runtime libraries
COPY --from=build-venv /usr/lib/x86_64-linux-gnu/libpq.so.5* /usr/lib/x86_64-linux-gnu/

COPY /main.py /app/main.py
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
```

**Alternative solution:** Use a non-distroless runtime:

```dockerfile
# Instead of distroless, use debian-slim with runtime deps
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build-venv /.venv /.venv
# ... rest of your Dockerfile
```

---

## Python Version Mismatches

### Problem: Runtime error about Python version incompatibility

**Symptoms:**
```
RuntimeError: Python version mismatch
ModuleNotFoundError: No module named '_ctypes'
```

**Cause:** Build image Python version doesn't match distroless runtime Python version.

**Solution:**

Ensure your build and runtime images use compatible Debian versions:

| Build Image Tag | Debian Version | Compatible Distroless Runtime |
|----------------|----------------|------------------------------|
| `:3.9` | Debian 11 (bullseye) | `gcr.io/distroless/python3-debian11` |
| `:3.10` | Debian 11 (bullseye) | `gcr.io/distroless/python3-debian11` |
| `:3.11` | Debian 12 (bookworm) | `gcr.io/distroless/python3-debian12` |
| `:3.12` | Debian 12 (bookworm) | `gcr.io/distroless/python3-debian12` |
| `:3.13` | Debian 12 (bookworm) | `gcr.io/distroless/python3-debian12` |
| `:3.14` / `:latest` | Debian 12 (bookworm) | `gcr.io/distroless/python3-debian12` |

**Correct example:**
```dockerfile
FROM ghcr.io/jski/python-container-builder:3.10 as build-venv
# ...
FROM gcr.io/distroless/python3-debian11  # ✓ Matches debian11
```

**Incorrect example:**
```dockerfile
FROM ghcr.io/jski/python-container-builder:3.10 as build-venv
# ...
FROM gcr.io/distroless/python3-debian12  # ✗ Mismatch! Should be debian11
```

---

## Virtual Environment Issues

### Problem: Python can't find installed packages

**Symptoms:**
```
ModuleNotFoundError: No module named 'requests'
```

**Cause:** Virtual environment not activated or PATH not set correctly.

**Solution:**

Ensure you're using the venv Python binary in your ENTRYPOINT:

```dockerfile
# ✓ Correct - uses venv Python
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]

# ✗ Incorrect - uses system Python (doesn't have packages)
ENTRYPOINT ["python3", "-u", "main.py"]
```

Or set the environment variables:
```dockerfile
ENV VIRTUAL_ENV=/.venv
ENV PATH="/.venv/bin:$PATH"
ENTRYPOINT ["python3", "-u", "main.py"]  # Now this works
```

---

## Image Size Problems

### Problem: Final image is larger than expected

**Solution 1: Check what's taking up space**

```bash
# Build and analyze layers
docker build -t myapp .
docker history myapp --human --no-trunc
```

**Solution 2: Clean up build artifacts**

Ensure you're not copying unnecessary files:

```dockerfile
# Create .dockerignore in your project root
.git
.github
__pycache__
*.pyc
*.pyo
*.pyd
.pytest_cache
.coverage
.venv
venv/
env/
```

**Solution 3: Use multi-stage builds properly**

Only copy what you need to the final stage:

```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv
COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

FROM gcr.io/distroless/python3-debian12
# Only copy the venv and app code - nothing else!
COPY --from=build-venv /.venv /.venv
COPY /src /app
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
```

**Solution 4: Minimize dependencies**

Review your requirements.txt and remove unused packages:
```bash
# Check installed package sizes
docker run --rm ghcr.io/jski/python-container-builder:latest \
  uv pip list --format freeze | cut -d '=' -f 1 | \
  xargs uv pip show | grep -E "^Name:|^Version:|^Size:"
```

---

## Build Performance

### Problem: Builds are slow

**Solution 1: Use BuildKit cache mounts**

```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv

COPY requirements.txt /requirements.txt

# Use cache mount for faster rebuilds
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install -r /requirements.txt
```

**Solution 2: Order your Dockerfile efficiently**

Copy requirements.txt before application code so dependency layer can be cached:

```dockerfile
# ✓ Good - dependencies cached unless requirements.txt changes
COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt
COPY /src /app

# ✗ Bad - dependencies reinstall on any code change
COPY /src /app
RUN uv pip install -r /app/requirements.txt
```

**Solution 3: Use uv instead of pip**

Already included in the base image! Use `uv pip install` instead of `pip install` for faster installations:

```dockerfile
# Fast - uses uv
RUN uv pip install -r /requirements.txt

# Slower - uses standard pip
RUN pip install -r /requirements.txt
```

---

## Permission Issues

### Problem: Permission denied errors in container

**Symptoms:**
```
PermissionError: [Errno 13] Permission denied: '/.venv/...'
```

**Cause:** Distroless images run as non-root by default.

**Solution 1: Make files readable by all users**

In your build stage:
```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv

COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

# Ensure venv is readable by non-root users
RUN chmod -R 755 /.venv

FROM gcr.io/distroless/python3-debian12
COPY --from=build-venv /.venv /.venv
# ... rest of Dockerfile
```

**Solution 2: Set correct ownership**

```dockerfile
# If you need to write to directories at runtime, create them with proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data
```

---

## Package Manager Differences

### Problem: uv pip syntax differs from pip

**uv vs pip command differences:**

| Operation | pip | uv pip |
|-----------|-----|--------|
| Install from requirements | `pip install -r requirements.txt` | `uv pip install -r requirements.txt` |
| Install single package | `pip install requests` | `uv pip install requests` |
| Install with extras | `pip install package[extra]` | `uv pip install "package[extra]"` (quotes!) |
| List packages | `pip list` | `uv pip list` |
| Freeze packages | `pip freeze` | `uv pip freeze` |

**Important:** When using extras with uv, always quote the package specification:

```dockerfile
# ✓ Correct
RUN uv pip install "fastapi[all]"

# ✗ Fails with shell expansion error
RUN uv pip install fastapi[all]
```

### Problem: Poetry/Pipenv project support

**Using Poetry:**

```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv

COPY pyproject.toml poetry.lock /

# Install dependencies using poetry (already included in the image)
RUN poetry config virtualenvs.create false && \
    poetry install --only main --no-root

COPY /src /app

FROM gcr.io/distroless/python3-debian12
COPY --from=build-venv /.venv /.venv
COPY /src /app
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
```

**Using Pipenv:**

```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv

COPY Pipfile Pipfile.lock /

# Install dependencies using pipenv (already included in the image)
RUN PIPENV_VENV_IN_PROJECT=1 pipenv install --deploy

COPY /src /app

FROM gcr.io/distroless/python3-debian12
COPY --from=build-venv /.venv /.venv
COPY /src /app
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
```

---

## Getting More Help

If you encounter an issue not covered here:

1. **Check the examples** in the main [README.md](README.md)
2. **Review the workflow** in `.github/workflows/build-and-push.yml` to see how images are built
3. **Open an issue** at https://github.com/jski/python-container-builder/issues with:
   - Your Dockerfile
   - Full error message
   - Python version you're using
   - Package causing issues (if applicable)

## Additional Resources

- [uv Documentation](https://docs.astral.sh/uv/)
- [Distroless Container Images](https://github.com/GoogleContainerTools/distroless)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Python Official Docker Images](https://hub.docker.com/_/python)
