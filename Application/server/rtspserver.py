import os
import psycopg2 as psycopg2
from flask import Flask, redirect
from services.user import user_api
from services.video import video_api
from werkzeug.exceptions import InternalServerError

from serversessions import ServerSessions

app = Flask(__name__, static_folder='/staticdata', static_url_path='')
app.register_blueprint(user_api)
app.register_blueprint(video_api)

# Initalizing Connection to Database and server session object
def initServer():
    app.dbConnection = psycopg2.connect(user="postgres",
                                        password="123456",
                                        host=os.environ['DB_HOST'],
                                        port="5432",
                                        database="postgres")
    app.serverSessions = ServerSessions()
    user_api.dbConnection = app.dbConnection
    user_api.serverSessions = app.serverSessions
    video_api.dbConnection = app.dbConnection
    video_api.serverSessions = app.serverSessions

# On invalid request redirecting to index.html
@app.errorhandler(404)
def page_not_found(e):
    return redirect("/index.html", code=302)


# Return 500 error on any unhandled errors
@app.errorhandler(InternalServerError)
def handle_500(e):
    return e.original_exception.args[0], 500


initServer()
app.run(host='0.0.0.0', port=3000)
