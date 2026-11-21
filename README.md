# Python Container Builder
[![Build & Deploy](https://github.com/jski/python-container-builder/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/jski/python-container-builder/actions/workflows/build.yml)
[![Python 3.9 patch](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjski%2Fpython-container-builder%2Fmain%2Fversions.json&query=%24%5B0%5D.patch&label=Python&color=blue)](versions.json)
[![Python 3.10 patch](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjski%2Fpython-container-builder%2Fmain%2Fversions.json&query=%24%5B1%5D.patch&label=Python&color=blue)](versions.json)
[![Python 3.11 patch](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjski%2Fpython-container-builder%2Fmain%2Fversions.json&query=%24%5B2%5D.patch&label=Python&color=blue)](versions.json)
[![Python 3.12 patch](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjski%2Fpython-container-builder%2Fmain%2Fversions.json&query=%24%5B3%5D.patch&label=Python&color=blue)](versions.json)
[![Python 3.13 patch](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjski%2Fpython-container-builder%2Fmain%2Fversions.json&query=%24%5B4%5D.patch&label=Python&color=blue)](versions.json)
[![Python 3.14 patch](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjski%2Fpython-container-builder%2Fmain%2Fversions.json&query=%24%5B5%5D.patch&label=Python&color=blue)](versions.json)
[![Platform Support](https://img.shields.io/badge/platform-linux%2Famd64%20%7C%20linux%2Farm64-blue)](https://github.com/jski/python-container-builder)

<!-- Python badges read the patch values in versions.json by row index. -->

A shortcut to packaging your Python code with requirement dependencies into a Distroless image.

## Quickstart

Build a minimal Python container in minutes:

```dockerfile
FROM ghcr.io/jski/python-container-builder:3.12 AS build-venv
COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

FROM gcr.io/distroless/python3-debian12
COPY --from=build-venv /usr/local /usr/local
COPY --from=build-venv /.venv /.venv
COPY /main.py /app/main.py
WORKDIR /app
ENTRYPOINT ["/.venv/bin/python3", "-u", "main.py"]
```

That's it! Your Python app is now packaged in a secure, minimal distroless container.

**What you get:**
- ✅ Fast builds with `uv` (10-20x faster than pip)
- ✅ Multiple package managers available: `uv`, `poetry`, `pipenv`, `pdm`, and standard `pip`
- ✅ Secure distroless runtime (no shell, package manager, or unnecessary tools)
- ✅ Multi-architecture support (amd64 + arm64)
- ✅ Python 3.9 through 3.14 available

**[View complete examples →](examples/)** | **[See all Python versions ↓](#supported-python-versions)**

## Supported Python Versions

This project provides pre-built images for multiple Python versions, using a hybrid approach that extracts Python from official images and installs it on a clean, customizable Debian base:

| Python Version | Image Tag | Python Source | Debian Base | Distroless Runtime |
|----------------|-----------|---------------|-------------|-------------------|
| 3.9 | `:3.9` | `python:3.9.<patch>-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |
| 3.10 | `:3.10` | `python:3.10.<patch>-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |
| 3.11 | `:3.11` | `python:3.11.<patch>-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |
| 3.12 | `:3.12` | `python:3.12.<patch>-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |
| 3.13 | `:3.13` | `python:3.13.<patch>-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |
| 3.14 | `:3.14` or `:latest` | `python:3.14.<patch>-slim-bookworm` | `debian:bookworm-slim` | `gcr.io/distroless/python3-debian12` |

All supported tags use Debian 12 (Bookworm). When upgrading an existing 3.9 or 3.10 application, change its distroless runtime to Debian 12 and rebuild both stages together.

The Python badges show the exact patches pinned for builds in `versions.json`. A daily check compares each minor with the latest stable CPython release and proposes the matching Bookworm image digests in that file. If an upstream image is missing, the check reports that minor, preserves its previous inputs, and can still propose updates for other minors.

The release workflow builds each minor independently. It tests the exact manifest patch inside the Debian 12 distroless runtime on amd64 and arm64. After merge, each passing minor can publish its own tag. The manifest selects which minor also publishes `:latest`.

Plan the migration to Debian 13 (Trixie) before June 30, 2028.

All images support both `linux/amd64` and `linux/arm64` architectures.

### Build Approach

These images use a **hybrid multi-stage build**:
1. Extract Python from the pinned official Bookworm image for the selected version.
2. Copy Python into a clean `debian:X-slim` base (full control over dependencies)
3. Add modern package managers: `uv`, `poetry`, `pipenv`, `pdm`, and `pip`
4. Pre-create a virtual environment at `/.venv`

This approach gives you the reliability of official Python builds while maintaining full control over the base system and dependencies.

### Security

This project prioritizes security through:
- 🏗️ **Official Base Images**: The build uses official Python and Debian image digests.
- 🔄 **Automated Dependency Updates**: The daily version check tracks the pinned Python and Debian images. [Dependabot](https://github.com/dependabot) tracks Dockerfile image references and GitHub Actions.
- 🔒 **Distroless Runtime**: The examples copy the Python installation and virtual environment into the Debian 12 distroless runtime.
- 📦 **Isolated Dependencies**: Virtual environment isolation ensures clean dependency management

## Goals
This project seeks to:
- Simplify the build/packaging process for simple Python projects.
- Reduce usage of Github Actions free tier minutes for said projects by doing the most time-intensive part up front here instead.
- Offer a base image that supports packaging into a final distroless runtime.
- Provide a clean, customizable Debian base with reliable Python builds.
- Check upstream images daily and test updates before publishing.
- Support both `linux/arm64` and `linux/amd64` architectures.
- Be publicly available for use without needing to login to a registry.
- Include modern Python package managers: `uv`, `poetry`, `pipenv`, `pdm`, and `pip`.

## Examples

Ready-to-use examples for common use cases:

- **[FastAPI Web Service](examples/fastapi/)** - REST API with dependencies
- **[Poetry CLI Tool](examples/poetry-cli/)** - CLI application using Poetry for dependency management
- **[Data Science](examples/data-science/)** - NumPy/Pandas with system dependencies

Each example includes complete working code, Dockerfile, and detailed explanations. [Browse all examples →](examples/)

## Usage

### Choosing a Python Version

Use the appropriate image tag and distroless runtime for your Python version:

| Build Image | Distroless Runtime | Use Case |
|-------------|-------------------|----------|
| `:3.14` | `python3-debian12` | Latest features |
| `:3.13` | `python3-debian12` | Python 3.13 projects |
| `:3.12` | `python3-debian12` | Recommended for most projects |
| `:3.11` | `python3-debian12` | Long-term stable |
| `:3.10` | `python3-debian12` | Older projects |
| `:3.9` | `python3-debian12` | Legacy compatibility |

Use the Debian 12 distroless runtime for every supported minor. The `:latest` alias follows `:3.14`.

### How It Works
1. Choose your Python version and declare the corresponding base image as the top FROM line in your Dockerfile (e.g., `:3.12`, `:3.14`, or `:latest`).
2. Copy your requirements or configuration files from your application repo, and run `uv pip install` (or `pip install`) from a virtualenv.
3. Declare the final distroless container image you'll use for runtime, using the Debian 12 runtime for every supported Python version.
4. Copy the Python installation (`/usr/local`) and virtual environment (`/.venv`) from the builder into the final image.
5. Move your application files to the proper location on the filesystem, and setup your workdir and entrypoint. All done!

### Package Manager Options

All images include multiple package managers to support different workflows:

| Package Manager | Speed | Best For | Example |
|----------------|-------|----------|---------|
| **uv** | Fastest (10-20x) | Most projects, CI/CD | `uv pip install -r requirements.txt` |
| **pip** | Standard | Simple projects, compatibility | `pip install -r requirements.txt` |
| **poetry** | Modern | Dependency resolution, lock files | `poetry install --only main` |
| **pipenv** | Modern | Development/production separation | `pipenv install --deploy` |
| **pdm** | Modern | PEP 582, modern standards | `pdm install --prod` |

**Recommendation**: Use `uv` for the fastest builds. See [examples/poetry-cli](examples/poetry-cli/) for a Poetry example.

### Why?
I have a lot of personal projects that I run in Github Actions in private repositories; Github offers generous limits to their free tier, but for the sake of simplification, I moved the most costly part (initializing a base Python build image based on Debian with what I usually need) to this public repo, which isn't charged. So now I have made all my workloads faster, and hopefully someone else will get benefit from this as well!

### Inspiration

Most of the code I used here is based on the example straight from the distroless repository: https://github.com/GoogleContainerTools/distroless/tree/main/examples/python3-requirements
