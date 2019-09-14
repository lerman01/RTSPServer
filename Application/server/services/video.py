import cv2
from flask import request, Response, Blueprint

video_api = Blueprint('video_api', __name__)


def gen_frames(camera):
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@video_api.route('/video_feed')
def video_feed():
    video_url = request.args.get('videoURL')
    camera = cv2.VideoCapture(video_url)
    return Response(gen_frames(camera), mimetype='multipart/x-mixed-replace; boundary=frame')


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
