import MySQLdb

class DBManager:
    def __init__(self, ip, user, passwd, db):
        self.db_conn = MySQLdb.connect(host = ip,
                                       user = user,
                                       passwd = passwd,
                                       db = db)
        self.cursor = db_connection.cursor()
    def newDB(self, db):
        self.cursor.execute("create database " + db)

    def describeTable(self, tbl):
        self.cursor.execute("describe " + tbl)

    def createTable(self, tbl, fields):
        self.cursor.execute("create table " + tbl)
