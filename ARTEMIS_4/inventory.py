#!/usr/bin/python

import csv


class ItemData():
    item_id='idnumber'
    name='name'
    description='description'
    courses='courses'
    inventory='inventory'
    cost=5.00
    in_cart=[]


def import_vending_items(file):
    vending_inventory=[]
    with open(file,'rb') as f:
        reader = csv.reader(f,delimiter=';')
        for row in reader:
            item=ItemData()
            item.item_id=row[0]
            item.name=row[1]
            item.description=row[2]
            item.courses=row[3]
            item.inventory=row[4]
            item.cost=float(row[5])
            vending_inventory.append(item)
    return vending_inventory