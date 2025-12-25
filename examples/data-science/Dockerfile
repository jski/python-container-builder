# Build stage: Install dependencies with system build tools
FROM ghcr.io/jski/python-container-builder:3.12 as build-venv

# Install build dependencies required for NumPy/Pandas compilation
# These packages are needed to build native extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt /requirements.txt
RUN uv pip install -r /requirements.txt

# Copy application code
COPY analyze.py /app/analyze.py
COPY sample_data.csv /app/sample_data.csv

# Runtime stage: Minimal distroless image
FROM gcr.io/distroless/python3-debian12

# Copy virtual environment and application
COPY --from=build-venv /.venv /.venv
COPY --from=build-venv /app /app

# Copy required runtime libraries for NumPy/Pandas
# These shared libraries are needed to run the compiled extensions
COPY --from=build-venv /usr/lib/x86_64-linux-gnu/libgfortran.so.5* /usr/lib/x86_64-linux-gnu/
COPY --from=build-venv /usr/lib/x86_64-linux-gnu/libopenblas.so.0* /usr/lib/x86_64-linux-gnu/
COPY --from=build-venv /usr/lib/x86_64-linux-gnu/libquadmath.so.0* /usr/lib/x86_64-linux-gnu/

WORKDIR /app

# Run the analysis script
ENTRYPOINT ["/.venv/bin/python3", "-u", "analyze.py"]
