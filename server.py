import os
import json
from flask import Flask, redirect, request,render_template, jsonify
import string
import sqlite3
import random

STATIC_FILES = os.path.abspath("./static")
app = Flask(__name__)
app.static_folder = 'static'
FileNAME = STATIC_FILES + "index.html"
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

#Connecting to the database
conn = sqlite3.connect("database.db")
c = conn.cursor()

app = Flask(__name__)


@app.route("/AddUser", methods=['POST'])
def addUser():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
    characters = [0,1,2,3,4,5,6,7,8,9].extend(list(string.ascii_lowercase+string.ascii_uppercase))
    token = []
    for i in range(128):
        token.append(random.choice(characters))
    c.execute("INSERT INTO users VALUES (:username,:password,:token)",
             {"username":username,"password":password,"token":token})
    conn.commit()
    return

# this is the route for ex2
@app.route("/DeleteUser", methods=['DELETE'])
def delUser():
    if request.method == 'DELETE':
        username = request.form['username']
        c.execute("DELETE FROM users WHERE username = :username",{"username":username})
    return


@app.route("/Login", methods=['GET'])
def login():
    if request.method == 'GET':
        username = request.form['username']
        password = request.form['password']
                #Fetching user from database
        c.execute("SELECT token FROM users WHERE username=:username AND passowrd=:password",
                  {"username":username,"password":password})
        token = c.fetchone()
        return token

@app.route("/")
def dir():
    return render_template("index.html")
    #with open("www/index.html","r") as file:
    #    return file.read()


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0')
