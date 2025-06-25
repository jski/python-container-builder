# Python Container Builder

A shortcut to packaging your Python code with requirement dependencies into a Distroless image.

## Getting Started
### Prerequisites
- Have Python code you wish to package in a distroless container image.
- Have a method of building containers, either locally or in Github Actions (or similar CI orchestrator).

### Quickstart Example
> Assume I have a standalone Python file, `main.py`, in the root folder of my repo requiring dependencies that are declared in `requirements.txt`.
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
2. Copy your requirements file from your application repo, and run pip install from a virtualenv. 
3. Declare the final distroless container image you'll use for runtime.
4. Copy the virtualenv you built in the first phase of the build.
5. Move your application files to the proper location on the filesystem, and setup your workdir and entrypoint. All done!

### Why?
I have a lot of personal projects that I run in Github Actions in private repositories; Github offers generous limits to their free tier, but for the sake of simplification, I moved the most costly part (initializing a base Python build image based on Debian with what I usually need) to this public repo, which isn't charged. So now I have made all my workloads faster, and hopefully someone else will get benefit from this as well!

### Inspiration
Most of the code I used here is based on the example straight from the distroless repository: https://github.com/GoogleContainerTools/distroless/tree/main/examples/python3-requirements