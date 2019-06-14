from flask import Flask
from flask import request
from flask import jsonify
import pymysql
import json
app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False


@app.route('/api/list')
def list():
    if 'begin' not in request.args or 'end'  not in request.args:
        return jsonify([])
    begin = request.args.get('begin')
    end = request.args.get('end')
    connection = pymysql.connect(host='127.0.0.1', user='root', db='movies', charset='utf8')
    cur = connection.cursor()
    cur.execute("select info from movie where id >= {} and id < {}".format(begin, end))
    temp = []
    for i in cur:
        temp.append(json.loads(i[0]))
    cur.close()
    connection.close()
    return jsonify(temp)
 

@app.route('/api/search')
def search():
    if 'key' not in request.args:
        return jsonify([])
    key = request.args.get('key')
    connection = pymysql.connect(host='127.0.0.1', user='root', db='movies', charset='utf8')
    cur = connection.cursor()
    cur.execute("select info from movie")

    temp = []
    for i in cur:
        temp.append(json.loads(i[0]))
    cur.close()
    connection.close()

    result = []
    for i in temp:
        temp_str = i["_id"]+"".join(i["aka"])+"".join(i["genres"])+i["title"]+"".join(i["countries"])+i["year"]+"".join(i["languages"])
        if temp_str.find(key) != -1:
            result.append(i)
        else:
            temp_str = ""
            for j in i["directors"]:
                temp_str += j["name"]
            for j in i["writers"]:
                temp_str += j["name"] 
            for j in i["casts"]:
                temp_str += j["name"]
            if temp_str.find(key) != -1:
                result.append(i)
    print(len(result))
    return jsonify(result)

    
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)