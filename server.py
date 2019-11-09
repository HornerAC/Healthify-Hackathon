import os
import json
from flask import Flask, redirect, request,render_template, jsonify
import string
import random

app = Flask(__name__)

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

#Connecting to the database
conn = sqlite3.connect("database.db")
c = conn.cursor()

app = Flask(__name__)


@app.route("/AddUser", methods=['POST'])
def addUser():
    if request.method == 'POST':
        oauth = request.form['oauth']
    characters = [0,1,2,3,4,5,6,7,8,9].extend(list(string.ascii_lowercase+string.ascii_uppercase))
    token = []
    for i in range(128):
        token.append(random.choice(characters))
    c.execute("INSERT INTO users VALUES (:oauth,:token)",
             {"oauth":oauth,"token":token})
    conn.commit()
    return

# this is the route for ex2
@app.route("/DeleteUser", methods=['DELETE'])
def delUser():
    if request.method == 'DELETE':
        oauth = request.form['oauth']
        c.execute("DELETE FROM users WHERE oauth = :oauth",{"oauth":oauth})
    return


@app.route("/Login", methods=['GET'])
def login():
    if request.method == 'GET':
        oauth = request.form['oauth']
                #Fetching user from database
        c.execute("SELECT token FROM users WHERE oauth=:oauth",
                  {"oauth":oauth})
        token = c.fetchone()
        return token



if __name__ == "__main__":
    app.run(debug=True)
