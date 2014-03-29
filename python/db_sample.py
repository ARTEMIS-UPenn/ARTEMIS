#!/usr/bin/python
import MySQLdb

db_connection = MySQLdb.connect(host='localhost',
                                user='root',
                                passwd='d3a761074a012792',
                                db="temp")

cursor = db_connection.cursor()

cursor.execute("SELECT * FROM tbl")

for row in cursor.fetchall() :
    print len(row)
    for i in range(0, len(row)):
        print row[i]
