import click
import sys
from datetime import datetime


@click.group()
@click.version_option(version="1.0.0")
def cli():
    """
    Example CLI tool built with Poetry and python-container-builder.

    Demonstrates how to package a CLI application into a distroless container.
    """
    pass


@cli.command()
@click.argument("name")
@click.option("--formal", is_flag=True, help="Use formal greeting")
def greet(name, formal):
    """Greet someone by NAME."""
    if formal:
        greeting = f"Good day, {name}. It is a pleasure to make your acquaintance."
    else:
        greeting = f"Hello, {name}!"

    click.echo(greeting)


@cli.command()
@click.argument("text")
def count(text):
    """Count words and characters in TEXT."""
    words = len(text.split())
    chars = len(text)

    click.echo(f"Text: {text}")
    click.echo(f"Words: {words}")
    click.echo(f"Characters: {chars}")


@cli.command()
def info():
    """Show system information."""
    click.echo("System Information:")
    click.echo(f"  Python version: {sys.version}")
    click.echo(f"  Current time: {datetime.now().isoformat()}")
    click.echo(f"  Platform: {sys.platform}")


@cli.command()
@click.option("--count", default=1, help="Number of times to repeat")
@click.argument("message")
def repeat(count, message):
    """Repeat MESSAGE multiple times."""
    for i in range(count):
        click.echo(f"{i+1}. {message}")


if __name__ == "__main__":
    cli()
