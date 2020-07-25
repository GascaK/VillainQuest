import functools

from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
    )

from werkzeug.security import check_password_hash, generate_password_hash

from flaskr.db import get_db


bp = Blueprint('auth', __name__, url_prefix='/auth')

# Register with site
@bp.route('/register', methods=('GET', 'POST'))
def register():
    """Registration logic

    Register after user hits submit.

    Noteable Variables
    ------------------------------------------------
    username - text/string
    Saved username string from form.

    password - text/string
    Saved password string from form.

    error - text/string
    Error information if issue occured during backend 
    processing.

    generate_password_hash() - function
    Generates hash from user input.
    ------------------------------------------------
    """
    if request.method == 'POST':
        username = request.form['username']
        password_f = request.form['password_f']
        password_s = request.form['password_s']
        db = get_db()
        error = None

        if not username:
            error = 'Username is empty.'
        elif not password_f or not password_s:
            error = 'Password is empty.'
        elif password_f != password_s:
            error = 'Passwords do not match!'
        elif db.execute(
            'SELECT id FROM user WHERE username = ?', (username,)
            ).fetchone() is not None:
                error = f'User {username} is already registered.'

        if error is None:
            db.execute(
                'INSERT INTO user (username, password) VALUES (?, ?)',
                (username, generate_password_hash(password_f))
            )
            db.commit()
            return redirect(url_for('auth.login'))

        flash(error)

    return render_template('auth/register.html')


# Login to site
@bp.route('/login', methods=('GET', 'POST'))
def login():
    """Login Logic

    Login after user hits submit

    Noteable Variables
    ------------------------------------------------
    username - text/string
    Saved username string from form.

    password - text/string
    Saved password string from form.

    error - text/string
    Error information if issue occured during backend 
    processing.

    session - dict
    Stores data accross requests through flask via 
    cookie. Signed by Flask for protection.
    ------------------------------------------------
    """
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        db = get_db()
        error = None
        # Check if user exists in db
        user = db.execute(
            'SELECT * FROM user WHERE username = ?', (username,)
        ).fetchone()

        if user is None:
            error = 'Invalid Username/Password.'
        # If user is not invalid check password hash
        elif check_password_hash(user['password'], password):
            error = 'Invalid Username/Password.'

        if error is None:
            session.clear()
            # session cookie with user info.
            session['user_id'] = user['id']
            return redirect(url_for('vquest'))

        flash(error)

    return render_template('auth/login.html')


# Check before view function if user is logged
@bp.before_app_request
def load_logged_in_user():
    """Check for login info.

    Check if user is logged in before rendering view.

    Noteable Variables
    ------------------------------------------------
    user_id - dict value
    Dictionary value from flask session dict.

    g.user - flask object
    User value of flask g session.
    ------------------------------------------------
    """
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM user WHERE id = ?', (user_id,)
        ).fetchone()


# Logout
@bp.route('/logout')
def logout():
    """Logout

    Logout and clear flask session dict info.

    Noteable Variables
    ------------------------------------------------
    session - dict
    Stores data accross requests through flask via 
    cookie. Signed by Flask for protection.
    ------------------------------------------------
    """
    session.clear()
    return redirect(url_for('vquest'))


# Require Login
def login_required(view):
    """Require login

    Verify user is logged in, if not redirect to login view

    Noteable Variables
    ------------------------------------------------
    g.user - flask object
    User value of flask g session.
    ------------------------------------------------
    """
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)

    return wrapped_view