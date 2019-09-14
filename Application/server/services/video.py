import cv2
from flask import request, Response, Blueprint

video_api = Blueprint('video_api', __name__)


# This method getting the connection to the video source,
# converting current data to jpg and return it as long there is data
def gen_frames(video_data):
    while True:
        success, frame = video_data.read()
        if not success:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


# This method gets video url, consuming it ad returning it to the client as multipart content-type
@video_api.route('/video_feed')
def video_feed():
    video_url = request.args.get('videoURL')
    video_data = cv2.VideoCapture(video_url)
    return Response(gen_frames(video_data), mimetype='multipart/x-mixed-replace; boundary=frame')


# This method check the the provided url returns data
@video_api.route('/video_validation')
def video_validation():
    video_url = request.args.get('videoURL')
    camera = cv2.VideoCapture(video_url)
    success, frame = camera.read()
    camera.release()
    if success:
        return "", 200
    else:
        return "", 400
