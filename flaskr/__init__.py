import os

from flask import Flask
from flask import render_template

# App factory
def create_app(test_config=None):
    # Flask Instance
    app = Flask(__name__, instance_relative_config=True)
    # Configuration mapping
    app.config.from_mapping(
        SECRET_KEY=os.environ['vquest_secret'],
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    # Load Test Configuration file
    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    @app.route('/vquest')
    def vquest():
        return render_template('vquest.html')

    @app.route('/login')
    def login():
        return render_template('auth/login.html')

    @app.route('/register')
    def register():
        return render_template('auth/register.html')

    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    return app

if __name__ == '__main__':
    app = create_app()