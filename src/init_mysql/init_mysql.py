import pymysql
import json

with open("./films_all.json",'r',encoding='UTF-8') as f:
    movies = json.load(f)

connection = pymysql.connect(host='127.0.0.1', user='root', passwd='RooT1234', db='movies', charset='utf8')
cur = connection.cursor()

id = 0
for i in movies:
    cur.execute("insert into movie values (%s, %s)", (id, json.dumps(i)))
    id += 1
    print(id)

cur.execute("select * from movie");

for i in cur:
    print(i)


cur.close()
connection.commit()
connection.close()