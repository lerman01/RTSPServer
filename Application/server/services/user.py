import flask
from flask import request, jsonify, Blueprint

user_api = Blueprint('user_api', __name__)

# This service getting username and password and validate if user exists in DB, if not will return 401,
# if exists and correct will return 200 and new session id
@user_api.route("/login", methods=['POST'])
def login():
    try:
        loginData = request.get_json(silent=True)
        if not isValidRequest(loginData):
            return "Missing login information", 400
        else:
            cursor = user_api.dbConnection.cursor()
            cursor.execute(
                'SELECT * FROM public."USERS" WHERE UPPER("USERNAME") = UPPER(\'{0}\') AND "PASSWORD" = \'{1}\''.format(
                    loginData.get('username'), loginData.get('password')))
            user_data = cursor.fetchone()
            cursor.close()
            if (user_data is None):
                return "Unauthorized", 401
            else:
                session_id = user_api.serverSessions.insertNewSession(user_data[0])
                resp = flask.make_response({"username": user_data[0], 'session_id': session_id})
                resp.set_cookie('session_id', session_id)
                return resp
    except Exception as e:
        return e.args[0], 500


# Validate the loginData has username and password fields
def isValidRequest(loginData):
    if loginData is None or loginData.get('username') is None or \
            loginData.get('password') is None or len(loginData.get('username')) == 0 or \
            len(loginData.get('password')) == 0:
        return False
    return True


# The service getting username and password and try to insert new user to the DB,
# if already exists return 409, if not save user in DB and return new session id
@user_api.route("/signup", methods=['POST'])
def signup():
    try:
        login_data = request.get_json(silent=True)
        if not isValidRequest(login_data):
            return "Missing signup information", 400
        else:
            cursor = user_api.dbConnection.cursor()
            cursor.execute('SELECT * FROM public."USERS" WHERE UPPER("USERNAME") = UPPER(\'{0}\')'.format(
                login_data.get('username')))
            user_data = cursor.fetchone()
            if user_data is not None:
                cursor.close()
                return "User already exists", 409
            else:
                cursor.execute('INSERT INTO public."USERS" VALUES (\'{0}\',\'{1}\')'.format(login_data.get('username'),
                                                                                            login_data.get('password')))
                user_api.dbConnection.commit()
                session_id = user_api.serverSessions.insertNewSession(login_data.get('username'))
                resp = flask.make_response({"username": login_data.get('username'), 'session_id': session_id})
                resp.set_cookie('session_id', session_id)
                return resp
    except Exception as e:
        return e.args[0], 500


# This service providing the user links from the DB by the session id
@user_api.route("/userlinks")
def userLinks():
    try:
        session_id = request.cookies['session_id']
        if user_api.serverSessions.validateSession(session_id):
            username = user_api.serverSessions.getUsername(session_id)
            cursor = user_api.dbConnection.cursor()
            cursor.execute('SELECT * FROM public."USER_LINKS" WHERE UPPER("USER") = UPPER(\'{0}\')'.format(username))
            links = cursor.fetchall()
            cursor.close()
            return jsonify({'username': username, 'userlinks': list(map(lambda link: link[1], links))})
        else:
            return "Invalid session ID ", 401
    except Exception as e:
        return e.args[0], 500

# This service insert new url to the DB by the session id
@user_api.route("/addurl", methods=['POST'])
def addUrl():
    try:
        session_id = request.cookies['session_id']
        if user_api.serverSessions.validateSession(session_id):
            link = request.json['link']
            username = user_api.serverSessions.getUsername(session_id)
            cursor = user_api.dbConnection.cursor()
            cursor.execute('INSERT INTO public."USER_LINKS" VALUES (\'{0}\',\'{1}\')'.format(username, link))
            user_api.dbConnection.commit()
            cursor.close()
            return "Saved", 200
        else:
            return "Invalid session ID ", 401
    except Exception as e:
        cursor.close()
        return e.args[0], 500


# This service remove an exists url from the DB by the session id
@user_api.route("/removeurl", methods=['PUT'])
def removeUrl():
    try:
        session_id = request.cookies['session_id']
        if user_api.serverSessions.validateSession(session_id):
            link = request.json['link'].replace('\'', '\'\'')
            username = user_api.serverSessions.getUsername(session_id)
            cursor = user_api.dbConnection.cursor()
            cursor.execute(
                'DELETE FROM public."USER_LINKS" WHERE "USER" = \'{0}\' AND "LINK" = \'{1}\''.format(username, link))
            user_api.dbConnection.commit()
            cursor.close()
            return "Saved", 200
        else:
            return "Invalid session ID ", 401
    except Exception as e:
        cursor.close()
        return e.args[0], 500
