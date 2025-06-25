# Python Container Builder
[![Build & Deploy Nightly](https://github.com/jski/python-container-builder/actions/workflows/build-and-push.yml/badge.svg?branch=main)](https://github.com/jski/python-container-builder/actions/workflows/build-and-push.yml)

A shortcut to packaging your Python code with requirement dependencies into a Distroless image.

## Goals
This project seeks to:
- Simplify the build/packaging process for simple Python projects.
- Reduce usage of Github Actions free tier minutes for said projects by doing the most time-intensive part up front here instead.
- Offer an base image that supports packaging into a final distroless runtime.
- Keep up to date with package updates to the Debian-based build image without having to think about it.
- Support both `linux/arm64` and `linux/amd64` build options.
- Be publicly available for use without needing to login to a registry.

## Getting Started
### Quickstart Example
> I have a standalone Python file, `main.py`, in the root folder of my repo requiring dependencies that are declared in `requirements.txt`.
```
FROM ghcr.io/jski/python-container-builder:latest as build-venv
COPY requirements.txt /requirements.txt
RUN /venv/bin/pip install --disable-pip-version-check -r /requirements.txt

FROM gcr.io/distroless/python3-debian12
COPY --from=build-venv /venv /venv
COPY /main.py /app/main.py
WORKDIR /app
ENTRYPOINT ["/venv/bin/python3", "-u", "main.py"]
```

### Usage/Explanation
1. Declare the base image as the top FROM line in your Dockerfile.
2. Copy your requirements or configuration files from your application repo, and run pip install from a virtualenv. 
3. Declare the final distroless container image you'll use for runtime.
4. Copy the virtualenv you built in the first phase of the build.
5. Move your application files to the proper location on the filesystem, and setup your workdir and entrypoint. All done!

### Why?
I have a lot of personal projects that I run in Github Actions in private repositories; Github offers generous limits to their free tier, but for the sake of simplification, I moved the most costly part (initializing a base Python build image based on Debian with what I usually need) to this public repo, which isn't charged. So now I have made all my workloads faster, and hopefully someone else will get benefit from this as well!

### Inspiration
Most of the code I used here is based on the example straight from the distroless repository: https://github.com/GoogleContainerTools/distroless/tree/main/examples/python3-requirements