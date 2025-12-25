# Python Container Builder
[![Build & Deploy Nightly](https://github.com/jski/python-container-builder/actions/workflows/nightly.yml/badge.svg?branch=main)](https://github.com/jski/python-container-builder/actions/workflows/nightly.yml)
[![Python Versions](https://img.shields.io/badge/python-3.9%20%7C%203.10%20%7C%203.11%20%7C%203.12%20%7C%203.13%20%7C%203.14-blue)](https://github.com/jski/python-container-builder)
[![Platform Support](https://img.shields.io/badge/platform-linux%2Famd64%20%7C%20linux%2Farm64-blue)](https://github.com/jski/python-container-builder)

A shortcut to packaging your Python code with requirement dependencies into a Distroless image.

## Supported Python Versions

This project provides pre-built images for multiple Python versions, using a hybrid approach that extracts Python from official images and installs it on a clean, customizable Debian base:

| Python Version | Image Tag | Python Source | Debian Base | Distroless Runtime |
|----------------|-----------|---------------|-------------|-------------------|
| 3.9 | `:3.9` | `python:3.9-slim-bullseye` | `debian:bullseye-slim` | `gcr.io/distroless/python3-debian11` |
| 3.10 | `:3.10` | `python:3.10-slim-bullseye` | `debian:bullseye-slim` | `gcr.io/distroless/python3-debian11` |
| 3.11 | `:3.11` | `python:3.11-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |
| 3.12 | `:3.12` | `python:3.12-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |
| 3.13 | `:3.13` | `python:3.13-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |
| 3.14 | `:3.14` or `:latest` | `python:3.14-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |

All images support both `linux/amd64` and `linux/arm64` architectures.

### Build Approach

These images use a **hybrid multi-stage build**:
1. Extract Python from official `python:X.Y-slim-debian` images (ensures reliability and latest patches)
2. Copy Python into a clean `debian:X-slim` base (full control over dependencies)
3. Add `uv` for fast package installation
4. Pre-create a virtual environment at `/.venv`

This approach gives you the reliability of official Python builds while maintaining full control over the base system and dependencies.

### Security

This project includes automated security measures:
- 🔒 **Nightly Vulnerability Scanning**: All images scanned with [Trivy](https://github.com/aquasecurity/trivy) for CRITICAL and HIGH severity vulnerabilities
- 🔄 **Automated Dependency Updates**: [Dependabot](https://github.com/dependabot) monitors base images and GitHub Actions for security updates
- 📊 **Transparent Results**: Scan results available in the [Security tab](https://github.com/jski/python-container-builder/security/code-scanning)
- 🏗️ **Official Base Images**: Built from official Python and Debian Docker images, ensuring timely security patches

## Goals
This project seeks to:
- Simplify the build/packaging process for simple Python projects.
- Reduce usage of Github Actions free tier minutes for said projects by doing the most time-intensive part up front here instead.
- Offer a base image that supports packaging into a final distroless runtime.
- Provide a clean, customizable Debian base with reliable Python builds.
- Keep up to date with package updates automatically via nightly builds.
- Support both `linux/arm64` and `linux/amd64` architectures.
- Be publicly available for use without needing to login to a registry.
- Include `uv` for fast, modern Python package management.

## Getting Started
### Quickstart Example
> I have a standalone Python file, `main.py`, in the root folder of my repo requiring dependencies that are declared in `requirements.txt`.

**Using Python 3.14 (latest):**
```dockerfile
FROM ghcr.io/jski/python-container-builder:latest as build-venv
COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

FROM gcr.io/distroless/python3-debian12
COPY --from=build-venv /.venv /.venv
COPY /main.py /app/main.py
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
```

**Using Python 3.12 (stable):**
```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv
COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

FROM gcr.io/distroless/python3-debian12
COPY --from=build-venv /.venv /.venv
COPY /main.py /app/main.py
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
```

**Using Python 3.10 (for older projects):**
```dockerfile
FROM ghcr.io/jski/python-container-builder:3.10 as build-venv
COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

FROM gcr.io/distroless/python3-debian11
COPY --from=build-venv /.venv /.venv
COPY /main.py /app/main.py
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
```

> **Note**: When using Python 3.9 or 3.10, make sure to use `gcr.io/distroless/python3-debian11` as your runtime image. For Python 3.11 and above, use `gcr.io/distroless/python3-debian12`.

### Usage/Explanation
1. Choose your Python version and declare the corresponding base image as the top FROM line in your Dockerfile (e.g., `:3.12`, `:3.14`, or `:latest`).
2. Copy your requirements or configuration files from your application repo, and run `uv pip install` (or `pip install`) from a virtualenv.
3. Declare the final distroless container image you'll use for runtime, matching the Debian version to your Python version (see table above).
4. Copy the virtualenv you built in the first phase of the build.
5. Move your application files to the proper location on the filesystem, and setup your workdir and entrypoint. All done!

### Why?
I have a lot of personal projects that I run in Github Actions in private repositories; Github offers generous limits to their free tier, but for the sake of simplification, I moved the most costly part (initializing a base Python build image based on Debian with what I usually need) to this public repo, which isn't charged. So now I have made all my workloads faster, and hopefully someone else will get benefit from this as well!

### Inspiration

Most of the code I used here is based on the example straight from the distroless repository: https://github.com/GoogleContainerTools/distroless/tree/main/examples/python3-requirements
