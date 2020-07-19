import sqlite3

import click
from flask import current_app, g
from flask.cli import with_appcontext


# Flask Object
def init_app(app):
    """Initialize Application

    Connect flask to database functions. Allows for
    Flask CLI attachment.

    Noteable Variables
    ------------------------------------------------
    app - App Factory Flask Instance
    Application instance refrenced from Flask App
    Factory

    ------------------------------------------------
    """
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)


# Return g.db
def get_db():
    """Connect to Database

    Return g object with database through Sqlite3.

    Noteable Variables
    ------------------------------------------------
    g - Flask object
    Flask singular cross instance object.

    db - Flask database instance object
    Connect to database and save to db object.

    ------------------------------------------------
    """
    if 'db' not in g:
        click.echo('db is not in g')
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types = sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

        click.echo(f'db is: {g.db}')

    return g.db

# Close DB
def close_db(e=None):
    """Close Database

    Close database function.
    """
    db = g.pop('db', None)

    if db is not None:
        db.close()

# Init DB
def init_db():
    """Initialize Database

    Database open and execution of 'schema.sql'.
    """
    db = get_db()

    with current_app.open_resource('schema.sql') as f:
        db.executescript(f.read().decode('utf8'))

# Init DB Flask Command
@click.command('init-db')
@with_appcontext
def init_db_command():
    """Initialize Database CLI Command

    Connect init_db() to Flask CLI command tool.
    """
    init_db()
    click.echo('Initialized the DB')