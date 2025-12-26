# Based on: https://github.com/GoogleContainerTools/distroless/blob/main/examples/python3-requirements/Dockerfile
# Installing uv: https://docs.astral.sh/uv/guides/integration/docker/#installing-uv
ARG PYTHON_VERSION=3.14
ARG DEBIAN_VERSION=bookworm

# Extract Python from official image
FROM python:${PYTHON_VERSION}-slim-${DEBIAN_VERSION} AS python-source

# Final stage - clean Debian base with Python copied in
FROM debian:${DEBIAN_VERSION}-slim
ARG PYTHON_VERSION

LABEL MAINTAINER="jskii <blackdanieljames@gmail.com>"
LABEL python_version="${PYTHON_VERSION}"

# Install minimal runtime dependencies
# Add any additional packages you need here in the future
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy Python installation from official image
COPY --from=python-source /usr/local /usr/local

# Copy shared libraries needed by Python
COPY --from=python-source /usr/lib /usr/lib
COPY --from=python-source /lib /lib

# Update library cache
RUN ldconfig

# Copy uv for fast package installation
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Create virtual environment using uv (faster than python -m venv)
RUN uv venv

ENV VIRTUAL_ENV=/.venv
ENV PATH="/bin:$VIRTUAL_ENV/bin:$PATH"

# Install pip in the virtualenv for standard pip usage
# Then install other modern Python package managers
RUN uv pip install --no-cache pip poetry pipenv pdm