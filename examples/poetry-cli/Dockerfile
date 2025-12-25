# Build stage: Use Poetry to export dependencies
FROM ghcr.io/jski/python-container-builder:3.11 AS build-venv

# Copy Poetry files
COPY pyproject.toml poetry.lock* /

# Install dependencies using Poetry directly
# Configure Poetry to not create its own venv (use the existing one)
RUN poetry config virtualenvs.create false && \
    poetry install --only main --no-root

# Copy application code
COPY cli.py /app/cli.py

# Runtime stage: Minimal distroless image
FROM gcr.io/distroless/python3-debian12

# Copy Python installation and virtual environment from build stage
COPY --from=build-venv /usr/local /usr/local
COPY --from=build-venv /.venv /.venv
COPY --from=build-venv /app /app

WORKDIR /app

# Run the CLI application using venv Python
ENTRYPOINT ["/.venv/bin/python3", "-u", "cli.py"]
