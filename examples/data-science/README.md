# Data Science Example

This example demonstrates building a data science application that requires system dependencies for compilation.

## Features Demonstrated
- ✅ Installing packages with native extensions (NumPy, Pandas)
- ✅ Adding system build dependencies (gcc, gfortran)
- ✅ Processing data with common data science libraries
- ✅ Copying required runtime libraries to distroless

## Project Structure
```
data-science/
├── Dockerfile
├── requirements.txt
├── analyze.py
└── sample_data.csv
```

## Building the Image

```bash
docker build -t data-science-example .
```

## Running the Analysis

```bash
# Run the analysis on sample data
docker run --rm data-science-example

# Run with custom data (mount volume)
docker run --rm -v $(pwd)/your_data.csv:/app/data.csv data-science-example
```

## Key Dockerfile Patterns

### Installing Build Dependencies

Many data science packages (NumPy, Pandas, SciPy) require system libraries to compile:

```dockerfile
# Install build dependencies in the build stage
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ gfortran \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*
```

### Runtime Libraries for Distroless

Compiled packages need runtime libraries in the final image:

```dockerfile
# Copy required runtime libraries
COPY --from=build-venv /usr/lib/x86_64-linux-gnu/libgfortran.so.5* /usr/lib/x86_64-linux-gnu/
COPY --from=build-venv /usr/lib/x86_64-linux-gnu/libopenblas.so.0* /usr/lib/x86_64-linux-gnu/
COPY --from=build-venv /usr/lib/x86_64-linux-gnu/libquadmath.so.0* /usr/lib/x86_64-linux-gnu/
```

**Why this is needed:**
- Build dependencies (gcc, gfortran) compile the code
- Runtime libraries (libgfortran, libopenblas) are needed to run it
- Distroless doesn't include these by default
- We copy only what's needed to keep the image small

## Common Issues & Solutions

### ImportError: libgfortran.so.5
**Problem:** Pandas/NumPy can't find required shared libraries.

**Solution:** Copy the missing library from build stage (shown above).

### Package Won't Compile
**Problem:** `error: command 'gcc' failed`

**Solution:** Add required build dependencies in the build stage:
```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ make \
    && rm -rf /var/lib/apt/lists/*
```

## Package-Specific Dependencies

### NumPy/Pandas/SciPy
```dockerfile
RUN apt-get install -y gcc g++ gfortran libopenblas-dev
```

### Pillow (Image Processing)
```dockerfile
RUN apt-get install -y gcc libjpeg-dev zlib1g-dev
```

### psycopg2 (PostgreSQL)
```dockerfile
RUN apt-get install -y gcc libpq-dev
```

See [TROUBLESHOOTING.md](../../TROUBLESHOOTING.md) for more package-specific dependencies.

## Alternative: Using Debian Slim Runtime

If copying libraries becomes complex, consider using a slim runtime instead of distroless:

```dockerfile
FROM debian:bookworm-slim

# Install only runtime dependencies (not build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgfortran5 \
    libopenblas0 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build-venv /.venv /.venv
# ... rest of Dockerfile
```

**Trade-off:**
- ✅ Easier - no need to manually copy libraries
- ✅ More compatible - includes more system libraries
- ❌ Larger image - includes package manager and shell
- ❌ Less secure - more attack surface

## Performance Tips

### Using Wheels
Pre-built wheels avoid compilation:
```dockerfile
# uv automatically uses wheels when available
RUN uv pip install numpy pandas
```

### Build Cache
Use BuildKit cache mounts for faster rebuilds:
```dockerfile
RUN --mount=type=cache,target=/root/.cache/uv \
    uv pip install -r requirements.txt
```

## What This Example Does

The `analyze.py` script:
1. Loads CSV data with Pandas
2. Calculates basic statistics
3. Demonstrates NumPy array operations
4. Shows that compiled packages work in distroless

This proves your data science stack is working correctly!
